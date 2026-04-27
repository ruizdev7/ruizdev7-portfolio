#!/bin/bash

# Script para configurar Ollama para trabajar con Docker
# Este script configura Ollama para escuchar en todas las interfaces

echo "🔧 Configurando Ollama para Docker..."

# Detener Ollama si está corriendo
echo "Deteniendo Ollama..."
pkill ollama 2>/dev/null
sleep 2

# Configurar variable de entorno para que Ollama escuche en todas las interfaces
export OLLAMA_HOST=0.0.0.0:11434

# Agregar a .zshrc si existe, o a .bash_profile
if [ -f ~/.zshrc ]; then
    if ! grep -q "OLLAMA_HOST=0.0.0.0:11434" ~/.zshrc; then
        echo "" >> ~/.zshrc
        echo "# Ollama configuration for Docker access" >> ~/.zshrc
        echo "export OLLAMA_HOST=0.0.0.0:11434" >> ~/.zshrc
        echo "✅ Agregado a ~/.zshrc"
    else
        echo "ℹ️  Ya está configurado en ~/.zshrc"
    fi
elif [ -f ~/.bash_profile ]; then
    if ! grep -q "OLLAMA_HOST=0.0.0.0:11434" ~/.bash_profile; then
        echo "" >> ~/.bash_profile
        echo "# Ollama configuration for Docker access" >> ~/.bash_profile
        echo "export OLLAMA_HOST=0.0.0.0:11434" >> ~/.bash_profile
        echo "✅ Agregado a ~/.bash_profile"
    else
        echo "ℹ️  Ya está configurado en ~/.bash_profile"
    fi
fi

# Iniciar Ollama con la nueva configuración
echo "Iniciando Ollama en modo background..."
OLLAMA_HOST=0.0.0.0:11434 ollama serve > /dev/null 2>&1 &
sleep 3

# Verificar que está corriendo
if lsof -i :11434 | grep -q LISTEN; then
    echo "✅ Ollama está corriendo y escuchando en todas las interfaces"
    echo ""
    echo "📋 Verificación:"
    lsof -i :11434 | grep LISTEN
    echo ""
    echo "🎉 Configuración completada!"
    echo ""
    echo "Para verificar desde Docker, ejecuta:"
    echo "  docker compose exec backend python3 -c \"from openai import OpenAI; client = OpenAI(base_url='http://host.docker.internal:11434/v1', api_key='ollama'); print(client.models.list())\""
else
    echo "❌ Error: Ollama no está corriendo. Intenta iniciarlo manualmente:"
    echo "  OLLAMA_HOST=0.0.0.0:11434 ollama serve"
fi

