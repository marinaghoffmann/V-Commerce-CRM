from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, Uuid
from uuid import uuid4
from app.database import Base


class KpiPorStatus(Base):
    """
    KPIs de vendas agregados por ano, mês e status do pedido.
    Tabela Gold: rocket.gold.kpi_por_status
    """
    __tablename__ = "kpi_por_status"

    id:                         Mapped[str]   = mapped_column(Uuid, primary_key=True, default=uuid4, index=True)
    ano_venda:                  Mapped[int]   = mapped_column(Integer)
    mes_venda:                  Mapped[int]   = mapped_column(Integer)
    status:                     Mapped[str]   = mapped_column(String)
    receita_total:              Mapped[float] = mapped_column(Float)
    ticket_medio:               Mapped[float] = mapped_column(Float)
    total_pedidos:              Mapped[int]   = mapped_column(Integer)
    total_clientes_unicos:      Mapped[int]   = mapped_column(Integer)
