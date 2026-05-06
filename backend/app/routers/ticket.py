from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.analiseTicket import AnaliseTicket
from app.schemas.analiseTicket import AnaliseTicketSchema

router = APIRouter(prefix="/ticket", tags=["Ticket"])


@router.get("/", response_model=List[AnaliseTicketSchema])
def list_ticket(skip: int = 0, limit: int = 0, db: Session = Depends(get_db)):
    query = db.query(AnaliseTicket).offset(skip)
    if limit > 0:
        query = query.limit(limit)
    return query.all()


@router.get("/{id_ticket}", response_model=AnaliseTicketSchema)
def get_ticket(id_ticket: str, db: Session = Depends(get_db)):
    ticket = db.query(AnaliseTicket).filter(AnaliseTicket.id_ticket == id_ticket).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket não encontrado")
    return ticket


@router.post("/", response_model=AnaliseTicketSchema, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: AnaliseTicketSchema, db: Session = Depends(get_db)):
    obj = AnaliseTicket(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{id_ticket}", response_model=AnaliseTicketSchema)
def update_ticket(id_ticket: str, payload: AnaliseTicketSchema, db: Session = Depends(get_db)):
    ticket = db.query(AnaliseTicket).filter(AnaliseTicket.id_ticket == id_ticket).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket não encontrado")
    data = payload.model_dump()
    for key, value in data.items():
        setattr(ticket, key, value)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.delete("/{id_ticket}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(id_ticket: str, db: Session = Depends(get_db)):
    ticket = db.query(AnaliseTicket).filter(AnaliseTicket.id_ticket == id_ticket).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket não encontrado")
    db.delete(ticket)
    db.commit()
    return None
