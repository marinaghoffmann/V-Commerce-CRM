from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.pedidos import PedidoClienteSchemaRead, PedidoClienteCreateSchema, PedidoClienteUpdateSchema, TotalPedidosComTicketsSchema
from app.models.pedido import Pedido as Pedidos
from app.models.cliente import Cliente
from app.models.produto import Produto
from app.models.ticket import Ticket
from sqlalchemy import func, extract

router = APIRouter(
    prefix="/pedidos_cliente",
    tags=["pedidos_cliente"],
)

@router.get("/", response_model=dict)
def get_pedido_cliente(
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0,
    nome_cliente: str | None = None,
    nome_produto: str | None = None,
    categoria_produto: str | None = None,
    status: str | None = None,
    metodo_pagamento: str | None = None,
):
    query = (
        db.query(
            Pedidos.id_pedido,
            Pedidos.status,
            Pedidos.valor_pedido,
            Pedidos.quantidade,
            Pedidos.metodo_pagamento,
            Pedidos.data_pedido,
            Produto.nome_produto,
            Produto.categoria,
            Pedidos.nome_completo,
        )
        .join(Produto, Pedidos.id_produto == Produto.id_produto)
        .join(Cliente, Pedidos.id_cliente == Cliente.id_cliente)
    )

    if nome_cliente:
        query = query.filter(Pedidos.nome_completo.ilike(f"%{nome_cliente}%"))
    if nome_produto:
        query = query.filter(Produto.nome_produto.ilike(f"%{nome_produto}%"))
    if categoria_produto:
        query = query.filter(Produto.categoria.ilike(f"%{categoria_produto}%"))
    if status:
        query = query.filter(Pedidos.status.ilike(f"%{status}%"))
    if metodo_pagamento:
        metodo_pagamento = metodo_pagamento if metodo_pagamento != "Cartão" else "cartao"
        query = query.filter(Pedidos.metodo_pagamento.ilike(f"%{metodo_pagamento}%"))

    total = query.count()

    rows = (
        query
        .order_by(Pedidos.data_pedido.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return {
        "total": total,
        "items": [
            PedidoClienteSchemaRead(
                id_pedido=row.id_pedido,
                nome_cliente=row.nome_completo,
                nome_produto=row.nome_produto,
                categoria_produto=row.categoria,
                status=row.status,
                valor_pedido=row.valor_pedido,
                quantidade=row.quantidade,
                metodo_pagamento=row.metodo_pagamento,
                data_pedido=row.data_pedido,
            )
            for row in rows
        ]
    }

@router.get("/total-com-tickets", status_code=status.HTTP_200_OK, response_model=TotalPedidosComTicketsSchema)
def get_total_pedidos_com_tickets(
    db: Session = Depends(get_db),
    ano: int | None = None,
    mes: int | None = None,
):
    hoje = date.today()
    ano = ano or hoje.year
    mes = mes or hoje.month

    filtros_pedido = [
        extract("year", Pedidos.data_pedido) == ano,
        extract("month", Pedidos.data_pedido) == mes,
    ]
    filtros_ticket = [
        extract("year", Ticket.data_abertura) == ano,
        extract("month", Ticket.data_abertura) == mes,
    ]

    total_pedidos = (
        db.query(func.count(Pedidos.id_pedido))
        .filter(*filtros_pedido)
        .scalar()
    )

    tickets_entrega = (
        db.query(func.count(Ticket.id_ticket))
        .join(Pedidos, Ticket.id_pedido == Pedidos.id_pedido)
        .filter(Ticket.tipo_problema == "entrega", *filtros_ticket)
        .scalar()
    )

    return {
        "ano": ano,
        "mes": mes,
        "total_pedidos": total_pedidos,
        "entrega_atrasada": tickets_entrega,
        "entrega_no_prazo": total_pedidos - tickets_entrega,
    }

@router.get("/{id_pedido}", response_model=PedidoClienteSchemaRead, status_code=status.HTTP_200_OK)
def get_pedido_by_id(id_pedido, db: Session = Depends(get_db)):
    if not db.query(Pedidos).filter(id_pedido == Pedidos.id_pedido).first():
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    query = (
        db.query(
        Pedidos.id_pedido,
        Pedidos.status,
        Pedidos.valor_pedido,
        Pedidos.quantidade,
        Pedidos.metodo_pagamento,
        Pedidos.data_pedido,
        Produto.nome_produto,
        Produto.categoria,
        Pedidos.nome_completo,
    )
    .join(Produto, Pedidos.id_produto == Produto.id_produto)
    .join(Cliente, Pedidos.id_cliente == Cliente.id_cliente)
    ).filter(id_pedido == Pedidos.id_pedido).first()
    
    return PedidoClienteSchemaRead(
            id_pedido=query.id_pedido,
            nome_cliente=query.nome_completo,
            nome_produto=query.nome_produto,
            categoria_produto=query.categoria,
            status=query.status,
            valor_pedido=query.valor_pedido,
            quantidade=query.quantidade,
            metodo_pagamento=query.metodo_pagamento,
            data_pedido=query.data_pedido,
        )


@router.post("/", response_model=PedidoClienteSchemaRead, status_code=status.HTTP_201_CREATED)
def create_pedido_cliente(pedido: PedidoClienteCreateSchema, db: Session = Depends(get_db)):
    pedido_existente = db.query(Pedidos).filter(Pedidos.id_pedido == pedido.id_pedido).first()
    cliente = db.query(Cliente).filter(Cliente.id_cliente == pedido.id_cliente).first()
    produto = db.query(Produto).filter(Produto.id_produto == pedido.id_produto).first()

    if pedido_existente:
        raise HTTPException(status_code=400, detail="Pedido com este ID já existe")

    if not cliente:
        raise HTTPException(status_code=404 , detail="Pedido não pode ser cadastrado para um cliente não existente no sistema")
    
    if not produto:
        raise HTTPException(status_code=404, detail="Pedido não pode ser cadastrado para um produto não existente no sistema")

    db_pedido = Pedidos(**pedido.model_dump())
    db.add(db_pedido)
    db.commit()
    db.refresh(db_pedido)
    return db_pedido

@router.patch("/{id_pedido}", response_model=PedidoClienteSchemaRead)
def update_pedido_cliente(id_pedido: str, pedido: PedidoClienteUpdateSchema, db: Session = Depends(get_db)):
    db_pedido = db.query(Pedidos).filter(Pedidos.id_pedido == id_pedido).first()

    if not db_pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    cliente = db.query(Cliente).filter(Cliente.id_cliente == db_pedido.id_cliente).first()
    produto = db.query(Produto).filter(Produto.id_produto == db_pedido.id_produto).first()


    if not cliente:
        raise HTTPException(status_code=404 , detail="Pedido não pode ser cadastrado para um cliente não existente no sistema")
    
    if not produto:
        raise HTTPException(status_code=404, detail="Pedido não pode ser cadastrado para um produto não existente no sistema")

    for key, value in pedido.model_dump(exclude_unset=True).items():
        setattr(db_pedido, key, value)

    db.commit()
    db.refresh(db_pedido)
    return db_pedido

@router.delete("/{id_pedido}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pedido_cliente(id_pedido: str, db: Session = Depends(get_db)):
    db_pedido = db.query(Pedidos).filter(Pedidos.id_pedido == id_pedido).first()
    if not db_pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    db.delete(db_pedido)
    db.commit()