from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, Boolean, Date, ForeignKey
from app.database import Base

class Ticket(Base):
    """
    Tickets de suporte enriquecidos com contexto de cliente e produto.
    Tabela Gold: rocket.gold.analise_tickets
    """
    __tablename__ = "analise_tickets"

    id_ticket:                  Mapped[str]        = mapped_column(String, primary_key=True, index=True)
    id_cliente:                 Mapped[str]        = mapped_column(String, ForeignKey("v_cliente_360.id_cliente"), index=True) # Precisa existir na db
    id_pedido:                  Mapped[str]        = mapped_column(String, ForeignKey("pedidos_por_cliente"), index=True)
    nome_cliente:               Mapped[str]        = mapped_column(String) # Nome e Sobrenome com primeira letra em maíusculo
    tipo_problema:              Mapped[str]        = mapped_column(String) # minusculo [reembolso, entrega, produto, pagamento]
    status_ticket:              Mapped[str]        = mapped_column(String) # minusculo [aberto, fechado]
    data_abertura:              Mapped[str]        = mapped_column(String) # YYYY-MM-DD
    data_resolucao:             Mapped[str | None] = mapped_column(String, nullable=True) # YYYY-MM-DD
    tempo_resolucao_horas:      Mapped[float | None]= mapped_column(Float, nullable=True) # float não negativo
    agente_suporte:             Mapped[str]        = mapped_column(String) # Nome e Sobrenome com a primeira letra em maíusculo
    nome_produto:               Mapped[str]        = mapped_column(String) # Primeira letra e maíusculo
    categoria_produto:          Mapped[str]        = mapped_column(String) # Primeira letra em maíusculo
    valor_pedido:               Mapped[float]      = mapped_column(Float) # Não pode ser negativo 
    total_pedidos_cliente:      Mapped[int]        = mapped_column(Integer, default=0) # Maior ou igual a zero
    receita_total_cliente:      Mapped[float]      = mapped_column(Float,   default=0.0) # Maior ou igual a zero