import logging
import subprocess
import tempfile
from pathlib import Path

from models import VideoJob
from .video_metadata import get_video_metadata
from .scenes_detector import detect_scenes, create_scenes, adjust_scenes_with_vad, parse_vector_times
from .output_converter import build_video_output
from .filter import build_filter
from .encoder import choose_encoder_settings

logger = logging.getLogger(__name__)


def _concat_segments(segment_files: list[Path], output_file: Path):

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".txt", delete=False, dir=output_file.parent
    ) as f:
        concat_list_path = Path(f.name)
        for seg_file in segment_files:
            safe_path = str(seg_file).replace("'", "'\\''")
            f.write(f"file '{safe_path}'\n")

    logger.info("Concat list written: %s (%d files)", concat_list_path, len(segment_files))

    command = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list_path),
        "-c", "copy",
        "-movflags", "+faststart",
        str(output_file)
    ]

    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        logger.debug("FFmpeg concat stdout: %s", result.stdout)
        logger.info("Concat output created: %s", output_file)
    except subprocess.CalledProcessError as e:
        logger.error("FFmpeg concat failed: %s", e.stderr)
        raise
    finally:
        concat_list_path.unlink(missing_ok=True)


def video_converter(video_job: VideoJob):
    logger.info("VIDEO_CONVERTER_START")
    logger.info("Instructions: %s", video_job.instructions_video.model_dump())

    input_video = Path(video_job.video_path)

    if not input_video.exists():
        logger.error("Input video not found: %s", input_video)
        raise FileNotFoundError(input_video)

    info_video = get_video_metadata(input_video)

    logger.info(
        "Video metadata | duration=%.2f width=%s height=%s codec=%s",
        info_video["duration"],
        info_video["width"],
        info_video["height"],
        info_video["codec"],
    )

    output_dir = input_video.parent / f"{input_video.stem}_result"
    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info("Output directory: %s", output_dir)

    instructions = video_job.instructions_video

    try:
        if instructions.choose_times and instructions.vector_times:
            logger.info("Segmentation strategy: VECTOR_TIMES")
            segments = parse_vector_times(instructions.vector_times, info_video["duration"])
            logger.info("Parsed %d segments from vector_times", len(segments))

        elif instructions.with_scene_detector:
            logger.info("Segmentation strategy: SCENE_DETECTION")
            segments = detect_scenes(
                input_video,
                min_scene_duration=instructions.min_scene_duration,
                max_scene_duration=instructions.max_scene_duration,
                duration=info_video["duration"],
            )

        else:
            logger.info("Segmentation strategy: TIME_BASED")
            segments = create_scenes(
                segments_requested=instructions.number_of_segments,
                duration=info_video["duration"]
            )


        logger.info(segments)
        segments = adjust_scenes_with_vad(input_video, segments)
        logger.info(segments)

    except Exception:
        logger.exception("Failed generating segments")
        raise

    if not segments:
        logger.error("Segmentation produced no segments")
        raise RuntimeError("No segments generated")

    logger.info("Total segments generated: %d", len(segments))

    # ── Encoding ─────────────────────────────────────────────────────────────
    encoder, encoder_flags = choose_encoder_settings(info_video)
    use_gpu = encoder in ("h264_nvenc", "h264_amf")
    filter_complex = build_filter(metadata=info_video, use_gpu=use_gpu)

    logger.info("Selected encoder: %s | GPU: %s", encoder, use_gpu)

    if not filter_complex:
        logger.error("Failed to build filter_complex")
        raise RuntimeError("Invalid filter_complex")

    # ── Procesar cada segmento ────────────────────────────────────────────────
    segment_files: list[Path] = []

    for i, (start, end) in enumerate(segments):
        length = end - start

        if length <= 0:
            logger.warning("Skipping invalid segment length: %.3f", length)
            continue

        output_file = output_dir / f"segment_{i + 1}.mp4"

        logger.info(
            "Processing segment %d | start=%.2f end=%.2f length=%.2f",
            i + 1, start, end, length
        )

        command = [
            "ffmpeg", "-y",
            "-ss", str(start),
            "-i", str(input_video),
            "-t", str(length),
            "-filter_complex", filter_complex,
            "-c:v", encoder,
            *encoder_flags,
            "-c:a", "copy",
            "-movflags", "+faststart",
            str(output_file)
        ]

        if logger.isEnabledFor(logging.DEBUG):
            logger.debug("FFmpeg command: %s", " ".join(command))

        try:
            result = subprocess.run(command, capture_output=True, text=True, check=True)
            logger.debug("FFmpeg stdout: %s", result.stdout)
            logger.info("Segment created: %s", output_file)
            segment_files.append(output_file)
        except subprocess.CalledProcessError as e:
            logger.error("FFmpeg failed for segment %d | stderr: %s", i + 1, e.stderr)
            raise

    # ── Join: concatenar todos los segmentos en uno solo ─────────────────────
    if instructions.join_times and instructions.choose_times and len(segment_files) > 1:
        logger.info("JOIN_TIMES enabled — concatenating %d segments", len(segment_files))

        joined_file = output_dir / "joined_output.mp4"
        _concat_segments(segment_files, joined_file)

        # Eliminar segmentos individuales, solo se entrega el joined
        for seg_file in segment_files:
            seg_file.unlink(missing_ok=True)
            logger.debug("Removed intermediate segment: %s", seg_file)

        joined_output = build_video_output(joined_file)
        logger.info("VIDEO_CONVERTER_COMPLETE | mode=JOINED | file=%s", joined_file)
        return [joined_output]

    # ── Sin join: devolver segmentos individuales ─────────────────────────────
    outputs = [build_video_output(f) for f in segment_files]
    logger.info("VIDEO_CONVERTER_COMPLETE | mode=SEGMENTS | files=%d", len(outputs))
    return outputs