from .ticket import TicketSchema
from .cliente import ClienteSchema
from .comportamento_digital import ComportamentoDigitalSchema
from .produto import ProdutoSchema
from .kpi_categoria import KpiCategoriaSchema
from .kpi_estado import KpiEstadoSchema
from .kpi_status import KpiStatusSchema

__all__ = [
    "ClienteSchema",
    "ProdutoSchema",
    "KpiCategoriaSchema",
    "KpiEstadoSchema",
    "KpiStatusSchema",
    "ComportamentoDigitalSchema",
    "TicketSchema",
]