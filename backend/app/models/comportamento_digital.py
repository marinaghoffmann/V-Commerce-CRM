from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, Boolean, Date, ForeignKey
from app.database import Base


class ComportamentoDigital(Base):
    """
    Comportamento digital do cliente agregado do clickstream.
    Tabela Gold: rocket.gold.comportamento_digital
    """
    __tablename__ = "comportamento_digital"

    id_cliente:                 Mapped[str]   = mapped_column(String, ForeignKey("v_cliente_360.id_cliente"), primary_key=True, index=True, )
    total_sessoes:              Mapped[int]   = mapped_column(Integer, default=0)
    total_eventos:              Mapped[int]   = mapped_column(Integer, default=0)
    total_visualizacoes_produto:Mapped[int]   = mapped_column(Integer, default=0)
    total_compras_click:        Mapped[int]   = mapped_column(Integer, default=0)
    taxa_abandono_carrinho:     Mapped[float] = mapped_column(Float,   default=0.0)
    canal_predominante:         Mapped[str]   = mapped_column(String)
    produto_mais_visitado:      Mapped[str]   = mapped_column(String)
