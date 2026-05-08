from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, ForeignKey
from app.database import Base

class Pedido(Base):
    __tablename__ = "pedidos_por_cliente"

    id_pedido:        Mapped[str]   = mapped_column(String, primary_key=True)
    id_cliente:       Mapped[str]   = mapped_column(String, ForeignKey("v_cliente_360.id_cliente"), index=True)
    nome_completo:    Mapped[str]   = mapped_column(String, nullable=True)
    email:            Mapped[str]   = mapped_column(String, nullable=True)
    cidade:           Mapped[str]   = mapped_column(String, nullable=True)
    estado:           Mapped[str]   = mapped_column(String, nullable=True)
    id_produto:       Mapped[str]   = mapped_column(String, nullable=True)
    data_pedido:      Mapped[str]   = mapped_column(String, nullable=True)
    valor_pedido:     Mapped[float] = mapped_column(Float, default=0.0)
    quantidade:       Mapped[int]   = mapped_column(Integer, default=0)
    status:           Mapped[str]   = mapped_column(String, nullable=True)
    metodo_pagamento: Mapped[str]   = mapped_column(String, nullable=True)