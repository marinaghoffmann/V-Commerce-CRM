from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.kpi import KpiPorStatus
from app.schemas.kpi import KpiStatusSchema, KpiStatusPayloadSchema, KpiStatusPatchSchema
from uuid import UUID

router = APIRouter(prefix="/kpi-status", tags=["kpi-status"])


@router.get("", response_model=List[KpiStatusSchema], status_code=status.HTTP_200_OK)
def get_kpi_status(limit: int = 30, offset: int = 0, db: Session = Depends(get_db)) -> List[KpiStatusSchema]:
    kpi_statuses = db.query(KpiPorStatus).limit(limit).offset(offset).all()
    return kpi_statuses

@router.get("/{id}", response_model=KpiStatusSchema, status_code=status.HTTP_200_OK)
def get_kpi_status_by_id(id: UUID, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorStatus).filter(KpiPorStatus.id == id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI status not found")
    
    return kpi

@router.post("", response_model=KpiStatusSchema, status_code=status.HTTP_201_CREATED)
def create_kpi_status(payload: KpiStatusPayloadSchema, db: Session = Depends(get_db)):
    kpi = KpiPorStatus(**payload.model_dump())
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.put("/{id}", response_model=KpiStatusSchema, status_code=status.HTTP_200_OK)
def update_kpi_status(id: UUID, payload: KpiStatusPayloadSchema, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorStatus).filter(KpiPorStatus.id == id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI status not found")
    
    update_data = payload.model_dump()
    for key, value in update_data.items():
        setattr(kpi, key, value)
    
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.delete("/{id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
def delete_kpi_status(id: UUID, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorStatus).filter(KpiPorStatus.id == id).first()
    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI status not found")
    db.delete(kpi)
    db.commit()
    return None


@router.patch("/{id}", response_model=KpiStatusSchema, status_code=status.HTTP_200_OK)
def partially_update_kpi_status(id: UUID, payload: KpiStatusPatchSchema, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorStatus).filter(KpiPorStatus.id == id).first()
    
    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI status not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(kpi, key, value)
    
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi
