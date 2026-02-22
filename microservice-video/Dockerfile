FROM python:3.13-slim

# Evita archivos .pyc y logs bufferizados
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar ffmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Copiar dependencias primero (mejor cache)
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del proyecto
COPY . .

EXPOSE 8000

CMD ["python", "/app/src/worker.py"]
# docker build --platform=linux/amd64 -t <username>/<tag> <dokerfile-path>