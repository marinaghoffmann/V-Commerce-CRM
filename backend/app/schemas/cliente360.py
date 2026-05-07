from pydantic import BaseModel
from datetime import date

# v_cliente_360

class Cliente360Schema(BaseModel):
    # Dados cadastrais
    id_cliente:                 str
    nome:                       str | None = None
    sobrenome:                  str | None = None
    email:                      str | None = None
    telefone_formatado:         str | None = None
    telefone_ramal:             str | None = None
    estado:                     str | None = None
    cidade:                     str | None = None
    data_nascimento:            date | None = None
    data_cadastro:              date | None = None
    genero:                     str | None = None

    # Métricas de pedidos
    total_compras:              int     = 0
    receita_total_cliente:      float   = 0.0
    ticket_medio:               float   = 0.0
    data_primeira_compra:       date | None = None
    data_ultima_compra:         date | None = None
    metodo_pagamento_preferido: str | None = None
    categoria_preferida:        str | None = None
    produto_mais_comprado:      str | None = None

    # Métricas de avaliações
    total_avaliacoes:           int     = 0
    media_nota_produto:         float   = 0.0
    media_nota_nps:             float   = 0.0

    # Métricas de tickets
    total_tickets:              int     = 0
    tickets_abertos:            int     = 0
    tickets_fechados:           int     = 0

    # Métricas de clickstream
    total_sessoes:              int     = 0
    total_produtos_visitados:   int     = 0
    tempo_medio_sessao_seg:     float   = 0.0

    # Segmento derivado
    segmento_cliente:           str | None = None

    model_config = {"from_attributes": True}
