import asyncio
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import Optional, Any, List
from database import get_schema, execute_query

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

def perguntar(question: str) -> dict:
    response = client.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents=question,
        config=types.GenerateContentConfig(
            system_instruction=(
                "Você é um especialista em SQL para SQLite.\n"
                "Dado uma pergunta em linguagem natural, gere uma query SQL correta.\n\n"
                "IMPORTANTE:\n"
                "- Preencha SEMPRE o campo 'final_sql' com a query gerada\n"
                "- Use APENAS as tabelas e colunas do schema abaixo\n"
                "- Não invente tabelas ou colunas\n"
                "- Marque 'is_valid' como true quando gerar a query\n\n"
                f"Schema do banco:\n{get_schema()}"
            ),
            response_mime_type="application/json",
            response_schema=CHESSContext,
            temperature=0.1,
        ),
    )

    ctx: CHESSContext = response.parsed

    if ctx.final_sql:
        ctx.rows = execute_query(ctx.final_sql)

    return ctx.model_dump()

def main():
    resultado = perguntar("Me retorne 5 produtos existentes")
    print(f"SQL gerado:  {resultado['final_sql']}")
    print(f"Válido:      {resultado['is_valid']}")
    print(f"Resultados:")
    for row in resultado['rows'] or []:
        print(f"  {row}")

if __name__ == "__main__":
    main()