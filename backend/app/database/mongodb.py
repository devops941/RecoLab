import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import pymongo
from pymongo import MongoClient
from app.core.config import settings

logger = logging.getLogger("recolab.database")


class MongoDB:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    sync_client: Optional[MongoClient] = None


db_manager = MongoDB()


async def connect_to_mongo():
    logger.info("Connecting to MongoDB Atlas...")
    try:
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=50,
            minPoolSize=10
        )
        db_manager.db = db_manager.client[settings.MONGODB_DB_NAME]
        
        # Sync client for dataframe / bulk analytical queries
        db_manager.sync_client = MongoClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        
        # Test connection ping
        await db_manager.client.admin.command('ping')
        logger.info(f"Connected to MongoDB Atlas successfully! Database: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        logger.error(f"Error connecting to MongoDB Atlas: {e}")
        raise e


async def close_mongo_connection():
    logger.info("Closing MongoDB connection...")
    if db_manager.client:
        db_manager.client.close()
    if db_manager.sync_client:
        db_manager.sync_client.close()
    logger.info("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    if db_manager.db is None:
        # Fallback initialization if invoked outside lifespan
        db_manager.client = AsyncIOMotorClient(settings.MONGODB_URI)
        db_manager.db = db_manager.client[settings.MONGODB_DB_NAME]
    return db_manager.db


def get_sync_database():
    if db_manager.sync_client is None:
        db_manager.sync_client = MongoClient(settings.MONGODB_URI)
    return db_manager.sync_client[settings.MONGODB_DB_NAME]
