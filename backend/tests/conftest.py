import pytest
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.database import Base, get_db, engine as original_engine, SessionLocal as original_sessionlocal
from app.models import (
    Cliente,
    Produto,
    pedido,
    KpiPorCategoria,
    KpiPorEstado,
    KpiPorStatus,
    ComportamentoDigital,
    Ticket
)

from app.main import app as fastapi_app

Base.metadata.create_all(bind=original_engine)

def override_get_db():
    try:
        db = original_sessionlocal()
        yield db
    finally:
        db.close()

@pytest.fixture(autouse=True)
def clean_database():
    with original_engine.begin() as connection:
        for table in reversed(Base.metadata.sorted_tables):
            try:
                connection.execute(table.delete())
            except Exception:
                pass
    
    yield
    
    with original_engine.begin() as connection:
        for table in reversed(Base.metadata.sorted_tables):
            try:
                connection.execute(table.delete())
            except Exception:
                pass

@pytest.fixture
def client():
    fastapi_app.dependency_overrides[get_db] = override_get_db
    client = TestClient(fastapi_app)
    yield client
    fastapi_app.dependency_overrides.clear()


@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    yield
    if os.path.exists("test.db"):
        os.remove("test.db")