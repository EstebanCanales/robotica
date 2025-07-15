# Proyecto Robotica

Este repositorio contiene el código para una aplicación full-stack de análisis de datos de robótica. La solución consta de una aplicación móvil para la visualización y solicitud de análisis, un servicio de backend para procesar datos y un generador de datos falsos para pruebas.

## Arquitectura

El proyecto está compuesto por tres componentes principales:

1.  **`robotica-app` (Frontend):** Una aplicación móvil desarrollada con React Native (Expo) que permite a los usuarios visualizar datos de sensores en tiempo real, solicitar análisis de IA, ver resultados históricos y configurar la aplicación.
2.  **`data-analysis` (Backend):** Un servicio de API construido con Python y FastAPI. Se encarga de gestionar los datos de los sensores, interactuar con una base de datos PostgreSQL, y realizar análisis complejos utilizando un modelo de lenguaje local a través de Ollama.
3.  **`fake-data` (Generador de Datos):** Un script de Python para poblar la base de datos con datos de sensores simulados, útil para desarrollo y pruebas.

Los servicios de backend (`api`, `db`, `ollama`) están orquestados con Docker Compose para un despliegue y desarrollo sencillos.

![Arquitectura del Sistema](httpsd://i.imgur.com/YourDiagram.png)
*(Nota: Reemplazar con una URL de diagrama de arquitectura si está disponible)*

---

## Tech Stack

| Componente      | Tecnologías Principales                                       |
| --------------- | ------------------------------------------------------------- |
| **Frontend**    | React Native, Expo, TypeScript, Bun                           |
| **Backend**     | Python, FastAPI, SQLAlchemy, Uvicorn, Ollama, Docker          |
| **Base de Datos** | PostgreSQL                                                    |
| **Data Faker**  | Python, Faker, Psycopg2                                       |

---

## Estructura del Proyecto

```
/
├── data-analysis/        # Servicio Backend (API FastAPI)
│   ├── app/              # Lógica de la aplicación
│   │   ├── ai/           # Cliente para interactuar con Ollama
│   │   ├── api/          # Definición de endpoints de la API
│   │   ├── db/           # Gestión de la base de datos
│   │   └── models/       # Esquemas de datos y modelos SQLAlchemy
│   ├── Dockerfile
│   └── requirements.txt
├── fake-data/            # Script para generar datos de prueba
│   ├── main.py
│   └── requirements.txt
├── robotica-app/         # Aplicación móvil (React Native / Expo)
│   ├── app/              # Pantallas y navegación de la app
│   ├── assets/           # Imágenes y fuentes
│   ├── components/       # Componentes reutilizables de la UI
│   ├── constants/        # Constantes (colores, endpoints de API)
│   ├── hooks/            # Hooks personalizados de React
│   └── services/         # Lógica de negocio y comunicación con API
└── docker-compose.yml    # Orquestación de los servicios de backend
```

---

## Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el entorno de desarrollo local.

### Prerrequisitos

-   [Node.js](https://nodejs.org/) (v18+ recomendado)
-   [Bun](https://bun.sh/) (o `npm`/`yarn` si lo prefieres)
-   [Docker](https://www.docker.com/get-started) y Docker Compose
-   [Python](https://www.python.org/downloads/) (v3.9+ recomendado)

### 1. Configuración del Backend

El backend se ejecuta como un conjunto de contenedores Docker.

1.  **Navega al directorio raíz del proyecto.**
2.  **Inicia los servicios de Docker Compose:**
    ```bash
    docker-compose up -d --build
    ```
    Este comando construirá las imágenes y levantará los contenedores para la API de FastAPI, la base de datos PostgreSQL y el servicio de Ollama.

3.  **(Opcional) Poblar la base de datos con datos de prueba:**
    -   Navega al directorio `fake-data`:
        ```bash
        cd fake-data
        ```
    -   Instala las dependencias:
        ```bash
        pip install -r requirements.txt
        ```
    -   Ejecuta el script para generar datos:
        ```bash
        python main.py
        ```

### 2. Configuración del Frontend

La aplicación móvil se ejecuta usando el CLI de Expo.

1.  **Navega al directorio de la aplicación móvil:**
    ```bash
    cd robotica-app
    ```
2.  **Instala las dependencias:**
    ```bash
    bun install
    ```
3.  **Inicia el servidor de desarrollo de Expo:**
    ```bash
    bun start
    ```
    Esto abrirá el Metro Bundler. Puedes escanear el código QR con la aplicación Expo Go en tu dispositivo móvil (iOS o Android) o ejecutar la aplicación en un emulador (`a` para Android, `i` para iOS).

### Verificación

-   La API del backend debería estar disponible en `http://localhost:8000/docs`.
-   La aplicación móvil debería conectarse a la API local automáticamente. La configuración de la URL de la API se encuentra en `robotica-app/constants/Api.ts`.

---

## Uso

### Backend API

La API de `data-analysis` expone varios endpoints para gestionar los datos:

-   `GET /api/v1/sensors`: Obtiene los últimos datos de los sensores.
-   `GET /api/v1/sensors/history`: Obtiene un historial de lecturas de sensores.
-   `POST /api/v1/analysis`: Envía datos para ser analizados por el modelo de IA (Ollama).
-   `GET /api/v1/analysis/history`: Obtiene un historial de los análisis realizados.

La documentación interactiva de la API (generada por Swagger UI) está disponible en `http://localhost:8000/docs` cuando el servicio está en ejecución.

### Aplicación Móvil

La aplicación `robotica-app` tiene las siguientes pestañas principales:

-   **Sensores:** Muestra los datos más recientes de los sensores.
-   **Análisis:** Permite al usuario seleccionar un modelo de IA, enviar los datos actuales para análisis y ver el resultado.
-   **Configuración:** Opciones para configurar la aplicación.

---

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cambios importantes o envía un pull request con tus mejoras.

## Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
