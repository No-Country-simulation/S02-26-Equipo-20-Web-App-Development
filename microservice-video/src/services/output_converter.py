import subprocess
from pathlib import Path

from models import VideoOutput


def get_video_duration_seconds(path: Path) -> int:
    """Obtiene duración del video en segundos usando ffprobe"""
    command = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(path)
    ]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True,
        check=True
    )

    duration = float(result.stdout.strip())
    return int(duration)


def build_video_output(path: Path) -> VideoOutput:
    """Construye el objeto VideoOutput a partir de un archivo"""

    size_bytes = path.stat().st_size
    duration_seconds = get_video_duration_seconds(path)

    return VideoOutput(
        fileName=path.name,
        path=str(path),
        durationSeconds=duration_seconds,
        videoSizeBytes=size_bytes
    )