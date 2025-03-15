from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from config import settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None
    
    async def connect_to_database(self):
        try:
            self.client = AsyncIOMotorClient(settings.MONGODB_URL)
            self.db = self.client[settings.MONGODB_DB_NAME]
            logger.info("Connected to MongoDB")
        except ConnectionFailure as e:
            logger.error(f"Could not connect to MongoDB: {e}")
            raise

    async def close_database_connection(self):
        if self.client:
            self.client.close()
            logger.info("Closed connection with MongoDB")

db = Database()
