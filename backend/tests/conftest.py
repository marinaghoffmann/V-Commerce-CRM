import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
import app.database as db_module

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

db_module.engine = test_engine
db_module.SessionLocal = TestingSessionLocal

from app.database import Base, get_db
from app.models import (
    Cliente,
    Produto,
    pedido,
    KpiPorCategoria,
    KpiPorEstado,
    KpiPorStatus,
    ComportamentoDigital,
    Ticket,
)
from app.main import app as fastapi_app

Base.metadata.create_all(bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


fastapi_app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    with TestClient(fastapi_app) as c:
        yield c


@pytest.fixture
def mock_cliente():
    """Valid client fixture with properly formatted data."""
    return {
        "nome": "João",
        "sobrenome": "Silva",
        "email": "joao.silva@example.com",
        "telefone_formatado": "(81) 98765-4321",
        "estado": "PE",
        "cidade": "Recife",
        "data_nascimento": "1990-05-15",
        "genero": "M",
        "origem": "web"
    }

@pytest.fixture
def mock_produto():
    return {
    "nome_produto": "Telefone Celular",
    "categoria": "Eletrônicos",
    "preco": 1200.0,
    "total_pedidos": 2,
    "unidades_vendidas": 3,
    "receita_total": 3600.0,
    "receita_media_por_pedido": 1800.0,
    "estoque_disponivel": 100,
    "total_avaliacoes": 8,
    "media_nota_produto": 5.0,
    "media_nota_nps": 9.0,
    "pct_recomenda": 92.0,
    "total_tickets": 1,
    "total_visualizacoes": 1,
    "flag_alto_ticket": False,
}

@pytest.fixture
def mock_pedido():
    return {
        "id_pedido": "123-213-123",
        "id_cliente": "1231241335123123123",
        "id_produto": "1111111",
        "nome_completo": "João Silva",
        "email": "joao@silva.com",
        "cidade": "Recife",
        "estado": "PE",
        "data_pedido": "2026-05-11",
        "valor_pedido": 1200,
        "quantidade": 3,
        "status": "criado",
        "metodo_pagamento": "pix",
}

@pytest.fixture
def mock_ticket():
    return {
        "id_ticket": "111-222-333",
        "id_cliente": "1231241335123123123",
        "nome_cliente": "João Silva",
        "tipo_problema": "produto",
        "status_ticket": "aberto",
        "data_abertura": "2026-05-11",
        "agente_suporte": "Carlos Souza",
        "nome_produto": "Celular",
        "categoria_produto": "Eletronico",
        "valor_pedido": 1200,
        "total_pedidos_cliente": 2,
        "receita_total_cliente": 1800
    }