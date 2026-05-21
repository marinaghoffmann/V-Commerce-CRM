from pydantic import BaseModel
from typing import Optional, Any, List

class ChatRequest(BaseModel):
    question: str
    session_id: str


class ChatResponse(BaseModel):
    question: str
    final_sql: Optional[str] = None
    is_valid: bool = False
    error_type: Optional[str] = None  
    error_message: Optional[str] = None
    rows: Optional[List[Any]] = None