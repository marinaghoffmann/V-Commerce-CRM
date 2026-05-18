from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, Boolean, Date, ForeignKey
from app.database import Base

class HistoricoAvaliacoes(Base):
    __tablename__ = "historico_avaliacoes"

    id_avaliacao:               Mapped[str]        = mapped_column(String, primary_key=True, index=True)
    id_cliente:                 Mapped[str]        = mapped_column(String, ForeignKey("v_cliente_360.id_cliente"), index=True)
    id_produto:                 Mapped[str]        = mapped_column(String, ForeignKey("pedidos_por_cliente"), index=True)
    nota_produto:               Mapped[int]        = mapped_column(Integer)
    comentario:                 Mapped[str]        = mapped_column(String)
    nota_nps:                   Mapped[int]        = mapped_column(Integer)
    recomenda:                  Mapped[str]        = mapped_column(String)
    data_avaliacao:             Mapped[Date| None] = mapped_column(Date, nullable=True)