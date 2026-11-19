from typing import List
from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_db, get_current_user
from app.schemas.benchmark import BenchmarkRunRequest, BenchmarkRunResponse
from app.services.benchmarking_service import BenchmarkingService

router = APIRouter(prefix="/benchmark", tags=["Benchmarking"])


@router.post("/run", response_model=BenchmarkRunResponse)
async def run_benchmark(
    req: BenchmarkRunRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = BenchmarkingService(db)
    return await service.execute_benchmark(req, user_id=current_user["id"])


@router.get("/experiments", response_model=List[dict])
async def list_experiments(
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BenchmarkingService(db)
    return await service.list_experiments(limit)


@router.get("/{experiment_id}", response_model=dict)
async def get_benchmark_experiment(
    experiment_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = BenchmarkingService(db)
    res = await service.get_benchmark_result(experiment_id)
    if not res:
        raise HTTPException(status_code=404, detail="Benchmark experiment not found")
    return res
