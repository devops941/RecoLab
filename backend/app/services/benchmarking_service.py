import uuid
import time
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException
from app.ml.evaluation.evaluator import AlgorithmBenchmarker, train_test_split_interactions
from app.schemas.benchmark import BenchmarkRunRequest, BenchmarkRunResponse, AlgorithmBenchmarkResult, BenchmarkMetrics


class BenchmarkingService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def execute_benchmark(self, req: BenchmarkRunRequest, user_id: str) -> BenchmarkRunResponse:
        start_time = time.time()
        experiment_id = f"exp_{uuid.uuid4().hex[:10]}"

        # Load products
        prod_cursor = self.db.products.find({"dataset_id": req.dataset_id})
        products = await prod_cursor.to_list(length=10000)
        if not products:
            prod_cursor = self.db.products.find({})
            products = await prod_cursor.to_list(length=10000)

        if not products:
            raise HTTPException(status_code=400, detail="No product records found to run benchmarking.")

        # Load interactions
        inter_cursor = self.db.interactions.find({"dataset_id": req.interaction_dataset_id})
        interactions = await inter_cursor.to_list(length=25000)
        if not interactions:
            inter_cursor = self.db.interactions.find({})
            interactions = await inter_cursor.to_list(length=25000)

        if not interactions:
            raise HTTPException(status_code=400, detail="No customer interaction records found to run benchmarking.")

        # Train/Test Split
        train_inter, test_inter = train_test_split_interactions(
            interactions=interactions,
            test_ratio=req.test_split_ratio,
            strategy=req.split_strategy
        )

        benchmarker = AlgorithmBenchmarker(
            products=products,
            train_interactions=train_inter,
            test_interactions=test_inter,
            top_k=req.top_k,
            content_weight=req.content_weight or 0.5,
            interaction_weight=req.interaction_weight or 0.5
        )

        bench_out = benchmarker.run_benchmark(algorithms=req.algorithms)
        duration_sec = time.time() - start_time

        parsed_results = [
            AlgorithmBenchmarkResult(
                algorithm_name=res["algorithm_name"],
                display_name=res["display_name"],
                metrics=BenchmarkMetrics(**res["metrics"]),
                parameters=res["parameters"],
                strengths=res["strengths"],
                tradeoffs=res["tradeoffs"]
            )
            for res in bench_out["results"]
        ]

        response_obj = BenchmarkRunResponse(
            experiment_id=experiment_id,
            dataset_id=req.dataset_id,
            interaction_dataset_id=req.interaction_dataset_id,
            top_k=req.top_k,
            test_split_ratio=req.test_split_ratio,
            split_strategy=req.split_strategy,
            results=parsed_results,
            best_algorithm_overall=bench_out["best_algorithm_overall"],
            best_by_metric=bench_out["best_by_metric"],
            total_evaluated_users=bench_out["total_evaluated_users"],
            total_test_interactions=bench_out["total_test_interactions"],
            execution_duration_sec=round(duration_sec, 2),
            created_at=datetime.now(timezone.utc)
        )

        # Store in MongoDB
        doc = response_obj.model_dump()
        doc["created_by"] = user_id
        await self.db.benchmarkResults.insert_one(doc)

        exp_record = {
            "experiment_id": experiment_id,
            "name": f"Benchmark Run Top-{req.top_k} ({', '.join(req.algorithms)})",
            "dataset_id": req.dataset_id,
            "interaction_dataset_id": req.interaction_dataset_id,
            "algorithms": req.algorithms,
            "parameters": req.model_dump(),
            "status": "completed",
            "results": [r.model_dump() for r in parsed_results],
            "best_algorithm": bench_out["best_algorithm_overall"],
            "created_by": user_id,
            "created_at": datetime.now(timezone.utc),
            "completed_at": datetime.now(timezone.utc)
        }
        await self.db.experiments.insert_one(exp_record)

        return response_obj

    async def get_benchmark_result(self, experiment_id: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.benchmarkResults.find_one({"experiment_id": experiment_id})
        if doc:
            if "_id" in doc:
                doc["id"] = str(doc.pop("_id"))
        return doc

    async def list_experiments(self, limit: int = 20) -> List[Dict[str, Any]]:
        cursor = self.db.experiments.find({}).sort("created_at", -1).limit(limit)
        items = []
        async for doc in cursor:
            if "_id" in doc:
                doc["id"] = str(doc.pop("_id"))
            items.append(doc)
        return items
