from database import engine
from sqlalchemy import text
from sqlglot import parse_one, exp

def get_tabelas_validas():
    with engine.connect() as conn:
        result = conn.execute(
            text("SELECT name FROM sqlite_master WHERE type='table';")
        )
        return {row[0] for row in result}


def extrair_tabelas(sql: str) -> set[str]:
    try:
        tree = parse_one(sql)
        return {
            table.name for table in tree.find_all(exp.Table)
        }
    except Exception as e:
        raise ValueError(f"SQL inválido: {e}")


def validar_sql(sql: str, TABELAS_VALIDAS: set) -> str:
    """Guardrail para validar a consulta SQL antes de executá-la."""

    sql = sql.strip()
    sql_upper = sql.upper()

    # Apenas SELECT
    if not sql_upper.startswith("SELECT") and not sql_upper.startswith("WITH"):
        raise ValueError("Apenas SELECT permitido")

    # Operações proibidas
    proibidos = [
        "DELETE", "UPDATE", "INSERT", "DROP", "ALTER", "PRAGMA", "TRUNCATE", "CREATE", "ATTACH",
    ]

    if any(p in sql_upper for p in proibidos):
        raise ValueError("Operação não permitida")

    # Bloqueia múltiplas queries
    if ";" in sql[:-1]:
        raise ValueError("Múltiplas queries não permitidas")

    # Extrai tabelas reais
    tabelas_encontradas = extrair_tabelas(sql)

    # Verifica escopo permitido
    tabelas_invalidas = tabelas_encontradas - TABELAS_VALIDAS

    if tabelas_invalidas:
        raise ValueError(
            f"Tabelas não permitidas: {tabelas_invalidas}"
        )

    # Adiciona LIMIT automaticamente
    if "LIMIT" not in sql_upper:
        sql = sql.rstrip(";") + " LIMIT 50;"

    return sql