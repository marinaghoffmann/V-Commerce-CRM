from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, Boolean, Date
from app.database import Base

class Produto(Base):
    __tablename__ = "desempenho_produtos"

    id_produto:                 Mapped[str]   = mapped_column(String,  primary_key=True, index=True)
    nome_produto:               Mapped[str]   = mapped_column(String)
    categoria:                  Mapped[str]   = mapped_column(String)
    preco:                      Mapped[float] = mapped_column(Float)

    total_pedidos:              Mapped[int]   = mapped_column(Integer, default=0)
    unidades_vendidas:          Mapped[int]   = mapped_column(Integer, default=0)
    receita_total:              Mapped[float] = mapped_column(Float,   default=0.0)
    receita_media_por_pedido:   Mapped[float] = mapped_column(Float,   default=0.0)

    estoque_disponivel:         Mapped[int]   = mapped_column(Integer, default=0, nullable=True)
    total_avaliacoes:           Mapped[int]   = mapped_column(Integer, default=0)
    media_nota_produto:         Mapped[float] = mapped_column(Float,   default=0.0)
    media_nota_nps:             Mapped[float] = mapped_column(Float,   default=0.0)
    pct_recomenda:              Mapped[float] = mapped_column(Float,   default=0.0)

    total_tickets:              Mapped[int]   = mapped_column(Integer, default=0)
    total_visualizacoes:        Mapped[int]   = mapped_column(Integer, default=0)

    flag_alto_ticket:           Mapped[bool]  = mapped_column(Boolean, default=False)
    data_cadastro:              Mapped[str | None] = mapped_column(String, nullable=True)