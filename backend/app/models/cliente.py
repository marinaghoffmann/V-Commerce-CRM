from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Float, Boolean, Date
from app.database import Base
from app.schemas.cliente import PedidoResumo, TicketResumo, TicketResumo


class Cliente(Base):
    """
    Visão 360 do cliente.
    Agrega métricas de pedidos, avaliações, tickets e clickstream.
    Tabela Gold: rocket.gold.v_cliente_360
    """
    __tablename__ = "v_cliente_360"

    id_cliente:                 Mapped[str]   = mapped_column(String,  primary_key=True, index=True)
    nome:                       Mapped[str]   = mapped_column(String)
    sobrenome:                  Mapped[str]   = mapped_column(String)
    email:                      Mapped[str]   = mapped_column(String)
    telefone_formatado:         Mapped[str]   = mapped_column(String)
    telefone_ramal:             Mapped[str]   = mapped_column(String, nullable=True)
    estado:                     Mapped[str]   = mapped_column(String)
    cidade:                     Mapped[str]   = mapped_column(String)
    data_nascimento:            Mapped[Date]  = mapped_column(Date, nullable=True)
    data_cadastro:              Mapped[Date]  = mapped_column(Date, nullable=True)
    genero:                     Mapped[str]   = mapped_column(String)
    origem:                     Mapped[str]   = mapped_column(String, nullable=True)

    total_compras:              Mapped[int]   = mapped_column(Integer, default=0)
    receita_total_cliente:      Mapped[float] = mapped_column(Float,   default=0.0)
    ticket_medio:               Mapped[float] = mapped_column(Float,   default=0.0)
    data_primeira_compra:       Mapped[Date]  = mapped_column(Date, nullable=True)
    data_ultima_compra:         Mapped[Date]  = mapped_column(Date, nullable=True)
    metodo_pagamento_preferido: Mapped[str]   = mapped_column(String, nullable=True)
    categoria_preferida:        Mapped[str]   = mapped_column(String, nullable=True )
    produto_mais_comprado:      Mapped[str]   = mapped_column(String, nullable=True)

    total_avaliacoes:           Mapped[int]   = mapped_column(Integer, default=0)
    media_nota_produto:         Mapped[float] = mapped_column(Float,   default=0.0)
    media_nota_nps:             Mapped[float] = mapped_column(Float,   default=0.0)

    total_tickets:              Mapped[int]   = mapped_column(Integer, default=0)
    tickets_abertos:            Mapped[int]   = mapped_column(Integer, default=0)
    tickets_fechados:           Mapped[int]   = mapped_column(Integer, default=0)

    total_sessoes:              Mapped[int]   = mapped_column(Integer, default=0)
    total_produtos_visitados:   Mapped[int]   = mapped_column(Integer, default=0)
    tempo_medio_sessao_seg:     Mapped[float] = mapped_column(Float,   default=0.0)

    segmento_cliente:           Mapped[str]   = mapped_column(String)

    pedidos: list[PedidoResumo] = []
    tickets: list[TicketResumo] = []