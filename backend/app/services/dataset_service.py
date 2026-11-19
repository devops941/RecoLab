import os
import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import pandas as pd
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings
from app.services.validation_service import DataValidationService


class DatasetService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def upload_and_process_dataset(
        self,
        file: UploadFile,
        name: str,
        dataset_type: str,
        user_id: str,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".csv", ".xlsx", ".xls"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format: {ext}. Allowed: .csv, .xlsx, .xls"
            )

        dataset_id = f"ds_{uuid.uuid4().hex[:10]}"
        file_path = os.path.join(settings.UPLOAD_DIRECTORY, f"{dataset_id}_{file.filename}")
        
        # Save file to upload directory
        content = await file.read()
        file_size = len(content)
        with open(file_path, "wb") as f:
            f.write(content)

        # Parse file into DataFrame
        try:
            if ext == ".csv":
                df = pd.read_csv(file_path)
            else:
                df = pd.read_excel(file_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to parse uploaded file: {str(e)}"
            )

        raw_records = df.to_dict(orient="records")

        # Validate based on type
        if dataset_type == "products":
            valid_recs, rejected_recs, val_summary = DataValidationService.validate_product_records(raw_records)
            # Add dataset_id to records
            for r in valid_recs:
                r["dataset_id"] = dataset_id
                r["created_at"] = datetime.now(timezone.utc)
            if valid_recs:
                await self.db.products.insert_many(valid_recs)
        else:
            # Interactions
            valid_recs, rejected_recs, val_summary = DataValidationService.validate_interaction_records(raw_records)
            for r in valid_recs:
                r["dataset_id"] = dataset_id
                r["created_at"] = datetime.now(timezone.utc)
            if valid_recs:
                await self.db.interactions.insert_many(valid_recs)

        # Save rejected records if any
        rejected_file_path = None
        if rejected_recs:
            rejected_file_path = os.path.join(settings.UPLOAD_DIRECTORY, f"{dataset_id}_rejected.json")
            with open(rejected_file_path, "w", encoding="utf-8") as f:
                json.dump(rejected_recs, f, default=str)

        dataset_doc = {
            "dataset_id": dataset_id,
            "name": name,
            "dataset_type": dataset_type,
            "description": description or "",
            "version": "1.0.0",
            "file_name": file.filename,
            "file_path": file_path,
            "rejected_file_path": rejected_file_path,
            "file_size_bytes": file_size,
            "row_count": len(valid_recs),
            "status": "valid" if val_summary.invalid_records == 0 else "valid_with_warnings",
            "validation_summary": val_summary.model_dump(),
            "created_by": user_id,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }

        await self.db.datasets.insert_one(dataset_doc)
        if "_id" in dataset_doc:
            dataset_doc["id"] = str(dataset_doc.pop("_id"))
        return dataset_doc

    async def list_datasets(self, dataset_type: Optional[str] = None) -> List[Dict[str, Any]]:
        query = {}
        if dataset_type:
            query["dataset_type"] = dataset_type
        cursor = self.db.datasets.find(query).sort("created_at", -1)
        datasets = []
        async for doc in cursor:
            if "_id" in doc:
                doc["id"] = str(doc.pop("_id"))
            datasets.append(doc)
        return datasets

    async def get_dataset(self, dataset_id: str) -> Optional[Dict[str, Any]]:
        doc = await self.db.datasets.find_one({"dataset_id": dataset_id})
        if doc:
            if "_id" in doc:
                doc["id"] = str(doc.pop("_id"))
        return doc

    async def delete_dataset(self, dataset_id: str) -> bool:
        doc = await self.db.datasets.find_one({"dataset_id": dataset_id})
        if not doc:
            return False

        # Delete products or interactions
        if doc.get("dataset_type") == "products":
            await self.db.products.delete_many({"dataset_id": dataset_id})
        else:
            await self.db.interactions.delete_many({"dataset_id": dataset_id})

        # Remove local files
        if doc.get("file_path") and os.path.exists(doc["file_path"]):
            try:
                os.remove(doc["file_path"])
            except Exception:
                pass
        if doc.get("rejected_file_path") and os.path.exists(doc["rejected_file_path"]):
            try:
                os.remove(doc["rejected_file_path"])
            except Exception:
                pass

        await self.db.datasets.delete_one({"dataset_id": dataset_id})
        return True

    async def get_preview(self, dataset_id: str, limit: int = 15) -> Dict[str, Any]:
        ds = await self.get_dataset(dataset_id)
        if not ds:
            raise HTTPException(status_code=404, detail="Dataset not found")

        if ds["dataset_type"] == "products":
            cursor = self.db.products.find({"dataset_id": dataset_id}, {"_id": 0}).limit(limit)
            rows = await cursor.to_list(length=limit)
        else:
            cursor = self.db.interactions.find({"dataset_id": dataset_id}, {"_id": 0}).limit(limit)
            rows = await cursor.to_list(length=limit)

        cols = list(rows[0].keys()) if rows else []
        return {
            "dataset_id": dataset_id,
            "name": ds["name"],
            "dataset_type": ds["dataset_type"],
            "columns": cols,
            "preview_rows": rows,
            "total_rows": ds["row_count"]
        }
