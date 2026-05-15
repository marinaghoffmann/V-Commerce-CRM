from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProdutoSchema(BaseModel):
    nome_produto: str | None = Field(None, min_length=1, description="Nome do produto")
    categoria: str | None = Field(None, min_length=1, description="Categoria do produto")
    preco: float | None = Field(None, gt=0, description="Preço do produto")
    total_pedidos: int = Field(0, ge=0, description="Quantidade total de pedidos")
    unidades_vendidas: int = Field(0, ge=0, description="Quantidade total de unidades vendidas")
    receita_total: float = Field(0.0, ge=0, description="Receita total gerada pelo produto")
    receita_media_por_pedido: float = Field(0.0, ge=0, description="Receita média por pedido")
    estoque_disponivel: int | None = Field(None, ge=0, description="Quantidade disponível em estoque")
    total_avaliacoes: int = Field(0, ge=0, description="Quantidade total de avaliações")
    media_nota_produto: float = Field(0.0, ge=0, description="Média das notas do produto")
    media_nota_nps: float = Field(0.0, ge=0, description="Média da nota NPS")
    pct_recomenda: float = Field(0.0, ge=0, le=100, description="Percentual de recomendação do produto")
    total_tickets: int = Field(0, ge=0, description="Quantidade total de tickets relacionados")
    total_visualizacoes: int = Field(0, ge=0, description="Quantidade total de visualizações")
    flag_alto_ticket: bool = Field(False, description="Indica se o produto possui alto volume de tickets")

    model_config = ConfigDict(from_attributes=True, extra="forbid")

    @field_validator("categoria")
    @classmethod
    def validar_categoria(cls, v):
        if v is None:
            return v
        return v.strip().capitalize()

    @field_validator("nome_produto")
    @classmethod
    def validar_nome(cls, v):
        if v is None:
            return v
        return v.strip()


class ProdutoSchemaRead(BaseModel):
    id_produto: str = Field(..., min_length=1, description="Identificador único do produto")
    nome_produto: str = Field(..., min_length=1, description="Nome do produto")
    categoria: str = Field(..., min_length=1, description="Categoria do produto")
    preco: float = Field(..., gt=0, description="Preço do produto")
    total_pedidos: int = Field(..., ge=0, description="Quantidade total de pedidos")
    unidades_vendidas: int = Field(..., ge=0, description="Quantidade total de unidades vendidas")
    receita_total: float = Field(..., ge=0, description="Receita total gerada pelo produto")
    receita_media_por_pedido: float = Field(..., ge=0, description="Receita média por pedido")
    estoque_disponivel: int | None = Field(None, ge=0, description="Quantidade disponível em estoque")
    total_avaliacoes: int = Field(..., ge=0, description="Quantidade total de avaliações")
    media_nota_produto: float = Field(..., ge=0, description="Média das notas do produto")
    media_nota_nps: float = Field(..., ge=0, description="Média da nota NPS")
    pct_recomenda: float = Field(..., ge=0, le=100, description="Percentual de recomendação do produto")
    total_tickets: int = Field(..., ge=0, description="Quantidade total de tickets relacionados")
    total_visualizacoes: int = Field(..., ge=0, description="Quantidade total de visualizações")
    flag_alto_ticket: bool = Field(..., description="Indica se o produto possui alto volume de tickets")

    model_config = ConfigDict(from_attributes=True, extra="forbid")

    @field_validator("categoria")
    @classmethod
    def validar_categoria(cls, v):
        return v.strip().capitalize()

    @field_validator("nome_produto")
    @classmethod
    def validar_nome(cls, v):
        return v.strip()


