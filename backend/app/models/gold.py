from sqlalchemy import Column, String, Integer, Float, Boolean, Date
from app.database import Base


class ClienteBase360(Base):
    """
    Visão 360 do cliente.
    Agrega métricas de pedidos, avaliações, tickets e clickstream.
    Tabela Gold: rocket.gold.v_cliente_360
    """
    __tablename__ = "v_cliente_360"

    # Dados cadastrais (dim_clientes)
    id_cliente                  = Column(String,  primary_key=True, index=True)
    nome                        = Column(String)
    sobrenome                   = Column(String)
    email                       = Column(String)
    telefone_formatado          = Column(String)
    telefone_ramal              = Column(String)
    estado                      = Column(String)
    cidade                      = Column(String)
    data_nascimento             = Column(Date)
    data_cadastro               = Column(Date)
    genero                      = Column(String)

    # Métricas de pedidos
    total_compras               = Column(Integer, default=0)
    receita_total_cliente       = Column(Float,   default=0.0)
    ticket_medio                = Column(Float,   default=0.0)
    data_primeira_compra        = Column(Date)
    data_ultima_compra          = Column(Date)
    metodo_pagamento_preferido  = Column(String)
    categoria_preferida         = Column(String)
    produto_mais_comprado       = Column(String)

    # Métricas de avaliações
    total_avaliacoes            = Column(Integer, default=0)
    media_nota_produto          = Column(Float,   default=0.0)
    media_nota_nps              = Column(Float,   default=0.0)

    # Métricas de tickets
    total_tickets               = Column(Integer, default=0)
    tickets_abertos             = Column(Integer, default=0)
    tickets_fechados            = Column(Integer, default=0)

    # Métricas de clickstream
    total_sessoes               = Column(Integer, default=0)
    total_produtos_visitados    = Column(Integer, default=0)
    tempo_medio_sessao_seg      = Column(Float,   default=0.0)

    # Segmento derivado: 'Novo', 'Inativo', 'Premium', 'Recorrente'
    segmento_cliente            = Column(String)


class DesempenhoProduto(Base):
    """
    Métricas por produto: vendas, avaliações, tickets e visualizações.
    Tabela Gold: rocket.gold.desempenho_produtos
    """
    __tablename__ = "desempenho_produtos"

    # Dados do catálogo (dim_catalogo_produtos)
    id_produto                  = Column(String,  primary_key=True, index=True)
    nome_produto                = Column(String)
    categoria                   = Column(String)
    preco                       = Column(Float)

    # Métricas de pedidos
    total_pedidos               = Column(Integer, default=0)
    unidades_vendidas           = Column(Integer, default=0)
    receita_total               = Column(Float,   default=0.0)
    receita_media_por_pedido    = Column(Float,   default=0.0)

    # Métricas de avaliações
    total_avaliacoes            = Column(Integer, default=0)
    media_nota_produto          = Column(Float,   default=0.0)
    media_nota_nps              = Column(Float,   default=0.0)
    pct_recomenda               = Column(Float,   default=0.0)

    # Métricas de tickets
    total_tickets               = Column(Integer, default=0)

    # Métricas de clickstream
    total_visualizacoes         = Column(Integer, default=0)

    # Flag derivada: produto com taxa de ticket acima de 0.22
    flag_alto_ticket            = Column(Boolean, default=False)


class KpiPorCategoria(Base):
    """
    KPIs de vendas agregados por ano, mês e categoria de produto.
    Tabela Gold: rocket.gold.kpi_por_categoria
    """
    __tablename__ = "kpi_por_categoria"

    id                          = Column(Integer, primary_key=True, autoincrement=True)
    ano_venda                   = Column(Integer)
    mes_venda                   = Column(Integer)
    categoria                   = Column(String)
    receita_total               = Column(Float)
    ticket_medio                = Column(Float)
    total_pedidos               = Column(Integer)
    total_clientes_unicos       = Column(Integer)


class KpiPorEstado(Base):
    """
    KPIs de vendas agregados por ano, mês e estado do cliente.
    Tabela Gold: rocket.gold.kpi_por_estado
    """
    __tablename__ = "kpi_por_estado"

    id                          = Column(Integer, primary_key=True, autoincrement=True)
    ano_venda                   = Column(Integer)
    mes_venda                   = Column(Integer)
    estado                      = Column(String)
    receita_total               = Column(Float)
    ticket_medio                = Column(Float)
    total_pedidos               = Column(Integer)
    total_clientes_unicos       = Column(Integer)


class KpiPorStatus(Base):
    """
    KPIs de vendas agregados por ano, mês e status do pedido.
    Tabela Gold: rocket.gold.kpi_por_status
    """
    __tablename__ = "kpi_por_status"

    id                          = Column(Integer, primary_key=True, autoincrement=True)
    ano_venda                   = Column(Integer)
    mes_venda                   = Column(Integer)
    status                      = Column(String)
    receita_total               = Column(Float)
    ticket_medio                = Column(Float)
    total_pedidos               = Column(Integer)
    total_clientes_unicos       = Column(Integer)


class ComportamentoDigital(Base):
    """
    Comportamento digital do cliente agregado do clickstream.
    Tabela Gold: rocket.gold.comportamento_digital
    """
    __tablename__ = "comportamento_digital"

    id_cliente                  = Column(String,  primary_key=True, index=True)
    total_sessoes               = Column(Integer, default=0)
    total_eventos               = Column(Integer, default=0)
    total_visualizacoes_produto = Column(Integer, default=0)
    total_compras_click         = Column(Integer, default=0)
    taxa_conversao_click        = Column(Float,   default=0.0)
    taxa_abandono_carrinho      = Column(Float,   default=0.0)
    canal_predominante          = Column(String)
    produto_mais_visitado       = Column(String)


class AnaliseTicket(Base):
    """
    Tickets de suporte enriquecidos com contexto de cliente e produto.
    Tabela Gold: rocket.gold.analise_tickets
    """
    __tablename__ = "analise_tickets"

    id_ticket                   = Column(String,  primary_key=True, index=True)
    id_cliente                  = Column(String,  index=True)
    nome_cliente                = Column(String)
    tipo_problema               = Column(String)
    status_ticket               = Column(String)   # 'aberto' | 'fechado'
    data_abertura               = Column(String)
    data_resolucao              = Column(String,  nullable=True)
    tempo_resolucao_horas       = Column(Float,   nullable=True)
    agente_suporte              = Column(String)
    nome_produto                = Column(String)
    categoria_produto           = Column(String)
    valor_pedido                = Column(Float)
    total_pedidos_cliente       = Column(Integer, default=0)
    receita_total_cliente       = Column(Float,   default=0.0)
