import sys
import os
from datetime import date

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal,Base
from app.models import (
    ClienteBase360,
    DesempenhoProduto,
    KpiPorCategoria,
    KpiPorEstado,
    KpiPorStatus,
    ComportamentoDigital,
    AnaliseTicket,
)



# Dados de seed

CLIENTES_360 = [
    dict(
        id_cliente="CLI001", nome="Ana", sobrenome="Silva",
        email="ana.silva@email.com", telefone_formatado="(11)9999-0001",telefone_ramal="1234",
        estado="SP", cidade="São Paulo", data_nascimento=date.fromisoformat("1990-03-15"), genero="F",
        total_compras=12, receita_total_cliente=3200.00, ticket_medio=266.67,
        data_primeira_compra=date.fromisoformat("2024-01-10"), data_ultima_compra=date.fromisoformat("2025-10-05"),
        metodo_pagamento_preferido="cartao_credito", categoria_preferida="Eletrônicos",
        produto_mais_comprado="Notebook Pro X",
        total_avaliacoes=8, media_nota_produto=4.5, media_nota_nps=9.0,
        total_tickets=2, tickets_abertos=1, tickets_fechados=1,
        total_sessoes=25, total_produtos_visitados=80, tempo_medio_sessao_seg=45.3,
        segmento_cliente="Premium",
    ),
    dict(
        id_cliente="CLI002", nome="Bruno", sobrenome="Costa",
        email="bruno.costa@email.com", telefone_formatado="(21)99999-0002", telefone_ramal="5678",
        estado="RJ", cidade="Rio de Janeiro", data_nascimento=date.fromisoformat("1985-07-22"), genero="M",
        total_compras=1, receita_total_cliente=150.00, ticket_medio=150.00,
        data_primeira_compra=date.fromisoformat("2025-11-20"), data_ultima_compra=date.fromisoformat("2025-11-20"),
        metodo_pagamento_preferido="pix", categoria_preferida="Moda",
        produto_mais_comprado="Tênis Runner 2",
        total_avaliacoes=1, media_nota_produto=3.0, media_nota_nps=7.0,
        total_tickets=0, tickets_abertos=0, tickets_fechados=0,
        total_sessoes=3, total_produtos_visitados=10, tempo_medio_sessao_seg=60.0,
        segmento_cliente="Novo",
    ),
    dict(
        id_cliente="CLI003", nome="Carla", sobrenome="Mendes",
        email="carla.mendes@email.com", telefone_formatado="(31)9999-0003", telefone_ramal="9012",
        estado="MG", cidade="Belo Horizonte", data_nascimento=date.fromisoformat("1992-12-01"), genero="F",
        total_compras=3, receita_total_cliente=780.00, ticket_medio=260.00,
        data_primeira_compra=date.fromisoformat("2023-05-10"), data_ultima_compra=date.fromisoformat("2024-09-30"),
        metodo_pagamento_preferido="boleto", categoria_preferida="Casa & Jardim",
        produto_mais_comprado="Aspirador Turbo",
        total_avaliacoes=3, media_nota_produto=4.0, media_nota_nps=8.5,
        total_tickets=1, tickets_abertos=0, tickets_fechados=1,
        total_sessoes=10, total_produtos_visitados=35, tempo_medio_sessao_seg=30.5,
        segmento_cliente="Inativo",
    ),
    dict(
        id_cliente="CLI004", nome="Diego", sobrenome="Ferreira",
        email="diego.ferreira@email.com", telefone_formatado="(41)9999-0004", telefone_ramal="3456",
        estado="RS", cidade="Porto Alegre", data_nascimento=date.fromisoformat("1988-04-18"), genero="M",
        total_compras=7, receita_total_cliente=2100.00, ticket_medio=300.00,
        data_primeira_compra=date.fromisoformat("2024-03-01"), data_ultima_compra=date.fromisoformat("2025-12-10"),
        metodo_pagamento_preferido="cartao_debito", categoria_preferida="Eletrônicos",
        produto_mais_comprado="Fone Bluetooth Z",
        total_avaliacoes=5, media_nota_produto=4.8, media_nota_nps=9.5,
        total_tickets=3, tickets_abertos=1, tickets_fechados=2,
        total_sessoes=18, total_produtos_visitados=60, tempo_medio_sessao_seg=55.0,
        segmento_cliente="Premium",
    ),
    dict(
        id_cliente="CLI005", nome="Eduarda", sobrenome="Lima",
        email="eduarda.lima@email.com", telefone_formatado="(51)9999-0005", telefone_ramal="7890",
        estado="BA", cidade="Salvador", data_nascimento=date.fromisoformat("1995-09-30"), genero="F",
        total_compras=4, receita_total_cliente=950.00, ticket_medio=237.50,
        data_primeira_compra=date.fromisoformat("2024-06-15"), data_ultima_compra=date.fromisoformat("2025-08-20"),
        metodo_pagamento_preferido="pix", categoria_preferida="Beleza",
        produto_mais_comprado="Kit Skincare Plus",
        total_avaliacoes=4, media_nota_produto=4.2, media_nota_nps=8.0,
        total_tickets=2, tickets_abertos=0, tickets_fechados=2,
        total_sessoes=15, total_produtos_visitados=45, tempo_medio_sessao_seg=40.0,
        segmento_cliente="Recorrente",
    ),
]

