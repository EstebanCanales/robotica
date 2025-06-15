#!/bin/bash

# Script para iniciar la aplicación completa en la JETSON Nano

echo "=== Iniciando la aplicación de análisis de datos en JETSON Nano ==="

# 1. Iniciar Ollama en segundo plano
echo "1. Iniciando Ollama..."
./start_ollama_service.sh

# 2. Verificar que Ollama esté funcionando
echo "2. Verificando Ollama..."
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "Error: No se puede conectar con Ollama. Asegúrate de que esté instalado y funcionando."
    exit 1
fi

# 3. Iniciar la aplicación con Docker Compose
echo "3. Iniciando la aplicación con Docker Compose..."
docker compose -f docker-compose.jetson.yml up -d

echo "=== Aplicación iniciada correctamente ==="
echo "La API está disponible en: http://localhost:8000"
echo "Para ver los logs: docker logs robot-data-analysis -f" 