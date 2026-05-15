import re
from datetime import datetime, date
from pydantic import BaseModel, ConfigDict, Field, field_validator


class PedidoClienteSchemaRead(BaseModel):
    id_pedido: str = Field(..., min_length=1, description="Identificador único do pedido")
    nome_cliente: str | None = Field(None, min_length=1, description="Nome completo do cliente")
    nome_produto: str | None = Field(None, min_length=1, description="Nome do produto")
    categoria_produto: str | None = Field(None, min_length=1, description="Categoria do produto")
    status: str | None = Field(None, description="Status do pedido")
    valor_pedido: float | None = Field(None, ge=0, description="Valor total do pedido")
    quantidade: int | None = Field(None, ge=0, description="Quantidade de produtos no pedido")
    metodo_pagamento: str | None = Field(None, min_length=1, description="Método de pagamento utilizado")
    data_pedido: date | None = Field(None, description="Data do pedido (AAAA-MM-DD)")

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class PedidoClienteCreateSchema(BaseModel):
    id_pedido: str = Field(..., min_length=1, description="Identificador único do pedido")
    id_cliente: str = Field(..., min_length=1, description="Identificador do cliente")
    nome_completo: str | None = Field(None, min_length=1, description="Nome completo do cliente")
    email: str | None = Field(None, description="Endereço de e-mail do cliente")
    cidade: str | None = Field(None, min_length=1, description="Cidade do cliente")
    estado: str | None = Field(None, max_length=2, description="Sigla do estado com 2 letras")
    id_produto: str = Field(..., min_length=1, description="Identificador do produto")
    data_pedido: str | None = Field(None, description="Data do pedido (AAAA-MM-DD)")
    valor_pedido: float = Field(0.0, ge=0, description="Valor total do pedido")
    quantidade: int = Field(0, gt=0, description="Quantidade de produtos no pedido")
    status: str = Field("pendente", description="Status atual do pedido")
    metodo_pagamento: str = Field(..., min_length=1, description="Método de pagamento utilizado")

    model_config = ConfigDict(extra="forbid")

    @field_validator("nome_completo")
    @classmethod
    def validar_nome(cls, v):
        if v is None:
            return v
        if re.search(r"[^a-zA-ZÀ-ÿ\s\-]", v):
            raise ValueError("nome_completo não pode conter números ou caracteres especiais")
        return v.strip().title()

    @field_validator("estado")
    @classmethod
    def validar_estado(cls, v):
        if v is None:
            return v
        v = v.strip().upper()
        if not re.fullmatch(r"[A-Z]{2}", v):
            raise ValueError("estado deve ter exatamente 2 letras maiúsculas (ex: PE)")
        return v

    @field_validator("cidade")
    @classmethod
    def validar_cidade(cls, v):
        if v is None:
            return v
        return v.strip().lower()

    @field_validator("data_pedido")
    @classmethod
    def validar_data(cls, v):
        if v is None:
            return v
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("data_pedido deve estar no formato YYYY-MM-DD")
        return v

    @field_validator("valor_pedido")
    @classmethod
    def validar_valor(cls, v):
        if v < 0:
            raise ValueError("valor_pedido não pode ser negativo")
        return v

    @field_validator("quantidade")
    @classmethod
    def validar_quantidade(cls, v):
        if v <= 0:
            raise ValueError("quantidade não pode ser menor ou igual a zero")
        return v


class PedidoClienteUpdateSchema(BaseModel):
    nome_completo: str | None = Field(None, min_length=1, description="Nome completo do cliente")
    email: str | None = Field(None, description="Endereço de e-mail do cliente")
    cidade: str | None = Field(None, min_length=1, description="Cidade do cliente")
    estado: str | None = Field(None, max_length=2, description="Sigla do estado com 2 letras")
    data_pedido: str | None = Field(None, description="Data do pedido (AAAA-MM-DD)")
    valor_pedido: float | None = Field(None, ge=0, description="Valor total do pedido")
    quantidade: int | None = Field(None, ge=0, description="Quantidade de produtos no pedido")
    status: str | None = Field(None, description="Status atual do pedido")
    metodo_pagamento: str | None = Field(None, min_length=1, description="Método de pagamento utilizado")

    model_config = ConfigDict(extra="forbid")

    @field_validator("nome_completo")
    @classmethod
    def validar_nome(cls, v):
        if v is None:
            return v
        if re.search(r"[^a-zA-ZÀ-ÿ\s\-]", v):
            raise ValueError("nome_completo não pode conter números ou caracteres especiais")
        return v.strip().title()

    @field_validator("estado")
    @classmethod
    def validar_estado(cls, v):
        if v is None:
            return v
        v = v.strip().upper()
        if not re.fullmatch(r"[A-Z]{2}", v):
            raise ValueError("estado deve ter exatamente 2 letras maiúsculas (ex: PE)")
        return v

    @field_validator("cidade")
    @classmethod
    def validar_cidade(cls, v):
        if v is None:
            return v
        return v.strip().lower()

    @field_validator("data_pedido")
    @classmethod
    def validar_data(cls, v):
        if v is None:
            return v
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("data_pedido deve estar no formato YYYY-MM-DD")
        return v

    @field_validator("valor_pedido")
    @classmethod
    def validar_valor(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError("valor_pedido não pode ser negativo")
        return v

    @field_validator("quantidade")
    @classmethod
    def validar_quantidade(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError("quantidade não pode ser negativa")
        return v