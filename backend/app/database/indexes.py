import logging
from pymongo import ASCENDING, DESCENDING, TEXT
from app.database.mongodb import get_database

logger = logging.getLogger("recolab.indexes")


async def init_indexes():
    db = get_database()
    logger.info("Initializing MongoDB indexes...")

    try:
        # Users collection
        await db.users.create_index([("email", ASCENDING)], unique=True)
        await db.users.create_index([("role", ASCENDING)])

        # Datasets collection
        await db.datasets.create_index([("dataset_id", ASCENDING)], unique=True)
        await db.datasets.create_index([("created_by", ASCENDING)])
        await db.datasets.create_index([("status", ASCENDING)])
        await db.datasets.create_index([("created_at", DESCENDING)])

        # Products collection
        await db.products.create_index([("dataset_id", ASCENDING), ("product_id", ASCENDING)], unique=True)
        await db.products.create_index([("dataset_id", ASCENDING), ("category", ASCENDING)])
        await db.products.create_index([("dataset_id", ASCENDING), ("brand", ASCENDING)])
        await db.products.create_index([("dataset_id", ASCENDING), ("price", ASCENDING)])
        await db.products.create_index([
            ("product_name", TEXT),
            ("description", TEXT),
            ("category", TEXT),
            ("brand", TEXT)
        ])

        # Interactions collection
        await db.interactions.create_index([("dataset_id", ASCENDING), ("customer_id", ASCENDING)])
        await db.interactions.create_index([("dataset_id", ASCENDING), ("product_id", ASCENDING)])
        await db.interactions.create_index([("dataset_id", ASCENDING), ("interaction_type", ASCENDING)])
        await db.interactions.create_index([("dataset_id", ASCENDING), ("interaction_date", DESCENDING)])

        # Recommendation Runs collection
        await db.recommendationRuns.create_index([("run_id", ASCENDING)], unique=True)
        await db.recommendationRuns.create_index([("dataset_id", ASCENDING)])
        await db.recommendationRuns.create_index([("product_id", ASCENDING)])
        await db.recommendationRuns.create_index([("created_at", DESCENDING)])

        # Experiments & Benchmarks
        await db.experiments.create_index([("experiment_id", ASCENDING)], unique=True)
        await db.experiments.create_index([("dataset_id", ASCENDING)])
        await db.experiments.create_index([("status", ASCENDING)])
        await db.experiments.create_index([("created_at", DESCENDING)])

        await db.benchmarkResults.create_index([("experiment_id", ASCENDING)])
        await db.benchmarkResults.create_index([("dataset_id", ASCENDING)])

        # Reports collection
        await db.reports.create_index([("report_id", ASCENDING)], unique=True)
        await db.reports.create_index([("dataset_id", ASCENDING)])
        await db.reports.create_index([("created_at", DESCENDING)])

        # Algorithm Configurations
        await db.algorithmConfigurations.create_index([("config_id", ASCENDING)], unique=True)
        await db.algorithmConfigurations.create_index([("user_id", ASCENDING)])

        # Audit Logs
        await db.auditLogs.create_index([("created_at", DESCENDING)])
        await db.auditLogs.create_index([("user_id", ASCENDING)])

        logger.info("MongoDB indexes verified successfully.")
    except Exception as e:
        logger.warning(f"Index creation note: {e}")
