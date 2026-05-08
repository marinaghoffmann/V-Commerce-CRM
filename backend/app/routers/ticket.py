from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ticket import Ticket
from app.schemas.ticket import TicketSchema

router = APIRouter(prefix="/ticket", tags=["Ticket"])


@router.get("/", response_model=List[TicketSchema])
def list_ticket(skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    query = db.query(Ticket).offset(skip)
    if limit > 0:
        query = query.limit(limit)
    return query.all()


@router.get("/{id_ticket}", response_model=TicketSchema)
def get_ticket(id_ticket: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id_ticket == id_ticket).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket não encontrado")
    return ticket


@router.post("/", response_model=TicketSchema, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketSchema, db: Session = Depends(get_db)):
    obj = Ticket(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{id_ticket}", response_model=TicketSchema)
def update_ticket(id_ticket: str, payload: TicketSchema, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id_ticket == id_ticket).first()
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
    ticket = db.query(Ticket).filter(Ticket.id_ticket == id_ticket).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket não encontrado")
    db.delete(ticket)
    db.commit()
    return None
