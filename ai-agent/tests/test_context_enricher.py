import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(__file__))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

import context_enricher
from context_enricher import (
    ContextPlan,
    ContextSample,
    ContextTarget,
    build_context_payload,
    render_context_samples,
)


def test_render_context_samples_formats_rows():
    sample = ContextSample(
        table="v_cliente_360",
        columns=["estado", "cidade"],
        rows=[{"estado": "BA", "cidade": "Salvador"}],
    )

    rendered = render_context_samples([sample])

    assert "Tabela candidata: v_cliente_360" in rendered
    assert "Colunas úteis: estado, cidade" in rendered
    assert "BA" in rendered
    assert "Salvador" in rendered


def test_build_context_payload_uses_selected_plan(monkeypatch):
    plan = ContextPlan(
        targets=[
            ContextTarget(
                table="v_cliente_360",
                columns=["estado", "cidade"],
                reason="clientes e localização",
            )
        ]
    )

    monkeypatch.setattr(context_enricher, "select_context_plan", lambda question: plan)
    monkeypatch.setattr(
        context_enricher,
        "execute_query",
        lambda sql: [{"estado": "PE", "cidade": "Recife"}],
    )

    payload = build_context_payload("Quais clientes do nordeste compraram mais?")

    assert payload["question"] == "Quais clientes do nordeste compraram mais?"
    assert payload["targets"][0]["table"] == "v_cliente_360"
    assert "Tabela candidata: v_cliente_360" in payload["context"]
    assert "PE" in payload["context"]

