import asyncio
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel
from typing import Optional, Any, List
from database import get_schema, execute_query
from prompt import SYSTEM_PROMPT

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
        model="gemini-2.5-flash",
        contents=question,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            response_mime_type="application/json",
            response_schema=CHESSContext,
            temperature=0.1,
        ),
    )

    ctx: CHESSContext = response.parsed

    if ctx.is_valid and ctx.final_sql:
        try:
            ctx.rows = execute_query(ctx.final_sql)
        except Exception as e:
            ctx.is_valid = False
            ctx.rows = None
            ctx.error_message = f"Erro ao executar SQL: {str(e)}"

    return ctx.model_dump()

if __name__ == "__main__":
    resultado = perguntar("Quais foram os 10 produtos mais vendidos?")
    print(f"SQL:    {resultado['final_sql']}")
    print(f"Válido: {resultado['is_valid']}")
    print(f"Erro:   {resultado['error_message']}")
    for row in resultado['rows'] or []:
        print(f"  {row}")