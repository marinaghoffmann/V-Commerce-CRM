import re
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, field_validator, Field, ConfigDict
from datetime import date

TIPOS_PROBLEMA  = {"reembolso", "entrega", "produto", "pagamento"}
STATUS_VALIDOS  = {"aberto", "fechado"}

class TicketSchema(BaseModel):
    id_ticket: str = Field(..., min_length=1, description="Identificador do ticket")
    id_cliente: str = Field(..., min_length=1, description="Client identifier")
    nome_cliente: str | None = Field(None, min_length=1, description="Nome completo do cliente")
    tipo_problema: str | None = Field(None, description="Tipo do problema: reembolso, entrega, produto ou pagamento")
    status_ticket: str | None = Field(None, description="Ticket status: aberto ou fechado")
    data_abertura: date | None = Field(None, description="Data de abertura (AAAA-MM-DD)")
    data_resolucao: date | None = Field(None, description="Data de resolução (AAAA-MM-DD)")
    tempo_resolucao_horas: float | None = Field(None, ge=0, description="Tempo de resolução em horas")
    agente_suporte: str | None = Field(None, min_length=1, description="Nome do agente de suporte")
    nome_produto: str | None = Field(None, min_length=1, description="Nome do produto")
    categoria_produto: str | None = Field(None, min_length=1, description="Categoria do produto")
    valor_pedido: float | None = Field(None, ge=0, description="Preço do pedido")
    total_pedidos_cliente: int = Field(0, ge=0, description="Total de pedidos do cliente")
    receita_total_cliente: float = Field(0.0, ge=0, description="Receita total gerada pelo cliente")

    model_config = {"from_attributes": True}

class TicketSchemaRead(BaseModel):
    id_ticket: str = Field(..., min_length=1, description="Identificador do ticket")
    id_cliente: str = Field(..., min_length=1, description="Client identifier")
    nome_cliente: str | None = Field(None, min_length=1, description="Nome completo do cliente")
    tipo_problema: str | None = Field(None, description="Tipo do problema: reembolso, entrega, produto ou pagamento")
    status_ticket: str | None = Field(None, description="Ticket status: aberto ou fechado")
    data_abertura: date | None = Field(None, description="Data de abertura (AAAA-MM-DD)")
    data_resolucao: date | None = Field(None, description="Data de resolução (AAAA-MM-DD)")
    tempo_resolucao_horas: float | None = Field(None, ge=0, description="Tempo de resolução em horas")
    agente_suporte: str | None = Field(None, min_length=1, description="Nome do agente de suporte")
    nome_produto: str | None = Field(None, min_length=1, description="Nome do produto")
    categoria_produto: str | None = Field(None, min_length=1, description="Categoria do produto")
    valor_pedido: float | None = Field(None, ge=0, description="Preço do pedido")
    total_pedidos_cliente: int = Field(0, ge=0, description="Total de pedidos do cliente")
    receita_total_cliente: float = Field(0.0, ge=0, description="Receita total gerada pelo cliente")

    model_config = ConfigDict(from_attributes=True)


