import subprocess

ENCODER_CACHE = None


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

    # NVENC
    if "h264_nvenc" in encoders:
        cuda_check = subprocess.run(
            ["ldconfig", "-p"], capture_output=True, text=True
        )
        if "libcuda.so.1" in cuda_check.stdout:
            ENCODER_CACHE = "h264_nvenc"
        else:
            ENCODER_CACHE = "libx264"
    # AMF (AMD)
    elif "h264_amf" in encoders:
        # opcional: intentar verificar librerías AMD si quieres
        # si no hay librerías, caer a libx264
        amf_check = subprocess.run(
            ["ldconfig", "-p"], capture_output=True, text=True
        )
        if "libamf.so" in amf_check.stdout:
            ENCODER_CACHE = "h264_amf"
        else:
            ENCODER_CACHE = "libx264"
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
