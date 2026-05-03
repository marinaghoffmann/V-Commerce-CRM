# V-Commerce CRM 360

Plataforma integrada de CRM desenvolvida para o RocketLab 2026 (Visagio), com pipeline de dados, sistema web e agente de IA conversacional.

---

## Visão Geral

A V-Commerce é uma varejista digital brasileira com mais de 50.000 clientes e 300.000 pedidos acumulados. Este projeto centraliza dados de clientes, pedidos, produtos e suporte em uma única plataforma, com dashboards analíticos e um agente de IA capaz de responder perguntas de negócio em linguagem natural.

### Módulos

| Módulo | Tecnologia | Descrição |
|---|---|---|
| Engenharia de Dados | Databricks + PySpark | Pipeline Bronze → Silver → Gold |
| CRM Web | FastAPI + React + TypeScript | Dashboards, perfil 360, CRUD |
| Agente de IA | Gemini 2.5 Flash | Chat Text-to-SQL integrado ao CRM |

---

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