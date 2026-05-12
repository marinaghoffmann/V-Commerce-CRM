from http import client

import pytest
from fastapi.testclient import TestClient

# Testes realizados
# Leitura
#       Observar se as métricas requisitadas estão sendo entregues de forma correta
#       Verificar funcionamento dos endpoints do tipo get
#       Verificar se a busca por KPI inexistente funciona

class TestsKpi:
    def test_get_kpi_categories(self, client: TestClient):
        response = client.post("/kpi-category", json={"ano_venda": 2025, "mes_venda": 5, "categoria": "Eletronico", "receita_total": 1200, "ticket_medio": 400, "total_pedidos": 3,"total_clientes_unicos": 3})

        response = client.get("/kpi-category")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_get_kpi_category_by_id(self, client: TestClient):
        create_response = client.post("/kpi-category", json={"ano_venda": 2025, "mes_venda": 5, "categoria": "Eletronico", "receita_total": 1200, "ticket_medio": 400, "total_pedidos": 3,"total_clientes_unicos": 3})
        assert create_response.status_code == 201
        created_kpi = create_response.json()
        
        kpi_id = created_kpi["id"]
        get_response = client.get(f"/kpi-category/{kpi_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id"] == kpi_id
    
    def test_get_nonexistent_kpi_category(self, client: TestClient):
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/kpi-category/{non_existent_id}")
        assert response.status_code == 404
        assert response.json()["detail"] == "KPI category not found"

    def test_get_kpi_state(self, client: TestClient):
        response = client.post("/kpi-state", json={"ano_venda": 2025, "mes_venda": 5, "estado": "PE", "receita_total": 1200, "ticket_medio": 400, "total_pedidos": 3,"total_clientes_unicos": 3})

        response = client.get("/kpi-state")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_kpi_state_by_id(self, client: TestClient):
        create_response = client.post("/kpi-state", json={"ano_venda": 2025, "mes_venda": 5, "estado": "PE", "receita_total": 1200, "ticket_medio": 400, "total_pedidos": 3,"total_clientes_unicos": 3})
        assert create_response.status_code == 201
        created_kpi = create_response.json()
        
        kpi_id = created_kpi["id"]
        get_response = client.get(f"/kpi-state/{kpi_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id"] == kpi_id

    def test_get_nonexistent_kpi_state(self, client: TestClient):
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/kpi-state/{non_existent_id}")
        assert response.status_code == 404
        assert response.json()["detail"] == "KPI state not found"

    def test_get_kpi_status(self, client: TestClient):
        response = client.post("/kpi-category", json={"ano_venda": 2025, "mes_venda": 5, "status": "entregue", "receita_total": 1200, "ticket_medio": 400, "total_pedidos": 3,"total_clientes_unicos": 3})

        response = client.get("/kpi-category")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_kpi_status_by_id(self, client: TestClient):
        create_response = client.post("/kpi-status", json={"ano_venda": 2025, "mes_venda": 5, "status": "entregue", "receita_total": 1200, "ticket_medio": 400, "total_pedidos": 3,"total_clientes_unicos": 3})
        assert create_response.status_code == 201
        created_kpi = create_response.json()
        
        kpi_id = created_kpi["id"]
        get_response = client.get(f"/kpi-status/{kpi_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id"] == kpi_id

    def test_get_nonexistent_kpi_status(self, client: TestClient):
        non_existent_id = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/kpi-status/{non_existent_id}")
        assert response.status_code == 404
        assert response.json()["detail"] == "KPI status not found"