import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection, get_database
from app.database.indexes import init_indexes
from app.services.seed_service import seed_initial_data

from app.api.v1.auth import router as auth_router
from app.api.v1.datasets import router as datasets_router
from app.api.v1.products import router as products_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.benchmarking import router as benchmarking_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.reports import router as reports_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - [%(levelname)s] - %(name)s: %(message)s"
)
logger = logging.getLogger("recolab")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup sequence
    logger.info("Initializing RecoLab Backend Application...")
    try:
        await connect_to_mongo()
        await init_indexes()
        # Seed initial admin and demo datasets
        db = get_database()
        await seed_initial_data(db)
        logger.info("RecoLab application startup completed successfully.")
    except Exception as e:
        logger.error(f"Startup initialization notice: {e}")
    yield
    # Shutdown sequence
    await close_mongo_connection()
    logger.info("RecoLab application shut down cleanly.")


app = FastAPI(
    title="RecoLab API – Intelligent Product Recommendation Strategy & Algorithm Benchmarking",
    description="Enterprise Machine Learning Recommendation Engine & Evaluation Platform",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS Middleware
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins + ["*"],  # Permits development browser connectivity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(datasets_router, prefix="/api/v1")
app.include_router(products_router, prefix="/api/v1")
app.include_router(recommendations_router, prefix="/api/v1")
app.include_router(benchmarking_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(reports_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "documentation": "/docs"
    }


@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }
