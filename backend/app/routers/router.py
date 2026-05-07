from fastapi import APIRouter
from app.routers.health import router as health_router
from app.routers.kpi_category import router as kpi_category_router
from app.routers.kpi_state import router as kpi_state_router
from app.routers.kpi_status import router as kpi_status_router

router = APIRouter()

router.include_router(health_router)
router.include_router(kpi_category_router)
router.include_router(kpi_state_router)
router.include_router(kpi_status_router)