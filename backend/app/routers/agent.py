import sys
import os
from app.schemas.agent import ChatRequest, ChatResponse
from fastapi import APIRouter, HTTPException

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../ai-agent"))

try:
    from agent import perguntar
except ImportError as e:
    raise ImportError(f"Falha ao importar ai-agent: {e}")

router = APIRouter(prefix="/agent", tags=["agent"])


def _normalize_rows(rows):
    if not rows:
        return None
    return [dict(row) for row in rows]


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    try:
        result = perguntar(question=request.question, session_id=request.session_id)
        return ChatResponse(
            question=request.question,
            final_sql=result.get("final_sql"),
            is_valid=result.get("is_valid", False),
            error_type=result.get("error_type"),  
            error_message=result.get("error_message"),
            rows=_normalize_rows(result.get("rows")),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar pergunta: {str(e)}")