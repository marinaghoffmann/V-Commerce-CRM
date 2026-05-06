from pydantic import BaseModel

# kpi_por_categoria

class KpiCategoriaSchema(BaseModel):
    id:                         int | None = None
    ano_venda:                  int
    mes_venda:                  int
    categoria:                  str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

    model_config = {"from_attributes": True}


# kpi_por_estado

class KpiEstadoSchema(BaseModel):
    id:                         int | None = None
    ano_venda:                  int
    mes_venda:                  int
    estado:                     str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

    model_config = {"from_attributes": True}


# kpi_por_status

class KpiStatusSchema(BaseModel):
    id:                         int | None = None
    ano_venda:                  int
    mes_venda:                  int
    status:                     str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

    model_config = {"from_attributes": True}
