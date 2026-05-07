from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cliente360 import ClienteBase360
from app.schemas.cliente360 import Cliente360Schema

router = APIRouter(prefix="/cliente", tags=["Cliente"])


@router.get("/", response_model=list[Cliente360Schema])
def listar_clientes(
    busca: str = None,
    status: str = None,
    categoria: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(ClienteBase360)

    if busca:
        query = query.filter(
            (ClienteBase360.nome.ilike(f"%{busca}%")) |
            (ClienteBase360.sobrenome.ilike(f"%{busca}%")) |
            (ClienteBase360.email.ilike(f"%{busca}%"))
        )

    if status:
        query = query.filter(ClienteBase360.segmento_cliente == status)

    if categoria:
        query = query.filter(ClienteBase360.categoria_preferida == categoria)

    offset = (page - 1) * limit
    return query.order_by(ClienteBase360.id_cliente).offset(offset).limit(limit).all()

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
