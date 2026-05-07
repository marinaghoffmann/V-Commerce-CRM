from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.kpi_categoria import KpiPorCategoria
from app.schemas.kpi_categoria import KpiCategoriaSchema, KpiCategoriaPayloadSchema, KpiCategoriaPatchSchema
from uuid import UUID

router = APIRouter(prefix="/kpi-category", tags=["kpi-category"])


@router.get("", response_model=List[KpiCategoriaSchema], status_code=status.HTTP_200_OK)
def get_kpi_categories(limit: int = 30, offset: int = 0, db: Session = Depends(get_db)):
    kpi_categories = db.query(KpiPorCategoria).limit(limit).offset(offset).all()
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