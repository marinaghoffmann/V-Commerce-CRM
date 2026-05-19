from __future__ import annotations

from dataclasses import dataclass
import os
import re
from typing import Any, Optional

from database import execute_query, get_schema
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from sqlalchemy import inspect
from database import engine


MAX_SAMPLE_ROWS = 3
MAX_SAMPLE_COLUMNS = 5
MAX_TABLES = 3


class ContextTarget(BaseModel):
    table: str
    columns: list[str] = Field(default_factory=list)
    reason: Optional[str] = None


class ContextPlan(BaseModel):
    targets: list[ContextTarget] = Field(default_factory=list)


@dataclass(frozen=True)
class ContextSample:
    table: str
    columns: list[str]
    rows: list[dict[str, Any]]


@dataclass(frozen=True)
class TableProfile:
    table: str
    columns: list[str]
    searchable_text: str


google_api_key = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=google_api_key) if google_api_key else None


def _normalize_text(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9_\s]", " ", value)
    return re.sub(r"\s+", " ", value)


def _tokenize(value: str) -> set[str]:
    normalized = _normalize_text(value)
    return {token for token in normalized.split() if len(token) > 2}


def _table_profiles() -> list[TableProfile]:
    inspector = inspect(engine)
    profiles: list[TableProfile] = []

    for table_name in inspector.get_table_names():
        columns = [column["name"] for column in inspector.get_columns(table_name)]
        searchable_text = " ".join([table_name, *columns])
        profiles.append(
            TableProfile(
                table=table_name,
                columns=columns,
                searchable_text=searchable_text,
            )
        )

    return profiles


def _table_columns(table_name: str) -> list[str]:
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name)
    return [column["name"] for column in columns]


def _default_columns_for_table(table_name: str) -> list[str]:
    columns = _table_columns(table_name)
    preferred = [
        column
        for column in columns
        if not column.lower().startswith("id") and not column.lower().endswith("_id")
    ]
    selected = preferred[:MAX_SAMPLE_COLUMNS]
    return selected if selected else columns[:MAX_SAMPLE_COLUMNS]


def _build_schema_overview() -> str:
    return get_schema()


def _score_profile(question: str, profile: TableProfile) -> int:
    question_tokens = _tokenize(question)
    profile_tokens = _tokenize(profile.searchable_text)
    overlap = question_tokens & profile_tokens
    score = len(overlap)

    # Prefer profiles with columns that overlap semantically with the question.
    for column in profile.columns:
        column_tokens = _tokenize(column)
        if column_tokens & question_tokens:
            score += 2

    # Small bonus when the question references a common business noun present in the table name.
    table_tokens = _tokenize(profile.table)
    if table_tokens & question_tokens:
        score += 1

    return score


def _fallback_plan(question: str) -> ContextPlan:
    profiles = _table_profiles()
    ranked = sorted(
        ((profile, _score_profile(question, profile)) for profile in profiles),
        key=lambda item: item[1],
        reverse=True,
    )

    candidates: list[ContextTarget] = []
    for profile, score in ranked:
        if score <= 0:
            continue

        candidates.append(
            ContextTarget(
                table=profile.table,
                columns=_default_columns_for_table(profile.table),
            )
        )

    if not candidates and profiles:
        for profile in profiles[:MAX_TABLES]:
            candidates.append(
                ContextTarget(
                    table=profile.table,
                    columns=_default_columns_for_table(profile.table),
                )
            )

    return ContextPlan(targets=candidates[:MAX_TABLES])


def select_context_plan(question: str) -> ContextPlan:
    if not client:
        return _fallback_plan(question)

    schema_overview = _build_schema_overview()
    system_instruction = (
        "Você é um roteador semântico de contexto para um agente Text-to-SQL. "
        "Escolha até 3 tabelas realmente úteis para a pergunta e até 5 colunas por tabela. "
        "Considere o schema, o significado da pergunta e a necessidade de desambiguar valores. "
        "Não use regras fixas por termo; devolva apenas o plano mais informativo possível."
    )
    prompt = (
        f"Schema disponível:\n{schema_overview}\n\n"
        f"Pergunta do usuário:\n{question}\n\n"
        "Retorne um JSON com as tabelas e colunas que melhor ajudam a desambiguar a pergunta e orientar amostras de linhas."
    )

    response = client.models.generate_content(
        model="gemini-3.1-flash-lite-preview",
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=ContextPlan,
            temperature=0.1,
        ),
    )

    plan = response.parsed or ContextPlan()

    valid_tables = set(inspect(engine).get_table_names())
    normalized_targets: list[ContextTarget] = []
    for target in plan.targets:
        if target.table in valid_tables:
            columns = [column for column in target.columns if column in _table_columns(target.table)]
            if not columns:
                columns = _default_columns_for_table(target.table)
            normalized_targets.append(
                ContextTarget(table=target.table, columns=columns[:MAX_SAMPLE_COLUMNS], reason=target.reason)
            )

    if not normalized_targets:
        return _fallback_plan(question)

    return ContextPlan(targets=normalized_targets[:MAX_TABLES])


def _build_sample_sql(table: str, columns: list[str], limit: int = MAX_SAMPLE_ROWS) -> str:
    projection = ", ".join(columns) if columns else "*"
    return f"SELECT {projection} FROM {table} LIMIT {limit}"


def fetch_context_samples_from_plan(plan: ContextPlan) -> list[ContextSample]:
    samples: list[ContextSample] = []

    for target in plan.targets:
        columns = target.columns or _default_columns_for_table(target.table)
        sql = _build_sample_sql(target.table, columns)
        try:
            rows = [dict(row) for row in execute_query(sql)]
        except Exception:
            continue

        if rows:
            samples.append(ContextSample(table=target.table, columns=columns, rows=rows))

    return samples


def fetch_context_samples(question: str) -> list[ContextSample]:
    plan = select_context_plan(question)
    return fetch_context_samples_from_plan(plan)


def render_context_samples(samples: list[ContextSample]) -> str:
    if not samples:
        return ""

    blocks: list[str] = []
    for sample in samples:
        blocks.append(f"Tabela candidata: {sample.table}")
        if sample.columns:
            blocks.append(f"Colunas úteis: {', '.join(sample.columns)}")
        for index, row in enumerate(sample.rows, 1):
            blocks.append(f"Linha {index}: {row}")

    return "\n".join(blocks).strip()


def build_enriched_context(question: str) -> str:
    samples = fetch_context_samples(question)
    return render_context_samples(samples)


def build_context_payload(question: str) -> dict[str, Any]:
    plan = select_context_plan(question)
    samples = fetch_context_samples_from_plan(plan)
    return {
        "question": question,
        "targets": [target.model_dump() for target in plan.targets],
        "context": render_context_samples(samples),
        "samples": [
            {"table": sample.table, "columns": sample.columns, "rows": sample.rows}
            for sample in samples
        ],
    }
