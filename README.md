# ClipFlow 🎬

> Automatización de generación de videos verticales (shorts) a partir de videos horizontales, usando inteligencia artificial.

## 📋 Descripción

ClipFlow es una aplicación web que permite a startups, pymes y emprendedores generar automáticamente shorts verticales a partir de sus videos horizontales. El objetivo es maximizar la presencia en redes sociales sin invertir tiempo que debería dedicarse al core del negocio.

El sistema detecta las escenas más relevantes del video original, recorta y adapta el encuadre al formato vertical (9:16) con seguimiento de movimiento, y genera múltiples shorts listos para publicar en plataformas como TikTok, Instagram Reels y YouTube Shorts.

## ✨ Funcionalidades

- 📤 **Upload de videos horizontales** hasta 500MB (MP4, WebM, MOV, AVI)
- 🤖 **Procesamiento automático con IA** — detección de escenas, seguimiento de rostros y recorte inteligente
- 📱 **Conversión a formato vertical 9:16** con soporte GPU (NVIDIA NVENC / AMD AMF)
- 🎙️ **Subtítulos automáticos** generados con Whisper (OpenAI)
- 📊 **Seguimiento del estado** de procesamiento en tiempo real
- ⬇️ **Descarga de shorts** generados directamente desde la app
- 🔐 **Autenticación segura** con JWT via cookies HttpOnly

## 🛠️ Stack Tecnológico

### Frontend
| Tecnología      | Versión | Uso             |
| --------------- | ------- | --------------- |
| React           | 19      | UI              |
| TypeScript      | 5       | Tipado estático |
| Tailwind CSS    | v4      | Estilos         |
| TanStack Query  | v5      | Server state    |
| React Hook Form | —       | Formularios     |
| Zod             | —       | Validaciones    |
| Axios           | —       | HTTP client     |

### Backend Java
| Tecnología        | Versión | Uso                   |
| ----------------- | ------- | --------------------- |
| Spring Boot       | 4.0.3   | API REST              |
| Spring Security   | —       | Autenticación JWT     |
| Spring Data JPA   | —       | ORM                   |
| PostgreSQL        | —       | Base de datos         |
| Redis Streams     | —       | Cola de mensajes      |
| Lombok            | —       | Reducción boilerplate |
| springdoc-openapi | 3.0.1   | Swagger UI / API docs |

### Microservicio Python
| Tecnología       | Uso                            |
| ---------------- | ------------------------------ |
| MediaPipe        | Detección de rostros y objetos |
| OpenCV           | Procesamiento de video         |
| Whisper (OpenAI) | Transcripción y subtítulos     |
| FFmpeg           | Encoding / conversión          |
| PySceneDetect    | Detección de escenas           |
| Redis            | Consumidor de jobs             |

## 🏗️ Arquitectura

```
Frontend (React)
     │
     ▼
Backend Java (Spring Boot)
     │  REST API + Cookie JWT
     │
     ├──► PostgreSQL (usuarios, jobs, outputs)
     │
     └──► Redis Streams
               │
               ▼
         Microservicio Python
         (procesamiento de video con IA)
               │
               ▼
         Redis Streams (resultado)
               │
               ▼
         Backend Java (actualiza estado)
```

## 🚀 Cómo ejecutar el proyecto

### Requisitos previos
- Java 25
- Node.js 18+
- Python 3.10+
- Docker y Docker Compose
- PostgreSQL
- FFmpeg instalado en el sistema

### 1. Clonar el repositorio

```bash
git clone https://github.com/No-Country-simulation/S02-26-Equipo-20-Web-App-Development
cd S02-26-Equipo-20-Web-App-Development
```

### 2. Levantar Redis

```bash
docker compose up -d
```

### 3. Backend Java

Crear la base de datos en PostgreSQL:
```sql
CREATE DATABASE shorts_video_db;
```

Configurar `application.yml` con tus credenciales y ejecutar:
```bash
cd backend
./mvnw spring-boot:run
```

### 4. Microservicio Python

```bash
cd microservice-video
pip install -r requirements.txt
python src/main.py
```

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

La app estará disponible en `http://localhost:5173`

## 🔑 Variables de entorno

### Backend (`application.yml`)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/shorts_video_db
    username: postgres
    password: TU_PASSWORD

jwt:
  secret: TU_SECRET_BASE64
  expiration: 36000000

video:
  storage:
    path: /ruta/donde/guardar/videos
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:8080/api/v1
```

## 👥 Equipo

| Nombre            | Rol      |
| ----------------- | -------- |
| Eduardo Maravilla | Backend  |
| Matías Yurquina   | Backend  |
| Marcos Travaglini | Frontend |

---

*Proyecto desarrollado en el marco de la simulación NoCountry — S02-26*
