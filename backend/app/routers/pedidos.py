from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.pedidos import PedidoClienteSchemaRead, PedidoClienteCreateSchema, PedidoClienteUpdateSchema;
from app.models.pedido import Pedido as Pedidos
from app.models.cliente import Cliente
from app.models.produto import Produto

router = APIRouter(
    prefix="/pedidos_cliente",
    tags=["pedidos_cliente"],
)

@router.get("/", response_model=list[PedidoClienteSchemaRead])
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
            Cliente.nome,
            Cliente.sobrenome,
            Cliente.categoria_preferida,
        )
        .join(
            Cliente,
            Pedidos.id_cliente == Cliente.id_cliente,
        )
        .join(
            Produto,
            Pedidos.id_produto == Produto.id_produto,
        )
    )

    filters = []

    if nome_produto:
        filters.append(
            Produto.nome_produto.ilike(f"%{nome_produto}%")
        )

    if categoria_produto:
        filters.append(
            Cliente.categoria_preferida.ilike(
                f"%{categoria_produto}%"
            )
        )

    if status:
        filters.append(
            Pedidos.status.ilike(f"%{status}%")
        )

    if metodo_pagamento:
        filters.append(
            Pedidos.metodo_pagamento.ilike(
                f"%{metodo_pagamento}%"
            )
        )

    if nome_cliente:
        filters.append(
            or_(
                Cliente.nome.ilike(f"%{nome_cliente}%"),
                Cliente.sobrenome.ilike(f"%{nome_cliente}%"),
            )
        )

    query = (
        query
        .filter(*filters)
        .order_by(Pedidos.data_pedido.desc())
        .offset(offset)
        .limit(limit)
    )

    rows = query.all()

    return [
        PedidoClienteSchemaRead(
            id_pedido=row.id_pedido,
            nome_cliente=f"{row.nome} {row.sobrenome}",
            nome_produto=row.nome_produto,
            categoria_produto=row.categoria_preferida,
            status=row.status,
            valor_pedido=row.valor_pedido,
            quantidade=row.quantidade,
            metodo_pagamento=row.metodo_pagamento,
            data_pedido=row.data_pedido,
        )
        for row in rows
    ]

@router.post("/", response_model=PedidoClienteSchemaRead, status_code=status.HTTP_201_CREATED)
def create_pedido_cliente(pedido: PedidoClienteCreateSchema, db: Session = Depends(get_db)):
    pedido_existente = db.query(Pedidos).filter(Pedidos.id_pedido == pedido.id_pedido).first()
    if pedido_existente:
        raise HTTPException(status_code=400, detail="Pedido com este ID já existe") 

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