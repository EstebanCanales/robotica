"""
Cliente para interactuar con Ollama.
"""
import json
import requests
import logging
import os
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


class OllamaClient:
    """Cliente para interactuar con el servicio Ollama."""
    
    def __init__(self, 
                 host: str = None, 
                 model: str = None):
        """
        Inicializar cliente de Ollama.
        
        Args:
            host: URL del servidor Ollama
            model: Modelo a utilizar
        """
        self.host = host or os.getenv("OLLAMA_HOST", "http://ollama:11434")
        self.model = model or os.getenv("OLLAMA_MODEL", "gemma3:1b")
        self.api_url = f"{self.host}/api/generate"
        # Timeout en segundos para la solicitud a Ollama (aumentado a 5 minutos)
        self.request_timeout = int(os.getenv("OLLAMA_TIMEOUT", "300"))
        logger.info(f"Cliente Ollama inicializado con host={self.host}, modelo={self.model}, timeout={self.request_timeout}s")
    
    def get_models(self) -> Dict[str, Any]:
        """
        Obtener lista de modelos disponibles en Ollama.
        
        Returns:
            Diccionario con información de los modelos
        """
        try:
            url = f"{self.host}/api/tags"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Error al obtener modelos de Ollama: {str(e)}")
            return {"models": []}
    
    def pull_model(self, model_name: str = None) -> bool:
        """
        Descargar un modelo en Ollama.
        
        Args:
            model_name: Nombre del modelo a descargar
            
        Returns:
            True si se descargó correctamente, False en caso contrario
        """
        model = model_name or self.model
        try:
            url = f"{self.host}/api/pull"
            payload = {"name": model}
            
            logger.info(f"Descargando modelo {model}...")
            response = requests.post(url, json=payload, timeout=600)  # Timeout más largo para la descarga
            response.raise_for_status()
            
            logger.info(f"Modelo {model} descargado correctamente")
            return True
        except requests.RequestException as e:
            logger.error(f"Error al descargar modelo {model}: {str(e)}")
            return False
    
    def get_response(self, prompt: str, model: str = None) -> str:
        """
        Obtener respuesta de Ollama.
        
        Args:
            prompt: Texto del prompt para enviar a Ollama
            model: Modelo a utilizar (opcional, usa el predeterminado si no se especifica)
            
        Returns:
            Respuesta generada por el modelo
        """
        try:
            model_to_use = model or self.model
            
            # Parámetros de generación optimizados para una respuesta más rápida
            payload = {
                "model": model_to_use,
                "prompt": prompt,
                "stream": False,
                # Parámetros para ajustar la generación
                "options": {
                    "temperature": 0.7,     # Menos temperatura para respuestas más deterministas
                    "top_p": 0.9,           # Limita el muestreo a los tokens más probables
                    "top_k": 40,            # Considera solo los 40 tokens más probables
                    "num_predict": 1024,    # Limita la longitud de la respuesta
                    "mirostat": 1,          # Activar mirostat para regular la creatividad
                    "mirostat_tau": 5.0,    # Perplexidad objetivo
                    "mirostat_eta": 0.1     # Tasa de aprendizaje
                }
            }
            
            logger.info(f"Enviando prompt a Ollama usando modelo {model_to_use} (longitud: {len(prompt)} caracteres)")
            response = requests.post(self.api_url, json=payload, timeout=self.request_timeout)
            response.raise_for_status()
            
            result = response.json()
            generated_text = result.get('response', '')
            
            logger.info(f"Respuesta recibida de Ollama (longitud: {len(generated_text)} caracteres)")
            return generated_text
            
        except requests.RequestException as e:
            logger.error(f"Error en la solicitud a Ollama: {str(e)}")
            raise Exception(f"Error al obtener respuesta de Ollama: {str(e)}")
        except json.JSONDecodeError as e:
            logger.error(f"Error al decodificar respuesta JSON: {str(e)}")
            raise Exception(f"Error al decodificar respuesta de Ollama: {str(e)}")
        except Exception as e:
            logger.error(f"Error inesperado al comunicarse con Ollama: {str(e)}")
            raise 