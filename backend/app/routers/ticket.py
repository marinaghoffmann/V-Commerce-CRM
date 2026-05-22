from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.ticket import Ticket
from app.models.cliente import Cliente
from app.models.pedido import Pedido
from app.schemas.ticket import TicketCreateSchema, TicketSchemaRead, TicketUpdateSchema

router = APIRouter(prefix="/ticket", tags=["Ticket"])


def _apply_filters(query, status: Optional[List[str]], search: Optional[str], categoria: Optional[List[str]]):
    if status:
        query = query.filter(Ticket.status_ticket.in_(status))
    if search:
        query = query.filter(
            Ticket.nome_cliente.ilike(f"%{search}%")
            | Ticket.tipo_problema.ilike(f"%{search}%")
        )
    if categoria:
        # Filtra pelo tipo de problema do ticket (reembolso, entrega, produto, pagamento)
        query = query.filter(Ticket.tipo_problema.in_(categoria))
    return query



@router.get("/kpis/resumo")
def get_kpis(
    db: Session = Depends(get_db),
    mes: int | None = None,
    ano: int | None = None,
):
    if mes and ano:
        m = str(mes).zfill(2)
        a = str(ano)
    else:
        ultima_data = db.query(func.max(Ticket.data_abertura)).scalar()
        if ultima_data:
            m = ultima_data[5:7]
            a = ultima_data[:4]
        else:
            m, a = "01", "1970"

    filtro_periodo = [
        func.strftime("%m", Ticket.data_abertura) == m,
        func.strftime("%Y", Ticket.data_abertura) == a,
    ]

    rows = (
        db.query(Ticket.status_ticket, func.count(Ticket.id_ticket))
        .filter(*filtro_periodo)
        .group_by(Ticket.status_ticket)
        .all()
    )
    kpis = {s: c for s, c in rows}

    fechados_mes = (
        db.query(func.count(Ticket.id_ticket))
        .filter(
            Ticket.status_ticket == "fechado",
            func.strftime("%m", Ticket.data_resolucao) == m,
            func.strftime("%Y", Ticket.data_resolucao) == a,
        )
        .scalar()
    )

    kpis["fechado_mes"] = fechados_mes or 0
    kpis["fechado_mes_ref"] = f"{m}/{a}"
    return kpis



@router.get("/count")
def count_tickets(
    db: Session = Depends(get_db),
    status: Optional[List[str]] = Query(default=None, alias="status[]"),
    search: str | None = None,
    categoria: Optional[List[str]] = Query(default=None, alias="categoria[]"),
):
    query = db.query(func.count(Ticket.id_ticket))
    query = _apply_filters(query, status, search, categoria)
    return {"total": query.scalar()}


@router.get("/", response_model=List[TicketSchemaRead])
def list_ticket(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    status: Optional[List[str]] = Query(default=None, alias="status[]"),
    search: str | None = None,
    categoria: Optional[List[str]] = Query(default=None, alias="categoria[]"),
    id_cliente: str | None = None,
):
    query = db.query(Ticket)

    if id_cliente:
        query = query.filter(Ticket.id_cliente.ilike(f"%{id_cliente}%"))

    query = _apply_filters(query, status, search, categoria)

    offset = (page - 1) * limit
    return query.order_by(Ticket.data_abertura.desc()).offset(offset).limit(limit).all()


@router.get("/{id_ticket}", response_model=TicketSchemaRead)
def get_ticket(id_ticket: str, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id_ticket == id_ticket).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket não encontrado")
    return ticket


@router.post("/", response_model=TicketSchemaRead, status_code=status.HTTP_201_CREATED)
def create_ticket(payload: TicketCreateSchema, db: Session = Depends(get_db)):
    if db.query(Ticket).filter(Ticket.id_ticket == payload.id_ticket).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ticket com este ID já existe")
    if not db.query(Cliente).filter(Cliente.id_cliente == payload.id_cliente).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    if not db.query(Pedido).filter(Pedido.id_pedido == payload.id_pedido).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    obj = Ticket(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.patch("/{id_ticket}", response_model=TicketSchemaRead)
def update_ticket(id_ticket: str, payload: TicketUpdateSchema, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id_ticket == id_ticket).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket não encontrado")
    if not db.query(Cliente).filter(Cliente.id_cliente == ticket.id_cliente).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    if not db.query(Pedido).filter(Pedido.id_pedido == ticket.id_pedido).first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pedido não encontrado")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(ticket, key, value)

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