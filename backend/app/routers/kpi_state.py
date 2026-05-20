from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.kpi_estado import KpiPorEstado
from app.schemas.kpi_estado import KpiEstadoSchema, KpiEstadoPayloadSchema, KpiEstadoPatchSchema
from uuid import UUID

router = APIRouter(prefix="/kpi-state", tags=["kpi-state"])


@router.get("", response_model=List[KpiEstadoSchema], status_code=status.HTTP_200_OK)
def get_kpi_states(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    ano: int | None = None,
    mes: int | None = None,
    ano_inicio: int | None = None,
    mes_inicio: int | None = None,
    ano_fim: int | None = None,
    mes_fim: int | None = None,
):
    filters = []

    if ano_inicio and mes_inicio and ano_fim and mes_fim:
        data_inicio = ano_inicio * 100 + mes_inicio
        data_fim    = ano_fim   * 100 + mes_fim
        filters.append(
            (KpiPorEstado.ano_venda * 100 + KpiPorEstado.mes_venda) >= data_inicio
        )
        filters.append(
            (KpiPorEstado.ano_venda * 100 + KpiPorEstado.mes_venda) <= data_fim
        )
    else:
        if ano is not None:
            filters.append(KpiPorEstado.ano_venda == ano)
        if mes is not None:
            filters.append(KpiPorEstado.mes_venda == mes)

    offset = (page - 1) * limit

    kpi_states = (
        db.query(KpiPorEstado)
        .filter(*filters)
        .order_by(KpiPorEstado.id)
        .offset(offset)
        .limit(limit)
        .all()
    )
    return kpi_states


@router.get("/{id}", response_model=KpiEstadoSchema, status_code=status.HTTP_200_OK)
def get_kpi_state(id: UUID, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorEstado).filter(KpiPorEstado.id == id).first()
    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI state not found")
    return kpi


@router.post("", response_model=KpiEstadoSchema, status_code=status.HTTP_201_CREATED)
def create_kpi_state(payload: KpiEstadoPayloadSchema, db: Session = Depends(get_db)):
    kpi = KpiPorEstado(**payload.model_dump())
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.put("/{id}", response_model=KpiEstadoSchema, status_code=status.HTTP_200_OK)
def update_kpi_state(id: UUID, payload: KpiEstadoPayloadSchema, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorEstado).filter(KpiPorEstado.id == id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI state not found")
    
    update_data = payload.model_dump()
    for key, value in update_data.items():
        setattr(kpi, key, value)
    
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.delete("/{id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
def delete_kpi_state(id: UUID, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorEstado).filter(KpiPorEstado.id == id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI state not found")
    
    db.delete(kpi)
    db.commit()
    return None


@router.patch("/{id}", response_model=KpiEstadoSchema, status_code=status.HTTP_200_OK)
def partially_update_kpi_state(id: UUID, payload: KpiEstadoPatchSchema, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorEstado).filter(KpiPorEstado.id == id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI state not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(kpi, key, value)

    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi
