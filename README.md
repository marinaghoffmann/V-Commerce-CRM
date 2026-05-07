# V-Commerce CRM 360

Plataforma integrada de CRM desenvolvida para o RocketLab 2026 (Visagio), com pipeline de dados, sistema web e agente de IA conversacional.

---

## Visão Geral

A V-Commerce é uma varejista digital brasileira, com mais de 50.000 clientes e 300.000 pedidos acumulados. Este projeto centraliza dados de clientes, pedidos, produtos e suporte em uma única plataforma, com dashboards analíticos e um agente de IA capaz de responder perguntas de negócio em linguagem natural.

### Módulos

| Módulo | Tecnologia | Descrição |
|---|---|---|
| Engenharia de Dados | Databricks + PySpark | Pipeline Bronze → Silver → Gold |
| CRM Web | FastAPI + React + TypeScript | Dashboards, perfil 360, CRUD |
| Agente de IA | Gemini 2.5 Flash | Chat Text-to-SQL integrado ao CRM |

---

## Como Executar

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

Se o ambiente virtual já tiver sido criado, basta ativá-lo antes de instalar as dependências:

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
python -m app.main
```

### Frontend

```bash
cd frontend
pnpm install
pnpm run dev
```

Se o `pnpm install` já tiver sido executado anteriormente, você pode ir direto para `pnpm run dev`.

## Engenharia de Dados

### Arquitetura Medalhão

O pipeline segue a arquitetura Medalhão em três camadas no Databricks:

- **Bronze** — ingestão dos CSVs brutos como tabelas Delta, sem transformações, com timestamp de ingestão
- **Silver** — limpeza, deduplicação, padronização de formatos e criação de colunas derivadas
- **Gold** — tabelas analíticas consolidadas que alimentam o CRM e o agente de IA

### Camada Bronze

As 6 tabelas a seguir foram ingeridas na camada Bronze:

| Tabela Delta | Arquivo de Origem |
|---|---|
| bronze.tb_avaliacoes | avaliacoes.csv |
| bronze.tb_catalogo_produtos | catalogo_produtos.csv |
| bronze.tb_clickstream | clickstream.csv |
| bronze.tb_clientes | clientes.csv |
| bronze.tb_pedidos | pedidos.csv |
| bronze.tb_suporte_tickets | suporte_tickets.csv |

### Camada Silver

Notebook responsável por:

* Remover linhas duplicadas via Window Functions particionadas pelo ID e ordenadas de forma decrescente pela data de cadastro
* Validar e nulificar datas inválidas (fora de faixa, futuras ou inconsistentes)
* Padronizar valores categóricos para valores canônicos em minúsculo sem acento
* Converter nulos falsos para nulo real
* Validar e marcar e-mails inválidos via regex
* Padronizar e separar campos compostos em colunas estruturadas
* Corrigir combinações inválidas entre colunas relacionadas
* Substituir valores inválidos pela mediana dos valores válidos
* Criar flags booleanas para rastreabilidade de nulos esperados
* Remover linhas com dados críticos ausentes
* Criar coluna derivada `status_ticket` a partir de nulos legítimos de `data_resolucao`
* Criar tabela 1:N entre `id_cliente` e `id_device` para normalizar múltiplos dispositivos por cliente

Tabelas geradas:

* `silver.dim_clientes`
* `silver.fat_avaliacoes`
* `silver.fat_pedidos`
* `silver.fat_suporte_tickets`
* `silver.dim_catalogo_produtos`
* `silver.fat_clickstream`

# Camada Gold

A camada Gold consolida e agrega os dados das camadas Silver em tabelas prontas para consumo pelo CRM, dashboards e pelo Agente de IA. Cada tabela é orientada a um caso de uso específico e otimizada para leitura, não para transformação.


## Tabelas

### `gold.v_cliente_360`
Consolida dados cadastrais com métricas de compra, suporte, satisfação e comportamento digital. 

### `gold.desempenho_produtos`
Consolida dados do catálogo com métricas de vendas, satisfação, suporte e visualizações. 

### `gold.kpis_vendas`
Métricas de vendas consolidadas com cortes por estado, categoria de produto e status do pedido. 

### `gold.analise_tickets`
Uma linha por ticket, com contexto completo do cliente e do produto envolvido.

### `gold.comportamento_digital`
Uma linha por cliente,com métricas de navegação agregadas do clickstream. 

---

## Agente de IA (Text-to-SQL)

O agente converte perguntas em linguagem natural para queries SQL válidas sobre o banco local, utilizando o modelo Gemini 2.5 Flash.

### Estrutura

| Arquivo | Descrição |
|---|---|
| `ai-agent/agent.py` | Função `perguntar()` — chama o Gemini, executa o SQL e retorna os resultados |
| `ai-agent/prompt.py` | System prompt com schema completo e exemplos few-shot |
| `ai-agent/database.py` | Conexão com o SQLite e funções `get_schema()` e `execute_query()` |
| `ai-agent/test_prompt.py` | Script para rodar todos os testes documentados |

### Configuração

```bash
cd ai-agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r ../backend/requirements.txt
cp ../.env.example .env
# editar .env com a GOOGLE_API_KEY
```

A chave de API pode ser obtida em: https://aistudio.google.com/app/apikey

### Rodando os testes

```bash
python test_prompt.py
```

O script executa 7 perguntas de negócio em sequência, com delay de 15s entre cada chamada para respeitar o rate limit do free tier (5 requests/min do Gemini 2.5 Flash).

### Perguntas testadas

| # | Pergunta | Status |
|---|---|---|
| 1 | Quais foram os 10 produtos mais vendidos? | ✅ Validado com dados reais |
| 2 | Qual estado teve maior receita total? | ✅ Validado com dados reais |
| 3 | Quais produtos estão gerando mais tickets de suporte? | ✅ Validado com dados reais |
| 4 | Me mostre os clientes do segmento Premium com maior receita | ✅ Validado com dados reais |
| 5 | Qual o ticket médio de cada categoria de produto? | ✅ Validado com dados reais |
| 6 | Qual a taxa média de abandono de carrinho? | ✅ Validado com dados reais |
| 7 | Qual a previsão do tempo para amanhã em São Paulo? | ✅ Guardrail ativado (fora do escopo) |
