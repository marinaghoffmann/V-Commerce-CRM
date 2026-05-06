from sqlalchemy import create_engine, inspect, text

engine = create_engine("sqlite:///../backend/V-Commerce-CRM-360.db")

def get_schema() -> str:
    inspector = inspect(engine)
    schema_parts = []
    
    for table_name in inspector.get_table_names():
        columns = inspector.get_columns(table_name)
        cols_str = ", ".join(
            f"{col['name']} ({col['type']})" for col in columns
        )
        schema_parts.append(f"Tabela {table_name}: {cols_str}")
    
    return "\n".join(schema_parts)

def execute_query(sql: str) -> list:
    with engine.connect() as conn:
        result = conn.execute(text(sql))
        return [row._mapping for row in result]
    
if __name__ == "__main__":
    print(get_schema())