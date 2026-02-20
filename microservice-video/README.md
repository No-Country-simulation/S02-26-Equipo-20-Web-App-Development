# Microservicio de conversión de video (horizontal → vertical)

Worker en Python que convierte videos horizontales a formato vertical (9:16, 1080×1920), segmentando el contenido y publicando resultados en Redis.

## Qué hace

- **Conversión a vertical**: adapta el video a 1080×1920 eligiendo automáticamente el modo según la relación de aspecto:
  - **Fit**: si ya es vertical o similar.
  - **Crop**: recorte centrado cuando la pérdida es aceptable.
  - **Blur**: fondo difuminado con contenido centrado cuando el recorte recortaría demasiado.
- **Segmentación**:
  - **Por escenas**: detección de cambios de escena (ContentDetector + AdaptiveDetector) con duración mínima/máxima configurable.
  - **Por tiempo**: división en un número fijo de segmentos de duración similar.
- **Ajuste por voz (VAD)**: usa WebRTC VAD para mover los cortes a zonas de silencio y evitar cortar en medio de frases.
- **Codificación**: FFmpeg con libx264 o, si está disponible, h264_nvenc / h264_amf (GPU).
- **Cola de trabajos**: consume jobs desde Redis Streams (`video-jobs`), procesa con locks distribuidos y heartbeat, y publica resultados en `video-results`.

## Requisitos

- **Python 3** (recomendado 3.10+)
- **Redis** (para streams y locks)
- **FFmpeg** en el PATH (con ffprobe)
- **Windows**: para activar el venv se usa `.venv\Scripts\activate` en lugar de `source .venv/bin/activate`

## Instalación

1. Clonar el repositorio y entrar en la carpeta del proyecto.

2. Crear el archivo de entorno a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

   Editar `.env` y configurar al menos:
   - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` (si aplica), `REDIS_DB`
   - Opcionales: `LOCK_TTL`, `CLAIM_IDLE`, `HEARTBEAT_INTERVAL`, `BLOCK_TIME`, `BATCH_SIZE`

3. Crear el entorno virtual e instalar dependencias:

   ```bash
   python -m venv .venv
   ```

   En Windows (PowerShell o CMD):

   ```bash
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```

   En Linux/macOS:

   ```bash
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

4. Asegurarse de que Redis esté en ejecución y accesible con la configuración de `.env`.

## Ejecución

Desde la **raíz del proyecto**, con el venv activado:

```bash
python src/worker.py
```

El worker se conecta a Redis, crea el consumer group en el stream `video-jobs` y queda esperando mensajes. Cada mensaje debe ser un JSON con el payload de un **VideoJob** (p. ej. `idJob`, `videoPath`, `instructionsVideo` con `withSceneDetector`, `minSceneDuration`, `maxSceneDuration`, `numberOfSegments`, etc.). Los resultados se publican en el stream `video-results` con el formato **VideoResult** (`idJob`, `state`, `videoResultPaths`).

## Estructura del proyecto (principal)

- `src/worker.py` — Punto de entrada del worker (Redis Streams, locks, procesamiento).
- `src/services/` — Lógica de negocio:
  - `video_converter.py` — Orquesta segmentación, filtro y codificación con FFmpeg.
  - `scenes_detector.py` — Detección de escenas y ajuste con VAD.
  - `processor_service.py` — Procesamiento del job y construcción del resultado.
  - `filter.py` — Filtros de escalado/recorte/blur para 1080×1920.
  - `encoder.py` — Elección de codec (libx264 / NVENC / AMF) y parámetros.
  - `video_metadata.py` — Metadatos del video vía ffprobe.
  - `redis_service.py`, `lock_service.py` — Redis y locks distribuidos.
- `src/models/` — Modelos Pydantic: `VideoJob`, `InstructionsVideo`, `VideoResult`.
- `src/config/` — Configuración (p. ej. `RedisConfig` desde variables de entorno).

## Formato de job (resumen)

El backend (p. ej. Java/Spring Boot) envía al stream un mensaje con un payload JSON que se deserializa a:

- `idJob`: identificador del trabajo.
- `videoPath`: ruta absoluta o relativa del archivo de video de entrada.
- `instructionsVideo`:
  - `withSceneDetector`: `true` → segmentación por escenas; `false` → por tiempo.
  - `minSceneDuration` / `maxSceneDuration`: límites de duración por segmento (segundos).
  - `numberOfSegments`: usado cuando `withSceneDetector` es `false`.

Los segmentos resultantes se guardan en una carpeta `{nombre_del_video}_result/` como `segment_1.mp4`, `segment_2.mp4`, etc., y esas rutas se devuelven en `videoResultPaths` del resultado.
