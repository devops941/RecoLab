import time
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import HTTPException
from app.ml.content_based.tf_idf_engine import ContentBasedRecommender
from app.ml.item_item.collaborative_engine import ItemItemRecommender
from app.ml.hybrid.hybrid_engine import HybridRecommender
from app.schemas.recommendation import (
    ContentBasedRequest,
    ItemItemRequest,
    HybridRequest,
    RecommendationResponse
)


class RecommendationService:
    # In-memory model cache per dataset_id
    _cb_cache: Dict[str, ContentBasedRecommender] = {}
    _ii_cache: Dict[str, ItemItemRecommender] = {}

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def _get_or_train_cb(self, dataset_id: str, req: Optional[ContentBasedRequest] = None) -> ContentBasedRecommender:
        if dataset_id in self._cb_cache:
            return self._cb_cache[dataset_id]

        cb = ContentBasedRecommender(
            dataset_id=dataset_id,
            max_features=req.max_features if req else 5000,
            ngram_range=tuple(req.ngram_range) if req and req.ngram_range else (1, 2)
        )
        # Attempt to load from disk
        if not cb.load():
            # Query products from MongoDB
            cursor = self.db.products.find({"dataset_id": dataset_id})
            products = await cursor.to_list(length=10000)
            if not products:
                # Fallback to any dataset's products if specific dataset_id is empty
                cursor = self.db.products.find({})
                products = await cursor.to_list(length=10000)
            if not products:
                raise HTTPException(status_code=400, detail="No product records found to initialize recommender.")
            cb.fit(products)

        self._cb_cache[dataset_id] = cb
        return cb

    async def _get_or_train_ii(self, dataset_id: str, customer_dataset_id: Optional[str] = None, req: Optional[ItemItemRequest] = None) -> ItemItemRecommender:
        cache_key = f"{dataset_id}_{customer_dataset_id or ''}"
        if cache_key in self._ii_cache:
            return self._ii_cache[cache_key]

        ii = ItemItemRecommender(
            dataset_id=dataset_id,
            weights=req.interaction_weights if req else None
        )
        if not ii.load():
            # Query interactions
            query = {"dataset_id": customer_dataset_id} if customer_dataset_id else {}
            inter_cursor = self.db.interactions.find(query)
            interactions = await inter_cursor.to_list(length=25000)
            if not interactions:
                # Query all interactions if specific dataset is empty
                inter_cursor = self.db.interactions.find({})
                interactions = await inter_cursor.to_list(length=25000)

            prod_cursor = self.db.products.find({"dataset_id": dataset_id})
            products = await prod_cursor.to_list(length=10000)
            if not products:
                prod_cursor = self.db.products.find({})
                products = await prod_cursor.to_list(length=10000)

            if not interactions:
                raise HTTPException(status_code=400, detail="No customer interaction data found for collaborative filtering.")
            ii.fit(interactions, products)

        self._ii_cache[cache_key] = ii
        return ii

    async def get_content_based_recommendations(self, req: ContentBasedRequest) -> RecommendationResponse:
        start_t = time.time()
        cb = await self._get_or_train_cb(req.dataset_id, req)

        # Source product
        source_prod = await self.db.products.find_one({"product_id": str(req.product_id)})
        if not source_prod:
            raise HTTPException(status_code=404, detail=f"Source product '{req.product_id}' not found.")
        if "_id" in source_prod:
            source_prod["id"] = str(source_prod.pop("_id"))

        recs = cb.recommend(
            product_id=req.product_id,
            top_k=req.top_k,
            similarity_threshold=req.similarity_threshold
        )
        exec_ms = (time.time() - start_t) * 1000

        run_id = f"run_{uuid.uuid4().hex[:10]}"
        resp_data = {
            "run_id": run_id,
            "dataset_id": req.dataset_id,
            "algorithm": "Content-Based Filtering (TF-IDF + Cosine)",
            "source_product": source_prod,
            "recommendations": recs,
            "total_recommendations": len(recs),
            "execution_time_ms": round(exec_ms, 2),
            "parameters": req.model_dump(),
            "created_at": datetime.now(timezone.utc)
        }

        # Save run record
        db_record = {k: (dict(v) if isinstance(v, dict) else v) for k, v in resp_data.items()}
        await self.db.recommendationRuns.insert_one(db_record)
        resp_data.pop("_id", None)
        return RecommendationResponse(**resp_data)

    async def get_item_item_recommendations(self, req: ItemItemRequest) -> RecommendationResponse:
        start_t = time.time()
        ii = await self._get_or_train_ii(req.dataset_id, req.customer_dataset_id, req)

        source_prod = await self.db.products.find_one({"product_id": str(req.product_id)})
        if not source_prod:
            raise HTTPException(status_code=404, detail=f"Source product '{req.product_id}' not found.")
        if "_id" in source_prod:
            source_prod["id"] = str(source_prod.pop("_id"))

        recs = ii.recommend(
            product_id=req.product_id,
            top_k=req.top_k,
            similarity_threshold=req.similarity_threshold
        )
        exec_ms = (time.time() - start_t) * 1000

        run_id = f"run_{uuid.uuid4().hex[:10]}"
        resp_data = {
            "run_id": run_id,
            "dataset_id": req.dataset_id,
            "algorithm": "Item-Item Collaborative Filtering (Cosine)",
            "source_product": source_prod,
            "recommendations": recs,
            "total_recommendations": len(recs),
            "execution_time_ms": round(exec_ms, 2),
            "parameters": req.model_dump(),
            "created_at": datetime.now(timezone.utc)
        }

        db_record = {k: (dict(v) if isinstance(v, dict) else v) for k, v in resp_data.items()}
        await self.db.recommendationRuns.insert_one(db_record)
        resp_data.pop("_id", None)
        return RecommendationResponse(**resp_data)

    async def get_hybrid_recommendations(self, req: HybridRequest) -> RecommendationResponse:
        start_t = time.time()
        cb = await self._get_or_train_cb(req.dataset_id)
        ii = await self._get_or_train_ii(req.dataset_id, req.customer_dataset_id)

        source_prod = await self.db.products.find_one({"product_id": str(req.product_id)})
        if not source_prod:
            raise HTTPException(status_code=404, detail=f"Source product '{req.product_id}' not found.")
        if "_id" in source_prod:
            source_prod["id"] = str(source_prod.pop("_id"))

        hybrid = HybridRecommender(
            content_recommender=cb,
            item_recommender=ii,
            content_weight=req.content_weight,
            interaction_weight=req.interaction_weight
        )

        recs = hybrid.recommend(
            product_id=req.product_id,
            top_k=req.top_k,
            similarity_threshold=req.similarity_threshold
        )
        exec_ms = (time.time() - start_t) * 1000

        run_id = f"run_{uuid.uuid4().hex[:10]}"
        resp_data = {
            "run_id": run_id,
            "dataset_id": req.dataset_id,
            "algorithm": f"Hybrid Strategy ({int(req.content_weight*100)}% Content / {int(req.interaction_weight*100)}% Interaction)",
            "source_product": source_prod,
            "recommendations": recs,
            "total_recommendations": len(recs),
            "execution_time_ms": round(exec_ms, 2),
            "parameters": req.model_dump(),
            "created_at": datetime.now(timezone.utc)
        }

        db_record = {k: (dict(v) if isinstance(v, dict) else v) for k, v in resp_data.items()}
        await self.db.recommendationRuns.insert_one(db_record)
        resp_data.pop("_id", None)
        return RecommendationResponse(**resp_data)

    async def get_run_by_id(self, run_id: str) -> Optional[Dict[str, Any]]:
        run = await self.db.recommendationRuns.find_one({"run_id": run_id})
        if run:
            if "_id" in run:
                run["id"] = str(run.pop("_id"))
        return run

    async def get_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        cursor = self.db.recommendationRuns.find({}).sort("created_at", -1).limit(limit)
        runs = []
        async for r in cursor:
            if "_id" in r:
                r["id"] = str(r.pop("_id"))
            runs.append(r)
        return runs
