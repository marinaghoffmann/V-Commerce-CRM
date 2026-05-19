import re
from test_helpers import call_agent, _run_sql


class TestEdgeCaseSemantic:
    """Casos-limite de interpretação semântica e dados."""

    def test_EDGE_01_sinonimo_receita(self):
        """Agente deve entender sinônimos: 'faturamento' = receita."""
        response = call_agent("Qual o faturamento total da empresa?")
        assert response
        assert re.search(r"\d[\d.,]+", response), "Sem número na resposta de faturamento"

    def test_EDGE_02_pergunta_ambigua_ticket(self):
        """Agente deve tratar 'ticket' de forma adequada ao contexto (suporte vs ticket médio)."""
        response = call_agent("Qual o ticket médio?")
        assert response
        # Deve trazer valor numérico (ticket médio financeiro)
        assert re.search(r"\d[\d.,]+", response)

    def test_EDGE_03_nps_produto_sem_avaliacao(self):
        """Consulta de NPS para produto com poucas avaliações não deve quebrar."""
        response = call_agent(
            "Qual o NPS do produto com menos avaliações?"
        )
        assert response

    def test_EDGE_04_cliente_inexistente(self):
        """Busca por cliente inexistente deve retornar resposta clara."""
        response = call_agent(
            "Quais pedidos o cliente de ID 'CLIENTE-NAO-EXISTE-99999' fez?"
        )
        assert response
        # Deve indicar que não encontrou ou retornar zero resultados
        nenhum = any(w in response.lower() for w in [
            "nenhum", "não encontrado", "não há", "zero", "0", "sem resultado"
        ])
        assert nenhum or re.search(r"\b0\b", response)

    def test_EDGE_05_percentual_recomendacao(self):
        """Agente deve calcular percentual de clientes que recomendam (NPS)."""
        response = call_agent(
            "Qual o percentual de clientes que recomendam os produtos?"
        )
        assert response
        # Espera algum número percentual
        assert re.search(r"\d+[.,]?\d*\s*%?", response)

    def test_EDGE_06_maiuscula_minuscula_filtro(self):
        """Agente deve ser robusto a variações de caixa no filtro."""
        response = call_agent(
            "Quantos clientes são do segmento PREMIUM?"
        )
        assert response
        real = _run_sql(
            "SELECT COUNT(*) FROM v_cliente_360 WHERE segmento_cliente='Premium'"
        )[0][0]
        from test_helpers import _contains_number

        assert _contains_number(response, real)

    def test_EDGE_07_canal_nulo(self):
        """Agente deve tratar clientes sem canal predominante (NULL)."""
        response = call_agent(
            "Quantos clientes não têm canal digital predominante definido?"
        )
        assert response
        real = _run_sql(
            "SELECT COUNT(*) FROM comportamento_digital "
            "WHERE canal_predominante IS NULL"
        )[0][0]
        from test_helpers import _contains_number

        assert _contains_number(response, real)

    def test_EDGE_08_produto_sem_estoque(self):
        """Agente deve identificar produtos sem estoque."""
        response = call_agent("Quantos produtos estão com estoque zerado?")
        assert response
        real = _run_sql(
            "SELECT COUNT(*) FROM desempenho_produtos WHERE estoque_disponivel=0"
        )[0][0]
        import re

        assert re.search(r"\d", response)

    def test_EDGE_09_multiplas_condicoes(self):
        """Agente deve processar consulta com múltiplos filtros simultâneos."""
        response = call_agent(
            "Qual a receita de pedidos aprovados, pagos com cartão, em Sao Paulo, em 2024?"
        )
        assert response
        assert re.search(r"\d[\d.,]+", response)

    def test_EDGE_10_pergunta_comparativa(self):
        """Agente deve comparar dois segmentos diretamente."""
        response = call_agent(
            "Clientes Premium ou Recorrentes têm maior ticket médio?"
        )
        assert response
        assert "premium" in response.lower() or "recorrente" in response.lower()
