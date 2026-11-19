import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.core.dependencies import get_db, get_current_user
from app.schemas.analytics import ReportRequest, ReportResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    req: ReportRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    service = ReportService(db)
    return await service.generate_report(req)


@router.get("", response_model=List[dict])
async def list_reports(
    limit: int = 20,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    cursor = db.reports.find({}).sort("created_at", -1).limit(limit)
    reports = []
    async for r in cursor:
        if "_id" in r:
            r["id"] = str(r.pop("_id"))
        reports.append(r)
    return reports


@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    doc = await db.reports.find_one({"report_id": report_id})
    if not doc or not os.path.exists(doc.get("file_path", "")):
        raise HTTPException(status_code=404, detail="Report file not found")

    file_path = doc["file_path"]
    filename = os.path.basename(file_path)
    media_type = "application/pdf" if doc.get("format") == "pdf" else "application/octet-stream"

    return FileResponse(
        path=file_path,
        filename=filename,
        media_type=media_type
    )
