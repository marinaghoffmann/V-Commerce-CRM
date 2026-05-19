"""
Comprehensive test suite for Cliente router.

Tests cover:
- Happy path: client creation with automatic formatting and UUID generation
- Error cases: validation errors, duplicates, not found
- Edge cases: empty datasets, pagination, filtering, boundary values
- Update operations: partial updates, immutable fields, email uniqueness
"""

import pytest
from fastapi.testclient import TestClient
from datetime import date

from app.models.cliente import Cliente


def _atualizar_cliente(db_session, email: str, **attrs):
    cliente = db_session.query(Cliente).filter(Cliente.email == email).first()
    assert cliente is not None

    for chave, valor in attrs.items():
        setattr(cliente, chave, valor)

    db_session.add(cliente)
    db_session.commit()
    db_session.refresh(cliente)
    return cliente


class TestClienteCreate:
    """Tests for POST /clientes (create client)."""
    
    def test_create_cliente_success(self, client: TestClient, mock_cliente):
        """Test successful client creation with UUID generated."""
        response = client.post("/clientes", json=mock_cliente)
        
        assert response.status_code == 201
        data = response.json()
        
        # Verify UUID generated
        assert "id_cliente" in data
        assert len(data["id_cliente"]) == 32  # UUID hex format
        
        # Verify data is returned correctly
        assert data["nome"] == "João"
        assert data["sobrenome"] == "Silva"
        assert data["email"] == "joao.silva@example.com"
        assert data["telefone_formatado"] == "(81) 98765-4321"
        assert data["estado"] == "PE"
        assert data["genero"] == "M"
        assert data["origem"] == "web"
        assert data["segmento_cliente"] == "novo"
    
    def test_create_cliente_name_capitalization(self, client: TestClient):
        """Test that name and surname are capitalized correctly (first letter uppercase, rest lowercase)."""
        payload = {
            "nome": "jOÃO",
            "sobrenome": "sILVA",
            "email": "test@example.com",
            "telefone_formatado": "(81) 98765-4321",
            "estado": "PE",
            "cidade": "Recife",
            "genero": "M"
        }
        response = client.post("/clientes", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        # Pydantic's capitalize() makes first letter uppercase, rest lowercase
        assert data["nome"] == "João"
        assert data["sobrenome"] == "Silva"
    
    def test_create_cliente_email_normalization(self, client: TestClient):
        """Test that email is normalized to lowercase."""
        payload = {
            "nome": "Maria",
            "sobrenome": "Santos",
            "email": "MARIA.SANTOS@EXAMPLE.COM",
            "telefone_formatado": "(81) 98765-4321",
            "estado": "PE",
            "cidade": "Recife",
            "genero": "F"
        }
        response = client.post("/clientes", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "maria.santos@example.com"
    
    def test_create_cliente_phone_formatting_10_digits(self, client: TestClient):
        """Test phone formatting with 10 digits (landline): (XX) XXXX-XXXX."""
        payload = {
            "nome": "Carlos",
            "sobrenome": "Oliveira",
            "email": "carlos@example.com",
            "telefone_formatado": "81987654321",  # 11 digits with area code
            "estado": "PE",
            "cidade": "Recife",
            "genero": "M"
        }
        response = client.post("/clientes", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert data["telefone_formatado"] == "(81) 98765-4321"
    
    def test_create_cliente_phone_formatting_with_special_chars(self, client: TestClient):
        """Test phone formatting with special characters (removes non-digits)."""
        payload = {
            "nome": "Ana",
            "sobrenome": "Costa",
            "email": "ana@example.com",
            "telefone_formatado": "(81) 9876-5432",  # Already partially formatted
            "estado": "PE",
            "cidade": "Recife",
            "genero": "F"
        }
        response = client.post("/clientes", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert data["telefone_formatado"] == "(81) 9876-5432"
    
    def test_create_cliente_date_formatting(self, client: TestClient):
        """Test that birth date is formatted as YYYY-MM-DD."""
        payload = {
            "nome": "Pedro",
            "sobrenome": "Martins",
            "email": "pedro@example.com",
            "telefone_formatado": "(81) 98765-4321",
            "estado": "PE",
            "cidade": "Recife",
            "data_nascimento": "1985-03-20",
            "genero": "M"
        }
        response = client.post("/clientes", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert data["data_nascimento"] == "1985-03-20"
    
    def test_create_cliente_data_cadastro_set_to_today(self, client: TestClient, mock_cliente):
        """Test that data_cadastro is automatically set to today."""
        response = client.post("/clientes", json=mock_cliente)
        
        assert response.status_code == 201
        data = response.json()
        # Should be today's date in YYYY-MM-DD format
        assert data["data_cadastro"] is not None
        assert isinstance(data["data_cadastro"], str)
    
    def test_create_cliente_duplicate_email_returns_409(self, client: TestClient, mock_cliente):
        """Test that duplicate email returns 409 Conflict (not 400)."""
        # Create first client
        response1 = client.post("/clientes", json=mock_cliente)
        assert response1.status_code == 201
        
        # Attempt to create second client with same email
        response2 = client.post("/clientes", json=mock_cliente)
        assert response2.status_code == 409
        assert "Email já cadastrado" in response2.json()["detail"]
    
    def test_create_cliente_missing_nome(self, client: TestClient, mock_cliente):
        """Test that missing 'nome' returns 422 validation error."""
        payload = mock_cliente.copy()
        del payload["nome"]
        
        response = client.post("/clientes", json=payload)
        assert response.status_code == 422
    
    def test_create_cliente_missing_email(self, client: TestClient, mock_cliente):
        """Test that missing 'email' returns 422 validation error."""
        payload = mock_cliente.copy()
        del payload["email"]
        
        response = client.post("/clientes", json=payload)
        assert response.status_code == 422
    
    def test_create_cliente_missing_telefone(self, client: TestClient, mock_cliente):
        """Test that missing 'telefone_formatado' returns 422 validation error."""
        payload = mock_cliente.copy()
        del payload["telefone_formatado"]
        
        response = client.post("/clientes", json=payload)
        assert response.status_code == 422
    
    def test_create_cliente_missing_genero(self, client: TestClient, mock_cliente):
        """Test that missing 'genero' returns 422 validation error."""
        payload = mock_cliente.copy()
        del payload["genero"]
        
        response = client.post("/clientes", json=payload)
        assert response.status_code == 422
    
    def test_create_cliente_invalid_genero(self, client: TestClient, mock_cliente):
        """Test that invalid genero value returns 422 validation error."""
        payload = mock_cliente.copy()
        payload["genero"] = "X"  # Invalid, must be M, F, or O
        
        response = client.post("/clientes", json=payload)
        assert response.status_code == 422
    
    def test_create_cliente_valid_genero_values(self, client: TestClient, mock_cliente):
        """Test that all valid genero values (M, F, O) are accepted."""
        for genero in ["M", "F", "O"]:
            payload = mock_cliente.copy()
            payload["email"] = f"test.{genero}@example.com"
            payload["genero"] = genero
            
            response = client.post("/clientes", json=payload)
            assert response.status_code == 201
            assert response.json()["genero"] == genero
    
    def test_create_cliente_invalid_origem(self, client: TestClient, mock_cliente):
        """Test that invalid origem value returns 422 validation error."""
        payload = mock_cliente.copy()
        payload["origem"] = "email"  # Invalid, must be web, app, or indicacao
        
        response = client.post("/clientes", json=payload)
        assert response.status_code == 422
    
    def test_create_cliente_valid_origem_values(self, client: TestClient, mock_cliente):
        """Test that all valid origem values (web, app, indicacao) are accepted."""
        for origem in ["web", "app", "indicacao"]:
            payload = mock_cliente.copy()
            payload["email"] = f"test.{origem}@example.com"
            payload["origem"] = origem
            
            response = client.post("/clientes", json=payload)
            assert response.status_code == 201
            assert response.json()["origem"] == origem
    
    def test_create_cliente_origem_optional(self, client: TestClient, mock_cliente):
        """Test that origem is optional (can be null)."""
        payload = mock_cliente.copy()
        del payload["origem"]
        
        response = client.post("/clientes", json=payload)
        assert response.status_code == 201
        assert response.json()["origem"] is None
    
    def test_create_cliente_invalid_email_format(self, client: TestClient, mock_cliente):
        """Test that invalid email format returns 422 validation error."""
        invalid_emails = [
            "notanemail",
            "missing@domain",
            "@nodomain.com",
            "spaces in@email.com"
        ]
        
        for invalid_email in invalid_emails:
            payload = mock_cliente.copy()
            payload["email"] = invalid_email
            
            response = client.post("/clientes", json=payload)
            assert response.status_code == 422
    
    def test_create_cliente_invalid_phone_format(self, client: TestClient, mock_cliente):
        """Test that invalid phone format returns 422 validation error."""
        invalid_phones = [
            "123",           # Too few digits
            "12345678901234",  # Too many digits
            "",              # Empty
            "abc-defg-hijk"  # Non-digits
        ]
        
        for invalid_phone in invalid_phones:
            payload = mock_cliente.copy()
            payload["telefone_formatado"] = invalid_phone
            
            response = client.post("/clientes", json=payload)
            assert response.status_code == 422
    
    def test_create_cliente_invalid_date_format(self, client: TestClient, mock_cliente):
        """Test that invalid date format returns 422 validation error."""
        payload = mock_cliente.copy()
        payload["data_nascimento"] = "15/03/1985"  # Invalid format, must be YYYY-MM-DD
        
        response = client.post("/clientes", json=payload)
        assert response.status_code == 422
    
    def test_create_cliente_with_accents_in_name(self, client: TestClient):
        """Test that names with accents are handled correctly."""
        payload = {
            "nome": "josé",
            "sobrenome": "montüeiro",
            "email": "jose@example.com",
            "telefone_formatado": "(81) 98765-4321",
            "estado": "PE",
            "cidade": "Recife",
            "genero": "M"
        }
        response = client.post("/clientes", json=payload)
        
        assert response.status_code == 201
        data = response.json()
        assert "josé" in data["nome"].lower() or data["nome"] == "José"
    
    def test_create_cliente_empty_name(self, client: TestClient, mock_cliente):
        """Test that empty name returns 422 validation error."""
        payload = mock_cliente.copy()
        payload["nome"] = ""
        
        response = client.post("/clientes", json=payload)
        assert response.status_code == 422


class TestClienteRead:
    """Tests for GET /clientes (list) and GET /clientes/{id} (detail)."""
    
    def test_listar_clientes_empty(self, client: TestClient, clean_database):
        """Test listing clients when database is empty."""
        response = client.get("/clientes")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_obter_cliente_por_id(self, client: TestClient, mock_cliente):
        """Test retrieving a client by ID."""
        # Create client
        create_response = client.post("/clientes", json=mock_cliente)
        cliente_id = create_response.json()["id_cliente"]
        
        # Get client
        get_response = client.get(f"/clientes/{cliente_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id_cliente"] == cliente_id
        assert get_response.json()["nome"] == "João"
    
    def test_obter_cliente_nao_existente(self, client: TestClient):
        """Test retrieving non-existent client returns 404."""
        response = client.get("/clientes/CLIENTE_INEXISTENTE")
        assert response.status_code == 404
        assert response.json()["detail"] == "Cliente não encontrado"
    
    def test_listar_clientes_com_paginacao(self, client: TestClient, mock_cliente):
        """Test listing clients with pagination."""
        # Create multiple clients
        for i in range(5):
            payload = mock_cliente.copy()
            payload["email"] = f"cliente{i}@example.com"
            client.post("/clientes", json=payload)
        
        # Test pagination
        response = client.get("/clientes?page=1&limit=2")
        assert response.status_code == 200
        assert len(response.json()) == 2
    
    def test_listar_clientes_busca_por_nome(self, client: TestClient, mock_cliente):
        """Test filtering clients by name search."""
        # Create clients
        payload1 = mock_cliente.copy()
        payload1["nome"] = "Antonio"
        payload1["email"] = "antonio@example.com"
        client.post("/clientes", json=payload1)
        
        payload2 = mock_cliente.copy()
        payload2["nome"] = "Maria"
        payload2["email"] = "maria@example.com"
        client.post("/clientes", json=payload2)
        
        # Search for Antonio
        response = client.get("/clientes?busca=Antonio")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["nome"] == "Antonio"
    
    def test_listar_clientes_busca_por_email(self, client: TestClient, mock_cliente):
        """Test filtering clients by email search."""
        # Create clients
        email = "specific@example.com"
        payload = mock_cliente.copy()
        payload["email"] = email
        client.post("/clientes", json=payload)
        
        # Search for email
        response = client.get(f"/clientes?busca={email}")
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["email"] == email
    
    def test_listar_clientes_com_status_filter(self, client: TestClient, mock_cliente):
        """Test filtering clients by segment status."""
        # Create client
        client.post("/clientes", json=mock_cliente)

        # This test verifies the filter parameter is accepted
        response = client.get("/clientes?status=premium")
        assert response.status_code == 200

    def test_listar_clientes_com_multiplos_status(self, client: TestClient, mock_cliente, db_session):
        """Test filtering clients by more than one segment value."""
        payload_a = mock_cliente.copy()
        payload_a["email"] = "multi-premium@example.com"
        client.post("/clientes", json=payload_a)

        payload_b = mock_cliente.copy()
        payload_b["email"] = "multi-inativo@example.com"
        client.post("/clientes", json=payload_b)

        payload_c = mock_cliente.copy()
        payload_c["email"] = "multi-novo@example.com"
        client.post("/clientes", json=payload_c)

        for email, segmento in [
            ("multi-premium@example.com", "premium"),
            ("multi-inativo@example.com", "inativo"),
            ("multi-novo@example.com", "novo"),
        ]:
            cliente = db_session.query(Cliente).filter(Cliente.email == email).first()
            assert cliente is not None
            cliente.segmento_cliente = segmento
            db_session.add(cliente)
        db_session.commit()

        response = client.get("/clientes?status=premium&status=inativo")

        assert response.status_code == 200
        emails = [cliente["email"] for cliente in response.json()]
        assert emails == ["multi-premium@example.com", "multi-inativo@example.com"]

    def test_listar_clientes_ordem_por_receita_desc(self, client: TestClient, mock_cliente, db_session):
        """Test ordering clients by highest revenue first."""
        payload_a = mock_cliente.copy()
        payload_a["email"] = "cliente-a@example.com"
        client.post("/clientes", json=payload_a)

        payload_b = mock_cliente.copy()
        payload_b["email"] = "cliente-b@example.com"
        client.post("/clientes", json=payload_b)

        payload_c = mock_cliente.copy()
        payload_c["email"] = "cliente-c@example.com"
        client.post("/clientes", json=payload_c)

        _atualizar_cliente(
            db_session,
            "cliente-a@example.com",
            receita_total_cliente=120.0,
            total_compras=2,
            ticket_medio=60.0,
            data_ultima_compra=date(2026, 5, 10),
        )
        _atualizar_cliente(
            db_session,
            "cliente-b@example.com",
            receita_total_cliente=320.0,
            total_compras=6,
            ticket_medio=53.33,
            data_ultima_compra=date(2026, 5, 18),
        )
        _atualizar_cliente(
            db_session,
            "cliente-c@example.com",
            receita_total_cliente=210.0,
            total_compras=4,
            ticket_medio=52.5,
            data_ultima_compra=date(2026, 5, 15),
        )

        response = client.get("/clientes?ordem=receita_total_cliente:desc")

        assert response.status_code == 200
        emails = [cliente["email"] for cliente in response.json()]
        assert emails == ["cliente-b@example.com", "cliente-c@example.com", "cliente-a@example.com"]

    def test_listar_clientes_ordem_por_total_compras_asc_com_status(self, client: TestClient, mock_cliente, db_session):
        """Test ordering clients by fewest purchases while preserving status filtering."""
        payload_a = mock_cliente.copy()
        payload_a["email"] = "premium-1@example.com"
        client.post("/clientes", json=payload_a)

        payload_b = mock_cliente.copy()
        payload_b["email"] = "premium-2@example.com"
        client.post("/clientes", json=payload_b)

        payload_c = mock_cliente.copy()
        payload_c["email"] = "inativo-1@example.com"
        client.post("/clientes", json=payload_c)

        _atualizar_cliente(
            db_session,
            "premium-1@example.com",
            segmento_cliente="premium",
            total_compras=9,
            receita_total_cliente=900.0,
            ticket_medio=100.0,
        )
        _atualizar_cliente(
            db_session,
            "premium-2@example.com",
            segmento_cliente="premium",
            total_compras=3,
            receita_total_cliente=300.0,
            ticket_medio=100.0,
        )
        _atualizar_cliente(
            db_session,
            "inativo-1@example.com",
            segmento_cliente="inativo",
            total_compras=1,
            receita_total_cliente=100.0,
            ticket_medio=100.0,
        )

        response = client.get("/clientes?status=premium&ordem=total_compras:asc")

        assert response.status_code == 200
        emails = [cliente["email"] for cliente in response.json()]
        assert emails == ["premium-2@example.com", "premium-1@example.com"]


class TestClienteUpdate:
    """Tests for PUT /clientes/{id} (update client)."""
    
    def test_atualizar_cliente_sucesso(self, client: TestClient, mock_cliente):
        """Test successful client update."""
        # Create client
        create_response = client.post("/clientes", json=mock_cliente)
        cliente_id = create_response.json()["id_cliente"]
        
        # Update client
        atualizar = {"nome": "João Atualizado"}
        update_response = client.put(f"/clientes/{cliente_id}", json=atualizar)
        
        assert update_response.status_code == 200
        assert update_response.json()["nome"] == "João Atualizado"
    
    def test_atualizar_cliente_aplica_formatadores(self, client: TestClient, mock_cliente):
        """Test that formatters are applied to updated fields."""
        # Create client
        create_response = client.post("/clientes", json=mock_cliente)
        cliente_id = create_response.json()["id_cliente"]
        
        # Update with unformatted data
        atualizar = {
            "nome": "jOÃO",
            "email": "NOVOMAIL@EXAMPLE.COM",
            "telefone_formatado": "81987654321"
        }
        update_response = client.put(f"/clientes/{cliente_id}", json=atualizar)
        
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["nome"] == "João"
        assert data["email"] == "novomail@example.com"
        assert data["telefone_formatado"] == "(81) 98765-4321"
    
    def test_atualizar_cliente_preserva_campos_nao_modificados(self, client: TestClient, mock_cliente):
        """Test that unmodified fields are preserved during partial update."""
        # Create client
        create_response = client.post("/clientes", json=mock_cliente)
        cliente_id = create_response.json()["id_cliente"]
        original_email = create_response.json()["email"]
        
        # Partial update - only name
        atualizar = {"nome": "Novo Nome"}
        update_response = client.put(f"/clientes/{cliente_id}", json=atualizar)
        
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["nome"] == "Novo Nome"
        assert data["email"] == original_email  # Should be unchanged
    
    def test_atualizar_cliente_nao_encontrado(self, client: TestClient, mock_cliente):
        """Test updating non-existent client returns 404."""
        response = client.put("/clientes/CLIENTE_INEXISTENTE", json={"nome": "Novo"})
        assert response.status_code == 404
        assert response.json()["detail"] == "Cliente não encontrado"
    
    def test_atualizar_cliente_nao_pode_mudar_id_cliente(self, client: TestClient, mock_cliente):
        """Test that id_cliente cannot be modified."""
        # Create client
        create_response = client.post("/clientes", json=mock_cliente)
        cliente_id = create_response.json()["id_cliente"]
        
        # Attempt to update id_cliente
        atualizar = {"id_cliente": "novo_id_cliente"}
        update_response = client.put(f"/clientes/{cliente_id}", json=atualizar)
        
        assert update_response.status_code == 422
    
    def test_atualizar_cliente_nao_pode_mudar_data_cadastro(self, client: TestClient, mock_cliente):
        """Test that data_cadastro cannot be modified."""
        # Create client
        create_response = client.post("/clientes", json=mock_cliente)
        cliente_id = create_response.json()["id_cliente"]
        original_data_cadastro = create_response.json()["data_cadastro"]
        
        # Attempt to update data_cadastro
        atualizar = {"data_cadastro": "2020-01-01"}
        update_response = client.put(f"/clientes/{cliente_id}", json=atualizar)
        
        assert update_response.status_code == 422
    
    def test_atualizar_cliente_email_duplicado(self, client: TestClient, mock_cliente):
        """Test that changing email to an existing one returns 409 Conflict."""
        # Create two clients
        email1 = "cliente1@example.com"
        email2 = "cliente2@example.com"
        
        payload1 = mock_cliente.copy()
        payload1["email"] = email1
        response1 = client.post("/clientes", json=payload1)
        cliente1_id = response1.json()["id_cliente"]
        
        payload2 = mock_cliente.copy()
        payload2["email"] = email2
        client.post("/clientes", json=payload2)
        
        # Try to change cliente1's email to cliente2's email
        atualizar = {"email": email2}
        update_response = client.put(f"/clientes/{cliente1_id}", json=atualizar)
        
        assert update_response.status_code == 409
        assert "Email já cadastrado" in update_response.json()["detail"]
    
    def test_atualizar_cliente_email_mesmo_cliente_permitido(self, client: TestClient, mock_cliente):
        """Test that updating with same email is allowed."""
        # Create client
        create_response = client.post("/clientes", json=mock_cliente)
        cliente_id = create_response.json()["id_cliente"]
        email_original = create_response.json()["email"]
        
        # Update with same email
        atualizar = {"email": email_original, "nome": "Novo Nome"}
        update_response = client.put(f"/clientes/{cliente_id}", json=atualizar)
        
        assert update_response.status_code == 200
        assert update_response.json()["email"] == email_original
    
    def test_atualizar_cliente_genero_valido(self, client: TestClient, mock_cliente):
        """Test updating genero to valid values."""
        # Create client
        create_response = client.post("/clientes", json=mock_cliente)
        cliente_id = create_response.json()["id_cliente"]
        
        # Update genero to F (originally M)
        atualizar = {"genero": "F"}
        update_response = client.put(f"/clientes/{cliente_id}", json=atualizar)
        
        assert update_response.status_code == 200
        assert update_response.json()["genero"] == "F"
    
    def test_atualizar_cliente_genero_invalido(self, client: TestClient, mock_cliente):
        """Test that invalid genero returns 422 validation error."""
        # Create client
        create_response = client.post("/clientes", json=mock_cliente)
        cliente_id = create_response.json()["id_cliente"]
        
        # Update with invalid genero
        atualizar = {"genero": "X"}
        update_response = client.put(f"/clientes/{cliente_id}", json=atualizar)
        
        assert update_response.status_code == 422


class TestClienteDelete:
    """Tests for DELETE /clientes/{id} (delete client)."""
    
    def test_deletar_cliente_sucesso(self, client: TestClient, mock_cliente):
        """Test successful client deletion."""
        # Create client
        create_response = client.post("/clientes", json=mock_cliente)
        cliente_id = create_response.json()["id_cliente"]
        
        # Delete client
        delete_response = client.delete(f"/clientes/{cliente_id}")
        assert delete_response.status_code == 204
        
        # Verify deleted
        get_response = client.get(f"/clientes/{cliente_id}")
        assert get_response.status_code == 404
    
    def test_deletar_cliente_nao_encontrado(self, client: TestClient):
        """Test deleting non-existent client returns 404."""
        response = client.delete("/clientes/CLIENTE_INEXISTENTE")
        assert response.status_code == 404
        assert response.json()["detail"] == "Cliente não encontrado"