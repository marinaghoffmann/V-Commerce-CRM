from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteSchema
from app.models.ticket import Ticket
from app.models.pedido import Pedido

router = APIRouter(prefix="/clientes", tags=["Cliente"])

@router.get("/", response_model=list[ClienteSchema])
def listar_clientes(
    busca: str = None,
    status: str = None,
    categoria: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(Cliente)

    if busca:
        query = query.filter(
            (Cliente.nome.ilike(f"%{busca}%")) |
            (Cliente.sobrenome.ilike(f"%{busca}%")) |
            (Cliente.email.ilike(f"%{busca}%"))
        )

    if status:
        query = query.filter(Cliente.segmento_cliente == status)

    if categoria:
        query = query.filter(Cliente.categoria_preferida == categoria)

    offset = (page - 1) * limit
    return query.order_by(Cliente.id_cliente).offset(offset).limit(limit).all()

@router.get("/{cliente_id}", response_model=ClienteSchema)
def obter_perfil_cliente(cliente_id: str, db: Session = Depends(get_db)):
    
    cliente = db.query(Cliente).filter(Cliente.id_cliente == cliente_id).first()
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    list_tickets = db.query(Ticket).filter(Ticket.id_cliente == cliente_id).all()
    list_pedidos = db.query(Pedido).filter(Pedido.id_cliente == cliente_id).all()
    
    resultado = {
        **cliente.__dict__, 
        "pedidos": list_pedidos,
        "tickets": list_tickets
    }
    
    return resultado

@router.post("/", response_model=ClienteSchema, status_code=status.HTTP_201_CREATED)
def create_cliente(payload: ClienteSchema, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.email == payload.email).first()
    if cliente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado")

    obj = Cliente(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/{id_cliente}", response_model=ClienteSchema)
def update_cliente(id_cliente: str, payload: ClienteSchema, db: Session = Depends(get_db)):
    cliente = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
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
    cliente = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if not cliente:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado")
    db.delete(cliente)
    db.commit()
    return None
