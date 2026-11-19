from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RecommendationRequestBase(BaseModel):
    dataset_id: str
    product_id: str
    top_k: int = Field(10, ge=1, le=50)
    similarity_threshold: float = Field(0.0, ge=0.0, le=1.0)


class ContentBasedRequest(RecommendationRequestBase):
    max_features: Optional[int] = 5000
    ngram_range: Optional[List[int]] = [1, 2]
    min_df: Optional[int] = 1
    max_df: Optional[float] = 0.95
    category_weight: Optional[float] = 0.3
    brand_weight: Optional[float] = 0.2
    description_weight: Optional[float] = 0.5


class ItemItemRequest(RecommendationRequestBase):
    customer_dataset_id: Optional[str] = None
    min_interactions: Optional[int] = 1
    interaction_weights: Optional[Dict[str, float]] = {
        "view": 1.0,
        "click": 1.5,
        "add_to_cart": 3.0,
        "wishlist": 2.5,
        "purchase": 5.0,
        "rating": 4.0
    }


class HybridRequest(RecommendationRequestBase):
    customer_dataset_id: Optional[str] = None
    content_weight: float = Field(0.5, ge=0.0, le=1.0)
    interaction_weight: float = Field(0.5, ge=0.0, le=1.0)


class RecommendationExplanation(BaseModel):
    summary: str
    content_match_score: Optional[float] = None
    interaction_match_score: Optional[float] = None
    shared_category: bool = False
    shared_brand: bool = False
    top_matching_terms: List[str] = []
    co_occurrence_count: Optional[int] = 0
    confidence_tier: str = "Medium"  # High, Medium, Low


class RecommendedProduct(BaseModel):
    rank: int
    product_id: str
    product_name: str
    category: str
    brand: str
    price: float
    image_url: Optional[str] = None
    rating: Optional[float] = 0.0
    similarity_score: float
    content_score: Optional[float] = None
    interaction_score: Optional[float] = None
    explanation: RecommendationExplanation


class RecommendationResponse(BaseModel):
    run_id: str
    dataset_id: str
    algorithm: str
    source_product: Dict[str, Any]
    recommendations: List[RecommendedProduct]
    total_recommendations: int
    execution_time_ms: float
    parameters: Dict[str, Any]
    created_at: datetime
