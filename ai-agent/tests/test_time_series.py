import re
from test_helpers import call_agent


class TestTimeSeries:
    """Análises por período (mês, ano)."""

    def test_TIME_01_evolucao_mensal_2024(self):
        """Agente deve mostrar evolução mensal de pedidos em 2024."""
        response = call_agent(
            "Mostre a evolução mensal do número de pedidos ao longo de 2024."
        )
        assert response
        assert "2024" in response
        assert re.search(r"\d{1,2}", response)  # Pelo menos um número de mês

    def test_TIME_02_melhor_mes_receita(self):
        """Agente deve identificar o mês com maior receita."""
        response = call_agent("Em qual mês ocorreu a maior receita total da história?")
        assert response
        assert re.search(r"\d", response)

    def test_TIME_03_crescimento_ano_a_ano(self):
        """Agente deve comparar receita entre 2023 e 2024."""
        response = call_agent(
            "Qual foi o crescimento da receita total de 2023 para 2024?"
        )
        assert response
        assert "2023" in response or "2024" in response

    def test_TIME_04_primeiro_ultimo_pedido(self):
        """Agente deve encontrar o pedido mais antigo e o mais recente."""
        response = call_agent(
            "Qual é a data do primeiro e do último pedido registrado?"
        )
        assert response
        # Deve conter alguma data no formato YYYY
        assert re.search(r"20\d{2}", response)

    def test_TIME_05_kpi_trimestre(self):
        """Agente deve calcular KPIs de um trimestre específico."""
        response = call_agent(
            "Qual foi a receita total no primeiro trimestre de 2025?"
        )
        assert response
        assert "2025" in response
        assert re.search(r"\d[\d.,]+", response)
