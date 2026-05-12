import pytest
from fastapi.testclient import TestClient
from sqlalchemy import false

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

class TestProduto:

    def test_create_produto(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        assert produto_response.status_code == 201
        assert produto_response.json()["nome_produto"] == "Telefone Celular"

    def test_create_duplicate_produto(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        assert produto_response.status_code == 201
        assert produto_response.json()["nome_produto"] == "Telefone Celular"

        duplicate_response = client.post("/produto/", json=mock_produto)
        assert duplicate_response.status_code == 400

    def test_get_produto(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        assert produto_response.status_code == 201
        produto_id = produto_response.json()["id_produto"]

        get_response = client.get(f"/produto/{produto_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id_produto"] == produto_id
        assert get_response.json()["nome_produto"] == "Telefone Celular"

    def test_get_nonexistent_produto(self, client: TestClient):
        get_response = client.get("/produto/ID_INEXISTENTE")
        assert get_response.status_code == 404
    
    def test_update_produto(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        assert produto_response.status_code == 201
        produto_id = produto_response.json()["id_produto"]

        update_payload = mock_produto.copy()
        update_payload["nome_produto"] = "Produto Atualizado"

        update_response = client.put(f"/produto/{produto_id}", json=update_payload)
        assert update_response.status_code == 200
        assert update_response.json()["nome_produto"] == "Produto Atualizado"
    
    def test_update_nonexistent_produto(self, client: TestClient, mock_produto):
        update_response = client.put("/produto/ID_INEXISTENTE", json=mock_produto)
        assert update_response.status_code == 404
    
    def test_delete_produto(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        assert produto_response.status_code == 201
        produto_id = produto_response.json()["id_produto"]

        delete_response = client.delete(f"/produto/{produto_id}")
        assert delete_response.status_code == 204

        get_response = client.get(f"/produto/{produto_id}")
        assert get_response.status_code == 404

    def test_delete_nonexistent_produto(self, client: TestClient):
        delete_response = client.delete("/produto/ID_INEXISTENTE")
        assert delete_response.status_code == 404