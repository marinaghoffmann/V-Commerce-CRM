from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.desempenhoProduto import DesempenhoProduto
from app.schemas.desempenhoProdutos import DesempenhoProdutoSchema

router = APIRouter(prefix="/produto", tags=["Produto"])


@router.get("/", response_model=List[DesempenhoProdutoSchema])
def list_produto(skip: int = 0, limit: int = 0, db: Session = Depends(get_db)):
    query = db.query(DesempenhoProduto).offset(skip)
    if limit > 0:
        query = query.limit(limit)
    return query.all()


@router.get("/{id_produto}", response_model=DesempenhoProdutoSchema)
def get_produto(id_produto: str, db: Session = Depends(get_db)):
    produto = db.query(DesempenhoProduto).filter(DesempenhoProduto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    return produto


@router.post("/", response_model=DesempenhoProdutoSchema, status_code=status.HTTP_201_CREATED)
def create_produto(payload: DesempenhoProdutoSchema, db: Session = Depends(get_db)):
    obj = DesempenhoProduto(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.put("/{id_produto}", response_model=DesempenhoProdutoSchema)
def update_produto(id_produto: str, payload: DesempenhoProdutoSchema, db: Session = Depends(get_db)):
    produto = db.query(DesempenhoProduto).filter(DesempenhoProduto.id_produto == id_produto).first()
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
    produto = db.query(DesempenhoProduto).filter(DesempenhoProduto.id_produto == id_produto).first()
    if not produto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Produto não encontrado")
    db.delete(produto)
    db.commit()
    return None
