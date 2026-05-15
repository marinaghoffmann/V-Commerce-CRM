from pydantic import BaseModel

class ProdutoCreate(BaseModel):
    nome_produto:               str
    categoria:                  str | None = None
    preco:                      float | None = None

    total_pedidos:              int     = 0
    unidades_vendidas:          int     = 0
    receita_total:              float   = 0.0
    receita_media_por_pedido:   float   = 0.0

    estoque_disponivel:         int | None = 0
    total_avaliacoes:           int     = 0
    media_nota_produto:         float   = 0.0
    media_nota_nps:             float   = 0.0
    pct_recomenda:              float   = 0.0

    total_tickets:              int     = 0
    total_visualizacoes:        int     = 0
    flag_alto_ticket:           bool    = False


class ProdutoSchema(BaseModel):
    id_produto:                 str
    nome_produto:               str | None = None
    categoria:                  str | None = None
    preco:                      float | None = None

    total_pedidos:              int | None = 0
    unidades_vendidas:          int | None = 0
    receita_total:              float | None = 0.0
    receita_media_por_pedido:   float | None = 0.0

    estoque_disponivel:         int | None = 0
    total_avaliacoes:           int | None = 0
    media_nota_produto:         float | None = 0.0
    media_nota_nps:             float | None = 0.0
    pct_recomenda:              float | None = 0.0

    total_tickets:              int | None = 0
    total_visualizacoes:        int | None = 0
    flag_alto_ticket:           bool | None = False

    model_config = {"from_attributes": True}