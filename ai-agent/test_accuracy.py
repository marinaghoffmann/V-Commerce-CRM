import os
import re
import time
import unittest
from typing import Any

from dotenv import load_dotenv

load_dotenv()

google_api_key = os.getenv("GOOGLE_API_KEY")

from agent import perguntar  # noqa: E402
from session_memory import clear_session_state  # noqa: E402


SESSION_ID = "acuracia-text-to-sql"
RATE_LIMIT_DELAY = 1.5  # segundos entre testes para evitar quota exhaustion

SQL_KEYWORDS = {
    "select",
    "from",
    "where",
    "group",
    "by",
    "order",
    "limit",
    "with",
    "join",
    "inner",
    "left",
    "right",
    "full",
    "on",
    "as",
    "and",
    "or",
    "case",
    "when",
    "then",
    "else",
    "end",
    "sum",
    "avg",
    "count",
    "date",
    "distinct",
}


ACCURACY_CASES: list[dict[str, Any]] = [
    # ===== CASOS BÁSICOS DE NEGÓCIO =====
    {
        "id": "top_10_produtos_vendidos",
        "prompt": "Quais foram os 10 produtos mais vendidos?",
        "expected_tables": {"desempenho_produtos"},
        "required_columns": {"desempenho_produtos": {"nome_produto", "unidades_vendidas"}},
        "reference_sql": """
            SELECT nome_produto, unidades_vendidas, receita_total
            FROM desempenho_produtos
            ORDER BY unidades_vendidas DESC
            LIMIT 10;
        """,
    },
    {
        "id": "estado_maior_receita",
        "prompt": "Qual estado teve maior receita total?",
        "expected_tables": {"kpi_por_estado"},
        "required_columns": {"kpi_por_estado": {"estado", "receita_total"}},
        "reference_sql": """
            SELECT estado, SUM(receita_total) AS receita_total
            FROM kpi_por_estado
            GROUP BY estado
            ORDER BY receita_total DESC
            LIMIT 1;
        """,
    },
    {
        "id": "clientes_nordeste_500_ultimo_trimestre",
        "prompt": "Quais clientes do nordeste compraram mais de R$ 500 no último trimestre?",
        "expected_tables": {"v_cliente_360"},
        "required_columns": {"v_cliente_360": {"estado", "receita_total_cliente"}},
        "reference_sql": """
            SELECT nome, sobrenome, email, estado, receita_total_cliente, data_ultima_compra
            FROM v_cliente_360
            WHERE estado IN ('RN', 'PB', 'PE', 'AL', 'SE', 'BA', 'PI', 'CE', 'MA')
              AND receita_total_cliente > 500
              AND data_ultima_compra >= DATE('now', '-3 months')
            ORDER BY receita_total_cliente DESC;
        """,
    },
    {
        "id": "regiao_maior_crescimento_receita",
        "prompt": "Qual região teve o maior crescimento de receita?",
        "expected_tables": {"kpi_por_estado"},
        "required_columns": {"kpi_por_estado": {"estado"}},
        "reference_sql": """
            WITH receita_por_regiao AS (
                SELECT
                    CASE
                        WHEN estado IN ('SP', 'RJ', 'MG', 'ES') THEN 'Sudeste'
                        WHEN estado IN ('PR', 'SC', 'RS') THEN 'Sul'
                        WHEN estado IN ('DF', 'GO', 'MT', 'MS') THEN 'Centro-Oeste'
                        WHEN estado IN ('AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO') THEN 'Norte'
                        ELSE 'Nordeste'
                    END AS regiao,
                    SUM(receita_total) AS receita_total
                FROM kpi_por_estado
                GROUP BY 1
            )
            SELECT regiao, receita_total
            FROM receita_por_regiao
            ORDER BY receita_total DESC
            LIMIT 1;
        """,
    },
    {
        "id": "produtos_mais_tickets",
        "prompt": "Quais produtos estão gerando mais tickets de suporte?",
        "expected_tables": {"desempenho_produtos"},
        "required_columns": {"desempenho_produtos": {"nome_produto", "total_tickets"}},
        "reference_sql": """
            SELECT nome_produto, categoria, total_tickets, media_nota_produto
            FROM desempenho_produtos
            ORDER BY total_tickets DESC
            LIMIT 10;
        """,
    },
    {
        "id": "ticket_medio_por_categoria",
        "prompt": "Qual o ticket médio de cada categoria de produto?",
        "expected_tables": {"kpi_por_categoria"},
        "required_columns": {"kpi_por_categoria": {"categoria", "ticket_medio"}},
        "reference_sql": """
            SELECT categoria, AVG(ticket_medio) AS ticket_medio_geral
            FROM kpi_por_categoria
            GROUP BY categoria
            ORDER BY ticket_medio_geral DESC;
        """,
    },
    {
        "id": "abandono_por_canal",
        "prompt": "Qual a taxa média de abandono de carrinho por canal?",
        "expected_tables": {"comportamento_digital"},
        "required_columns": {"comportamento_digital": {"canal_predominante"}},
        "reference_sql": """
            SELECT canal_predominante,
                   AVG(taxa_abandono_carrinho) AS media_abandono
            FROM comportamento_digital
            GROUP BY canal_predominante
            ORDER BY media_abandono DESC;
        """,
    },
    {
        "id": "receita_por_status",
        "prompt": "Quais status de pedido concentram mais receita?",
        "expected_tables": {"kpi_por_status"},
        "required_columns": {"kpi_por_status": {"status"}},
        "reference_sql": """
            SELECT status, SUM(receita_total) AS receita_total
            FROM kpi_por_status
            GROUP BY status
            ORDER BY receita_total DESC;
        """,
    },
    # ===== AGREGAÇÕES AVANÇADAS =====
    {
        "id": "clientes_inativos_6_meses",
        "prompt": "Quais clientes não compraram há mais de 6 meses?",
        "expected_tables": {"v_cliente_360"},
        "required_columns": {"v_cliente_360": {"nome", "data_ultima_compra"}},
        "reference_sql": """
            SELECT nome, sobrenome, email, data_ultima_compra
            FROM v_cliente_360
            WHERE data_ultima_compra < DATE('now', '-6 months')
            ORDER BY data_ultima_compra ASC;
        """,
    },
    {
        "id": "categorias_com_avaliacao_baixa",
        "prompt": "Quais categorias de produtos têm as avaliações mais baixas?",
        "expected_tables": {"kpi_por_categoria"},
        "required_columns": {"kpi_por_categoria": {"categoria"}},
        "reference_sql": """
            SELECT categoria, AVG(media_avaliacao_categoria) AS media_geral
            FROM kpi_por_categoria
            GROUP BY categoria
            ORDER BY media_geral ASC
            LIMIT 5;
        """,
    },
    {
        "id": "taxa_conversao_por_estado",
        "prompt": "Qual é a taxa de conversão por estado?",
        "expected_tables": {"comportamento_digital"},
        "required_columns": {"comportamento_digital": {"estado"}},
        "reference_sql": """
            SELECT estado,
                   COUNT(*) AS total_acessos,
                   SUM(CASE WHEN fez_compra = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS taxa_conversao
            FROM comportamento_digital
            GROUP BY estado
            ORDER BY taxa_conversao DESC;
        """,
    },
    {
        "id": "receita_acumulada_por_trimestre",
        "prompt": "Qual a receita acumulada por trimestre do ano?",
        "expected_tables": {"kpi_por_estado"},
        "required_columns": {"kpi_por_estado": {"mes_venda", "receita_total"}},
        "reference_sql": """
            SELECT
                CASE
                    WHEN mes_venda IN (1,2,3) THEN 'Q1'
                    WHEN mes_venda IN (4,5,6) THEN 'Q2'
                    WHEN mes_venda IN (7,8,9) THEN 'Q3'
                    ELSE 'Q4'
                END AS trimestre,
                SUM(receita_total) AS receita_trimestral
            FROM kpi_por_estado
            GROUP BY 1
            ORDER BY receita_trimestral DESC;
        """,
    },
    {
        "id": "segmentacao_rfm_clientes",
        "prompt": "Qual é a segmentação RFM (Recency, Frequency, Monetary) dos nossos clientes?",
        "expected_tables": {"v_cliente_360"},
        "required_columns": {"v_cliente_360": {"id_cliente", "receita_total_cliente"}},
        "reference_sql": """
            SELECT
                COUNT(*) AS total_clientes,
                CASE
                    WHEN receita_total_cliente > 1000 THEN 'High Value'
                    WHEN receita_total_cliente > 500 THEN 'Medium Value'
                    ELSE 'Low Value'
                END AS segmento,
                AVG(receita_total_cliente) AS receita_media
            FROM v_cliente_360
            GROUP BY 2
            ORDER BY receita_media DESC;
        """,
    },
    # ===== TIME-SERIES E VARIAÇÕES =====
    {
        "id": "variacao_mensal_abandonos",
        "prompt": "Como variou a taxa de abandono de carrinho ao longo dos meses?",
        "expected_tables": {"comportamento_digital"},
        "required_columns": {"comportamento_digital": {"taxa_abandono_carrinho"}},
        "reference_sql": """
            SELECT
                strftime('%Y-%m', data_acesso) AS mes,
                AVG(taxa_abandono_carrinho) AS media_abandono
            FROM comportamento_digital
            GROUP BY 1
            ORDER BY 1 DESC;
        """,
    },
    {
        "id": "crescimento_trimestral_estados",
        "prompt": "Qual estado teve maior crescimento trimestral em receita?",
        "expected_tables": {"kpi_por_estado"},
        "required_columns": {"kpi_por_estado": {"estado"}},
        "reference_sql": """
            WITH receita_trimestral AS (
                SELECT
                    estado,
                    CASE WHEN mes_venda IN (1,2,3) THEN 'Q1'
                         WHEN mes_venda IN (4,5,6) THEN 'Q2'
                         WHEN mes_venda IN (7,8,9) THEN 'Q3'
                         ELSE 'Q4' END AS trimestre,
                    SUM(receita_total) AS receita
                FROM kpi_por_estado
                GROUP BY 1, 2
            )
            SELECT estado, trimestre, receita
            FROM receita_trimestral
            ORDER BY receita DESC
            LIMIT 10;
        """,
    },
    {
        "id": "comparacao_q4_vs_q1",
        "prompt": "Qual foi a variação de receita entre Q4 e Q1?",
        "expected_tables": {"kpi_por_estado"},
        "required_columns": {"kpi_por_estado": {"receita_total"}},
        "reference_sql": """
            WITH trimestral AS (
                SELECT
                    CASE WHEN mes_venda IN (1,2,3) THEN 'Q1'
                         WHEN mes_venda IN (10,11,12) THEN 'Q4' END AS trimestre,
                    SUM(receita_total) AS receita
                FROM kpi_por_estado
                WHERE mes_venda IN (1,2,3,10,11,12)
                GROUP BY 1
            )
            SELECT
                MAX(CASE WHEN trimestre = 'Q4' THEN receita END) AS receita_q4,
                MAX(CASE WHEN trimestre = 'Q1' THEN receita END) AS receita_q1
            FROM trimestral;
        """,
    },
    {
        "id": "historico_avaliacoes_clientes",
        "prompt": "Qual é o histórico de avaliações dos clientes ao longo do tempo?",
        "expected_tables": {"historico_avaliacoes"},
        "required_columns": {"historico_avaliacoes": {"avaliacao"}},
        "reference_sql": """
            SELECT
                strftime('%Y-%m', data_avaliacao) AS mes,
                COUNT(*) AS total_avaliacoes,
                AVG(avaliacao) AS media_avaliacao
            FROM historico_avaliacoes
            GROUP BY 1
            ORDER BY 1 DESC;
        """,
    },
    # ===== GUARDRAILS ÓBVIOS (Fora de Escopo) =====
    {
        "id": "guardrail_previsao_tempo",
        "prompt": "Qual a previsão do tempo para amanhã em São Paulo?",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
    {
        "id": "guardrail_poema_vendas",
        "prompt": "Escreva um poema sobre receita de vendas.",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
    {
        "id": "guardrail_carta_amor",
        "prompt": "Faça uma carta de amor para nossos clientes mais valiosos.",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
    {
        "id": "guardrail_receita_bolo",
        "prompt": "Como faço um bolo de chocolate com receita de vendas?",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
    {
        "id": "guardrail_capital_brasil",
        "prompt": "Qual é a capital do Brasil?",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
    # ===== GUARDRAILS SUTIS (Ambíguo/Competitor/Fora de Escopo) =====
    {
        "id": "guardrail_casas_bahia",
        "prompt": "Quantos clientes da Casas Bahia compraram em nossa plataforma?",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
    {
        "id": "guardrail_magazine_luiza",
        "prompt": "Qual é o desempenho da Magazine Luiza em nossas categorias?",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
    {
        "id": "guardrail_mercado_livre",
        "prompt": "Qual é a receita agregada de vendedores do Mercado Livre?",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
    {
        "id": "guardrail_amazonas",
        "prompt": "Quais produtos vendemos que também estão na Amazon?",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
    {
        "id": "guardrail_politica_devolucoes",
        "prompt": "Qual é a política de devoluções da nossa empresa?",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
    {
        "id": "guardrail_fornecedor_logistica",
        "prompt": "Quem é nosso fornecedor de logística e qual é o contato?",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
    {
        "id": "guardrail_melhor_dia_compras",
        "prompt": "Qual é o melhor dia da semana para fazer compras e economizar?",
        "expected_tables": set(),
        "required_columns": {},
        "reference_sql": None,
    },
]


def normalize_sql(sql: str) -> str:
    return re.sub(r"\s+", " ", sql).strip().rstrip(";").lower()


def extract_tables(sql: str) -> set[str]:
    cte_names = {
        match.group(1).lower()
        for match in re.finditer(r"\b(?:with|,)\s*([a-zA-Z_][\w]*)\s+as\s*\(", sql, flags=re.IGNORECASE)
    }
    candidates = {
        match.group(1).lower()
        for match in re.finditer(r"\b(?:from|join)\s+([a-zA-Z_][\w]*)", sql, flags=re.IGNORECASE)
    }
    return {name for name in candidates if name not in SQL_KEYWORDS and name not in cte_names}


def extract_columns(sql: str) -> set[str]:
    tokens = {token.lower() for token in re.findall(r"\b[a-zA-Z_][\w]*\b", sql)}
    return {token for token in tokens if token not in SQL_KEYWORDS}


def reset_session() -> None:
    clear_session_state(SESSION_ID)


class TestSqlAccuracy(unittest.TestCase):
    def setUp(self) -> None:
        reset_session()

    def tearDown(self) -> None:
        reset_session()

    def test_sql_accuracy_suite(self) -> None:
        for idx, case_data in enumerate(ACCURACY_CASES):
            # Rate limiting entre testes para evitar quota exhaustion
            if idx > 0:
                time.sleep(RATE_LIMIT_DELAY)

            with self.subTest(case_id=case_data["id"]):
                result = perguntar(case_data["prompt"], session_id=SESSION_ID)

                if case_data["reference_sql"] is None:
                    self.assertFalse(result["is_valid"])
                    self.assertIsNone(result["final_sql"])
                    self.assertIn(result["rows"], (None, []))
                    self.assertTrue(result["error_message"])
                    continue

                self.assertTrue(result["is_valid"])
                self.assertTrue(result["final_sql"])
                self.assertIsNotNone(result["rows"])

                actual_sql = result["final_sql"]
                actual_tables = extract_tables(actual_sql)
                actual_columns = extract_columns(actual_sql)

                self.assertEqual(
                    case_data["expected_tables"],
                    actual_tables,
                    msg=f"Tabela esperada não encontrada. Esperado: {case_data['expected_tables']} | Atual: {actual_tables} | SQL: {actual_sql}",
                )

                for table_name, required_columns in case_data["required_columns"].items():
                    missing_columns = {column for column in required_columns if column.lower() not in actual_columns}
                    self.assertFalse(
                        missing_columns,
                        msg=f"Colunas esperadas ausentes para {table_name}. Ausentes: {missing_columns} | Atual: {actual_columns} | SQL: {actual_sql}",
                    )

                self.assertTrue(normalize_sql(actual_sql))


if __name__ == "__main__":
    unittest.main()

