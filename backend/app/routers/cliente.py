from typing import List
from uuid import uuid4
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteSchema, ClienteCreateSchema, ClienteUpdateSchema
from app.models.ticket import Ticket
from app.models.pedido import Pedido
from app.models.comportamento_digital import ComportamentoDigital

CLIENTE_ORDER_FIELDS = {
    "receita_total_cliente": Cliente.receita_total_cliente,
    "total_compras": Cliente.total_compras,
    "ticket_medio": Cliente.ticket_medio,
    "data_ultima_compra": Cliente.data_ultima_compra,
}

router = APIRouter(prefix="/clientes", tags=["Cliente"])

@router.get("/count")
def contar_clientes(
    busca: str = None,
    status: list[str] | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(func.count(Cliente.id_cliente))

    if busca:
        query = query.filter(
            (Cliente.nome.ilike(f"%{busca}%")) |
            (Cliente.sobrenome.ilike(f"%{busca}%")) |
            (Cliente.email.ilike(f"%{busca}%")) |
            ((Cliente.nome + " " + Cliente.sobrenome).ilike(f"%{busca}%"))
        )

    if status:
        query = query.filter(Cliente.segmento_cliente.in_(status))

    return {"total": query.scalar()}

@router.get("/", response_model=list[ClienteSchema])
def listar_clientes(
    busca: str = None,
    status: list[str] | None = Query(default=None),
    categoria: str = None,
    ordem: str = None,
    page: int = 1,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    query = db.query(Cliente)

    if busca:
        query = query.filter(
            (Cliente.nome.ilike(f"%{busca}%")) |
            (Cliente.sobrenome.ilike(f"%{busca}%")) |
            (Cliente.email.ilike(f"%{busca}%")) |
            ((Cliente.nome + " " + Cliente.sobrenome).ilike(f"%{busca}%"))
        )

    if status:
        query = query.filter(Cliente.segmento_cliente.in_(status))

    if categoria:
        query = query.filter(Cliente.categoria_preferida == categoria)

    if ordem:
        coluna, direcao = ordem.split(":", 1) if ":" in ordem else (ordem, "desc")
        campo_ordenacao = CLIENTE_ORDER_FIELDS.get(coluna)
        if campo_ordenacao is not None:
            query = query.order_by(
                campo_ordenacao.desc() if direcao == "desc" else campo_ordenacao.asc(),
                Cliente.id_cliente,
            )
        else:
            query = query.order_by(Cliente.id_cliente)
    else:
        query = query.order_by(Cliente.id_cliente)

    offset = (page - 1) * limit
    return query.offset(offset).limit(limit).all()

@router.get("/{cliente_id}", response_model=ClienteSchema)
def obter_perfil_cliente(cliente_id: str, db: Session = Depends(get_db)):
    
    cliente = db.query(Cliente).filter(Cliente.id_cliente == cliente_id).first()
    
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    
    list_tickets = db.query(Ticket).filter(Ticket.id_cliente == cliente_id).all()
    list_pedidos = db.query(Pedido).filter(Pedido.id_cliente == cliente_id).all()
    comp_digital = db.query(ComportamentoDigital).filter(ComportamentoDigital.id_cliente == cliente_id).first()
    
    resultado = {
        **cliente.__dict__, 
        "pedidos": list_pedidos,
        "tickets": list_tickets,
        "total_sessoes": comp_digital.total_sessoes if comp_digital else 0,
        "taxa_conversao_compra": comp_digital.taxa_conversao_click if comp_digital else 0.0,
        "taxa_abandono_carrinho": comp_digital.taxa_abandono_carrinho if comp_digital else 0.0,
        "canal_predominante": comp_digital.canal_predominante if comp_digital else None
    }
    
    return resultado

@router.post("/", response_model=ClienteSchema, status_code=status.HTTP_201_CREATED)
def create_cliente(payload: ClienteCreateSchema, db: Session = Depends(get_db)):
    """
    Create a new client in the system.
    
    Generates a unique UUID for id_cliente, sets data_cadastro to today,
    validates all input fields (name capitalization, email format, phone format),
    and checks for email uniqueness.
    
    Args:
        payload: ClienteCreateSchema with client data
        db: Database session
    
    Returns:
        ClienteSchema: Created client with auto-generated id_cliente
    
    Raises:
        HTTPException 409: Email already registered
        HTTPException 422: Invalid data format (handled by Pydantic)
    """
    # Check if email already exists
    cliente_existente = db.query(Cliente).filter(Cliente.email == payload.email).first()
    if cliente_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email já cadastrado"
        )
    
    # Generate UUID and set registration date
    id_cliente = uuid4().hex
    data_cadastro = datetime.now().date()
    
    # Create new client with formatted data from schema validators
    novo_cliente = Cliente(
        id_cliente=id_cliente,
        data_cadastro=data_cadastro,
        segmento_cliente="novo",
        **payload.model_dump()
    )
    db.add(novo_cliente)
    db.commit()
    db.refresh(novo_cliente)
    return novo_cliente

@router.put("/{id_cliente}", response_model=ClienteSchema)
def update_cliente(id_cliente: str, payload: ClienteUpdateSchema, db: Session = Depends(get_db)):
    """
    Update an existing client's information.
    
    Validates and formats all provided fields (name, email, phone, date).
    Prevents modification of immutable fields (id_cliente, data_cadastro).
    Checks email uniqueness only if email is being updated.
    
    Args:
        id_cliente: The client's unique identifier
        payload: ClienteUpdateSchema with fields to update
        db: Database session
    
    Returns:
        ClienteSchema: Updated client
    
    Raises:
        HTTPException 404: Client not found
        HTTPException 400: Attempting to modify id_cliente or data_cadastro
        HTTPException 409: New email already registered to another client
        HTTPException 422: Invalid data format (handled by Pydantic)
    """
    # Retrieve existing client
    cliente = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if not cliente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Prevent modification of immutable fields
    dados_atualizacao = payload.model_dump(exclude_unset=True)
    if "id_cliente" in dados_atualizacao:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="id_cliente cannot be modified"
        )
    if "data_cadastro" in dados_atualizacao:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="data_cadastro cannot be modified"
        )
    
    # Check email uniqueness if email is being updated
    if "email" in dados_atualizacao and dados_atualizacao["email"] != cliente.email:
        email_existente = db.query(Cliente).filter(
            Cliente.email == dados_atualizacao["email"],
            Cliente.id_cliente != id_cliente
        ).first()
        if email_existente:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email já cadastrado"
            )
    
    # Update only provided fields with formatted values from schema validators
    for chave, valor in dados_atualizacao.items():
        if valor is not None:
            setattr(cliente, chave, valor)
    
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