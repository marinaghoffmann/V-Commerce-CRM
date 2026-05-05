from app.models.kpi import KpiPorCategoria, KpiPorEstado, KpiPorStatus
from app.models.comportamentoDigital import ComportamentoDigital
from app.models.desempenhoProduto import DesempenhoProduto
from app.models.analiseTicket import AnaliseTicket
from app.models.cliente360 import ClienteBase360

__all__ = [
    "ClienteBase360",
    "DesempenhoProduto",
    "KpiPorCategoria",
    "KpiPorEstado",
    "KpiPorStatus",
    "ComportamentoDigital",
    "AnaliseTicket",
]