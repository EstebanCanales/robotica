#!/bin/bash

# Script para iniciar Ollama en segundo plano en la JETSON Nano

# Verificar si Ollama ya está en ejecución
if pgrep -x "ollama" > /dev/null
then
    echo "Ollama ya está en ejecución"
else
    echo "Iniciando Ollama en segundo plano..."
    # Iniciar Ollama en segundo plano
    nohup ollama serve > /var/log/ollama.log 2>&1 &
    
    # Esperar a que Ollama esté listo
    echo "Esperando a que Ollama esté disponible..."
    sleep 5
    
    # Verificar si Ollama está ejecutándose
    if pgrep -x "ollama" > /dev/null
    then
        echo "Ollama iniciado correctamente en segundo plano"
    else
        echo "Error al iniciar Ollama"
        exit 1
    fi
fi

echo "Puedes iniciar la API de análisis de datos con:"
echo "cd data-analysis && python run.py" 