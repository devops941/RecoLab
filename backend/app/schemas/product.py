from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class ProductBase(BaseModel):
    product_id: str
    product_name: str
    category: str
    brand: str
    description: str
    price: float = Field(..., ge=0.0)
    subcategory: Optional[str] = None
    product_tags: Optional[List[str]] = []
    features: Optional[List[str]] = []
    rating: Optional[float] = 0.0
    image_url: Optional[str] = None
    stock_status: Optional[str] = "In Stock"
    discount: Optional[float] = 0.0
    color: Optional[str] = None
    product_attributes: Optional[Dict[str, Any]] = {}


class ProductCreate(ProductBase):
    dataset_id: str


class ProductUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    subcategory: Optional[str] = None
    product_tags: Optional[List[str]] = None
    features: Optional[List[str]] = None
    rating: Optional[float] = None
    image_url: Optional[str] = None
    stock_status: Optional[str] = None
    discount: Optional[float] = None
    color: Optional[str] = None


class ProductResponse(ProductBase):
    id: str
    dataset_id: str
    interaction_count: int = 0
    average_rating: float = 0.0
    created_at: Optional[datetime] = None


class ProductFilterParams(BaseModel):
    dataset_id: Optional[str] = None
    search: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    page: int = 1
    page_size: int = 20
    sort_by: Optional[str] = "product_name"
    sort_dir: Optional[str] = "asc"
