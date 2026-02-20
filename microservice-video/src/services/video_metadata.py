import subprocess
import json
from pathlib import Path


def _parse_fps(value: str) -> float:
    if not value:
        return 0.0

    if "/" in value:
        num, den = value.split("/")
        den = float(den)
        return float(num) / den if den != 0 else 0.0

    return float(value)


def get_video_metadata(video_path: Path) -> dict:
    result = subprocess.run(
        [
            "ffprobe",
            "-v", "error",
            "-show_entries",
            "format=duration,bit_rate,size",
            "-show_entries",
            "stream=width,height,codec_name,r_frame_rate",
            "-of", "json",
            str(video_path)
        ],
        capture_output=True,
        text=True,
        check=True
    )

    data = json.loads(result.stdout)

    format_info = data.get("format", {})
    streams = data.get("streams", [])

    video_stream = next(
        (s for s in streams if "width" in s),
        {}
    )

    width = int(video_stream.get("width") or 1920)
    height = int(video_stream.get("height") or 1080)
    fps = _parse_fps(video_stream.get("r_frame_rate"))

    return {
        "duration": float(format_info.get("duration") or 0),
        "bitrate": int(format_info.get("bit_rate") or 0),
        "size_bytes": int(format_info.get("size") or 0),

        "width": width,
        "height": height,
        "codec": video_stream.get("codec_name") or "unknown",
        "fps": fps,
    }