from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://admin:password@localhost:27017"
    MONGODB_DB_NAME: str = "sensor_data"
    API_PORT: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
