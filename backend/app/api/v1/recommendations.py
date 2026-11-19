from typing import List
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_db, get_current_user
from app.schemas.recommendation import (
    ContentBasedRequest,
    ItemItemRequest,
    HybridRequest,
    RecommendationResponse
)
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.post("/content-based", response_model=RecommendationResponse)
async def get_content_based_recommendations(
    req: ContentBasedRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = RecommendationService(db)
    return await service.get_content_based_recommendations(req)


@router.post("/item-item", response_model=RecommendationResponse)
async def get_item_item_recommendations(
    req: ItemItemRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = RecommendationService(db)
    return await service.get_item_item_recommendations(req)


@router.post("/hybrid", response_model=RecommendationResponse)
async def get_hybrid_recommendations(
    req: HybridRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = RecommendationService(db)
    return await service.get_hybrid_recommendations(req)


@router.get("/history", response_model=List[dict])
async def get_recommendation_history(
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = RecommendationService(db)
    return await service.get_history(limit)


@router.get("/{run_id}", response_model=dict)
async def get_recommendation_run(
    run_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = RecommendationService(db)
    run = await service.get_run_by_id(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Recommendation run not found")
    return run
