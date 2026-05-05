from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, Boolean, Date, ForeignKey
from app.database import Base

class AnaliseTicket(Base):
    """
    Tickets de suporte enriquecidos com contexto de cliente e produto.
    Tabela Gold: rocket.gold.analise_tickets
    """
    __tablename__ = "analise_tickets"

    id_ticket:                  Mapped[str]        = mapped_column(String, primary_key=True, index=True)
    id_cliente:                 Mapped[str]        = mapped_column(String, ForeignKey("v_cliente_360.id_cliente"), index=True)
    nome_cliente:               Mapped[str]        = mapped_column(String)
    tipo_problema:              Mapped[str]        = mapped_column(String)
    status_ticket:              Mapped[str]        = mapped_column(String)
    data_abertura:              Mapped[str]        = mapped_column(String)
    data_resolucao:             Mapped[str | None] = mapped_column(String, nullable=True)
    tempo_resolucao_horas:      Mapped[float | None]= mapped_column(Float, nullable=True)
    agente_suporte:             Mapped[str]        = mapped_column(String)
    nome_produto:               Mapped[str]        = mapped_column(String)
    categoria_produto:          Mapped[str]        = mapped_column(String)
    valor_pedido:               Mapped[float]      = mapped_column(Float)
    total_pedidos_cliente:      Mapped[int]        = mapped_column(Integer, default=0)
    receita_total_cliente:      Mapped[float]      = mapped_column(Float,   default=0.0)