class ProdutoCreateSchema(BaseModel):
    nome_produto: str = Field(..., min_length=1, description="Nome do produto")
    categoria: str = Field(..., min_length=1, description="Categoria do produto")
    preco: float = Field(..., gt=0, description="Preço do produto")
    total_pedidos: int = Field(0, ge=0, description="Quantidade total de pedidos")
    unidades_vendidas: int = Field(0, ge=0, description="Quantidade total de unidades vendidas")
    receita_total: float = Field(0.0, ge=0, description="Receita total gerada pelo produto")
    receita_media_por_pedido: float = Field(0.0, ge=0, description="Receita média por pedido")
    estoque_disponivel: int | None = Field(None, ge=0, description="Quantidade disponível em estoque")
    total_avaliacoes: int = Field(0, ge=0, description="Quantidade total de avaliações")
    media_nota_produto: float = Field(0.0, ge=0, description="Média das notas do produto")
    media_nota_nps: float = Field(0.0, ge=0, description="Média da nota NPS")
    pct_recomenda: float = Field(0.0, ge=0, le=100, description="Percentual de recomendação do produto")
    total_tickets: int = Field(0, ge=0, description="Quantidade total de tickets relacionados")
    total_visualizacoes: int = Field(0, ge=0, description="Quantidade total de visualizações")
    flag_alto_ticket: bool = Field(False, description="Indica se o produto possui alto volume de tickets")

    model_config = ConfigDict(extra="forbid")

    @field_validator("categoria")
    @classmethod
    def validar_categoria(cls, v):
        return v.strip().capitalize()

    @field_validator("nome_produto")
    @classmethod
    def validar_nome(cls, v):
        return v.strip()

    @field_validator("preco")
    @classmethod
    def validar_preco(cls, v):
        if v <= 0:
            raise ValueError("preco deve ser maior que zero")
        return v

    @field_validator(
        "total_pedidos",
        "unidades_vendidas",
        "total_avaliacoes",
        "total_tickets",
        "total_visualizacoes",
    )
    @classmethod
    def validar_inteiros_nao_negativos(cls, v):
        if v < 0:
            raise ValueError("o campo não pode ser negativo")
        return v

    @field_validator("estoque_disponivel")
    @classmethod
    def validar_estoque(cls, v):
        if v is not None and v < 0:
            raise ValueError("estoque_disponivel não pode ser negativo")
        return v

    @field_validator(
        "receita_total",
        "receita_media_por_pedido",
        "media_nota_produto",
        "media_nota_nps",
    )
    @classmethod
    def validar_floats_nao_negativos(cls, v):
        if v < 0:
            raise ValueError("o campo não pode ser negativo")
        return v

    @field_validator("pct_recomenda")
    @classmethod
    def validar_pct_recomenda(cls, v):
        if not (0 <= v <= 100):
            raise ValueError("pct_recomenda deve estar entre 0 e 100")
        return v


class ProdutoUpdateSchema(BaseModel):
    nome_produto: str | None = Field(None, min_length=1, description="Nome do produto")
    categoria: str | None = Field(None, min_length=1, description="Categoria do produto")
    preco: float | None = Field(None, gt=0, description="Preço do produto")
    total_pedidos: int | None = Field(None, ge=0, description="Quantidade total de pedidos")
    unidades_vendidas: int | None = Field(None, ge=0, description="Quantidade total de unidades vendidas")
    receita_total: float | None = Field(None, ge=0, description="Receita total gerada pelo produto")
    receita_media_por_pedido: float | None = Field(None, ge=0, description="Receita média por pedido")
    estoque_disponivel: int | None = Field(None, ge=0, description="Quantidade disponível em estoque")
    total_avaliacoes: int | None = Field(None, ge=0, description="Quantidade total de avaliações")
    media_nota_produto: float | None = Field(None, ge=0, description="Média das notas do produto")
    media_nota_nps: float | None = Field(None, ge=0, description="Média da nota NPS")
    pct_recomenda: float | None = Field(None, ge=0, le=100, description="Percentual de recomendação do produto")
    total_tickets: int | None = Field(None, ge=0, description="Quantidade total de tickets relacionados")
    total_visualizacoes: int | None = Field(None, ge=0, description="Quantidade total de visualizações")
    flag_alto_ticket: bool | None = Field(None, description="Indica se o produto possui alto volume de tickets")

    model_config = ConfigDict(extra="forbid")

    @field_validator("categoria")
    @classmethod
    def validar_categoria(cls, v):
        if v is None:
            return v
        return v.strip().capitalize()

    @field_validator("nome_produto")
    @classmethod
    def validar_nome(cls, v):
        if v is None:
            return v
        return v.strip()

    @field_validator("preco")
    @classmethod
    def validar_preco(cls, v):
        if v is None:
            return v
        if v <= 0:
            raise ValueError("preco deve ser maior que zero")
        return v

    @field_validator(
        "total_pedidos",
        "unidades_vendidas",
        "total_avaliacoes",
        "total_tickets",
        "total_visualizacoes",
    )
    @classmethod
    def validar_inteiros_nao_negativos(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError("o campo não pode ser negativo")
        return v

    @field_validator("estoque_disponivel")
    @classmethod
    def validar_estoque(cls, v):
        if v is not None and v < 0:
            raise ValueError("estoque_disponivel não pode ser negativo")
        return v

    @field_validator(
        "receita_total",
        "receita_media_por_pedido",
        "media_nota_produto",
        "media_nota_nps",
    )
    @classmethod
    def validar_floats_nao_negativos(cls, v):
        if v is None:
            return v
        if v < 0:
            raise ValueError("o campo não pode ser negativo")
        return v

    @field_validator("pct_recomenda")
    @classmethod
    def validar_pct_recomenda(cls, v):
        if v is None:
            return v
        if not (0 <= v <= 100):
            raise ValueError("pct_recomenda deve estar entre 0 e 100")
        return v