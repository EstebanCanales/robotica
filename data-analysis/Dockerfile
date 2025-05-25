FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY app/ /app/app/
COPY run.py .

# Crear directorio para datos
RUN mkdir -p /app/data

# Exponer puerto para la API
EXPOSE 8000

# Comando para iniciar la aplicación
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 