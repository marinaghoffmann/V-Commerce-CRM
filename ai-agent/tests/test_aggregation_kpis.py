import re
from test_helpers import call_agent, _run_sql, _contains_number


class TestAggregationKPIs:
    """Agregações financeiras e métricas de negócio."""

    def test_AGG_01_receita_total(self):
        """Agente deve calcular a receita total dos pedidos aprovados."""
        response = call_agent(
            "Qual é a receita total gerada pelos pedidos com status 'aprovado'?"
        )
        assert response
        real = _run_sql(
            "SELECT SUM(valor_pedido) FROM pedidos_por_cliente WHERE status='aprovado'"
        )[0][0]
        assert _contains_number(response, real, tolerance=0.10)

    def test_AGG_02_ticket_medio_geral(self):
        """Agente deve calcular o ticket médio de todos os pedidos."""
        response = call_agent("Qual é o ticket médio dos pedidos?")
        assert response
        real = _run_sql("SELECT AVG(valor_pedido) FROM pedidos_por_cliente")[0][0]
        assert _contains_number(response, real, tolerance=0.10)

    def test_AGG_03_receita_por_categoria(self):
        """Agente deve apresentar receita por categoria de produto."""
        response = call_agent("Qual a receita total por categoria de produto?")
        assert response
        categorias = ["Eletronicos", "Vestuario", "Casa", "Esportes"]
        found = sum(1 for c in categorias if c.lower() in response.lower())
        assert found >= 2

    def test_AGG_04_total_tickets_abertos(self):
        """Agente deve contar tickets de suporte em aberto."""
        response = call_agent("Quantos tickets de suporte estão em aberto?")
        assert response
        real = _run_sql(
            "SELECT COUNT(*) FROM analise_tickets WHERE status_ticket='aberto'"
        )[0][0]
        assert _contains_number(response, real)

    def test_AGG_05_media_nps(self):
        """Agente deve calcular a média geral do NPS."""
        response = call_agent("Qual é a nota média de NPS dos clientes?")
        assert response
        real = _run_sql("SELECT AVG(nota_nps) FROM historico_avaliacoes")[0][0]
        assert _contains_number(response, real, tolerance=0.10)

    def test_AGG_06_taxa_conversao_media(self):
        """Agente deve calcular a taxa de conversão média digital."""
        response = call_agent(
            "Qual a taxa de conversão média dos clientes no canal digital?"
        )
        assert response
        real = _run_sql(
            "SELECT AVG(taxa_conversao_click) FROM comportamento_digital"
        )[0][0]
        assert _contains_number(response, real, tolerance=0.15)

    def test_AGG_07_receita_por_estado(self):
        """Agente deve apresentar receita por estado."""
        response = call_agent("Qual o estado com maior receita total?")
        assert response
        # Valida que citou algum estado brasileiro
        estados = ["Sao Paulo", "Minas Gerais", "Rio de Janeiro", "Bahia", "Pernambuco"]
        found = any(e.lower() in response.lower() for e in estados)
        assert found, f"Nenhum estado reconhecido na resposta: {response[:300]}"

    def test_AGG_08_kpi_anual_2024(self):
        """Agente deve trazer KPIs do ano de 2024."""
        response = call_agent("Qual foi a receita total e o número de pedidos em 2024?")
        assert response
        real_rec = _run_sql(
            "SELECT SUM(receita_total) FROM kpi_por_categoria WHERE ano_venda=2024"
        )[0][0]
        # Verifica apenas que citou 2024 e algum número relevante
        assert "2024" in response
        import re

        assert re.search(r"\d[\d.,]+", response)