class TicketCreateSchema(BaseModel):
    id_ticket: str = Field(..., min_length=1, description="Identificador único do ticket")
    id_cliente: str = Field(..., min_length=1, description="Identificador do cliente")
    nome_cliente: str = Field(..., min_length=1, description="Nome completo do cliente")
    tipo_problema: str = Field(..., description="Tipo do problema: reembolso, entrega, produto ou pagamento")
    status_ticket: str = Field("aberto", description="Status do ticket: aberto ou fechado")
    data_abertura: str = Field(..., description="Data de abertura (AAAA-MM-DD)")
    data_resolucao: str | None = Field(None, description="Data de resolução (AAAA-MM-DD)")
    tempo_resolucao_horas: float | None = Field(None, ge=0, description="Tempo de resolução em horas")
    agente_suporte: str = Field(..., min_length=1, description="Nome do agente de suporte")
    nome_produto: str = Field(..., min_length=1, description="Nome do produto")
    categoria_produto: str = Field(..., min_length=1, description="Categoria do produto")
    valor_pedido: float = Field(0.0, ge=0, description="Valor do pedido")
    total_pedidos_cliente: int = Field(0, ge=0, description="Quantidade total de pedidos do cliente")
    receita_total_cliente: float = Field(0.0, ge=0, description="Receita total gerada pelo cliente")

    model_config = ConfigDict(extra="forbid")
    @field_validator("nome_cliente", "agente_suporte")
    @classmethod
    def validar_nome(cls, v):
        if re.search(r"[^a-zA-ZÀ-ÿ\s\-]", v):
            raise ValueError("nome não pode conter números ou caracteres especiais")
        return v.strip().title()

    @field_validator("tipo_problema")
    @classmethod
    def validar_tipo_problema(cls, v):
        v = v.strip().lower()
        if v not in TIPOS_PROBLEMA:
            raise ValueError(f"tipo_problema deve ser um dos valores: {TIPOS_PROBLEMA}")
        return v

    @field_validator("status_ticket")
    @classmethod
    def validar_status_ticket(cls, v):
        v = v.strip().lower()
        if v not in STATUS_VALIDOS:
            raise ValueError(f"status_ticket deve ser um dos valores: {STATUS_VALIDOS}")
        return v

    @field_validator("data_abertura", "data_resolucao")
    @classmethod
    def validar_data(cls, v):
        if v is None:
            return v
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("data deve estar no formato YYYY-MM-DD")
        return v

    @field_validator("tempo_resolucao_horas")
    @classmethod
    def validar_tempo_resolucao(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError("tempo_resolucao_horas não pode ser negativo")
        return v

    @field_validator("valor_pedido")
    @classmethod
    def validar_valor_pedido(cls, v):
        if v < 0:
            raise ValueError("valor_pedido não pode ser negativo")
        return v

    @field_validator("total_pedidos_cliente")
    @classmethod
    def validar_total_pedidos(cls, v):
        if v < 0:
            raise ValueError("total_pedidos_cliente não pode ser negativo")
        return v

    @field_validator("receita_total_cliente")
    @classmethod
    def validar_receita_total(cls, v):
        if v < 0:
            raise ValueError("receita_total_cliente não pode ser negativa")
        return v

    @field_validator("nome_produto", "categoria_produto")
    @classmethod
    def validar_primeira_letra_maiuscula(cls, v):
        return v.strip().capitalize()


class TicketUpdateSchema(BaseModel):
    tipo_problema: str | None = Field(None, description="Tipo do problema: reembolso, entrega, produto ou pagamento")
    status_ticket: str | None = Field("aberto", description="Status do ticket: aberto ou fechado")
    data_resolucao: str | None = Field(None, description="Data de resolução (AAAA-MM-DD)")
    tempo_resolucao_horas: float | None = Field(None, ge=0, description="Tempo de resolução em horas")
    agente_suporte: str | None = Field(None, min_length=1, description="Nome do agente de suporte")
    valor_pedido: float | None = Field(None, ge=0, description="Valor do pedido")
    total_pedidos_cliente: int | None = Field(None, ge=0, description="Quantidade total de pedidos do cliente")
    receita_total_cliente: float | None = Field(None, ge=0, description="Receita total gerada pelo cliente")

    @field_validator("agente_suporte")
    @classmethod
    def validar_nome(cls, v):
        if v is None:
            return v
        if re.search(r"[^a-zA-ZÀ-ÿ\s\-]", v):
            raise ValueError("nome não pode conter números ou caracteres especiais")
        return v.strip().title()

    @field_validator("tipo_problema")
    @classmethod
    def validar_tipo_problema(cls, v):
        if v is None:
            return v
        v = v.strip().lower()
        if v not in TIPOS_PROBLEMA:
            raise ValueError(f"tipo_problema deve ser um dos valores: {TIPOS_PROBLEMA}")
        return v

    @field_validator("status_ticket")
    @classmethod
    def validar_status_ticket(cls, v):
        if v is None:
            return v
        v = v.strip().lower()
        if v not in STATUS_VALIDOS:
            raise ValueError(f"status_ticket deve ser um dos valores: {STATUS_VALIDOS}")
        return v

    @field_validator("data_resolucao")
    @classmethod
    def validar_data(cls, v):
        if v is None:
            return v
        try:
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("data deve estar no formato YYYY-MM-DD")
        return v

    @field_validator("tempo_resolucao_horas")
    @classmethod
    def validar_tempo_resolucao(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError("tempo_resolucao_horas não pode ser negativo")
        return v

    @field_validator("valor_pedido")
    @classmethod
    def validar_valor_pedido(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError("valor_pedido não pode ser negativo")
        return v

    @field_validator("total_pedidos_cliente")
    @classmethod
    def validar_total_pedidos(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError("total_pedidos_cliente não pode ser negativo")
        return v

    @field_validator("receita_total_cliente")
    @classmethod
    def validar_receita_total(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError("receita_total_cliente não pode ser negativa")
        return v