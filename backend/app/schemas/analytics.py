from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class KPICards(BaseModel):
    total_products: int
    total_customers: int
    total_interactions: int
    total_purchases: int
    average_product_price: float
    total_categories: int
    total_recommendations_generated: int
    average_similarity_score: float
    active_datasets: int
    completed_experiments: int


class ChartDataPoint(BaseModel):
    name: str
    value: float
    secondary_value: Optional[float] = None
    extra: Optional[Dict[str, Any]] = None


class BehaviourAnalytics(BaseModel):
    interaction_type_distribution: List[ChartDataPoint]
    top_viewed_products: List[ChartDataPoint]
    top_purchased_products: List[ChartDataPoint]
    category_engagement: List[ChartDataPoint]
    monthly_trends: List[ChartDataPoint]
    conversion_rate_percent: float
    cart_abandonment_estimate_percent: float


class PriceAnalytics(BaseModel):
    average_price: float
    median_price: float
    min_price: float
    max_price: float
    price_distribution_buckets: List[ChartDataPoint]
    category_average_prices: List[ChartDataPoint]
    brand_price_comparisons: List[ChartDataPoint]
    price_vs_interaction_scatter: List[Dict[str, Any]]


class DemandAnalytics(BaseModel):
    demand_ranking: List[ChartDataPoint]
    category_demand: List[ChartDataPoint]
    daily_demand_trends: List[ChartDataPoint]
    weekly_demand_trends: List[ChartDataPoint]
    high_demand_products: List[Dict[str, Any]]
    low_demand_products: List[Dict[str, Any]]


class BusinessInsightItem(BaseModel):
    title: str
    category: str
    supporting_data: str
    explanation: str
    business_impact_hypothesis: str
    suggested_action: str
    priority: str  # High, Medium, Low


class DashboardOverviewResponse(BaseModel):
    kpis: KPICards
    behaviour: BehaviourAnalytics
    price: PriceAnalytics
    demand: DemandAnalytics
    insights: List[BusinessInsightItem]
    dataset_id: Optional[str] = None


class ReportRequest(BaseModel):
    dataset_id: str
    report_type: str  # validation, catalogue, behaviour, price, demand, content_based, item_item, hybrid, benchmark, full
    format: str = "pdf"  # pdf, xlsx, csv
    experiment_id: Optional[str] = None
    title: Optional[str] = None


class ReportResponse(BaseModel):
    report_id: str
    title: str
    report_type: str
    format: str
    file_path: str
    file_size_bytes: int
    dataset_id: str
    created_at: datetime
    download_url: str
