import pytest
from fastapi.testclient import TestClient

# Testes realizados
# Criação
#       Verificar se um ticket pode ser criado com sucesso
#       Verificar se um ticket criado poderá ser recuperado corretamente
#       Verificar se ticket não podem ser criados com chaves duplicadas
#       Verificar se os campos obrigatórios são validados (On Hold)
# Leitura
#       Verificar se um ticket existente pode ser recuperado por ID
#       Verificar se a resposta para um ticket inexistente é adequada (404)
# Edição
#      Verificar se um ticket existente pode ser atualizado com sucesso
#      Verificar se as atualizações são refletidas corretamente na leitura subsequente
#      Verificar se a resposta para atualização de um ticket inexistente é adequada (404)
# Deleção
#      Verificar se um ticket existente pode ser deletado com sucesso
#      Verificar se a resposta para deleção de um ticket inexistente é adequada (404)

class TestTicket:
    def test_create_ticket(self, client: TestClient, mock_ticket):
        ticket_response = client.post("/ticket/", json=mock_ticket)
        assert ticket_response.status_code == 201
        assert ticket_response.json()["id_ticket"] == "111-222-333"
    
    def test_duplicate_ticket(self, client: TestClient, mock_ticket):
        ticket_response = client.post("/ticket/", json=mock_ticket)
        assert ticket_response.status_code == 201
        assert ticket_response.json()["id_ticket"] == "111-222-333"

        duplicate_response = client.post("/ticket/", json=mock_ticket)
        assert duplicate_response.status_code == 400
    
    def test_get_valid_ticket(self, client: TestClient, mock_ticket):
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
    
    def test_update_ticket(self, client: TestClient, mock_ticket):
        ticket_response = client.post("/ticket/", json=mock_ticket)
        assert ticket_response.status_code == 201
        ticket_id = ticket_response.json()["id_ticket"]

        update_payload = mock_ticket.copy()
        update_payload["status_ticket"] = "Fechado"

        update_response = client.put(f"/ticket/{ticket_id}", json=update_payload)
        assert update_response.status_code == 200
        assert update_response.json()["status_ticket"] == "Fechado"
    
    def test_update_nonexistent_ticket(self, client: TestClient, mock_ticket):
        update_payload = mock_ticket.copy()
        update_payload["status_ticket"] = "Fechado"

        update_response = client.put("/ticket/ID_INEXISTENTE", json=update_payload)
        assert update_response.status_code == 404
        assert update_response.json()["detail"] == "Ticket não encontrado"
    
    def test_delete_ticket(self, client: TestClient, mock_ticket):
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