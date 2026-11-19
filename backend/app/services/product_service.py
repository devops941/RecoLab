from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.product import ProductCreate, ProductUpdate, ProductFilterParams


class ProductService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def list_products(self, params: ProductFilterParams) -> Tuple[List[Dict[str, Any]], int]:
        query: Dict[str, Any] = {}
        if params.dataset_id:
            query["dataset_id"] = params.dataset_id
        if params.category:
            query["category"] = params.category
        if params.brand:
            query["brand"] = params.brand
        if params.min_price is not None or params.max_price is not None:
            price_query = {}
            if params.min_price is not None:
                price_query["$gte"] = params.min_price
            if params.max_price is not None:
                price_query["$lte"] = params.max_price
            query["price"] = price_query
        if params.search:
            regex = {"$regex": params.search, "$options": "i"}
            query["$or"] = [
                {"product_name": regex},
                {"description": regex},
                {"category": regex},
                {"brand": regex},
                {"product_id": regex}
            ]

        total_count = await self.db.products.count_documents(query)

        sort_field = params.sort_by or "product_name"
        sort_order = 1 if params.sort_dir == "asc" else -1

        skip = (params.page - 1) * params.page_size
        cursor = self.db.products.find(query).sort(sort_field, sort_order).skip(skip).limit(params.page_size)

        products = []
        async for doc in cursor:
            if "_id" in doc:
                doc["id"] = str(doc.pop("_id"))
            products.append(doc)

        return products, total_count

    async def get_product(self, product_id: str, dataset_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        query: Dict[str, Any] = {"product_id": str(product_id)}
        if dataset_id:
            query["dataset_id"] = dataset_id

        doc = await self.db.products.find_one(query)
        if not doc:
            return None

        if "_id" in doc:
            doc["id"] = str(doc.pop("_id"))

        # Fetch interaction statistics for this product
        inter_stats = await self.db.interactions.aggregate([
            {"$match": {"product_id": str(product_id)}},
            {"$group": {
                "_id": "$product_id",
                "count": {"$sum": 1},
                "avg_rating": {"$avg": "$rating"}
            }}
        ]).to_list(length=1)

        if inter_stats:
            doc["interaction_count"] = inter_stats[0].get("count", 0)
            doc["average_rating"] = round(inter_stats[0].get("avg_rating", 0.0) or doc.get("rating", 0.0), 1)
        else:
            doc["interaction_count"] = 0
            doc["average_rating"] = doc.get("rating", 0.0)

        return doc

    async def create_product(self, prod_in: ProductCreate) -> Dict[str, Any]:
        doc = prod_in.model_dump()
        doc["created_at"] = datetime.now(timezone.utc)
        res = await self.db.products.insert_one(doc)
        doc["id"] = str(res.inserted_id)
        return doc

    async def update_product(self, product_id: str, prod_update: ProductUpdate, dataset_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        query: Dict[str, Any] = {"product_id": str(product_id)}
        if dataset_id:
            query["dataset_id"] = dataset_id

        update_data = {k: v for k, v in prod_update.model_dump().items() if v is not None}
        if not update_data:
            return await self.get_product(product_id, dataset_id)

        update_data["updated_at"] = datetime.now(timezone.utc)
        await self.db.products.update_one(query, {"$set": update_data})
        return await self.get_product(product_id, dataset_id)

    async def delete_product(self, product_id: str, dataset_id: Optional[str] = None) -> bool:
        query: Dict[str, Any] = {"product_id": str(product_id)}
        if dataset_id:
            query["dataset_id"] = dataset_id
        res = await self.db.products.delete_one(query)
        return res.deleted_count > 0

    async def get_filter_options(self, dataset_id: Optional[str] = None) -> Dict[str, Any]:
        match = {"dataset_id": dataset_id} if dataset_id else {}
        categories = await self.db.products.distinct("category", match)
        brands = await self.db.products.distinct("brand", match)
        return {
            "categories": sorted([c for c in categories if c]),
            "brands": sorted([b for b in brands if b])
        }
