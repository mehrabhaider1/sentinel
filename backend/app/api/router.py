from fastapi import APIRouter

from app.api.v1.analysis import router as analysis_router
from app.api.v1.auth import router as auth_router
from app.api.v1.health import router as health_router
from app.api.v1.organizations import router as organization_router
from app.api.v1.projects import router as project_router
from app.api.v1.root import router as root_router
from app.api.v1.dashboard import router as dashboard_router
api_router = APIRouter()

api_router.include_router(root_router)

api_router.include_router(
    health_router,
    prefix="/api/v1",
)

api_router.include_router(auth_router)
api_router.include_router(organization_router)
api_router.include_router(project_router)
api_router.include_router(analysis_router)
api_router.include_router(dashboard_router)