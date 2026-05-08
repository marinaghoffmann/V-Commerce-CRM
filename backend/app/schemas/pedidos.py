from pydantic import BaseModel, ConfigDict
from datetime import date

class PedidoClienteSchemaRead(BaseModel):
    id_pedido:         str
    nome_cliente:      str | None = None
    nome_produto:      str | None = None
    categoria_produto: str | None = None
    status:            str | None = None
    valor_pedido:      float | None = None
    quantidade:        int | None = None
    metodo_pagamento:  str | None = None
    data_pedido:       date | None = None

    model_config = ConfigDict(from_attributes=True)

class PedidoClienteCreateSchema(BaseModel):
    id_pedido:                  str
    id_cliente:                 str
    id_produto:                 str
    nome_cliente:               str
    cidade:                     str
    estado:                     str
    data_pedido:                date 
    valor_pedido:               float 
    quantidade:                 int 
    status:                     str
    metodo_pagamento:           str
    categoria_produto:          str

class PedidoClienteUpdateSchema(BaseModel):
    id_pedido:                  str
    nome_cliente:               str | None = None
    cidade:                   str | None = None
    estado:                   str | None = None
    data_pedido:                date | None = None
    valor_pedido:               float | None = None
    nome_produto:               str | None = None
    quantidade:               int | None = None
    status:                  str | None = None
    metodo_pagamento:         str | None = None
    categoria_produto:          str | None = None