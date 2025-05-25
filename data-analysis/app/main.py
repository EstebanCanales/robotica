"""
Aplicación principal.
"""
import os
import json
import logging
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

from app.db.manager import DBManager
from app.ai.ollama_client import OllamaClient
from app.api.routes import router

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Inicializar la aplicación FastAPI
app = FastAPI(
    title="API de Análisis de Datos de Sensores",
    description="API para procesar datos de sensores agrícolas y generar análisis con modelos de IA",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir router
app.include_router(router)

# Instancias globales
db_manager = DBManager()
ollama_client = OllamaClient()
DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")

@app.on_event("startup")
async def startup_event():
    """Configuración inicial al iniciar la aplicación."""
    logger.info("Inicializando la base de datos...")
    db_manager.setup_database()
    
    # Verificar si el modelo está disponible
    logger.info(f"Verificando si el modelo {DEFAULT_MODEL} está disponible...")
    models = ollama_client.get_models()
    logger.info(f"Modelos disponibles: {models}")
    
    if DEFAULT_MODEL in models:
        logger.info(f"Modelo {DEFAULT_MODEL} encontrado en la lista de modelos")
    else:
        logger.info(f"Modelo {DEFAULT_MODEL} no encontrado. Por favor, descárgalo manualmente.")
        logger.info(f"Puede usar: 'ollama pull {DEFAULT_MODEL}' en la máquina host")
    
    logger.info("Aplicación inicializada correctamente")

@app.on_event("shutdown")
async def shutdown_event():
    """Limpieza al detener la aplicación."""
    logger.info("Cerrando conexiones...")
    # Cerrar cualquier conexión pendiente si es necesario
    
    logger.info("Aplicación detenida correctamente")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 