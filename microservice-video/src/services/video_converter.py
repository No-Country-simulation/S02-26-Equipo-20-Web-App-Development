import logging
import subprocess
from pathlib import Path

from sympy import false, true

from models import VideoJob
from .video_metadata import get_video_metadata
from .scenes_detector import detect_scenes,create_scenes,adjust_scenes_with_vad
from .output_converter import build_video_output
from .filter import build_filter
from .encoder import choose_encoder_settings
from smart_crop_processor import process_with_smart_crop

logger = logging.getLogger(__name__)

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

    segments=[]
    output_path=""

    try:
        #MULTIPLES VIDEOS, SOLO GIRO VERTICAL
        if video_job.instructions_video.with_scene_detector and video_job.instructions_video.is_follow_face==false: #DIVIDE EN X PARTES, NO CORTA VERTICALMENTE
            logger.info("Segmentation strategy: SCENE_DETECTION - CORTAR VIDEOS")

            segments = detect_scenes( # 1 - 30, 30 - 50
                input_video,
                min_scene_duration=video_job.instructions_video.min_scene_duration,
                max_scene_duration=video_job.instructions_video.max_scene_duration,
                duration=info_video["duration"],
            )
        #VIDEO SIMPLE, SOLO GIRO VERTICAL
        elif video_job.instructions_video.with_scene_detector==false and video_job.instructions_video.is_follow_face == false:

            logger.info("Segmentation strategy: TIME BASED VIDEO SIMPLE - SOLO GIRAR VIDEO")
            segments = create_scenes(
                segments_requested=0,
                duration=info_video["duration"]
            )

            output_path = str(Path(output_dir) / f"follow_face_{video_job.id_job}.mp4")

        else:  # UN SOLO VIDEO CORTAR VERTICAL / SIGUE OBJETOS

            logger.info("Segmentation strategy: TIME_BASED")
            # video simple cortado vertical
            if video_job.instructions_video.with_scene_detector==false and video_job.instructions_video.is_follow_face:

                logger.info("Usando modo FOLLOW FACE con SmartCrop VIDEO SIMPLE")

                input_path = video_job.video_path
                output_path = str(Path(output_dir) / f"follow_face_{video_job.id_job}.mp4")
                process_with_smart_crop(input_path, output_path)
                return [build_video_output(Path(output_path))]

            # multiples videos, cortado vertical
            else:  # MULTIPLES VIDEOS CORTAR VERTICAL / SIGUE OBJETOS

                #NUEVO
                logger.info("Usando modo FOLLOW FACE con SmartCrop VIDEO MULTIPLE")

                input_path = video_job.video_path
                output_path = str(Path(output_dir) / f"follow_face_{video_job.id_job}.mp4")
                process_with_smart_crop(input_path, output_path)

                #Para que haga el segmento a partir del nuevo video
                input_video=output_path

                segments = detect_scenes(  # 1 - 30, 30 - 50
                    output_path,
                    min_scene_duration=video_job.instructions_video.min_scene_duration,
                    max_scene_duration=video_job.instructions_video.max_scene_duration,
                    duration=info_video["duration"],
                )

                segments = adjust_scenes_with_vad(output_path, segments)


    except Exception:
        logger.exception("Failed generating segments")
        raise

    if not segments:
        logger.error("Segmentation produced no segments")
        raise RuntimeError("No segments generated")

    logger.info("Total segments generated: %d", len(segments))

    encoder, encoder_flags = choose_encoder_settings(info_video)

    logger.info("Encoder initialized once for all segments")
    logger.info("Selected encoder: %s", encoder)
    logger.info("Encoder flags: %s", encoder_flags)

    use_gpu = encoder in ("h264_nvenc", "h264_amf")
    filter_complex = build_filter(metadata=info_video, use_gpu=use_gpu)

    if not filter_complex:
        logger.error("Failed to build filter_complex")
        raise RuntimeError("Invalid filter_complex")

    outputs = []

    for i, (start, end) in enumerate(segments):

        length = end - start

        if length <= 0:
            logger.warning("Skipping invalid segment length: %.3f", length)
            continue

        output_file = output_dir / f"segment_{i + 1}.mp4"

        logger.info(
            "Processing segment %d | start=%.2f end=%.2f length=%.2f",
            i + 1,
            start,
            end,
            length
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
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                check=True
            )

            logger.debug("FFmpeg stdout: %s", result.stdout)
            logger.info("Segment created: %s", output_file)

        except subprocess.CalledProcessError as e:
            logger.error("FFmpeg failed for segment %d", i + 1)
            logger.error("stderr: %s", e.stderr)
            raise

        video_output = build_video_output(output_file)
        outputs.append(video_output)


    logger.info("VIDEO_CONVERTER_COMPLETE | files=%d", len(outputs))

    return outputs

