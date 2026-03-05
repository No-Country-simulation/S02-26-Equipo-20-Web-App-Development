import subprocess
import platform

ENCODER_CACHE = None


def _is_windows():
    return platform.system() == "Windows"


def _check_cuda():
    """Verifica disponibilidad de CUDA según el SO."""
    if _is_windows():
        result = subprocess.run(
            ["nvidia-smi"],
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    else:
        result = subprocess.run(
            ["ldconfig", "-p"],
            capture_output=True,
            text=True
        )
        return "libcuda.so.1" in result.stdout


def _check_amf():
    """Verifica disponibilidad de AMF según el SO."""
    if _is_windows():
        result = subprocess.run(
            ["where", "amf-encoder-demo"],
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    else:
        result = subprocess.run(
            ["ldconfig", "-p"],
            capture_output=True,
            text=True
        )
        return "libamf.so" in result.stdout


def detect_encoder():
    global ENCODER_CACHE

    if ENCODER_CACHE:
        return ENCODER_CACHE

    result = subprocess.run(
        ["ffmpeg", "-encoders"],
        capture_output=True,
        text=True
    )
    encoders = result.stdout

    if "h264_nvenc" in encoders and _check_cuda():
        ENCODER_CACHE = "h264_nvenc"
    elif "h264_amf" in encoders and _check_amf():
        ENCODER_CACHE = "h264_amf"
    else:
        ENCODER_CACHE = "libx264"

    return ENCODER_CACHE

def resolution_tier(metadata):
    w = metadata["width"]
    h = metadata["height"]

    pixels = w * h

    if pixels >= 3840 * 2160:
        return "4k"
    if pixels >= 1920 * 1080:
        return "1080"
    return "low"


def nvenc_flags(tier):
    mapping = {
        "4k": ["-preset", "p5", "-cq", "23"],
        "1080": ["-preset", "p4", "-cq", "21"],
        "low": ["-preset", "p3", "-cq", "19"],
    }
    return mapping[tier] + ["-rc", "vbr"]


def amf_flags(tier):
    mapping = {
        "4k": ["-quality", "balanced"],
        "1080": ["-quality", "speed"],
        "low": ["-quality", "speed"],
    }
    return mapping[tier]


def x264_flags(tier):
    mapping = {
        "4k": ["-preset", "slow", "-crf", "23"],
        "1080": ["-preset", "medium", "-crf", "22"],
        "low": ["-preset", "fast", "-crf", "21"],
    }
    return mapping[tier]

def choose_encoder_settings(meta):
    encoder = detect_encoder()
    tier = resolution_tier(meta)

    providers = {
        "h264_nvenc": nvenc_flags,
        "h264_amf": amf_flags,
        "libx264": x264_flags,
    }

    flags = providers[encoder](tier)

    return encoder, flags
