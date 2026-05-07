# Testes do Prompt Text-to-SQL — V-Commerce CRM 360

Documentação dos testes realizados para validar o prompt base do agente de IA.
Todos os testes foram executados com dados reais das tabelas Gold exportadas do Databricks.

Modelo utilizado: `gemini-2.5-flash`
Script de teste: `test_prompt.py`

---

## Resultados

### 1. Top 10 produtos mais vendidos
**Pergunta:** "Quais foram os 10 produtos mais vendidos?"

**SQL gerado:**
```sql
SELECT nome_produto, unidades_vendidas, receita_total
FROM desempenho_produtos
ORDER BY unidades_vendidas DESC
LIMIT 10;
```

**Resultado:** ✅ Válido — 10 linhas retornadas
| nome_produto | unidades_vendidas | receita_total |
|---|---|---|
| Monitor 27 Polegadas | 10851 | 17341114.45 |
| Console de Videogame | 10594 | 32747794.49 |
| Impressora Multifuncional | 10380 | 9702513.16 |
| Notebook Intel Core i7 | 10325 | 25731785.23 |
| Smart TV 43 Polegadas | 10160 | 11307188.36 |
| Câmera de Ação 4K | 10099 | 10612281.21 |
| Smartphone 64GB | 9515 | 14336637.35 |
| Smart TV 32 Polegadas | 9328 | 9182017.07 |
| Monitor Gamer 144Hz | 9299 | 8451154.63 |
| Projetor Full HD | 9155 | 24597152.96 |

---

### 2. Estado com maior receita total
**Pergunta:** "Qual estado teve maior receita total?"

**SQL gerado:**
```sql
SELECT estado, SUM(receita_total) AS receita_total
FROM kpi_por_estado
GROUP BY estado
ORDER BY receita_total DESC
LIMIT 1;
```

**Resultado:** ✅ Válido — 1 linha retornada
| estado | receita_total |
|---|---|
| Sao Paulo | 91224178.93 |

---

### 3. Produtos com mais tickets de suporte
**Pergunta:** "Quais produtos estão gerando mais tickets de suporte?"

**SQL gerado:**
```sql
SELECT nome_produto, categoria, total_tickets, media_nota_produto, receita_total
FROM desempenho_produtos
ORDER BY total_tickets DESC
LIMIT 10;
```

**Resultado:** ✅ Válido — 10 linhas retornadas
| nome_produto | categoria | total_tickets | media_nota_produto | receita_total |
|---|---|---|---|---|
| Projetor Full HD | Eletronicos | 683 | 3.5 | 24597152.96 |
| Smart TV 50 Polegadas | Eletronicos | 631 | 3.52 | 15090316.26 |
| Smartphone Pro Max 512GB | Eletronicos | 630 | 3.47 | 23262371.39 |
| Monitor 24 Polegadas | Eletronicos | 628 | 3.52 | 11056767.03 |
| Drone com Câmera | Eletronicos | 620 | 3.51 | 17510063.79 |
| HD Externo 2TB | Eletronicos | 619 | 3.48 | 5270197.62 |
| Notebook Intel Core i5 | Eletronicos | 588 | 3.48 | 22094934.51 |
| Smartphone 128GB | Eletronicos | 581 | 3.59 | 16498498.97 |
| Carregador Turbo | Eletronicos | 415 | 3.55 | 597274.22 |
| Caixa de Som Bluetooth | Eletronicos | 392 | 3.59 | 1994014.34 |

---

### 4. Clientes Premium com maior receita
**Pergunta:** "Me mostre os clientes do segmento Premium com maior receita"

**SQL gerado:**
```sql
SELECT nome, sobrenome, email, receita_total_cliente, segmento_cliente
FROM v_cliente_360
WHERE segmento_cliente = 'Premium'
ORDER BY receita_total_cliente DESC
LIMIT 100;
```

**Resultado:** ✅ Válido — 100 linhas retornadas
| nome | sobrenome | receita_total_cliente |
|---|---|---|
| Gustavo | Horta | 84243.25 |
| Elisa | Domingues | 77646.73 |
| Urania | Uchoa | 74852.63 |
| ... | ... | ... |

> Segmentos disponíveis no banco: `Premium`, `Recorrente`, `Inativo`, `Novo`

---

### 5. Ticket médio por categoria
**Pergunta:** "Qual o ticket médio de cada categoria de produto?"

**SQL gerado:**
```sql
SELECT categoria, AVG(ticket_medio) AS ticket_medio_geral
FROM kpi_por_categoria
GROUP BY categoria
ORDER BY ticket_medio_geral DESC;
```

**Resultado:** ✅ Válido — 8 linhas retornadas
| categoria | ticket_medio_geral |
|---|---|
| Eletronicos | 2797.48 |
| Moveis | 899.40 |
| Automotivo | 327.26 |
| Esportes | 300.27 |
| Brinquedos | 274.77 |
| Casa | 272.75 |
| Vestuario | 268.16 |
| Beleza | 183.39 |

---

### 6. Taxa média de abandono de carrinho
**Pergunta:** "Qual a taxa média de abandono de carrinho?"

**SQL gerado:**
```sql
SELECT AVG(taxa_abandono_carrinho) AS taxa_media_abandono
FROM comportamento_digital;
```

**Resultado:** ✅ Válido — 1 linha retornada
| taxa_media_abandono |
|---|
| 0.026 |

---

### 7. Pergunta fora do escopo (guardrail)
**Pergunta:** "Qual a previsão do tempo para amanhã em São Paulo?"

**Resultado:** ✅ Guardrail ativado corretamente
```
SQL:    None
Válido: False
Erro:   A pergunta está fora do escopo de dados da V-Commerce. O sistema
        apenas processa dados de vendas, clientes, produtos, tickets e
        comportamento digital.
```

---

## Resumo

| # | Pergunta | SQL Gerado | Válido | Dados Reais |
|---|---|---|---|---|
| 1 | Top 10 produtos mais vendidos | ✅ | ✅ | ✅ |
| 2 | Estado com maior receita | ✅ | ✅ | ✅ |
| 3 | Produtos com mais tickets | ✅ | ✅ | ✅ |
| 4 | Clientes Premium com maior receita | ✅ | ✅ | ✅ |
| 5 | Ticket médio por categoria | ✅ | ✅ | ✅ |
| 6 | Taxa de abandono de carrinho | ✅ | ✅ | ✅ |
| 7 | Previsão do tempo (fora do escopo) | — | ✅ guardrail | — |
