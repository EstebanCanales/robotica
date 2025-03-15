#!/bin/bash

# URL base de la API
API_URL="http://localhost:8000"

# Habilitar modo debug
set -x

# Colores para la salida
# 1. Primero crear una nueva lectura de sensor
echo -e "${BLUE}1. Creando nueva lectura de sensor...${NC}"
RESPONSE=$(curl -v -X POST "$API_URL/api/sensors/reading" \
BLUE='\033[0;34m'

echo -e "${BLUE}=== Test de Sensores API ===${NC}\n"

# 1. Primero crear una nueva lectura de sensor
echo -e "${BLUE}1. Creando nueva lectura de sensor...${NC}"
echo "Enviando petición POST para crear sensor..."
RESPONSE=$(curl -v -X POST "$API_URL/api/sensors/reading" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test_device",
    "sensor_type": "temperature",
    "value": 25.5,
    "unit": "C",
    "timestamp": "2024-03-08T12:00:00Z"
  }')

# Mostrar la respuesta completa
echo "Respuesta completa del servidor:"
echo "$RESPONSE"

# Extraer el ID del sensor creado
SENSOR_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "ID del sensor extraído: $SENSOR_ID"

if [ -n "$SENSOR_ID" ]; then
    echo -e "${GREEN}✓ Sensor creado exitosamente con ID: $SENSOR_ID${NC}"
echo "Sensor ID a actualizar: $SENSOR_ID"
UPDATE_RESPONSE=$(curl -v -X PUT "$API_URL/api/sensors/reading/$SENSOR_ID" \
    echo -e "${RED}✗ Error al crear el sensor${NC}"
    exit 1
fi

# 2. Actualizar el valor del sensor
echo -e "\n${BLUE}2. Actualizando valor del sensor...${NC}"
echo "Actualizando sensor con ID: $SENSOR_ID"
UPDATE_RESPONSE=$(curl -v -X PUT "$API_URL/api/sensors/reading/$SENSOR_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "value": 26.5
  }')

if echo $UPDATE_RESPONSE | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Valor del sensor actualizado exitosamente${NC}"
VERIFY_RESPONSE=$(curl -v "$API_URL/api/sensors/latest?device_id=test_device")
echo "Respuesta de verificación completa:"
echo "$VERIFY_RESPONSE"
VERIFY_RESPONSE=$(curl -v "$API_URL/api/sensors/latest?device_id=test_device")
echo "Respuesta de verificación completa:"
echo "$VERIFY_RESPONSE"
    exit 1
fi

# 3. Verificar el nuevo valor
echo -e "\n${BLUE}3. Verificando el nuevo valor...${NC}"
echo "Verificando el sensor actualizado..."
VERIFY_RESPONSE=$(curl -v "$API_URL/api/sensors/latest?device_id=test_device")
echo "Respuesta de verificación:"
echo "$VERIFY_RESPONSE"

if echo $VERIFY_RESPONSE | grep -q '"value":26.5'; then
    echo -e "${GREEN}✓ El nuevo valor se verificó correctamente${NC}"
else
    echo -e "${RED}✗ Error al verificar el nuevo valor${NC}"
    exit 1
fi

echo -e "\n${GREEN}=== Todas las pruebas completadas exitosamente ===${NC}"

