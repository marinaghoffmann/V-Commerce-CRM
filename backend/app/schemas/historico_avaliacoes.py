from pydantic import BaseModel
from datetime import date

class AvaliacaoBase(BaseModel):
    id_avaliacao: str
    id_cliente: str
    id_produto: str
    nota_produto: int
    comentario: str
    nota_nps: int
    recomenda: str
    data_avaliacao: date | None

class AvaliacaoRead(AvaliacaoBase):
    pass

class AvaliacaoCreate(AvaliacaoBase):
    pass

class AvaliacaoUpdate(BaseModel):
    nota_produto: int | None
    comentario: str | None 
    nota_nps: int | None
    recomenda: str | None
    data_avaliacao: date | None

class AvaliacoesGrafico(BaseModel):
    ruim: int
    neutra: int
    positiva: int