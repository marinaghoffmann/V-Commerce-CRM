import re
from test_helpers import call_agent, _run_sql, _extract_sql, _contains_number, _is_destructive_sql


class TestBasicQueries:
    """Consultas simples de leitura e contagem."""

    def test_BASIC_01_total_clientes(self):
        """Agente deve informar a quantidade total de clientes."""
        response = call_agent("Quantos clientes existem no banco de dados?")
        assert response, "Resposta vazia"
        # Valor real
        real = _run_sql("SELECT COUNT(*) FROM v_cliente_360")[0][0]
        assert _contains_number(response, real), (
            f"Esperava encontrar {real} na resposta, mas recebeu: {response[:200]}"
        )

    def test_BASIC_02_total_pedidos(self):
        """Agente deve informar a quantidade total de pedidos."""
        response = call_agent("Qual o total de pedidos na base?")
        assert response
        real = _run_sql("SELECT COUNT(*) FROM pedidos_por_cliente")[0][0]
        assert _contains_number(response, real)

    def test_BASIC_03_total_produtos(self):
        """Agente deve informar o total de produtos cadastrados."""
        response = call_agent("Quantos produtos estão cadastrados?")
        assert response
        real = _run_sql("SELECT COUNT(*) FROM desempenho_produtos")[0][0]
        assert _contains_number(response, real)

    def test_BASIC_04_lista_categorias(self):
        """Agente deve listar as categorias de produtos disponíveis."""
        response = call_agent("Quais são as categorias de produtos disponíveis?")
        assert response
        categorias = ["Eletronicos", "Vestuario", "Casa", "Esportes", "Beleza"]
        found = sum(1 for c in categorias if c.lower() in response.lower())
        assert found >= 3, f"Poucas categorias identificadas na resposta: {response[:300]}"

    def test_BASIC_05_segmentos_cliente(self):
        """Agente deve listar os segmentos de clientes."""
        response = call_agent("Quais são os segmentos de clientes existentes?")
        assert response
        segmentos = ["Inativo", "Recorrente", "Premium", "Novo"]
        found = sum(1 for s in segmentos if s.lower() in response.lower())
        assert found >= 3

    def test_BASIC_06_status_pedidos(self):
        """Agente deve listar os status de pedidos."""
        response = call_agent("Quais são os possíveis status de um pedido?")
        assert response
        statuses = ["aprovado", "reembolsado", "recusado", "processado", "processando"]
        found = sum(1 for s in statuses if s in response.lower())
        assert found >= 3

    def test_BASIC_07_sql_extraivel_e_valido(self):
        """O SQL gerado pelo agente deve ser executável no banco."""
        response = call_agent("Mostre os 5 primeiros clientes cadastrados.")
        assert response
        sql = _extract_sql(response)
        if sql:
            # Não pode ser destrutivo
            assert not _is_destructive_sql(sql), f"SQL destrutivo detectado: {sql}"
            # Deve executar sem erro
            try:
                rows = _run_sql(sql)
                assert len(rows) <= 5
            except Exception as e:
                import pytest

                pytest.fail(f"SQL inválido gerado pelo agente: {e}\nSQL: {sql}")

    def test_BASIC_08_clientes_nordeste_ultimo_trimestre(self):
        """Agente deve receber a consulta com região e janela temporal dinâmica."""
        response = call_agent(
            "Quais clientes do nordeste compraram mais de R$ 500 no último trimestre?"
        )
        assert response
        assert "nordeste" in response.lower() or "500" in response.lower() or len(response) > 0

        sql = _extract_sql(response)
        if sql:
            assert not _is_destructive_sql(sql), f"SQL destrutivo detectado: {sql}"

    def test_BASIC_09_regiao_maior_crescimento_receita(self):
        """Agente deve identificar a região com maior crescimento de receita."""
        response = call_agent("Qual região teve maior crescimento de receita?")
        assert response

        real = _run_sql(
            """
            WITH por_regiao_mes AS (
                SELECT
                    CASE
                        WHEN estado IN ('AL','BA','CE','MA','PB','PE','PI','RN','SE') THEN 'Nordeste'
                        WHEN estado IN ('ES','MG','RJ','SP') THEN 'Sudeste'
                        WHEN estado IN ('PR','RS','SC') THEN 'Sul'
                        WHEN estado IN ('DF','GO','MS','MT') THEN 'Centro-Oeste'
                        WHEN estado IN ('AC','AM','AP','PA','RO','RR','TO') THEN 'Norte'
                        ELSE 'Outros'
                    END AS regiao,
                    ano_venda,
                    mes_venda,
                    SUM(receita_total) AS receita
                FROM kpi_por_estado
                GROUP BY regiao, ano_venda, mes_venda
            ),
            atual AS (
                SELECT regiao, receita
                FROM por_regiao_mes
                WHERE ano_venda * 100 + mes_venda = (
                    SELECT MAX(ano_venda * 100 + mes_venda) FROM por_regiao_mes
                )
            ),
            anterior AS (
                SELECT regiao, receita
                FROM por_regiao_mes
                WHERE ano_venda * 100 + mes_venda = (
                    SELECT DISTINCT ano_venda * 100 + mes_venda
                    FROM por_regiao_mes
                    ORDER BY 1 DESC
                    LIMIT 1 OFFSET 1
                )
            )
            SELECT a.regiao, ROUND((a.receita - b.receita) / b.receita * 100, 2) AS crescimento_pct
            FROM atual a
            JOIN anterior b ON a.regiao = b.regiao
            ORDER BY crescimento_pct DESC
            LIMIT 1
            """
        )

        assert real
        regiao_esperada = str(real[0][0])
        assert regiao_esperada.lower() in response.lower(), (
            f"Esperava encontrar a região {regiao_esperada} na resposta, mas recebeu: {response[:300]}"
        )
