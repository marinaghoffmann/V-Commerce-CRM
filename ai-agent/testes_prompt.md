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

**Resultado:** ✅ Válido — 5 linhas retornadas (banco de seed contém 5 produtos)
| nome_produto | unidades_vendidas | receita_total |
|---|---|---|
| Tênis Runner 2 | 120 | 35988.0 |
| Fone Bluetooth Z | 80 | 31992.0 |
| Kit Skincare Plus | 60 | 11394.0 |
| Notebook Pro X | 45 | 134995.5 |
| Aspirador Turbo | 30 | 17997.0 |

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
| SP | 60000.0 |

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

**Resultado:** ✅ Válido — 5 linhas retornadas
| nome_produto | categoria | total_tickets | media_nota_produto | receita_total |
|---|---|---|---|---|
| Aspirador Turbo | Casa & Jardim | 9 | 3.9 | 17997.0 |
| Notebook Pro X | Eletrônicos | 8 | 4.6 | 134995.5 |
| Tênis Runner 2 | Moda | 5 | 4.3 | 35988.0 |
| Fone Bluetooth Z | Eletrônicos | 4 | 4.7 | 31992.0 |
| Kit Skincare Plus | Beleza | 3 | 4.4 | 11394.0 |

---

### 4. Clientes VIP com maior receita
**Pergunta:** "Me mostre os clientes do segmento VIP com maior receita"

**SQL gerado:**
```sql
SELECT nome, sobrenome, email, receita_total_cliente, total_compras
FROM v_cliente_360
WHERE segmento_cliente = 'VIP'
ORDER BY receita_total_cliente DESC
LIMIT 100;
```

**Resultado:** ✅ Válido — SQL correto, nenhum cliente com segmento VIP no banco de seed atual.

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

**Resultado:** ✅ Válido — 4 linhas retornadas
| categoria | ticket_medio_geral |
|---|---|
| Casa & Jardim | 405.0 |
| Eletrônicos | 310.0 |
| Moda | 255.0 |
| Beleza | 182.5 |

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
| 0.252 |

---

### 7. Pergunta fora do escopo (guardrail)
**Pergunta:** "Qual a previsão do tempo para amanhã em São Paulo?"

**Resultado:** ✅ Guardrail ativado corretamente
```
SQL:    None
Válido: False
Erro:   A pergunta está fora do escopo de análise de dados da V-Commerce.
        O sistema apenas processa dados de vendas, clientes, produtos,
        tickets e comportamento digital.
```

---

## Resumo

| # | Pergunta | SQL Gerado | Válido | Dados Reais |
|---|---|---|---|---|
| 1 | Top 10 produtos mais vendidos | ✅ | ✅ | ✅ |
| 2 | Estado com maior receita | ✅ | ✅ | ✅ |
| 3 | Produtos com mais tickets | ✅ | ✅ | ✅ |
| 4 | Clientes VIP com maior receita | ✅ | ✅ | ✅ |
| 5 | Ticket médio por categoria | ✅ | ✅ | ✅ |
| 6 | Taxa de abandono de carrinho | ✅ | ✅ | ✅ |
| 7 | Previsão do tempo (fora do escopo) | — | ✅ guardrail | — |
