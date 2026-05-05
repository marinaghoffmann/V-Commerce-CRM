from pydantic import BaseModel
from typing import Optional
from datetime import date


# v_cliente_360

class Cliente360Schema(BaseModel):
    # Dados cadastrais
    id_cliente:                 str
    nome:                       Optional[str]   = None
    sobrenome:                  Optional[str]   = None
    email:                      Optional[str]   = None
    telefone_formatado:         Optional[str]   = None
    telefone_ramal:             Optional[str]   = None
    estado:                     Optional[str]   = None
    cidade:                     Optional[str]   = None
    data_nascimento:            Optional[date]  = None
    data_cadastro:              Optional[date]  = None
    genero:                     Optional[str]   = None

    # Métricas de pedidos
    total_compras:              int             = 0
    receita_total_cliente:      float           = 0.0
    ticket_medio:               float           = 0.0
    data_primeira_compra:       Optional[date]  = None
    data_ultima_compra:         Optional[date]  = None
    metodo_pagamento_preferido: Optional[str]   = None
    categoria_preferida:        Optional[str]   = None
    produto_mais_comprado:      Optional[str]   = None

    # Métricas de avaliações
    total_avaliacoes:           int             = 0
    media_nota_produto:         float           = 0.0
    media_nota_nps:             float           = 0.0

    # Métricas de tickets
    total_tickets:              int             = 0
    tickets_abertos:            int             = 0
    tickets_fechados:           int             = 0

    # Métricas de clickstream
    total_sessoes:              int             = 0
    total_produtos_visitados:   int             = 0
    tempo_medio_sessao_seg:     float           = 0.0

    # Segmento derivado
    segmento_cliente:           Optional[str]   = None

    model_config = {"from_attributes": True}



# desempenho_produtos

class DesempenhoProdutoSchema(BaseModel):
    id_produto:                 str
    nome_produto:               Optional[str]   = None
    categoria:                  Optional[str]   = None
    preco:                      Optional[float] = None

    total_pedidos:              int             = 0
    unidades_vendidas:          int             = 0
    receita_total:              float           = 0.0
    receita_media_por_pedido:   float           = 0.0

    total_avaliacoes:           int             = 0
    media_nota_produto:         float           = 0.0
    media_nota_nps:             float           = 0.0
    pct_recomenda:              float           = 0.0

    total_tickets:              int             = 0
    total_visualizacoes:        int             = 0
    flag_alto_ticket:           bool            = False

    model_config = {"from_attributes": True}



# kpi_por_categoria

class KpiCategoriaSchema(BaseModel):
    id:                         Optional[int]   = None
    ano_venda:                  int
    mes_venda:                  int
    categoria:                  str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

    model_config = {"from_attributes": True}



# kpi_por_estado

class KpiEstadoSchema(BaseModel):
    id:                         Optional[int]   = None
    ano_venda:                  int
    mes_venda:                  int
    estado:                     str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

    model_config = {"from_attributes": True}




# kpi_por_status

class KpiStatusSchema(BaseModel):
    id:                         Optional[int]   = None
    ano_venda:                  int
    mes_venda:                  int
    status:                     str
    receita_total:              float
    ticket_medio:               float
    total_pedidos:              int
    total_clientes_unicos:      int

    model_config = {"from_attributes": True}



# comportamento_digital

class ComportamentoDigitalSchema(BaseModel):
    id_cliente:                 str
    total_sessoes:              int             = 0
    total_eventos:              int             = 0
    total_visualizacoes_produto:int             = 0
    total_compras_click:        int             = 0
    taxa_conversao_click:       float           = 0.0
    taxa_abandono_carrinho:     float           = 0.0
    canal_predominante:         Optional[str]   = None
    produto_mais_visitado:      Optional[str]   = None

    model_config = {"from_attributes": True}



# analise_tickets

class AnaliseTicketSchema(BaseModel):
    id_ticket:                  str
    id_cliente:                 str
    nome_cliente:               Optional[str]   = None
    tipo_problema:              Optional[str]   = None
    status_ticket:              Optional[str]   = None
    data_abertura:              Optional[str]   = None
    data_resolucao:             Optional[str]   = None
    tempo_resolucao_horas:      Optional[float] = None
    agente_suporte:             Optional[str]   = None
    nome_produto:               Optional[str]   = None
    categoria_produto:          Optional[str]   = None
    valor_pedido:               Optional[float] = None
    total_pedidos_cliente:      int             = 0
    receita_total_cliente:      float           = 0.0

    model_config = {"from_attributes": True}