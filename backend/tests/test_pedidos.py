import pytest
from fastapi.testclient import TestClient

class TestPedido:
    def test_create_pedido(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        mock_pedido["id_produto"] = produto_response.json()["id_produto"]
        mock_pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 201
        assert pedido_response.json()["id_pedido"] == "123-213-123"

    def test_create_duplicate_pedido(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        mock_pedido["id_produto"] = produto_response.json()["id_produto"]
        mock_pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 201
        duplicate_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert duplicate_response.status_code == 400

    def test_create_pedido_with_nonexistent_cliente(self, client: TestClient, mock_pedido, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        mock_pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 404
        assert pedido_response.json()["detail"] == "Pedido não pode ser cadastrado para um cliente não existente no sistema"

    def test_create_pedido_with_nonexistent_produto(self, client: TestClient, mock_pedido, mock_cliente):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        mock_pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 404
        assert pedido_response.json()["detail"] == "Pedido não pode ser cadastrado para um produto não existente no sistema"

    def test_get_pedido_existent(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        mock_pedido["id_produto"] = produto_response.json()["id_produto"]
        mock_pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 201
        pedido_id = pedido_response.json()["id_pedido"]
        get_response = client.get(f"/pedidos_cliente/{pedido_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id_pedido"] == "123-213-123"

    def test_get_pedido_nonexistent(self, client: TestClient):
        get_response = client.get("/pedidos_cliente/ID_INEXISTENTE")
        assert get_response.status_code == 404
        assert get_response.json()["detail"] == "Pedido não encontrado"

    def test_update_pedido(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        mock_pedido["id_produto"] = produto_response.json()["id_produto"]
        mock_pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 201
        pedido_id = pedido_response.json()["id_pedido"]
        update_payload = {"valor_pedido": 1700}
        update_response = client.patch(f"/pedidos_cliente/{pedido_id}", json=update_payload)
        assert update_response.status_code == 200
        assert update_response.json()["valor_pedido"] == 1700

    def test_update_nonexistent_pedido(self, client: TestClient):
        update_payload = {"status": "fechado"}
        update_response = client.patch("/pedidos_cliente/ID_INEXISTENTE", json=update_payload)
        assert update_response.status_code == 404
        assert update_response.json()["detail"] == "Pedido não encontrado"

    def test_update_pedido_with_nonexistent_cliente(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        mock_pedido["id_produto"] = produto_response.json()["id_produto"]
        mock_pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        id_cliente = cliente_response.json()["id_cliente"]
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 201
        pedido_id = pedido_response.json()["id_pedido"]
        client.delete(f"/clientes/{id_cliente}")
        update_payload = {"valor_pedido": 1700}
        update_response = client.patch(f"/pedidos_cliente/{pedido_id}", json=update_payload)
        assert update_response.status_code == 404
        assert update_response.json()["detail"] == "Pedido não pode ser cadastrado para um cliente não existente no sistema"

    def test_update_pedido_with_nonexistent_produto(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        mock_pedido["id_produto"] = produto_response.json()["id_produto"]
        mock_pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 201
        pedido_id = pedido_response.json()["id_pedido"]
        produto_id = produto_response.json()["id_produto"]
        client.delete(f"/produto/{produto_id}")
        update_payload = {"valor_pedido": 1700}
        update_response = client.patch(f"/pedidos_cliente/{pedido_id}", json=update_payload)
        assert update_response.status_code == 404
        assert update_response.json()["detail"] == "Pedido não pode ser cadastrado para um produto não existente no sistema"

    def test_delete_pedido(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        mock_pedido["id_produto"] = produto_response.json()["id_produto"]
        mock_pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 201
        pedido_id = pedido_response.json()["id_pedido"]
        delete_response = client.delete(f"/pedidos_cliente/{pedido_id}")
        assert delete_response.status_code == 204
        get_response = client.get(f"/pedidos_cliente/{pedido_id}")
        assert get_response.status_code == 404

    def test_delete_nonexistent_pedido(self, client: TestClient):
        delete_response = client.delete("/pedidos_cliente/ID_INEXISTENTE")
        assert delete_response.status_code == 404
        assert delete_response.json()["detail"] == "Pedido não encontrado"

    def test_nome_valido_vira_title_case(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["nome_completo"] = "joão da silva"
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 201

    def test_nome_com_espacos_extras_e_removido(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["nome_completo"] = "  maria souza  "
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 201

    def test_nome_com_hifen_e_valido(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["nome_completo"] = "Ana-Paula Silva"
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 201

    @pytest.mark.parametrize("nome_invalido", [
        "João123",
        "Maria@Silva",
        "Pedro!",
    ], ids=["com numero", "com arroba", "com exclamacao"])
    def test_nome_com_caracteres_invalidos(self, client: TestClient, mock_pedido, mock_cliente, mock_produto, nome_invalido):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["nome_completo"] = nome_invalido
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 422

    def test_estado_vira_capitalizado(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["estado"] = "pernambuco"
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 201
        assert response.json()["estado"] == "Pernambuco"

    def test_cidade_vira_capitalizada(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["cidade"] = "recife"
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 201
        assert response.json()["cidade"] == "Recife"

    def test_data_valida_e_aceita(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["data_pedido"] = "2024-01-15"
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 201

    @pytest.mark.parametrize("data_invalida", [
        "15/01/2024",
        "2024/01/15",
        "01-15-2024",
        "não é uma data",
    ], ids=["DD/MM/YYYY", "YYYY/MM/DD", "MM-DD-YYYY", "texto"])
    def test_data_invalida(self, client: TestClient, mock_pedido, mock_cliente, mock_produto, data_invalida):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["data_pedido"] = data_invalida
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 422

    def test_valor_positivo_e_aceito(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["valor_pedido"] = 99.90
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 201

    def test_valor_zero_e_aceito(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["valor_pedido"] = 0.0
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 201

    def test_valor_pedido_negativo(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["valor_pedido"] = -0.01
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 422

    def test_quantidade_positiva(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["quantidade"] = 5
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 201

    def test_quantidade_negativa(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)
        pedido = mock_pedido.copy()
        pedido["id_produto"] = produto_response.json()["id_produto"]
        pedido["id_cliente"] = cliente_response.json()["id_cliente"]
        pedido["quantidade"] = -1
        response = client.post("/pedidos_cliente/", json=pedido)
        assert response.status_code == 422