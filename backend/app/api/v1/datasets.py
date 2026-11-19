from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_db, get_current_user
from app.schemas.dataset import DatasetResponse, DatasetPreview
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.post("/upload", response_model=DatasetResponse, status_code=status.HTTP_201_CREATED)
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(...),
    dataset_type: str = Form(..., description="'products' or 'interactions'"),
    description: Optional[str] = Form(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = DatasetService(db)
    res = await service.upload_and_process_dataset(
        file=file,
        name=name,
        dataset_type=dataset_type,
        user_id=current_user["id"],
        description=description
    )
    return res


@router.get("", response_model=List[DatasetResponse])
async def list_datasets(
    dataset_type: Optional[str] = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = DatasetService(db)
    return await service.list_datasets(dataset_type)


@router.get("/{dataset_id}", response_model=DatasetResponse)
async def get_dataset(dataset_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    service = DatasetService(db)
    ds = await service.get_dataset(dataset_id)
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds


@router.delete("/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = DatasetService(db)
    success = await service.delete_dataset(dataset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return {"message": f"Dataset '{dataset_id}' successfully removed."}


@router.get("/{dataset_id}/preview", response_model=DatasetPreview)
async def preview_dataset(
    dataset_id: str,
    limit: int = 15,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = DatasetService(db)
    return await service.get_preview(dataset_id, limit=limit)
