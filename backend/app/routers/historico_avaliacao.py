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
) -> AvaliacoesGrafico:
    hoje = date.today()
    ano = ano or hoje.year
    mes = mes or hoje.month

    filtros = [
        extract("year", Avaliacoes.data_avaliacao) == ano,
        extract("month", Avaliacoes.data_avaliacao) == mes,
    ]

    row = (
        db.query(
            func.count(case((Avaliacoes.nota_produto.between(1, 2), 1))).label("ruim"),
            func.count(case((Avaliacoes.nota_produto == 3, 1))).label("neutra"),
            func.count(case((Avaliacoes.nota_produto.between(4, 5), 1))).label("positiva"),
        )
        .filter(*filtros)
        .first()
    )

    return AvaliacoesGrafico(
        ano=ano,
        mes=mes,
        ruim=row.ruim if row else 0,
        neutra=row.neutra if row else 0,
        positiva=row.positiva if row else 0,
    )