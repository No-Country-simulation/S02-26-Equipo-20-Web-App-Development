import logging
import time
from pathlib import Path
from typing import Tuple
from models import VideoJob, VideoOutputResults
from .video_converter import video_converter
from .output_converter import get_video_duration_seconds

logger = logging.getLogger(__name__)


def validate_video_path(video_path: str) -> bool:
    """
    Válida que el path del video sea válido

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
            videos=[]
        )

        return False, result


class ProcessorService:
    """Servicio para procesar videos (simulado por ahora)"""
