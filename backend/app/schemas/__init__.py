from .analiseTicket import AnaliseTicketSchema
from .cliente360 import Cliente360Schema
from .comportamentoDigital import ComportamentoDigitalSchema
from .desempenhoProdutos import DesempenhoProdutoSchema
from .kpi import KpiCategoriaSchema, KpiEstadoSchema, KpiStatusSchema

__all__ = [
    "Cliente360Schema",
    "DesempenhoProdutoSchema",
    "KpiCategoriaSchema",
    "KpiEstadoSchema",
    "KpiStatusSchema",
    "ComportamentoDigitalSchema",
    "AnaliseTicketSchema",
]