PRODUTOS = [
    dict(
        id_produto="PROD001", nome_produto="Notebook Pro X", categoria="Eletrônicos",
        preco=2999.90,total_pedidos=45, unidades_vendidas=45, receita_total=134995.50, receita_media_por_pedido=2999.90,
        total_avaliacoes=30, media_nota_produto=4.6, media_nota_nps=9.1, pct_recomenda=93.33,
        total_tickets=8, total_visualizacoes=200, flag_alto_ticket=False,
    ),
    dict(
        id_produto="PROD002", nome_produto="Tênis Runner 2", categoria="Moda",
        preco=299.90, total_pedidos=120, unidades_vendidas=120, receita_total=35988.00, receita_media_por_pedido=299.90,
        total_avaliacoes=90, media_nota_produto=4.3, media_nota_nps=8.5, pct_recomenda=88.89,
        total_tickets=5, total_visualizacoes=540, flag_alto_ticket=False,
    ),
    dict(
        id_produto="PROD003", nome_produto="Aspirador Turbo", categoria="Casa & Jardim",
        preco=599.90, total_pedidos=30, unidades_vendidas=30, receita_total=17997.00, receita_media_por_pedido=599.90,
        total_avaliacoes=20, media_nota_produto=3.9, media_nota_nps=7.8, pct_recomenda=75.00,
        total_tickets=9, total_visualizacoes=150, flag_alto_ticket=True,
    ),
    dict(
        id_produto="PROD004", nome_produto="Fone Bluetooth Z", categoria="Eletrônicos",
        preco=399.90, total_pedidos=80, unidades_vendidas=80, receita_total=31992.00, receita_media_por_pedido=399.90,
        total_avaliacoes=60, media_nota_produto=4.7, media_nota_nps=9.3, pct_recomenda=95.00,
        total_tickets=4, total_visualizacoes=380, flag_alto_ticket=False,
    ),
    dict(
        id_produto="PROD005", nome_produto="Kit Skincare Plus", categoria="Beleza",
        preco=189.90, total_pedidos=60, unidades_vendidas=60, receita_total=11394.00, receita_media_por_pedido=189.90,
        total_avaliacoes=45, media_nota_produto=4.4, media_nota_nps=8.7, pct_recomenda=91.11,
        total_tickets=3, total_visualizacoes=270, flag_alto_ticket=False,
    ),
]

KPI_CATEGORIA = [
    dict(ano_venda=2025, mes_venda=10, categoria="Eletrônicos",  receita_total=45000.00, ticket_medio=300.00, total_pedidos=150, total_clientes_unicos=80),
    dict(ano_venda=2025, mes_venda=10, categoria="Moda",         receita_total=12000.00, ticket_medio=250.00, total_pedidos=48,  total_clientes_unicos=35),
    dict(ano_venda=2025, mes_venda=10, categoria="Casa & Jardim",receita_total=8000.00,  ticket_medio=400.00, total_pedidos=20,  total_clientes_unicos=18),
    dict(ano_venda=2025, mes_venda=10, categoria="Beleza",       receita_total=6000.00,  ticket_medio=180.00, total_pedidos=33,  total_clientes_unicos=28),
    dict(ano_venda=2025, mes_venda=11, categoria="Eletrônicos",  receita_total=50000.00, ticket_medio=320.00, total_pedidos=156, total_clientes_unicos=90),
    dict(ano_venda=2025, mes_venda=11, categoria="Moda",         receita_total=14000.00, ticket_medio=260.00, total_pedidos=54,  total_clientes_unicos=40),
    dict(ano_venda=2025, mes_venda=11, categoria="Casa & Jardim",receita_total=9500.00,  ticket_medio=410.00, total_pedidos=23,  total_clientes_unicos=20),
    dict(ano_venda=2025, mes_venda=11, categoria="Beleza",       receita_total=7200.00,  ticket_medio=185.00, total_pedidos=39,  total_clientes_unicos=33),
]

