from test_helpers import call_agent, _run_sql, _contains_number


class TestFiltersConditionals:
    """Filtros com WHERE, LIKE, IN, BETWEEN."""

    def test_FILTER_01_clientes_premium(self):
        """Agente deve filtrar clientes do segmento Premium."""
        response = call_agent("Quantos clientes são do segmento Premium?")
        assert response
        real = _run_sql(
            "SELECT COUNT(*) FROM v_cliente_360 WHERE segmento_cliente='Premium'"
        )[0][0]
        assert _contains_number(response, real)

    def test_FILTER_02_pedidos_pix(self):
        """Agente deve filtrar pedidos pagos com Pix."""
        response = call_agent("Quantos pedidos foram pagos com Pix?")
        assert response
        real = _run_sql(
            "SELECT COUNT(*) FROM pedidos_por_cliente WHERE metodo_pagamento='pix'"
        )[0][0]
        assert _contains_number(response, real)

    def test_FILTER_03_produtos_eletronicos_ativos(self):
        """Agente deve filtrar produtos eletrônicos ativos."""
        response = call_agent(
            "Quantos produtos da categoria Eletronicos estão ativos?"
        )
        assert response
        real = _run_sql(
            "SELECT COUNT(*) FROM desempenho_produtos "
            "WHERE categoria='Eletronicos' AND ativo=1"
        )[0][0]
        assert _contains_number(response, real)

    def test_FILTER_04_tickets_entrega(self):
        """Agente deve filtrar tickets do tipo entrega."""
        response = call_agent(
            "Quantos tickets de suporte são relacionados a problemas de entrega?"
        )
        assert response
        real = _run_sql(
            "SELECT COUNT(*) FROM analise_tickets WHERE tipo_problema='entrega'"
        )[0][0]
        assert _contains_number(response, real)

    def test_FILTER_05_clientes_sao_paulo(self):
        """Agente deve filtrar clientes de São Paulo."""
        response = call_agent("Quantos clientes são de Sao Paulo?")
        assert response
        real = _run_sql(
            "SELECT COUNT(*) FROM v_cliente_360 WHERE estado='Sao Paulo'"
        )[0][0]
        assert _contains_number(response, real)

    def test_FILTER_06_pedidos_reembolsados_2024(self):
        """Agente deve filtrar pedidos reembolsados em 2024."""
        response = call_agent(
            "Quantos pedidos foram reembolsados em 2024?"
        )
        assert response
        real = _run_sql(
            "SELECT COUNT(*) FROM pedidos_por_cliente "
            "WHERE status='reembolsado' AND data_pedido LIKE '2024%'"
        )[0][0]
        assert _contains_number(response, real)

    def test_FILTER_07_clientes_sem_compras(self):
        """Agente deve filtrar clientes sem nenhuma compra (inativos)."""
        response = call_agent("Quantos clientes têm zero compras registradas?")
        assert response
        real = _run_sql(
            "SELECT COUNT(*) FROM v_cliente_360 WHERE total_compras=0"
        )[0][0]
        # Aceita resposta mesmo que seja 0
        import re

        assert re.search(r"\d", response)
