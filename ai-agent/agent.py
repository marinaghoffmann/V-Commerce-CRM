import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import Optional, Any, List
from database import execute_query
from prompt import SYSTEM_PROMPT
from utils import validar_sql, get_tabelas_validas
from session_memory import build_session_context, register_turn, clear_session_state

load_dotenv()

google_api_key = os.getenv("GOOGLE_API_KEY")

class CHESSContext(BaseModel):
    question: str
    db_path: str = "V-Commerce-CRM-360.db"
    candidate_sql: Optional[str] = None
    final_sql: Optional[str] = None
    is_valid: bool = False
    error_message: Optional[str] = None
    rows: List[Any] | None = None


client = genai.Client(api_key=google_api_key)

def perguntar(question: str, session_id: str = "default") -> dict:
    # Adicionou session context
    session_context = build_session_context(session_id)
    prompt_parts = []

    if session_context:
        prompt_parts.append(session_context)

    prompt_parts.append(f"Pergunta atual do usuário:\n{question}")

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents="\n\n".join(prompt_parts),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=CHESSContext,
            temperature=0.1,
        ),
    )

    TABELAS_VALIDAS = get_tabelas_validas()

    ctx: CHESSContext = response.parsed

    if ctx.is_valid and ctx.final_sql:
        try:
            ctx.final_sql = validar_sql(ctx.final_sql, TABELAS_VALIDAS)
            ctx.rows = execute_query(ctx.final_sql)
        except Exception as e:
            ctx.is_valid = False
            ctx.rows = None
            ctx.error_message = f"Erro ao executar SQL: {str(e)}"

    # Adicionou essa função
    register_turn(
        session_id,
        question=question,
        final_sql=ctx.final_sql,
        is_valid=ctx.is_valid,
        error_message=ctx.error_message,
        rows=ctx.rows,
    )

    return ctx.model_dump()

if __name__ == "__main__":
    # Adicionou clear session state
    clear_session_state("default")
    resultado = perguntar("Quais foram os 10 produtos mais vendidos?", session_id="default")
    print(f"SQL:    {resultado['final_sql']}")
    print(f"Válido: {resultado['is_valid']}")
    print(f"Erro:   {resultado['error_message']}")
    for row in resultado['rows'] or []:
        print(f"  {row}")