KPI_ESTADO = [
    dict(ano_venda=2025, mes_venda=10, estado="SP", receita_total=28000.00, ticket_medio=310.00, total_pedidos=90,  total_clientes_unicos=55),
    dict(ano_venda=2025, mes_venda=10, estado="RJ", receita_total=15000.00, ticket_medio=290.00, total_pedidos=52,  total_clientes_unicos=38),
    dict(ano_venda=2025, mes_venda=10, estado="MG", receita_total=10000.00, ticket_medio=270.00, total_pedidos=37,  total_clientes_unicos=28),
    dict(ano_venda=2025, mes_venda=10, estado="RS", receita_total=8000.00,  ticket_medio=300.00, total_pedidos=27,  total_clientes_unicos=20),
    dict(ano_venda=2025, mes_venda=10, estado="BA", receita_total=6000.00,  ticket_medio=250.00, total_pedidos=24,  total_clientes_unicos=18),
    dict(ano_venda=2025, mes_venda=11, estado="SP", receita_total=32000.00, ticket_medio=320.00, total_pedidos=100, total_clientes_unicos=62),
    dict(ano_venda=2025, mes_venda=11, estado="RJ", receita_total=17500.00, ticket_medio=295.00, total_pedidos=59,  total_clientes_unicos=43),
    dict(ano_venda=2025, mes_venda=11, estado="MG", receita_total=11000.00, ticket_medio=275.00, total_pedidos=40,  total_clientes_unicos=30),
]

KPI_STATUS = [
    dict(ano_venda=2025, mes_venda=10, status="entregue",    receita_total=50000.00, ticket_medio=300.00, total_pedidos=167, total_clientes_unicos=90),
    dict(ano_venda=2025, mes_venda=10, status="cancelado",   receita_total=3000.00,  ticket_medio=280.00, total_pedidos=11,  total_clientes_unicos=10),
    dict(ano_venda=2025, mes_venda=10, status="em_transito", receita_total=8000.00,  ticket_medio=310.00, total_pedidos=26,  total_clientes_unicos=22),
    dict(ano_venda=2025, mes_venda=11, status="entregue",    receita_total=58000.00, ticket_medio=315.00, total_pedidos=184, total_clientes_unicos=98),
    dict(ano_venda=2025, mes_venda=11, status="cancelado",   receita_total=2500.00,  ticket_medio=270.00, total_pedidos=9,   total_clientes_unicos=8),
    dict(ano_venda=2025, mes_venda=11, status="em_transito", receita_total=10000.00, ticket_medio=320.00, total_pedidos=31,  total_clientes_unicos=26),
]

COMPORTAMENTO_DIGITAL = [
    dict(id_cliente="CLI001", total_sessoes=25, total_eventos=200, total_visualizacoes_produto=80,  total_compras_click=12, taxa_conversao_click=0.15, taxa_abandono_carrinho=0.20, canal_predominante="mobile",  produto_mais_visitado="Notebook Pro X"),
    dict(id_cliente="CLI002", total_sessoes=3,  total_eventos=15,  total_visualizacoes_produto=10,  total_compras_click=1,  taxa_conversao_click=0.10, taxa_abandono_carrinho=0.33, canal_predominante="desktop", produto_mais_visitado="Tênis Runner 2"),
    dict(id_cliente="CLI003", total_sessoes=10, total_eventos=80,  total_visualizacoes_produto=35,  total_compras_click=3,  taxa_conversao_click=0.09, taxa_abandono_carrinho=0.25, canal_predominante="mobile",  produto_mais_visitado="Aspirador Turbo"),
    dict(id_cliente="CLI004", total_sessoes=18, total_eventos=150, total_visualizacoes_produto=60,  total_compras_click=7,  taxa_conversao_click=0.12, taxa_abandono_carrinho=0.18, canal_predominante="app",     produto_mais_visitado="Fone Bluetooth Z"),
    dict(id_cliente="CLI005", total_sessoes=15, total_eventos=110, total_visualizacoes_produto=45,  total_compras_click=4,  taxa_conversao_click=0.09, taxa_abandono_carrinho=0.30, canal_predominante="mobile",  produto_mais_visitado="Kit Skincare Plus"),
]

