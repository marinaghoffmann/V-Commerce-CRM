import pytest
from fastapi.testclient import TestClient


class TestTicket:
    def test_create_ticket(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket_response = client.post("/ticket/", json=mock_ticket)
        assert ticket_response.status_code == 201
        assert ticket_response.json()["id_ticket"] == "111-222-333"

    def test_duplicate_ticket(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket_response = client.post("/ticket/", json=mock_ticket)
        assert ticket_response.status_code == 201

        duplicate_response = client.post("/ticket/", json=mock_ticket)
        assert duplicate_response.status_code == 400

    def test_get_valid_ticket(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket_response = client.post("/ticket/", json=mock_ticket)
        assert ticket_response.status_code == 201
        ticket_id = ticket_response.json()["id_ticket"]

        get_response = client.get(f"/ticket/{ticket_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id_ticket"] == ticket_id

    def test_get_nonexistent_ticket(self, client: TestClient):
        get_response = client.get("/ticket/ID_INEXISTENTE")
        assert get_response.status_code == 404
        assert get_response.json()["detail"] == "Ticket não encontrado"

    def test_update_ticket(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket_response = client.post("/ticket/", json=mock_ticket)
        assert ticket_response.status_code == 201
        ticket_id = ticket_response.json()["id_ticket"]

        update_response = client.patch(f"/ticket/{ticket_id}", json={"status_ticket": "fechado"})
        assert update_response.status_code == 200
        assert update_response.json()["status_ticket"] == "fechado"

    def test_update_reflects_on_get(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket_response = client.post("/ticket/", json=mock_ticket)
        assert ticket_response.status_code == 201
        ticket_id = ticket_response.json()["id_ticket"]

        client.patch(f"/ticket/{ticket_id}", json={"status_ticket": "fechado"})

        get_response = client.get(f"/ticket/{ticket_id}")
        assert get_response.status_code == 200
        assert get_response.json()["status_ticket"] == "fechado"

    def test_update_nonexistent_ticket(self, client: TestClient):
        update_response = client.patch("/ticket/ID_INEXISTENTE", json={"status_ticket": "fechado"})
        assert update_response.status_code == 404
        assert update_response.json()["detail"] == "Ticket não encontrado"

    def test_delete_ticket(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket_response = client.post("/ticket/", json=mock_ticket)
        assert ticket_response.status_code == 201
        ticket_id = ticket_response.json()["id_ticket"]

        delete_response = client.delete(f"/ticket/{ticket_id}")
        assert delete_response.status_code == 204

        get_response = client.get(f"/ticket/{ticket_id}")
        assert get_response.status_code == 404

    def test_delete_nonexistent_ticket(self, client: TestClient):
        delete_response = client.delete("/ticket/ID_INEXISTENTE")
        assert delete_response.status_code == 404
        assert delete_response.json()["detail"] == "Ticket não encontrado"

    def test_create_ticket_with_nonexistent_cliente(self, client: TestClient, mock_ticket):
        ticket_response = client.post("/ticket/", json=mock_ticket)
        assert ticket_response.status_code == 404
        assert ticket_response.json()["detail"] == "Cliente não encontrado"


    def test_nome_valido_vira_title_case(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["nome_cliente"] = "joão silva"

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 201

    @pytest.mark.parametrize("nome_invalido", [
        "João123",
        "Maria@Silva",
        "Pedro!",
    ], ids=["com número", "com arroba", "com exclamação"])
    def test_nome_invalido(self, client: TestClient, mock_ticket, mock_cliente, nome_invalido):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["nome_cliente"] = nome_invalido

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 422

    def test_agente_valido_vira_title_case(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["agente_suporte"] = "carlos souza"

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 201

    @pytest.mark.parametrize("agente_invalido", [
        "Carlos123",
        "Ana@Lima",
        "Pedro!",
    ], ids=["com número", "com arroba", "com exclamação"])
    def test_agente_invalido(self, client: TestClient, mock_ticket, mock_cliente, agente_invalido):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["agente_suporte"] = agente_invalido

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 422


class TestTipoProblema:
    @pytest.mark.parametrize("tipo_valido", [
        "reembolso", "entrega", "produto", "pagamento"
    ])
    def test_tipo_problema_valido_e_aceito(self, client: TestClient, mock_ticket, mock_cliente, tipo_valido):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["tipo_problema"] = tipo_valido

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 201

    @pytest.mark.parametrize("tipo_invalido", [
        "Técnico", "financeiro", "outros", ""
    ], ids=["Técnico", "financeiro", "outros", "vazio"])
    def test_tipo_problema_invalido(self, client: TestClient, mock_ticket, mock_cliente, tipo_invalido):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["tipo_problema"] = tipo_invalido

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 422


    @pytest.mark.parametrize("status_valido", [
        "aberto", "fechado"
    ])
    def test_status_valido_e_aceito(self, client: TestClient, mock_ticket, mock_cliente, status_valido):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["status_ticket"] = status_valido

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 201

    @pytest.mark.parametrize("status_invalido", [
        "pendente", "em_andamento", ""
    ], ids=["pendente", "em andamento", "vazio"])
    def test_status_invalido_retorna_422(self, client: TestClient, mock_ticket, mock_cliente, status_invalido):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["status_ticket"] = status_invalido

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 422


    def test_data_abertura_valida_e_aceita(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["data_abertura"] = "2024-01-15"

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 201

    @pytest.mark.parametrize("data_invalida", [
        "15/01/2024",
        "2024/01/15",
        "01-15-2024",
        "nao e uma data",
    ], ids=["DD/MM/YYYY", "YYYY/MM/DD", "MM-DD-YYYY", "texto"])
    def test_data_abertura_invalida(self, client: TestClient, mock_ticket, mock_cliente, data_invalida):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["data_abertura"] = data_invalida

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 422

    @pytest.mark.parametrize("data_invalida", [
        "15/01/2024",
        "2024/01/15",
        "não é uma data",
    ], ids=["DD/MM/YYYY", "YYYY/MM/DD", "texto"])
    def test_data_resolucao_invalida(self, client: TestClient, mock_ticket, mock_cliente, data_invalida):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["data_resolucao"] = data_invalida

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 422


    def test_tempo_resolucao_negativo(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["tempo_resolucao_horas"] = -1.0

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 422

    def test_valor_pedido_negativo(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["valor_pedido"] = -0.01

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 422

    def test_total_pedidos_negativo(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["total_pedidos_cliente"] = -1

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 422

    def test_receita_total_negativa(self, client: TestClient, mock_ticket, mock_cliente):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket["receita_total_cliente"] = -0.01

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 422

    @pytest.mark.parametrize("campo,valor", [
        ("tempo_resolucao_horas", 0.0),
        ("valor_pedido", 0.0),
        ("total_pedidos_cliente", 0),
        ("receita_total_cliente", 0.0),
    ])
    def test_valores_zero_sao_aceitos(self, client: TestClient, mock_ticket, mock_cliente, campo, valor):
        client.post("/clientes/", json=mock_cliente)

        ticket = mock_ticket.copy()
        ticket[campo] = valor

        response = client.post("/ticket/", json=ticket)
        assert response.status_code == 201