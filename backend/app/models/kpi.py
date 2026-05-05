from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float
from app.database import Base

class KpiPorCategoria(Base):
    """
    KPIs de vendas agregados por ano, mês e categoria de produto.
    Tabela Gold: rocket.gold.kpi_por_categoria
    """
    __tablename__ = "kpi_por_categoria"

    id:                         Mapped[int]   = mapped_column(Integer, primary_key=True, autoincrement=True)
    ano_venda:                  Mapped[int]   = mapped_column(Integer)
    mes_venda:                  Mapped[int]   = mapped_column(Integer)
    categoria:                  Mapped[str]   = mapped_column(String)
    receita_total:              Mapped[float] = mapped_column(Float)
    ticket_medio:               Mapped[float] = mapped_column(Float)
    total_pedidos:              Mapped[int]   = mapped_column(Integer)
    total_clientes_unicos:      Mapped[int]   = mapped_column(Integer)


class KpiPorEstado(Base):
    """
    KPIs de vendas agregados por ano, mês e estado do cliente.
    Tabela Gold: rocket.gold.kpi_por_estado
    """
    __tablename__ = "kpi_por_estado"

    id:                         Mapped[int]   = mapped_column(Integer, primary_key=True, autoincrement=True)
    ano_venda:                  Mapped[int]   = mapped_column(Integer)
    mes_venda:                  Mapped[int]   = mapped_column(Integer)
    estado:                     Mapped[str]   = mapped_column(String)
    receita_total:              Mapped[float] = mapped_column(Float)
    ticket_medio:               Mapped[float] = mapped_column(Float)
    total_pedidos:              Mapped[int]   = mapped_column(Integer)
    total_clientes_unicos:      Mapped[int]   = mapped_column(Integer)


class KpiPorStatus(Base):
    """
    KPIs de vendas agregados por ano, mês e status do pedido.
    Tabela Gold: rocket.gold.kpi_por_status
    """
    __tablename__ = "kpi_por_status"

    id:                         Mapped[int]   = mapped_column(Integer, primary_key=True, autoincrement=True)
    ano_venda:                  Mapped[int]   = mapped_column(Integer)
    mes_venda:                  Mapped[int]   = mapped_column(Integer)
    status:                     Mapped[str]   = mapped_column(String)
    receita_total:              Mapped[float] = mapped_column(Float)
    ticket_medio:               Mapped[float] = mapped_column(Float)
    total_pedidos:              Mapped[int]   = mapped_column(Integer)
    total_clientes_unicos:      Mapped[int]   = mapped_column(Integer)
