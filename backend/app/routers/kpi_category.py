from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.kpi_categoria import KpiPorCategoria
from app.schemas.kpi_categoria import KpiCategoriaSchema, KpiCategoriaPayloadSchema, KpiCategoriaPatchSchema
from uuid import UUID

router = APIRouter(prefix="/kpi-category", tags=["kpi-category"])


@router.get("", response_model=List[KpiCategoriaSchema], status_code=status.HTTP_200_OK)
def get_kpi_categories(
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
            (KpiPorCategoria.ano_venda * 100 + KpiPorCategoria.mes_venda) >= data_inicio
        )
        filters.append(
            (KpiPorCategoria.ano_venda * 100 + KpiPorCategoria.mes_venda) <= data_fim
        )
    else:
        if ano is not None:
            filters.append(KpiPorCategoria.ano_venda == ano)
        if mes is not None:
            filters.append(KpiPorCategoria.mes_venda == mes)

    offset = (page - 1) * limit

    kpi_categories = (
        db.query(KpiPorCategoria)
        .filter(*filters)
        .order_by(KpiPorCategoria.id)
        .offset(offset)
        .limit(limit)
        .all()
    )
    return kpi_categories

@router.get("/{id}", response_model=KpiCategoriaSchema, status_code=status.HTTP_200_OK)
def get_kpi_category(id: UUID, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorCategoria).filter(KpiPorCategoria.id == id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI category not found")
    
    return kpi


@router.post("", response_model=KpiCategoriaSchema, status_code=status.HTTP_201_CREATED)
def create_kpi_category(payload: KpiCategoriaPayloadSchema, db: Session = Depends(get_db)):
    kpi = KpiPorCategoria(**payload.model_dump())
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.put("/{id}", response_model=KpiCategoriaSchema, status_code=status.HTTP_200_OK)
def update_kpi_category(id: UUID, payload: KpiCategoriaPayloadSchema, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorCategoria).filter(KpiPorCategoria.id == id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI category not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    update_data.pop("id", None)
    for key, value in update_data.items():
        setattr(kpi, key, value)
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.delete("/{id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
def delete_kpi_category(id: UUID, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorCategoria).filter(KpiPorCategoria.id == id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI category not found")
    
    db.delete(kpi)
    db.commit()
    return None


@router.patch("/{id}", response_model=KpiCategoriaSchema, status_code=status.HTTP_200_OK)
def partially_update_kpi_category(id: UUID, payload: KpiCategoriaPatchSchema, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorCategoria).filter(KpiPorCategoria.id == id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI category not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(kpi, key, value)
    
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi