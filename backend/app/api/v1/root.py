from fastapi import APIRouter

router = APIRouter(tags=["Root"])


@router.get("/")
async def root():
    return {
        "application": "Sentinel AI",
        "version": "0.1.0",
        "status": "running",
    }
