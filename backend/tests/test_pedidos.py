import pytest
from fastapi.testclient import TestClient

# Testes realizados
# Criação
#       Verificar se um pedido pode ser criado com sucesso
#       Verificar se um pedido criado poderá ser recuperado corretamente
#       Verificar se pedido não podem ser criados com chaves duplicadas
#       Verificar se os campos obrigatórios são validados (On Hold)
# Leitura
#       Verificar se um pedido existente pode ser recuperado por ID
#       Verificar se a resposta para um pedido inexistente é adequada (404)
# Edição
#      Verificar se um pedido existente pode ser atualizado com sucesso
#      Verificar se as atualizações são refletidas corretamente na leitura subsequente
#      Verificar se a resposta para atualização de um pedido inexistente é adequada (404)
# Deleção
#      Verificar se um pedido existente pode ser deletado com sucesso
#      Verificar se a resposta para deleção de um pedido inexistente é adequada (404)

class TestPedido:
    def test_create_pedido(self, client: TestClient, mock_pedido):
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 201
        assert pedido_response.json()["id_pedido"] == "123-213-123"
    
    def test_create_duplicate_pedido(self, client: TestClient, mock_pedido  ):
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 201
        assert pedido_response.json()["id_pedido"] == "123-213-123"

        duplicate_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert duplicate_response.status_code == 400

    def test_get_pedido_existent(self, client: TestClient, mock_pedido, mock_cliente, mock_produto):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        produto_response = client.post("/produto/", json=mock_produto)

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
    
    def test_update_pedido(self, client: TestClient, mock_pedido):
        pedido_response = client.post("/pedidos_cliente/", json=mock_pedido)
        assert pedido_response.status_code == 201
        pedido_id = pedido_response.json()["id_pedido"]

        update_payload = mock_pedido.copy()
        update_payload["status"] = "Atualizado"

        update_response = client.patch(f"/pedidos_cliente/{pedido_id}", json=update_payload)
        assert update_response.status_code == 200
        assert update_response.json()["status"] == "Atualizado"
    
    def test_update_nonexistent_pedido(self, client: TestClient, mock_pedido):
        update_payload = mock_pedido.copy()
        update_payload["status"] = "Atualizado"

        update_response = client.patch("/pedidos_cliente/ID_INEXISTENTE", json=update_payload)
        assert update_response.status_code == 404
        assert update_response.json()["detail"] == "Pedido não encontrado"
    
    def test_delete_pedido(self, client: TestClient, mock_pedido):
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

    