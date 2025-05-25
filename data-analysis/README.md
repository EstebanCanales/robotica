# Análisis de Datos de Sensores para Robótica

Este proyecto proporciona una API para recopilar datos de sensores, almacenarlos en una base de datos SQLite, y generar análisis automático utilizando modelos de IA a través de Ollama.

## Características

- Recopilación automática de datos de sensores desde un servidor existente
- Almacenamiento estructurado de datos en SQLite
- Generación de análisis utilizando Gemma 3 (4B) a través de Ollama
- API RESTful para acceder a datos y análisis
- Contenedorización completa con Docker
- Soporte para aceleración por GPU

## Requisitos

- Docker y Docker Compose
- Un servidor que exponga datos de sensores en formato JSON (ya implementado)
- [Opcional] GPU compatible con CUDA para mejorar el rendimiento

## Estructura del Proyecto

```
data-analysis/
├── app/                    # Paquete principal
│   ├── __init__.py
│   ├── main.py             # Punto de entrada de la aplicación
│   ├── api/                # Módulo de API
│   │   ├── __init__.py
│   │   └── routes.py       # Rutas de la API
│   ├── db/                 # Módulo de base de datos
│   │   ├── __init__.py
│   │   └── manager.py      # Gestor de base de datos SQLite
│   ├── ai/                 # Módulo de IA
│   │   ├── __init__.py
│   │   └── ollama_client.py # Cliente para Ollama
│   ├── models/             # Módulo de modelos de datos
│   │   ├── __init__.py
│   │   └── schema.py       # Esquemas de datos
│   └── utils/              # Utilidades
│       ├── __init__.py
│       └── prompt_generator.py # Generador de prompts
├── data/                   # Directorio para datos
├── run.py                  # Script para iniciar la aplicación
├── requirements.txt        # Dependencias Python
├── Dockerfile              # Configuración para Docker
└── README.md               # Este archivo
```

## Instalación y Uso

1. Asegúrate de tener Docker y Docker Compose instalados.

2. Clona este repositorio:

   ```
   git clone <url-del-repositorio>
   cd <nombre-del-repositorio>
   ```

3. Configura la URL del servidor de datos en el archivo `docker-compose.yml`:

   ```yaml
   environment:
     - SENSOR_API_URL=http://tu-servidor-de-datos:puerto/ruta
   ```

4. Inicia los servicios con Docker Compose:

   ```
   docker-compose up -d
   ```

5. Accede a la API en `http://localhost:8000`

6. El modelo Gemma 3 (4B) se descargará automáticamente en el primer inicio

## Endpoints de la API

- `GET /`: Información básica sobre la API
- `GET /procesar-datos`: Obtiene datos del servidor, los guarda en la base de datos y genera un análisis con el modelo de IA
- `GET /respuestas`: Lista todas las respuestas generadas
- `GET /respuestas/{id}`: Obtiene una respuesta específica por su ID
- `GET /modelos`: Lista los modelos disponibles en Ollama
- `POST /modelos/{model_name}/pull`: Descarga un modelo específico

## Configuración

El proyecto utiliza las siguientes variables de entorno:

- `OLLAMA_HOST`: URL del servidor Ollama (por defecto: http://ollama:11434)
- `OLLAMA_MODEL`: Modelo de IA a utilizar (por defecto: gemma3:4b)
- `SENSOR_API_URL`: URL del servidor de datos de sensores

## Aceleración por GPU

Para habilitar la aceleración por GPU, asegúrate de tener instalado el [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html) y configura Docker para utilizarlo. El archivo docker-compose.yml ya incluye la configuración necesaria.

## Licencia

Este proyecto está licenciado bajo [tu licencia aquí].