TICKETS = [
    dict(id_ticket="TKT001", id_cliente="CLI001", nome_cliente="Ana Silva",      tipo_problema="entrega_atrasada",  status_ticket="fechado", data_abertura=date.fromisoformat("2025-09-01"), data_resolucao=date.fromisoformat("2025-09-03"), tempo_resolucao_horas=48.0, agente_suporte="Agente João",   nome_produto="Notebook Pro X",    categoria_produto="Eletrônicos",  valor_pedido=2999.90, total_pedidos_cliente=12, receita_total_cliente=3200.00),
    dict(id_ticket="TKT002", id_cliente="CLI003", nome_cliente="Carla Mendes",   tipo_problema="produto_com_defeito",status_ticket="fechado", data_abertura=date.fromisoformat("2025-07-15"), data_resolucao=date.fromisoformat("2025-07-18"), tempo_resolucao_horas=72.0, agente_suporte="Agente Maria",  nome_produto="Aspirador Turbo",   categoria_produto="Casa & Jardim",valor_pedido=599.90,  total_pedidos_cliente=3,  receita_total_cliente=780.00),
    dict(id_ticket="TKT003", id_cliente="CLI004", nome_cliente="Diego Ferreira", tipo_problema="cobranca_incorreta",status_ticket="aberto",  data_abertura=date.fromisoformat("2025-12-05"), data_resolucao=None,                              tempo_resolucao_horas=None, agente_suporte="Agente João",   nome_produto="Fone Bluetooth Z",  categoria_produto="Eletrônicos",  valor_pedido=399.90,  total_pedidos_cliente=7,  receita_total_cliente=2100.00),
    dict(id_ticket="TKT004", id_cliente="CLI005", nome_cliente="Eduarda Lima",   tipo_problema="troca_devolucao",   status_ticket="fechado", data_abertura=date.fromisoformat("2025-08-10"), data_resolucao=date.fromisoformat("2025-08-12"), tempo_resolucao_horas=36.0, agente_suporte="Agente Carlos", nome_produto="Kit Skincare Plus", categoria_produto="Beleza",       valor_pedido=189.90,  total_pedidos_cliente=4,  receita_total_cliente=950.00),
    dict(id_ticket="TKT005", id_cliente="CLI002", nome_cliente="Bruno Costa",    tipo_problema="entrega_atrasada",  status_ticket="aberto",  data_abertura=date.fromisoformat("2025-11-22"), data_resolucao=None,                              tempo_resolucao_horas=None, agente_suporte="Agente Maria",  nome_produto="Tênis Runner 2",    categoria_produto="Moda",         valor_pedido=299.90,  total_pedidos_cliente=1,  receita_total_cliente=150.00),
]



# Execução


def run():
    print("Criando tabelas...")
    Base.metadata.create_all(bind=engine)
    print("Tabelas criadas.")

    db = SessionLocal()
    try:
        # Evita reinserir se já existir dados
        if db.query(ClienteBase360).count() > 0:
            print("Banco já possui dados. Seed ignorado.")
            return

        print("Inserindo seed...")
        db.bulk_insert_mappings(ClienteBase360,    CLIENTES_360)
        db.bulk_insert_mappings(DesempenhoProduto, PRODUTOS)
        db.bulk_insert_mappings(KpiPorCategoria,   KPI_CATEGORIA)
        db.bulk_insert_mappings(KpiPorEstado,      KPI_ESTADO)
        db.bulk_insert_mappings(KpiPorStatus,      KPI_STATUS)
        db.bulk_insert_mappings(ComportamentoDigital, COMPORTAMENTO_DIGITAL)
        db.bulk_insert_mappings(AnaliseTicket,     TICKETS)
        db.commit()

        print("\nRegistros inseridos:")
        print(f"   v_cliente_360:         {db.query(ClienteBase360).count()}")
        print(f"   desempenho_produtos:   {db.query(DesempenhoProduto).count()}")
        print(f"   kpi_por_categoria:     {db.query(KpiPorCategoria).count()}")
        print(f"   kpi_por_estado:        {db.query(KpiPorEstado).count()}")
        print(f"   kpi_por_status:        {db.query(KpiPorStatus).count()}")
        print(f"   comportamento_digital: {db.query(ComportamentoDigital).count()}")
        print(f"   analise_tickets:       {db.query(AnaliseTicket).count()}")
        print("\nSeed concluído com sucesso!")

    except Exception as e:
        db.rollback()
        print(f"Erro ao inserir seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()