from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class InteractionType(str):
    VIEW = "view"
    CLICK = "click"
    ADD_TO_CART = "add_to_cart"
    PURCHASE = "purchase"
    WISHLIST = "wishlist"
    RATING = "rating"


class InteractionBase(BaseModel):
    customer_id: str
    product_id: str
    interaction_type: str
    interaction_date: datetime
    transaction_id: Optional[str] = None
    rating: Optional[float] = None
    quantity: Optional[int] = 1
    purchase_amount: Optional[float] = None
    session_id: Optional[str] = None
    interaction_weight: Optional[float] = None


class InteractionCreate(InteractionBase):
    dataset_id: str


class InteractionResponse(InteractionBase):
    id: str
    dataset_id: str
    product_name: Optional[str] = None
    category: Optional[str] = None


class InteractionFilterParams(BaseModel):
    dataset_id: Optional[str] = None
    customer_id: Optional[str] = None
    product_id: Optional[str] = None
    interaction_type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    page: int = 1
    page_size: int = 20
