from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routers import sensors
from app.database import db
import logging

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(title="Sensor Data API",
              description="API for collecting and retrieving sensor data")

# Configurar CORS para permitir conexiones desde la Jetson
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especifica orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Eventos de inicio y cierre para gestionar la conexión a la base de datos


@app.on_event("startup")
async def startup_db_client():
    try:
        await db.connect_to_database()
        print("MongoDB connection successful")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    await db.close_database_connection()

# Incluir rutas
app.include_router(sensors.router)


@app.get("/")
async def root():
    return {"message": "Sensor Data API is running"}
