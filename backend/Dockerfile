# Utiliza una imagen base de Python
FROM python:3.9-slim

# Establece el directorio de trabajo en /app
WORKDIR /app

# Copia el archivo requirements.txt e instala las dependencias
COPY requirements.txt requirements.txt
RUN pip install -r requirements.txt

RUN apt-get update && \
    apt-get install -y vim && \
    rm -rf /var/lib/apt/lists/*

# Copia todo el contenido de la aplicación al contenedor
COPY . .

# Expone el puerto en el que se ejecutará la aplicación
EXPOSE 6000

# Comando para ejecutar la aplicación con Gunicorn (un servidor WSGI)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:6000", "app:app"]