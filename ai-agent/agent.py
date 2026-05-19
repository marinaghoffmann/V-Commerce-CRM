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

    register_turn(
        session_id,
        question=question,
        final_sql=ctx.final_sql,
        is_valid=ctx.is_valid,
        error_message=ctx.error_message,
        rows=ctx.rows,
    )

    return ctx.model_dump()


def call_agent(question: str, session_id: str = "default") -> str:
    """Compat layer: chama a função `perguntar()` (que usa o Gemini) e retorna texto.

    Isso evita invocar o `generate_content` duas vezes com configurações distintas
    e previne erros de argumento inválido do SDK. Retorna um texto contendo
    o SQL (entre blocos ```sql```) quando disponível, seguido por uma
    representação das primeiras linhas do resultado.
    """
    try:
        ctx = perguntar(question, session_id=session_id)
    except Exception as e:
        return f"ERROR calling agent: {e}"

    final_sql = ctx.get("final_sql")
    is_valid = ctx.get("is_valid")
    error = ctx.get("error_message")
    rows = ctx.get("rows")

    if final_sql:
        out = []
        out.append("```sql")
        out.append(final_sql)
        out.append("```")
        if rows:
            # show up to first 5 rows
            preview = rows[:5]
            out.append("Amostra de resultados:")
            for r in preview:
                out.append(str(tuple(r.values()) if hasattr(r, 'values') else r))
        return "\n".join(out)

    if not is_valid and error:
        return error

    return str(ctx)

if __name__ == "__main__":
    clear_session_state("default")
    resultado = perguntar("Quais foram os 10 produtos mais vendidos?", session_id="default")
    print(f"SQL:    {resultado['final_sql']}")
    print(f"Válido: {resultado['is_valid']}")
    print(f"Erro:   {resultado['error_message']}")
    for row in resultado['rows'] or []:
        print(f"  {row}")