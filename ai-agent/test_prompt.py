"""
Script para rodar todos os testes documentados do prompt Text-to-SQL.
Uso: python test_prompt.py
"""

import time
from agent import perguntar

TESTES = [
    "Quais foram os 10 produtos mais vendidos?",
    "Qual estado teve maior receita total?",
    "Quais produtos estão gerando mais tickets de suporte?",
    "Me mostre os clientes do segmento VIP com maior receita",
    "Qual o ticket médio de cada categoria de produto?",
    "Qual a taxa média de abandono de carrinho?",
    "Qual a previsão do tempo para amanhã em São Paulo?",  # teste do guardrail
]

DELAY_ENTRE_TESTES = 15  # segundos — respeita o rate limit do free tier (5 req/min)

def rodar_testes():
    print("=" * 60)
    print("TESTES DO PROMPT TEXT-TO-SQL — V-Commerce CRM 360")
    print("=" * 60)

    for i, pergunta in enumerate(TESTES, 1):
        print(f"\n[{i}/{len(TESTES)}] {pergunta}")
        print("-" * 60)

        try:
            resultado = perguntar(pergunta)

            print(f"SQL:    {resultado['final_sql']}")
            print(f"Válido: {resultado['is_valid']}")

            if resultado['error_message']:
                print(f"Erro:   {resultado['error_message']}")

            if resultado['rows']:
                print(f"Linhas: {len(resultado['rows'])}")
                for row in resultado['rows'][:3]:
                    print(f"  {dict(row)}")
                if len(resultado['rows']) > 3:
                    print(f"  ... e mais {len(resultado['rows']) - 3} linha(s)")

        except Exception as e:
            print(f"ERRO NA CHAMADA: {e}")

        if i < len(TESTES):
            print(f"\n⏳ Aguardando {DELAY_ENTRE_TESTES}s (rate limit)...")
            time.sleep(DELAY_ENTRE_TESTES)

    print("\n" + "=" * 60)
    print("Testes concluídos.")
    print("=" * 60)

if __name__ == "__main__":
    rodar_testes()