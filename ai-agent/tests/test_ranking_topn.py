import re
from test_helpers import call_agent, _run_sql


class TestRankingTopN:
    """Consultas de ordenação e top-N."""

    def test_RANK_01_top5_produtos_receita(self):
        """Agente deve listar os 5 produtos com maior receita."""
        response = call_agent("Liste os 5 produtos que mais geraram receita.")
        assert response
        sql = _run_sql
        # Tenta extrair SQL se o agente retornou
        try:
            from test_helpers import _extract_sql, _is_destructive_sql

            sql_text = _extract_sql(response)
        except Exception:
            sql_text = None

        if sql_text:
            assert not _is_destructive_sql(sql_text)
            rows = _run_sql(sql_text)
            assert 1 <= len(rows) <= 5

    def test_RANK_02_top10_clientes_ltv(self):
        """Agente deve listar os 10 clientes com maior LTV (receita total)."""
        response = call_agent(
            "Quais são os 10 clientes com maior receita total acumulada?"
        )
        assert response
        assert re.search(r"\d[\d.,]+", response)

    def test_RANK_03_piores_produtos_nps(self):
        """Agente deve identificar os produtos com menor NPS."""
        response = call_agent(
            "Quais são os 5 produtos com a pior nota de NPS?"
        )
        assert response
        assert re.search(r"\d[\d.,]", response)

    def test_RANK_04_estado_mais_pedidos(self):
        """Agente deve rankear estados por volume de pedidos."""
        response = call_agent(
            "Quais são os 3 estados com maior número de pedidos?"
        )
        assert response
        estados_br = [
            "Sao Paulo", "Minas Gerais", "Rio de Janeiro",
            "Bahia", "Parana", "Pernambuco"
        ]
        found = sum(1 for e in estados_br if e.lower() in response.lower())
        assert found >= 1

    def test_RANK_05_categoria_mais_vendida(self):
        """Agente deve identificar a categoria de produto mais vendida."""
        response = call_agent("Qual categoria de produto tem mais unidades vendidas?")
        assert response
        categorias = ["Eletronicos", "Vestuario", "Casa", "Esportes", "Beleza"]
        found = any(c.lower() in response.lower() for c in categorias)
        assert found
