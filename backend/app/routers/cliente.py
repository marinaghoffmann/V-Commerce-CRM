from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cliente360 import ClienteBase360
from app.schemas.cliente360 import Cliente360Schema

router = APIRouter(prefix="/cliente", tags=["Cliente"])


@router.get("/", response_model=List[Cliente360Schema])
def list_cliente(skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    query = db.query(ClienteBase360).offset(skip)
    if limit > 0:
        query = query.limit(limit)
    return query.all()

@router.get("/{cliente_id}", response_model=Cliente360Schema)
def obter_perfil_cliente(cliente_id: str, db: Session = Depends(get_db)):
    
    cliente = db.query(ClienteBase360).filter(ClienteBase360.id_cliente == cliente_id).first()
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    lista_tickets = db.query(AnaliseTicket).filter(AnaliseTicket.id_cliente == cliente_id).all()
    lista_pedidos = db.query(PedidosPorCliente).filter(PedidosPorCliente.id_cliente == cliente_id).all()
    
    
    resultado = {
        **cliente.__dict__, 
        "pedidos": lista_pedidos,
        "tickets": lista_tickets
    }
    
    return resultado


@router.post("/", response_model=Cliente360Schema, status_code=status.HTTP_201_CREATED)
def create_cliente(payload: Cliente360Schema, db: Session = Depends(get_db)):
    obj = ClienteBase360(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{id_cliente}", response_model=Cliente360Schema)
def update_cliente(id_cliente: str, payload: Cliente360Schema, db: Session = Depends(get_db)):
    cliente = db.query(ClienteBase360).filter(ClienteBase360.id_cliente == id_cliente).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    data = payload.model_dump()
    for key, value in data.items():
        setattr(cliente, key, value)
    db.add(cliente)
    db.commit()
    db.refresh(cliente)
    return cliente


@router.delete("/{id_cliente}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cliente(id_cliente: str, db: Session = Depends(get_db)):
    cliente = db.query(ClienteBase360).filter(ClienteBase360.id_cliente == id_cliente).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    db.delete(cliente)
    db.commit()
    return None
