from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class BenchmarkMetrics(BaseModel):
    precision_at_k: float
    recall_at_k: float
    f1_at_k: float
    map_at_k: float
    ndcg_at_k: float
    coverage: float
    catalog_coverage: float
    diversity: float
    novelty: float
    execution_time_ms: float
    model_build_time_ms: float


class AlgorithmBenchmarkResult(BaseModel):
    algorithm_name: str
    display_name: str
    metrics: BenchmarkMetrics
    parameters: Dict[str, Any]
    strengths: List[str]
    tradeoffs: List[str]


class BenchmarkRunRequest(BaseModel):
    dataset_id: str
    interaction_dataset_id: str
    algorithms: List[str] = ["content_based", "item_item", "hybrid"]
    top_k: int = Field(10, ge=1, le=50)
    test_split_ratio: float = Field(0.2, ge=0.1, le=0.5)
    split_strategy: str = "user_holdout"  # user_holdout, temporal, random
    content_weight: Optional[float] = 0.5
    interaction_weight: Optional[float] = 0.5


class BenchmarkRunResponse(BaseModel):
    experiment_id: str
    dataset_id: str
    interaction_dataset_id: str
    top_k: int
    test_split_ratio: float
    split_strategy: str
    results: List[AlgorithmBenchmarkResult]
    best_algorithm_overall: str
    best_by_metric: Dict[str, str]
    total_evaluated_users: int
    total_test_interactions: int
    execution_duration_sec: float
    created_at: datetime


class ExperimentCreate(BaseModel):
    name: str
    dataset_id: str
    interaction_dataset_id: str
    algorithms: List[str]
    parameters: Dict[str, Any]
    notes: Optional[str] = None


class ExperimentResponse(BaseModel):
    experiment_id: str
    name: str
    dataset_id: str
    interaction_dataset_id: str
    algorithms: List[str]
    parameters: Dict[str, Any]
    status: str  # pending, running, completed, failed
    results: Optional[List[AlgorithmBenchmarkResult]] = None
    summary: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    created_by: str
    created_at: datetime
    completed_at: Optional[datetime] = None
