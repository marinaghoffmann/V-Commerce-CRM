from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.produto import Produto
from app.schemas.produto import ProdutoSchema

router = APIRouter(prefix="/produto", tags=["Produto"])


@router.get("/", response_model=List[ProdutoSchema])
def list_produto(skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    query = db.query(Produto).offset(skip)
    if limit > 0:
        query = query.limit(limit)
    return query.all()


@router.get("/{id_produto}", response_model=ProdutoSchema)
def get_produto(id_produto: str, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    return produto


@router.post("/", response_model=ProdutoSchema, status_code=status.HTTP_201_CREATED)
def create_produto(payload: ProdutoSchema, db: Session = Depends(get_db)):
    obj = Produto(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{id_produto}", response_model=ProdutoSchema)
def update_produto(id_produto: str, payload: ProdutoSchema, db: Session = Depends(get_db)):
    produto = db.query(Produto).filter(Produto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    data = payload.model_dump()
    for key, value in data.items():
        setattr(produto, key, value)
    db.add(produto)
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
