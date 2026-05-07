from .analiseTicket import AnaliseTicketSchema
from .cliente360 import Cliente360Schema
from .comportamentoDigital import ComportamentoDigitalSchema
from .desempenhoProdutos import DesempenhoProdutoSchema
from .kpi_categoria import KpiCategoriaSchema
from .kpi_estado import KpiEstadoSchema
from .kpi_status import KpiStatusSchema

__all__ = [
    "Cliente360Schema",
    "DesempenhoProdutoSchema",
    "KpiCategoriaSchema",
    "KpiEstadoSchema",
    "KpiStatusSchema",
    "ComportamentoDigitalSchema",
    "AnaliseTicketSchema",
]