from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.kpi import KpiPorStatus
from app.schemas.kpi import KpiStatusSchema

router = APIRouter(prefix="/kpi-status", tags=["kpi-status"])


@router.get("", response_model=List[KpiStatusSchema], status_code=status.HTTP_200_OK)
def get_kpi_status(db: Session = Depends(get_db)) -> List[KpiStatusSchema]:
    kpi_statuses = db.query(KpiPorStatus).all()
    return kpi_statuses

@router.get("/{status_id}", response_model=KpiStatusSchema, status_code=status.HTTP_200_OK)
def get_kpi_status_by_id(status_id: int, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorStatus).filter(KpiPorStatus.id == status_id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI status not found")
    
    return kpi

@router.post("", response_model=KpiStatusSchema, status_code=status.HTTP_201_CREATED)
def create_kpi_status(payload: KpiStatusSchema, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"id"})
    kpi = KpiPorStatus(**data)
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.put("/{status_id}", response_model=KpiStatusSchema, status_code=status.HTTP_200_OK)
def update_kpi_status(status_id: int, payload: KpiStatusSchema, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorStatus).filter(KpiPorStatus.id == status_id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI status not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    update_data.pop("id", None)
    for key, value in update_data.items():
        setattr(kpi, key, value)
    
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.delete("/{status_id}", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
def delete_kpi_status(status_id: int, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorStatus).filter(KpiPorStatus.id == status_id).first()
    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI status not found")
    db.delete(kpi)
    db.commit()
    return None


@router.patch("/{status_id}", response_model=KpiStatusSchema, status_code=status.HTTP_200_OK)
def partially_update_kpi_status(status_id: int, payload: KpiStatusSchema, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorStatus).filter(KpiPorStatus.id == status_id).first()
    
    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI status not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    update_data.pop("id", None)
    for key, value in update_data.items():
        setattr(kpi, key, value)
    
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi
