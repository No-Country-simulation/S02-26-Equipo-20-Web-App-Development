import time
from pathlib import Path
from typing import Tuple
from models import VideoJob, VideoOutputResults
from src.services.video_converter import video_converter
from output_converter import get_video_duration_seconds
import cv2
from moviepy import VideoFileClip
import logging
# from output_converter import build_video_output
import numpy as np

logger = logging.getLogger(__name__)


def validate_video_path(video_path: str) -> bool:
    """
    Args:
        video_path: Path del video a validar

    Returns:
        True si es válido
    """

    if not video_path or not video_path.strip():
        logger.error("Video path vacío")
        return False

    logger.debug(f"Video path válido: {video_path}")
    return True


def process_video(job: VideoJob) -> Tuple[bool, VideoOutputResults]:
    """
    Procesa un video según las instrucciones proporcionadas

    Args:
        job: VideoJob con la información del video a procesar

    Returns:
        Tuple (success: bool, result: VideoResult)
    """
    logger.info(f"Iniciando procesamiento de job: {job.id_job}")
    logger.info(f"Video path: {job.video_path}")
    logger.info(f"   - With Scene detector: {job.instructions_video.with_scene_detector}")
    logger.info(f"   - Seguir cara: {job.instructions_video.is_follow_face}")
    logger.info(f"   - Duración escena mín: {job.instructions_video.min_scene_duration}s")
    logger.info(f"   - Duración escena máx: {job.instructions_video.max_scene_duration}s")
    logger.info(f"   - Número de segmentos: {job.instructions_video.number_of_segments}")

    start_time = time.time()

    try:
        # Generar paths simulados de videos resultantes
        videos = video_converter(job)

        elapsed = time.time() - start_time
        logger.info(f"Procesamiento completado en {elapsed:.2f}s")
        logger.info(f"Videos generados: {len(videos)}")

        result = VideoOutputResults(
            idJob=job.id_job,
            baseVideoDurationSeconds=get_video_duration_seconds(Path(job.video_path)),
            state="done",
            videos=videos
        )

        return True, result

    except Exception as e:
        elapsed = time.time() - start_time
        logger.error(f"Error procesando video después de {elapsed:.2f}s: {e}")

        # Crear resultado de fallo
        result = VideoOutputResults(
            idJob=job.id_job,
            state="failed",
            baseVideoDurationSeconds=0,
            videos=[]
        )

        return False, result

#NUEVO
def process_with_smart_crop(job: VideoJob) -> Tuple[bool, VideoOutputResults]:

    start_time = time.time()

    try:
        # 1. Cargar el video original
        clip = VideoFileClip(job.video_path)
        ancho_orig, alto_orig = clip.size

        # Definir el nuevo ancho (Relación 9:16)
        ancho_target = int(alto_orig * 9 / 16)
        print(f"Original: {ancho_orig}x{alto_orig} -> Destino: {ancho_target}x{alto_orig}")

        # 2. Función de procesamiento de cada frame
        def procesar_frame(frame):
            # Convertir a gris para detectar el peso visual (acción)
            gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
            m = cv2.moments(gray)

            if m["m00"] != 0:
                centro_x = int(m["m10"] / m["m00"])
            else:
                centro_x = ancho_orig // 2

            # Ajustar el centro para no salirnos de los bordes
            centro_x = max(ancho_target // 2, min(centro_x, ancho_orig - ancho_target // 2))

            x1 = centro_x - (ancho_target // 2)
            x2 = x1 + ancho_target

            # IMPORTANTE: Extraemos solo la porción central y hacemos una copia limpia
            return np.ascontiguousarray(frame[:, x1:x2])

        nuevo_clip = clip.image_transform(procesar_frame).resized(width=ancho_target, height=alto_orig)

        clip.close()
        nuevo_clip.close()

        videos = video_converter(job)

        result = VideoOutputResults(
            idJob=job.id_job,
            baseVideoDurationSeconds=get_video_duration_seconds(Path(job.video_path)),
            state="done",
            videos=videos
        )

        return True, result

    except Exception as e:
        elapsed = time.time() - start_time
        logger.error(f"Error procesando video después de {elapsed:.2f}s: {e}")

        # Crear resultado de fallo
        result = VideoOutputResults(
            idJob=job.id_job,
            state="failed",
            baseVideoDurationSeconds=0,
            videos=[]
        )

        return False, result

 #no hace nada
def ProcessorService():
    return

