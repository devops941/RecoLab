from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_db, get_current_user
from app.schemas.product import ProductResponse, ProductCreate, ProductUpdate, ProductFilterParams
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("")
async def list_products(
    dataset_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    brand: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: Optional[str] = Query("product_name"),
    sort_dir: Optional[str] = Query("asc"),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = ProductService(db)
    params = ProductFilterParams(
        dataset_id=dataset_id,
        search=search,
        category=category,
        brand=brand,
        min_price=min_price,
        max_price=max_price,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir
    )
    products, total = await service.list_products(params)
    return {
        "items": products,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size if page_size else 1
    }


@router.get("/filters")
async def get_filter_options(
    dataset_id: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = ProductService(db)
    return await service.get_filter_options(dataset_id)


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    dataset_id: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    service = ProductService(db)
    prod = await service.get_product(product_id, dataset_id)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    prod_in: ProductCreate,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = ProductService(db)
    return await service.create_product(prod_in)


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    prod_update: ProductUpdate,
    dataset_id: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = ProductService(db)
    updated = await service.update_product(product_id, prod_update, dataset_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated


@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    dataset_id: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = ProductService(db)
    success = await service.delete_product(product_id, dataset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": f"Product '{product_id}' deleted successfully."}
