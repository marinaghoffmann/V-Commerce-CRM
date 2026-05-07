from app.models.kpi import KpiPorCategoria, KpiPorEstado, KpiPorStatus
from app.models.comportamentoDigital import ComportamentoDigital
from app.models.desempenhoProduto import Produto
from app.models.analiseTicket import Ticket
from app.models.cliente360 import Cliente

__all__ = [
    "Cliente",
    "Produto",
    "KpiPorCategoria",
    "KpiPorEstado",
    "KpiPorStatus",
    "ComportamentoDigital",
    "Ticket",
]