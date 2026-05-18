import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import distinct, func

from app.database import get_db
from app.models.produto import Produto
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
    query = (
        query
        .filter(*filters)
        .order_by(Produto.id_produto)
        .offset(offset)
        .limit(limit)
    )
    return query.all()


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

@router.patch("/{id_produto}", response_model=ProdutoSchema)
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