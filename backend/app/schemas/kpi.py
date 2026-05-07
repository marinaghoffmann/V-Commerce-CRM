from pydantic import BaseModel
from uuid import UUID

# kpi_por_categoria
class KpiCategoriaPayloadSchema(BaseModel):
    ano_venda:                  int
    mes_venda:                  int
    categoria:                  str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

class KpiCategoriaPatchSchema(BaseModel):
    ano_venda:                  int | None = None
    mes_venda:                  int | None = None
    categoria:                  str | None = None
    receita_total:              float | None = None
    ticket_medio:               float | None = None
    total_pedidos:              int | None = None
    total_clientes_unicos:      int | None = None

class KpiCategoriaSchema(BaseModel):
    id:                         UUID | None = None
    ano_venda:                  int
    mes_venda:                  int
    categoria:                  str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

    model_config = {"from_attributes": True}


# kpi_por_estado
class KpiEstadoPayloadSchema(BaseModel):
    ano_venda:                  int
    mes_venda:                  int
    estado:                     str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

class KpiEstadoPatchSchema(BaseModel):
    ano_venda:                  int | None = None
    mes_venda:                  int | None = None
    estado:                     str | None = None
    receita_total:              float | None = None
    ticket_medio:               float | None = None
    total_pedidos:              int | None = None
    total_clientes_unicos:      int | None = None

class KpiEstadoSchema(BaseModel):
    id:                         UUID | None = None
    ano_venda:                  int
    mes_venda:                  int
    estado:                     str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

    model_config = {"from_attributes": True}


# kpi_por_status

class KpiStatusPatchSchema(BaseModel):
    ano_venda:                  int | None = None
    mes_venda:                  int | None = None
    status:                     str | None = None
    receita_total:              float | None = None
    ticket_medio:               float | None = None
    total_pedidos:              int | None = None
    total_clientes_unicos:      int | None = None

class KpiStatusPayloadSchema(BaseModel):
    ano_venda:                  int
    mes_venda:                  int
    status:                     str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

class KpiStatusSchema(BaseModel):
    id:                         UUID | None = None
    ano_venda:                  int
    mes_venda:                  int
    status:                     str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

    model_config = {"from_attributes": True}
