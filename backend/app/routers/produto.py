from datetime import date
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import distinct, func

from app.database import get_db
from app.models.produto import Produto
from app.models.pedido import Pedido
from app.schemas.produto import ProdutoSchema, ProdutoCreateSchema, ProdutoSchemaRead, ProdutoUpdateSchema

router = APIRouter(prefix="/produto", tags=["Produto"])


@router.get("/categorias", response_model=List[str])
def list_categorias(db: Session = Depends(get_db)):
    rows = db.query(distinct(Produto.categoria)).filter(Produto.categoria != None).order_by(Produto.categoria).all()
    return [r[0] for r in rows]


@router.get("/", response_model=List[ProdutoSchemaRead])
def list_produto(
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    nome_produto: str | None = None,
    categoria: List[str] | None = Query(default=None),
):
    query = db.query(Produto)
    filters = []

    if nome_produto:
        filters.append(Produto.nome_produto.ilike(f"%{nome_produto}%"))
    if categoria:
        filters.append(Produto.categoria.in_(categoria))

    offset = (page - 1) * limit
    produtos = (
        query
        .filter(*filters)
        .order_by(Produto.id_produto)
        .offset(offset)
        .limit(limit)
        .all()
    )

    ids_produtos = [p.id_produto for p in produtos]

    inicio = date(2025, 2, 1)
    fim = date(2025, 4, 1)

    pedidos_raw = (
        db.query(
            Pedido.id_produto,
            func.strftime('%Y-%m', Pedido.data_pedido).label("mes"),
            func.sum(Pedido.valor_pedido).label("total_valor"),
            func.count(Pedido.id_pedido).label("quantidade"),
        )
        .filter(
            Pedido.id_produto.in_(ids_produtos),
            Pedido.data_pedido >= inicio,
            Pedido.data_pedido < fim
        )
        .group_by(Pedido.id_produto, func.strftime('%Y-%m', Pedido.data_pedido))
        .order_by(Pedido.id_produto, func.strftime('%Y-%m', Pedido.data_pedido))
        .all()
    )

    pedidos_por_produto: dict = {}
    for p in pedidos_raw:
        pedidos_por_produto.setdefault(p.id_produto, []).append({
            "mes": p.mes,
            "total_valor": float(p.total_valor),
            "quantidade": p.quantidade,
        })

    resultado = []
    for produto in produtos:
        pedidos_list = pedidos_por_produto.get(produto.id_produto, [])

        indicador_crescimento = None
        if len(pedidos_list) >= 2:
            anterior = pedidos_list[-2]["total_valor"]
            atual = pedidos_list[-1]["total_valor"]
            if anterior != 0:
                indicador_crescimento = round((atual - anterior) / anterior * 100, 2)

        resultado.append(ProdutoSchemaRead(
            id_produto=produto.id_produto,
            nome_produto=produto.nome_produto,
            categoria=produto.categoria,
            preco=produto.preco,
            total_pedidos=produto.total_pedidos,
            unidades_vendidas=produto.unidades_vendidas,
            receita_total=produto.receita_total,
            receita_media_por_pedido=produto.receita_media_por_pedido,
            estoque_disponivel=produto.estoque_disponivel,
            total_avaliacoes=produto.total_avaliacoes,
            media_nota_produto=produto.media_nota_produto,
            media_nota_nps=produto.media_nota_nps,
            pct_recomenda=produto.pct_recomenda,
            total_tickets=produto.total_tickets,
            total_visualizacoes=produto.total_visualizacoes,
            flag_alto_ticket=produto.flag_alto_ticket,
            indicador_crescimento=indicador_crescimento,
        ))

    return resultado


@router.get("/{id_produto}", response_model=ProdutoSchemaRead)
def get_produto(id_produto: str, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    return produto


@router.post("/", response_model=ProdutoSchema, status_code=status.HTTP_201_CREATED)
def create_produto(payload: ProdutoCreateSchema, db: Session = Depends(get_db)):
    produto_existente = db.query(Produto).filter(Produto.nome_produto == payload.nome_produto).first()
    if produto_existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Produto com este nome já existe")

    max_id = db.query(func.max(Produto.id_produto)).filter(Produto.id_produto.like("PROD-%")).scalar()
    if max_id:
        try:
            current_num = int(max_id.split("-")[1])
            new_id = f"PROD-{current_num + 1:04d}"
        except ValueError:
            new_id = "PROD-0001"
    else:
        new_id = "PROD-0001"

    obj = Produto(
        id_produto=new_id,
        **payload.model_dump()
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.patch("/{id_produto}", response_model=ProdutoSchemaRead)
def update_produto(
    id_produto: str,
    payload: ProdutoUpdateSchema,
    db: Session = Depends(get_db)
):
    produto = (
        db.query(Produto)
        .filter(Produto.id_produto == id_produto)
        .first()
    )

    if not produto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado"
        )

    data = payload.model_dump(exclude_unset=True)

    for key, value in data.items():
        setattr(produto, key, value)

    db.commit()
    db.refresh(produto)

    return produto

@router.delete("/{id_produto}", status_code=status.HTTP_204_NO_CONTENT)
def delete_produto(id_produto: str, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    db.delete(produto)
    db.commit()
    return None