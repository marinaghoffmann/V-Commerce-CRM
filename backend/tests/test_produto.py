import pytest
from fastapi.testclient import TestClient

class TestProduto:
    def test_create_produto(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        assert produto_response.status_code == 201
        assert produto_response.json()["nome_produto"] == "Telefone Celular"

    def test_create_produto_retorna_id(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        assert produto_response.status_code == 201
        assert "id_produto" in produto_response.json()

    def test_create_duplicate_produto(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        assert produto_response.status_code == 201

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
        assert get_response.json()["detail"] == "Produto não encontrado"

    def test_update_produto(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        assert produto_response.status_code == 201
        produto_id = produto_response.json()["id_produto"]

        update_payload = mock_produto.copy()
        update_payload["nome_produto"] = "Produto Atualizado"

        update_response = client.put(f"/produto/{produto_id}", json=update_payload)
        assert update_response.status_code == 200
        assert update_response.json()["nome_produto"] == "Produto Atualizado"

    def test_update_produto(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        produto_id = produto_response.json()["id_produto"]

        update_payload = mock_produto.copy()
        update_payload["preco"] = 999.0

        client.put(f"/produto/{produto_id}", json=update_payload)

        get_response = client.get(f"/produto/{produto_id}")
        assert get_response.status_code == 200
        assert get_response.json()["preco"] == 999.0

    def test_update_nonexistent_produto(self, client: TestClient, mock_produto):
        update_response = client.put("/produto/ID_INEXISTENTE", json=mock_produto)
        assert update_response.status_code == 404
        assert update_response.json()["detail"] == "Produto não encontrado"

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
        assert delete_response.json()["detail"] == "Produto não encontrado"

    def test_nome_com_espacos_extras_e_removido(self, client: TestClient, mock_produto):
        produto = mock_produto.copy()
        produto["nome_produto"] = "  Notebook  "

        response = client.post("/produto/", json=produto)
        assert response.status_code == 201
        assert response.json()["nome_produto"] == "Notebook"

    def test_categoria_minuscula_e_capitalizada(self, client: TestClient, mock_produto):
        produto = mock_produto.copy()
        produto["nome_produto"] = "Produto Categoria Teste"
        produto["categoria"] = "eletrônicos"

        response = client.post("/produto/", json=produto)
        assert response.status_code == 201
        assert response.json()["categoria"] == "Eletrônicos"

    def test_categoria_com_espacos_extras_e_removida(self, client: TestClient, mock_produto):
        produto = mock_produto.copy()
        produto["nome_produto"] = "Produto Espacos Categoria"
        produto["categoria"] = "  Informática  "

        response = client.post("/produto/", json=produto)
        assert response.status_code == 201
        assert response.json()["categoria"] == "Informática"

    def test_preco_positivo_aceito(self, client: TestClient, mock_produto):
        produto = mock_produto.copy()
        produto["nome_produto"] = "Produto Preco Valido"
        produto["preco"] = 0.01

        response = client.post("/produto/", json=produto)
        assert response.status_code == 201

    def test_preco_zero_rejeitado(self, client: TestClient, mock_produto):
        produto = mock_produto.copy()
        produto["preco"] = 0

        response = client.post("/produto/", json=produto)
        assert response.status_code == 422

    def test_preco_negativo_rejeitado(self, client: TestClient, mock_produto):
        produto = mock_produto.copy()
        produto["preco"] = -1.0

        response = client.post("/produto/", json=produto)
        assert response.status_code == 422

    def test_preco_ausente_rejeitado(self, client: TestClient, mock_produto):
        produto = mock_produto.copy()
        del produto["preco"]

        response = client.post("/produto/", json=produto)
        assert response.status_code == 422

    @pytest.mark.parametrize("campo", [
        "total_pedidos",
        "unidades_vendidas",
        "total_avaliacoes",
        "total_tickets",
        "total_visualizacoes",
    ])
    def test_inteiros_negativos_rejeitados(self, client: TestClient, mock_produto, campo):
        produto = mock_produto.copy()
        produto[campo] = -1

        response = client.post("/produto/", json=produto)
        assert response.status_code == 422

    @pytest.mark.parametrize("campo", [
        "receita_total",
        "receita_media_por_pedido",
        "media_nota_produto",
        "media_nota_nps",
    ])
    def test_floats_negativos_rejeitados(self, client: TestClient, mock_produto, campo):
        produto = mock_produto.copy()
        produto[campo] = -0.1

        response = client.post("/produto/", json=produto)
        assert response.status_code == 422

    def test_estoque_negativo_rejeitado(self, client: TestClient, mock_produto):
        produto = mock_produto.copy()
        produto["estoque_disponivel"] = -1

        response = client.post("/produto/", json=produto)
        assert response.status_code == 422

    def test_estoque_none_aceito(self, client: TestClient, mock_produto):
        produto = mock_produto.copy()
        produto["nome_produto"] = "Produto Sem Estoque"
        produto["estoque_disponivel"] = None

        response = client.post("/produto/", json=produto)
        assert response.status_code == 201
        assert response.json()["estoque_disponivel"] is 0

    def test_pct_recomenda_acima_100_rejeitado(self, client: TestClient, mock_produto):
        produto = mock_produto.copy()
        produto["pct_recomenda"] = 100.1

        response = client.post("/produto/", json=produto)
        assert response.status_code == 422

    def test_pct_recomenda_negativa_rejeitada(self, client: TestClient, mock_produto):
        produto = mock_produto.copy()
        produto["pct_recomenda"] = -1.0

        response = client.post("/produto/", json=produto)
        assert response.status_code == 422

    def test_pct_recomenda_limites_validos(self, client: TestClient, mock_produto):
        for pct, nome in [(0.0, "Produto Pct Zero"), (100.0, "Produto Pct Cem")]:
            produto = mock_produto.copy()
            produto["nome_produto"] = nome
            produto["pct_recomenda"] = pct

            response = client.post("/produto/", json=produto)
            assert response.status_code == 201

    def test_patch_somente_preco(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        produto_id = produto_response.json()["id_produto"]

        patch_response = client.patch(f"/produto/{produto_id}", json={"preco": 500.0})
        assert patch_response.status_code == 200
        assert patch_response.json()["preco"] == 500.0
        assert patch_response.json()["nome_produto"] == "Telefone Celular"

    def test_patch_somente_categoria(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        produto_id = produto_response.json()["id_produto"]

        patch_response = client.patch(f"/produto/{produto_id}", json={"categoria": "Informática"})
        assert patch_response.status_code == 200
        assert patch_response.json()["categoria"] == "Informática"

    def test_patch_refletido_na_leitura(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        produto_id = produto_response.json()["id_produto"]

        client.patch(f"/produto/{produto_id}", json={"total_tickets": 99})

        get_response = client.get(f"/produto/{produto_id}")
        assert get_response.json()["total_tickets"] == 99

    def test_patch_nonexistent_produto(self, client: TestClient):
        patch_response = client.patch("/produto/ID_INEXISTENTE", json={"preco": 100.0})
        assert patch_response.status_code == 404
        assert patch_response.json()["detail"] == "Produto não encontrado"

    def test_patch_preco_zero_rejeitado(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        produto_id = produto_response.json()["id_produto"]

        patch_response = client.patch(f"/produto/{produto_id}", json={"preco": 0})
        assert patch_response.status_code == 422

    def test_patch_pct_recomenda_invalida(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        produto_id = produto_response.json()["id_produto"]

        patch_response = client.patch(f"/produto/{produto_id}", json={"pct_recomenda": 150.0})
        assert patch_response.status_code == 422

    def test_patch_categoria_capitalizada(self, client: TestClient, mock_produto):
        produto_response = client.post("/produto/", json=mock_produto)
        produto_id = produto_response.json()["id_produto"]

        patch_response = client.patch(f"/produto/{produto_id}", json={"categoria": "periféricos"})
        assert patch_response.status_code == 200
        assert patch_response.json()["categoria"] == "Periféricos"