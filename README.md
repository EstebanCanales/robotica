# Robotica Data Platform

Este proyecto es una plataforma full-stack para la recolección, análisis y monitoreo de datos de sensores agrícolas, diseñada para ser robusta, escalable y fácil de usar.

## Visión General

La plataforma consta de tres componentes principales:

1.  **Backend de Análisis de Datos (`data-analysis`)**: Un servicio FastAPI en Python que ingiere datos, los almacena, interactúa con un modelo de IA (Ollama) para generar análisis y expone una API RESTful.
2.  **Aplicación Móvil (`robotica-app`)**: Una aplicación en React Native (Expo) que permite a los usuarios monitorear los datos de los sensores en tiempo real, ver análisis históricos y gestionar el sistema.
3.  **Generador de Datos Falsos (`fake-data`)**: Un microservicio FastAPI que simula lecturas de sensores del mundo real para permitir pruebas de carga y desarrollo sin hardware físico.

## Key Features

- **Análisis con IA**: Integración con Ollama para analizar automáticamente los datos de sensores y extraer insights valiosos.
- **API RESTful Completa**: Endpoints documentados para la ingesta de datos, consulta de análisis, historial y gestión de modelos.
- **Base de Datos Optimizada**: Capa de persistencia con SQLite, con consultas optimizadas e indexación para un rendimiento rápido (<1ms en pruebas).
- **Monitoreo en Tiempo Real**: Aplicación móvil para visualizar datos y análisis al instante.
- **Entorno Containerizado**: Todo el stack se gestiona con Docker Compose para un desarrollo local rápido y consistente.
- **Generador de Datos de Prueba**: Herramienta para simular datos realistas y facilitar el testing de QA.

## Tech Stack

| Componente          | Tecnologías                                        |
| ------------------- | -------------------------------------------------- |
| **Backend**         | Python, FastAPI, Uvicorn                           |
| **Frontend**        | React Native, Expo, TypeScript                     |
| **Base de Datos**   | SQLite                                             |
| **IA & Machine Learning** | Ollama (con modelos como `gemma3:4b`)              |
| **Containerización**| Docker, Docker Compose                             |
| **Testing**         | Pytest, Unittest                                   |

## Project Structure

```
/robotica
├── data-analysis/      # Backend FastAPI (API, DB, IA)
├── robotica-app/       # Frontend React Native (Expo)
├── fake-data/          # Generador de datos simulados
├── docker-compose.yml  # Orquestación de servicios
└── README.md           # Esta documentación
```

## Getting Started

Sigue estos pasos para levantar el entorno de desarrollo local.

### Prerrequisitos

- **Docker y Docker Compose**: [Instrucciones de instalación](https://docs.docker.com/get-docker/)
- **Ollama**: Debes instalar Ollama en tu máquina anfitriona. [Instrucciones de instalación](https://ollama.com/).
- **Git**

### Instalación y Ejecución

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd robotica
    ```

2.  **Preparar Ollama (en la máquina anfitriona):**
    El backend espera que Ollama esté sirviendo un modelo. Abre una terminal separada y ejecuta:
    ```bash
    # Descarga el modelo si no lo tienes
    ollama pull gemma3:4b

    # Inicia el servidor de Ollama (se ejecutará en segundo plano)
    ollama serve
    ```
    Puedes verificar que Ollama funciona visitando `http://localhost:11434` en tu navegador.

3.  **Iniciar el Generador de Datos Falsos:**
    Para que la API principal pueda obtener datos, el simulador debe estar en ejecución. Abre otra terminal:
    ```bash
    cd fake-data
    pip install -r requirements.txt
    python main.py
    ```
    El generador estará disponible en `http://localhost:8080`.

4.  **Iniciar los servicios principales con Docker Compose:**
    Desde el directorio raíz del proyecto (`/robotica`), ejecuta:
    ```bash
    docker-compose up --build
    ```
    Esto construirá y levantará los contenedores para la **API de análisis** y la **aplicación de Expo**.

### Acceso a los Servicios

- **API de Análisis**: `http://localhost:8000`
- **Documentación Interactiva de la API**: `http://localhost:8000/docs`
- **Aplicación Móvil (Expo)**: Escanea el código QR que aparece en la terminal de Docker con la aplicación Expo Go en tu teléfono.
- **Generador de Datos Falsos**: `http://localhost:8080/datos`

## API Documentation

La documentación detallada de cada endpoint, incluyendo ejemplos de peticiones y respuestas, se encuentra en el siguiente archivo:

[**Ver Documentación de la API](./data-analysis/API_DOCUMENTATION.md)**]

## Testing

El proyecto incluye tests para garantizar la calidad y el rendimiento. Para ejecutar el test de rendimiento de la base de datos:

```bash
cd data-analysis
python3 -m unittest app/db/test_db_performance.py
```