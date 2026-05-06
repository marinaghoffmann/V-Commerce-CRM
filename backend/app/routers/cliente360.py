from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db 
from app.models.cliente360 import ClienteBase360
from app.schemas.cliente360 import Cliente360Schema

from app.models.analiseTicket import AnaliseTicket 

router = APIRouter(prefix="/clientes", tags=["Perfil 360"])

@router.get("/{cliente_id}", response_model=Cliente360Schema)
def obter_perfil_cliente(cliente_id: str, db: Session = Depends(get_db)):
    
    # 1. Busca os dados consolidados do cliente
    cliente = db.query(ClienteBase360).filter(ClienteBase360.id_cliente == cliente_id).first()
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    # 2. Busca o histórico de tickets desse cliente
    lista_tickets = db.query(AnaliseTicket).filter(AnaliseTicket.id_cliente == cliente_id).all()
    
    
    lista_pedidos = [] 
    
    resultado = {
        **cliente.__dict__, 
        "pedidos": lista_pedidos,
        "tickets": lista_tickets
    }
    
    return resultado