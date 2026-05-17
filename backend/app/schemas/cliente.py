from pydantic import BaseModel, Field, field_validator, EmailStr
from datetime import date
from enum import Enum
import re

class GeneroEnum(str, Enum):
    """Gender options: M (Male), F (Female), O (Other)."""
    M = "M"
    F = "F"
    O = "O"

class OrigemEnum(str, Enum):
    """Origin options: web, app, indicacao."""
    WEB = "web"
    APP = "app"
    INDICACAO = "indicacao"

class PedidoResumo(BaseModel):
    id_pedido: str | None = None
    data_pedido: date | None = None
    valor_pedido: float | None = 0.0
    status: str | None = None
    
    model_config = {"from_attributes": True}

class TicketResumo(BaseModel):
    id_ticket: str | None = None
    data_abertura: date | None = None
    tipo_problema: str | None = None
    status_ticket: str | None = None
    
    model_config = {"from_attributes": True}

# v_cliente_360

class ClienteSchema(BaseModel):
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
    origem:                     str | None = None

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

    pedidos: list[PedidoResumo] = []
    tickets: list[TicketResumo] = []

    model_config = {"from_attributes": True}

class ClienteCreateSchema(BaseModel):
    """Schema for creating a new client with automatic formatting and validation."""
    nome: str = Field(..., min_length=1, description="Client first name")
    sobrenome: str = Field(..., min_length=1, description="Client last name")
    email: str = Field(..., description="Client email address")
    telefone_formatado: str = Field(..., description="Formatted phone: (XX) XXXX-XXXX or (XX) XXXXX-XXXX")
    telefone_ramal: str | None = Field(None, description="Optional extension")
    estado: str = Field(..., min_length=2, max_length=2, description="State abbreviation (e.g., SP, RJ)")
    cidade: str = Field(..., min_length=1, description="City name")
    data_nascimento: date | None = Field(None, description="Birth date (YYYY-MM-DD)")
    genero: GeneroEnum = Field(..., description="Gender: M (Male), F (Female), O (Other)")
    origem: OrigemEnum | None = Field(None, description="Origin: web, app, or indicacao")

    model_config = {"extra": "forbid"}
    
    @field_validator("nome", "sobrenome", mode="before")
    @classmethod
    def format_nome_sobrenome(cls, value: str) -> str:
        """Format name to title case: first letter uppercase, rest lowercase."""
        if not isinstance(value, str):
            raise ValueError("Name must be a string")
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be empty")
        return value.title()
    
    @field_validator("email", mode="before")
    @classmethod
    def format_email(cls, value: str) -> str:
        """Validate and normalize email to lowercase."""
        if not isinstance(value, str):
            raise ValueError("Email must be a string")
        value = value.strip().lower()
        # Basic email validation pattern (RFC 5322 simplified)
        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_pattern, value):
            raise ValueError("Invalid email format. Use: name@example.com")
        return value
    
    @field_validator("telefone_formatado", mode="before")
    @classmethod
    def format_telefone(cls, value: str) -> str:
        """Validate and format phone to (XX) XXXX-XXXX or (XX) XXXXX-XXXX."""
        if not isinstance(value, str):
            raise ValueError("Phone must be a string")
        # Remove all non-digit characters
        digits = re.sub(r"\D", "", value)
        
        # Must be 10 or 11 digits (2 area code + 8 or 9 digits)
        if len(digits) not in (10, 11):
            raise ValueError("Phone must have 10 or 11 digits. Format: (XX) XXXX-XXXX or (XX) XXXXX-XXXX")
        
        area_code = digits[:2]
        phone_number = digits[2:]
        
        if len(phone_number) == 8:
            formatted = f"({area_code}) {phone_number[:4]}-{phone_number[4:]}"
        else:  # 9 digits
            formatted = f"({area_code}) {phone_number[:5]}-{phone_number[5:]}"
        
        return formatted
    
    @field_validator("data_nascimento", mode="before")
    @classmethod
    def validate_data_nascimento(cls, value: str | date | None) -> date | None:
        """Validate and convert birth date to YYYY-MM-DD format."""
        if value is None:
            return None
        if isinstance(value, date):
            return value
        if isinstance(value, str):
            try:
                return date.fromisoformat(value)
            except ValueError:
                raise ValueError("Date must be in YYYY-MM-DD format")
        raise ValueError("Date must be a string in YYYY-MM-DD format or a date object")

class ClienteUpdateSchema(BaseModel):
    """Schema for updating an existing client with same validation as create."""
    nome: str | None = Field(None, min_length=1, description="Client first name")
    sobrenome: str | None = Field(None, min_length=1, description="Client last name")
    email: str | None = Field(None, description="Client email address")
    telefone_formatado: str | None = Field(None, description="Formatted phone: (XX) XXXX-XXXX or (XX) XXXXX-XXXX")
    telefone_ramal: str | None = Field(None, description="Optional extension")
    estado: str | None = Field(None, min_length=2, max_length=2, description="State abbreviation")
    cidade: str | None = Field(None, min_length=1, description="City name")
    data_nascimento: date | None = Field(None, description="Birth date (YYYY-MM-DD)")
    genero: GeneroEnum | None = Field(None, description="Gender: M, F, or O")
    origem: OrigemEnum | None = Field(None, description="Origin: web, app, or indicacao")

    model_config = {"extra": "forbid"}
    
    @field_validator("nome", "sobrenome", mode="before")
    @classmethod
    def format_nome_sobrenome(cls, value: str | None) -> str | None:
        """Format name to title case: first letter uppercase, rest lowercase."""
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("Name must be a string")
        value = value.strip()
        if not value:
            raise ValueError("Name cannot be empty")
        return value.title()
    
    @field_validator("email", mode="before")
    @classmethod
    def format_email(cls, value: str | None) -> str | None:
        """Validate and normalize email to lowercase."""
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("Email must be a string")
        value = value.strip().lower()
        email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        if not re.match(email_pattern, value):
            raise ValueError("Invalid email format. Use: name@example.com")
        return value
    
    @field_validator("telefone_formatado", mode="before")
    @classmethod
    def format_telefone(cls, value: str | None) -> str | None:
        """Validate and format phone to (XX) XXXX-XXXX or (XX) XXXXX-XXXX."""
        if value is None:
            return None
        if not isinstance(value, str):
            raise ValueError("Phone must be a string")
        digits = re.sub(r"\D", "", value)
        
        if len(digits) not in (10, 11):
            raise ValueError("Phone must have 10 or 11 digits. Format: (XX) XXXX-XXXX or (XX) XXXXX-XXXX")
        
        area_code = digits[:2]
        phone_number = digits[2:]
        
        if len(phone_number) == 8:
            formatted = f"({area_code}) {phone_number[:4]}-{phone_number[4:]}"
        else:
            formatted = f"({area_code}) {phone_number[:5]}-{phone_number[5:]}"
        
        return formatted
    
    @field_validator("data_nascimento", mode="before")
    @classmethod
    def validate_data_nascimento(cls, value: str | date | None) -> date | None:
        """Validate and convert birth date to YYYY-MM-DD format."""
        if value is None:
            return None
        if isinstance(value, date):
            return value
        if isinstance(value, str):
            try:
                return date.fromisoformat(value)
            except ValueError:
                raise ValueError("Date must be in YYYY-MM-DD format")
        raise ValueError("Date must be a string in YYYY-MM-DD format or a date object")