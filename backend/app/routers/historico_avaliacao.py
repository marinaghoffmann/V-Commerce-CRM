from datetime import date
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, case, extract, func
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.historico_avaliacoes import AvaliacaoBase, AvaliacaoCreate, AvaliacaoRead, AvaliacaoUpdate, AvaliacoesGrafico
from app.models.historico_avaliacoes import HistoricoAvaliacoes as Avaliacoes
from app.models.pedido import Pedido as Pedidos
from app.models.cliente import Cliente

router = APIRouter(
    prefix="/avaliacoes",
    tags=["avaliacoes"]
)

@router.get("/", response_model=list[AvaliacaoRead])
def get_avaliacoes(
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0,
):
    query = (
        db.query(Avaliacoes)
        .offset(offset)
        .limit(limit)
    )

    return query.all()

@router.get("", response_model=AvaliacoesGrafico, status_code=status.HTTP_200_OK)
def get_avaliacoes_grafico(
    db: Session = Depends(get_db),
    ano: int | None = None,
    mes: int | None = None,
    ano_inicio: int | None = None,
    mes_inicio: int | None = None,
    ano_fim: int | None = None,
    mes_fim: int | None = None,
) -> AvaliacoesGrafico:
    hoje = date.today()

    filtros = []

    if ano_inicio and mes_inicio and ano_fim and mes_fim:
        data_inicio = date(ano_inicio, mes_inicio, 1)
        from calendar import monthrange
        ultimo_dia = monthrange(ano_fim, mes_fim)[1]
        data_fim_date = date(ano_fim, mes_fim, ultimo_dia)
        filtros.append(Avaliacoes.data_avaliacao >= data_inicio)
        filtros.append(Avaliacoes.data_avaliacao <= data_fim_date)
        ano_ref = ano_fim
        mes_ref = mes_fim
    else:
        ano_ref = ano or hoje.year
        mes_ref = mes or hoje.month
        filtros = [
            extract("year",  Avaliacoes.data_avaliacao) == ano_ref,
            extract("month", Avaliacoes.data_avaliacao) == mes_ref,
        ]

    row = (
        db.query(
            func.count(case((Avaliacoes.nota_produto.between(1, 2), 1))).label("ruim"),
            func.count(case((Avaliacoes.nota_produto == 3,          1))).label("neutra"),
            func.count(case((Avaliacoes.nota_produto.between(4, 5), 1))).label("positiva"),
        )
        .filter(*filtros)
        .first()
    )

    return AvaliacoesGrafico(
        ano=ano_ref,
        mes=mes_ref,
        ruim=row.ruim       if row else 0,
        neutra=row.neutra   if row else 0,
        positiva=row.positiva if row else 0,
    )