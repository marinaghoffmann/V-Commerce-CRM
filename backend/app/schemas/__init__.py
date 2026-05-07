from .analiseTicket import TicketSchema
from .cliente360 import ClienteSchema
from .comportamentoDigital import ComportamentoDigitalSchema
from .desempenhoProdutos import ProdutoSchema
from .kpi import KpiCategoriaSchema, KpiEstadoSchema, KpiStatusSchema

__all__ = [
    "ClienteSchema",
    "ProdutoSchema",
    "KpiCategoriaSchema",
    "KpiEstadoSchema",
    "KpiStatusSchema",
    "ComportamentoDigitalSchema",
    "TicketSchema",
]