from pydantic import BaseModel
from datetime import date

# comportamento_digital

class ComportamentoDigitalSchema(BaseModel):
    id_cliente:                  str
    total_sessoes:               int     = 0
    total_eventos:               int     = 0
    total_visualizacoes_produto: int     = 0
    total_compras_click:         int     = 0
    taxa_conversao_click:        float   = 0.0
    taxa_abandono_carrinho:      float   = 0.0
    canal_predominante:          str | None = None
    produto_mais_visitado:       str | None = None

    model_config = {"from_attributes": True}
