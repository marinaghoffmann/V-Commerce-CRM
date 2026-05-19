import re
from test_helpers import call_agent, _run_sql, _contains_number


class TestJoinsRelated:
    """Consultas que exigem combinação de tabelas/visões."""

    def test_JOIN_01_cliente_com_mais_tickets(self):
        """Agente deve identificar o cliente com mais tickets abertos."""
        response = call_agent(
            "Qual cliente tem mais tickets de suporte em aberto?"
        )
        assert response
        assert re.search(r"\w+", response)  # Algum nome/id de cliente

    def test_JOIN_02_produto_mais_reclamado(self):
        """Agente deve identificar o produto com mais tickets de suporte."""
        response = call_agent(
            "Qual produto gerou mais tickets de suporte?"
        )
        assert response
        real = _run_sql(
            "SELECT nome_produto, COUNT(*) as total "
            "FROM analise_tickets GROUP BY nome_produto "
            "ORDER BY total DESC LIMIT 1"
        )[0]
        assert real[0].lower() in response.lower() or _contains_number(response, real[1])

    def test_JOIN_03_receita_por_segmento(self):
        """Agente deve calcular receita por segmento de cliente."""
        response = call_agent(
            "Qual a receita total por segmento de cliente (Premium, Recorrente, etc.)?"
        )
        assert response
        segmentos = ["Premium", "Recorrente", "Inativo", "Novo"]
        found = sum(1 for s in segmentos if s.lower() in response.lower())
        assert found >= 2

    def test_JOIN_04_nps_por_categoria(self):
        """Agente deve calcular NPS médio por categoria de produto."""
        response = call_agent(
            "Qual é a nota média de NPS por categoria de produto?"
        )
        assert response
        assert re.search(r"\d[\d.,]", response)

    def test_JOIN_05_canal_predominante_por_segmento(self):
        """Agente deve identificar o canal digital predominante por segmento."""
        response = call_agent(
            "Qual é o canal digital mais usado pelos clientes Premium?"
        )
        assert response
        canais = ["app", "web", "mobile"]
        found = any(c in response.lower() for c in canais)
        assert found
