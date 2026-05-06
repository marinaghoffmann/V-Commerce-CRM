from fastapi import APIRouter
from app.routers.health import router as health_router
from app.routers.cliente import router as cliente_router
from app.routers.produto import router as produto_router
from app.routers.ticket import router as ticket_router

router = APIRouter()

router.include_router(health_router)
router.include_router(cliente_router)
router.include_router(produto_router)
router.include_router(ticket_router)