from pydantic import BaseModel
from datetime import date

# analise_tickets

class TicketSchema(BaseModel):
    id_ticket:                  str
    id_cliente:                 str
    nome_cliente:               str | None = None
    tipo_problema:              str | None = None
    status_ticket:              str | None = None
    data_abertura:              date | None = None
    data_resolucao:             date | None = None
    tempo_resolucao_horas:      float | None = None
    agente_suporte:             str | None = None
    nome_produto:               str | None = None
    categoria_produto:          str | None = None
    valor_pedido:               float | None = None
    total_pedidos_cliente:      int     = 0
    receita_total_cliente:      float   = 0.0

    model_config = {"from_attributes": True}