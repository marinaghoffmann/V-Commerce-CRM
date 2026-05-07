from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db 
from app.models.cliente360 import ClienteBase360
from app.schemas.cliente360 import Cliente360Schema
from app.models.analiseTicket import AnaliseTicket
from app.models.pedidosPorCliente import PedidosPorCliente

router = APIRouter(prefix="/clientes", tags=["Perfil 360"])

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