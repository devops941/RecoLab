from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class DatasetType(str):
    PRODUCTS = "products"
    INTERACTIONS = "interactions"


class DatasetCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)
    dataset_type: str = Field(..., description="'products' or 'interactions'")
    description: Optional[str] = None
    version: Optional[str] = "1.0.0"


class ColumnMapping(BaseModel):
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    price: Optional[str] = None
    customer_id: Optional[str] = None
    interaction_type: Optional[str] = None
    interaction_date: Optional[str] = None
    rating: Optional[str] = None
    quantity: Optional[str] = None
    purchase_amount: Optional[str] = None


class ValidationSummary(BaseModel):
    total_records: int = 0
    valid_records: int = 0
    invalid_records: int = 0
    duplicate_records: int = 0
    missing_values: Dict[str, int] = {}
    data_quality_score: float = 0.0
    detected_columns: List[str] = []
    missing_required_columns: List[str] = []
    rejected_sample: List[Dict[str, Any]] = []
    validation_messages: List[str] = []


class DatasetResponse(BaseModel):
    id: str
    dataset_id: str
    name: str
    dataset_type: str
    description: Optional[str] = None
    version: str = "1.0.0"
    file_name: str
    file_size_bytes: int
    row_count: int = 0
    status: str = "uploaded"  # uploaded, validating, valid, error, archived
    validation_summary: Optional[ValidationSummary] = None
    created_by: str
    created_at: datetime
    updated_at: datetime


class DatasetPreview(BaseModel):
    dataset_id: str
    name: str
    dataset_type: str
    columns: List[str]
    preview_rows: List[Dict[str, Any]]
    total_rows: int
