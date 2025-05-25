"""
Aplicación principal.
"""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.db.manager import DatabaseManager
from app.ai.ollama_client import OllamaClient

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Crear aplicación FastAPI
app = FastAPI(
    title="Robotica Data Analysis API",
    description="API para análisis de datos de sensores de robótica",
    version="1.0.0",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir router de la API
app.include_router(router)

# Modelo a utilizar
MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")


@app.on_event("startup")
async def startup_event():
    """Inicializar la aplicación."""
    try:
        # Inicializar la base de datos
        logger.info("Inicializando la base de datos...")
        db_manager = DatabaseManager()
        db_manager.setup_database()
        
        # Verificar y descargar el modelo si es necesario
        logger.info(f"Verificando si el modelo {MODEL} está disponible...")
        ollama_client = OllamaClient(model=MODEL)
        
        # Intentar obtener lista de modelos disponibles
        models_info = ollama_client.get_models()
        models = [model.get("name") for model in models_info.get("models", [])]
        
        if MODEL not in models:
            logger.info(f"Modelo {MODEL} no encontrado. Iniciando descarga...")
            success = ollama_client.pull_model()
            if success:
                logger.info(f"Modelo {MODEL} descargado correctamente")
            else:
                logger.error(f"No se pudo descargar el modelo {MODEL}")
        else:
            logger.info(f"Modelo {MODEL} ya está disponible")
            
        logger.info("Aplicación inicializada correctamente")
    except Exception as e:
        logger.error(f"Error al inicializar la aplicación: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 