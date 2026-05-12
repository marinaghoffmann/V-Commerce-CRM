from pydantic import BaseModel
from uuid import UUID


class KpiStatusPayloadSchema(BaseModel):
    ano_venda:                  int
    mes_venda:                  int
    status:                     str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int


class KpiStatusPatchSchema(BaseModel):
    ano_venda:                  int | None = None
    mes_venda:                  int | None = None
    status:                     str | None = None
    receita_total:              float | None = None
    ticket_medio:               float | None = None
    total_pedidos:              int | None = None
    total_clientes_unicos:      int | None = None


class KpiStatusSchema(BaseModel):
    id:                         UUID
    ano_venda:                  int
    mes_venda:                  int
    status:                     str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

    model_config = {"from_attributes": True}
