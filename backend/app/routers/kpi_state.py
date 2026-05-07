from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.kpi import KpiPorEstado
from app.schemas.kpi import KpiEstadoSchema

router = APIRouter(prefix="/kpi-state", tags=["kpi-state"])


@router.get("", response_model=List[KpiEstadoSchema], status_code=status.HTTP_200_OK)
def get_kpi_states(limit: int = 30, db: Session = Depends(get_db)):
    kpi_states = db.query(KpiPorEstado).limit(limit).all()
    return kpi_states


@router.get("/{state_id}", response_model=KpiEstadoSchema, status_code=status.HTTP_200_OK)
def get_kpi_state(state_id: int, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorEstado).filter(KpiPorEstado.id == state_id).first()
    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI state not found")
    return kpi


@router.post("", response_model=KpiEstadoSchema, status_code=status.HTTP_201_CREATED)
def create_kpi_state(payload: KpiEstadoSchema, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude={"id"})
    kpi = KpiPorEstado(**data)
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.put("/{state_id}", response_model=KpiEstadoSchema, status_code=status.HTTP_200_OK)
def update_kpi_state(state_id: int, payload: KpiEstadoSchema, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorEstado).filter(KpiPorEstado.id == state_id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI state not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    update_data.pop("id", None)
    for key, value in update_data.items():
        setattr(kpi, key, value)
    
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.delete("/{state_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_kpi_state(state_id: int, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorEstado).filter(KpiPorEstado.id == state_id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI state not found")
    
    db.delete(kpi)
    db.commit()
    return None


@router.patch("/{state_id}", response_model=KpiEstadoSchema, status_code=status.HTTP_200_OK)
def partially_update_kpi_state(state_id: int, payload: KpiEstadoSchema, db: Session = Depends(get_db)):
    kpi = db.query(KpiPorEstado).filter(KpiPorEstado.id == state_id).first()

    if not kpi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="KPI state not found")
    
    update_data = payload.model_dump(exclude_unset=True)
    update_data.pop("id", None)
    for key, value in update_data.items():
        setattr(kpi, key, value)

    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi
