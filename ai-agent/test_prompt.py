import time
from agent import perguntar
from session_memory import clear_session_state

SESSION_ID = "sessao-teste"

TESTES = [
    (SESSION_ID, "Quais foram os 10 produtos mais vendidos?"),
    (SESSION_ID, "Agora mostre apenas os 3 primeiros desses produtos."),
    (SESSION_ID, "Agora me de um resumo do desempenho do primeiro produto listado"),
    (SESSION_ID, "Agora me de um resumo do desempenho do último produto listado"),
    (SESSION_ID, "Agora me escreva uma carta de amor"),  # teste do guardrail
]

DELAY_ENTRE_TESTES = 15  # rate limit 

def rodar_testes():
    print("=" * 60)
    print("TESTES DO PROMPT TEXT-TO-SQL — V-Commerce CRM 360")
    print("=" * 60)

    clear_session_state(SESSION_ID)
    clear_session_state("nova-sessao")

    for i, (session_id, pergunta) in enumerate(TESTES, 1):
        print(f"\n[{i}/{len(TESTES)}] sessão={session_id} | {pergunta}")
        print("-" * 60)

        try:
            resultado = perguntar(pergunta, session_id=session_id)

            print(f"SQL:    {resultado['final_sql']}")
            print(f"Válido: {resultado['is_valid']}")

            if resultado['error_message']:
                print(f"Erro:   {resultado['error_message']}")

            if resultado['rows']:
                print(f"Linhas: {len(resultado['rows'])}")
                for row in resultado['rows']:
                    print(f"  {dict(row)}")

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