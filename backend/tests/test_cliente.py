import pytest
from fastapi.testclient import TestClient

mock_cliente = {
    "id_cliente": "CLI001",
    "nome": "João",
    "sobrenome": "Silva",
    "email": "joao.silva@example.com",
    "telefone_formatado": "(11) 98765-4321",
    "telefone_ramal": "101",
    "estado": "SP",
    "cidade": "São Paulo",
    "data_nascimento": "1995-08-14",
    "data_cadastro": "2026-01-10",
    "genero": "Masculino",
    "total_compras": 0,
    "receita_total_cliente": 0,
    "ticket_medio": 0,
    "data_primeira_compra": "2026-05-10",
    "data_ultima_compra": "2026-05-10",
    "metodo_pagamento_preferido": "string",
    "categoria_preferida": "string",
    "produto_mais_comprado": "string",
    "total_avaliacoes": 0,
    "media_nota_produto": 0,
    "media_nota_nps": 0,
    "total_tickets": 0,
    "tickets_abertos": 0,
    "tickets_fechados": 0,
    "total_sessoes": 0,
    "total_produtos_visitados": 0,
    "tempo_medio_sessao_seg": 0,
    "segmento_cliente": "string"
    }

# Testes realizados
# Criação
#       Verificar se um cliente pode ser criado com sucesso
#       Verificar se um cliente criado poderá ser recuperado corretamente
#       Verificar se clientes não podem ser criados com chaves duplicadas
#       Verificar se os campos obrigatórios são validados (On Hold)
# Leitura
#       Verificar se um cliente existente pode ser recuperado por ID
#       Verificar se a resposta para um cliente inexistente é adequada (404)
# Edição
#      Verificar se um cliente existente pode ser atualizado com sucesso
#      Verificar se as atualizações são refletidas corretamente na leitura subsequente
#      Verificar se a resposta para atualização de um cliente inexistente é adequada (404)
# Deleção
#      Verificar se um cliente existente pode ser deletado com sucesso
#      Verificar se a resposta para deleção de um cliente inexistente é adequada (404)

class TestCliente:

    def test_create_cliente(self, client: TestClient):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        assert cliente_response.status_code == 201
        assert cliente_response.json()["nome"] == "João"

    def test_get_cliente(self, client: TestClient):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        assert cliente_response.status_code == 201
        cliente_id = cliente_response.json()["id_cliente"]

        get_response = client.get(f"/clientes/{cliente_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id_cliente"] == cliente_id
        assert get_response.json()["nome"] == "João"

    def test_create_duplicate_client(self, client: TestClient):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        assert cliente_response.status_code == 201
        assert cliente_response.json()["nome"] == "João"

        # Tentativa de criar um cliente com o mesmo ID
        duplicate_response = client.post("/clientes/", json=mock_cliente)
        assert duplicate_response.status_code == 400
    
    def test_get_nonexistent_cliente(self, client: TestClient):
        get_response = client.get("/clientes/ID_INEXISTENTE")
        assert get_response.status_code == 404
        assert get_response.json()["detail"] == "Cliente não encontrado"

    def test_update_cliente(self, client: TestClient):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        assert cliente_response.status_code == 201
        cliente_id = cliente_response.json()["id_cliente"]

        update_payload = mock_cliente.copy()
        update_payload["nome"] = "João Atualizado"

        update_response = client.put(f"/clientes/{cliente_id}", json=update_payload)
        assert update_response.status_code == 200
        assert update_response.json()["nome"] == "João Atualizado"
    
    def test_update_nonexistent_cliente(self, client: TestClient):
        update_payload = mock_cliente.copy()
        update_payload["nome"] = "João Atualizado"

        update_response = client.put("/clientes/ID_INEXISTENTE", json=update_payload)
        assert update_response.status_code == 404
        assert update_response.json()["detail"] == "Cliente não encontrado"
    
    def test_delete_cliente(self, client: TestClient):
        cliente_response = client.post("/clientes/", json=mock_cliente)
        assert cliente_response.status_code == 201
        cliente_id = cliente_response.json()["id_cliente"]

        delete_response = client.delete(f"/clientes/{cliente_id}")
        assert delete_response.status_code == 204

        assert client.get(f"/clientes/{cliente_id}").status_code == 404

    def test_delete_nonexistent_cliente(self, client: TestClient):
        delete_response = client.delete("/clientes/ID_INEXISTENTE")
        assert delete_response.status_code == 404
        assert delete_response.json()["detail"] == "Cliente não encontrado"