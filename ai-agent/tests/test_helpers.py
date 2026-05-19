import time
import re
import pytest

from agent import call_agent
from utils import (
    run_sql as _run_sql,
    extract_sql as _extract_sql,
    contains_number as _contains_number,
    is_refused as _is_refused,
    is_destructive_sql as _is_destructive_sql,
)

# Delay entre testes para não estourar rate-limit da API
INTER_TEST_DELAY_SEC = 3.0
# Timeout máximo esperado do agente (segundos)
AGENT_TIMEOUT_SEC = 30


@pytest.fixture(autouse=True)
def rate_limit_delay():
    """Aguarda entre cada teste para respeitar rate limits da API."""
    yield
    time.sleep(INTER_TEST_DELAY_SEC)


__all__ = [
    "call_agent",
    "_run_sql",
    "_extract_sql",
    "_contains_number",
    "_is_refused",
    "_is_destructive_sql",
]
