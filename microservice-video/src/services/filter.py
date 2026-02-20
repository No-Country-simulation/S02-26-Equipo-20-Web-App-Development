def build_filter(metadata, use_gpu=False):

    mode = choose_mode(metadata)

    if use_gpu:
        scale = "scale_cuda"
        upload = "hwupload_cuda"
        download = "hwdownload"
    else:
        scale = "scale"
        upload = ""
        download = ""

    # ---------- FIT ----------
    if mode == "fit":

        if use_gpu:
            return (
                f"[0:v]{upload},{scale}=1080:1920:"
                f"force_original_aspect_ratio=decrease,{download}"
            )
        else:
            return (
                "scale=1080:1920:"
                "force_original_aspect_ratio=decrease"
            )

    # ---------- CROP ----------
    if mode == "crop":

        if use_gpu:
            return (
                f"[0:v]{upload},{scale}=1080:1920:"
                f"force_original_aspect_ratio=increase,"
                f"crop=1080:1920,{download}"
            )
        else:
            return (
                "[0:v]scale=1080:1920:"
                "force_original_aspect_ratio=increase,"
                "crop=1080:1920"
            )

    # ---------- BLUR ----------
    # Blur se queda CPU por estabilidad
    if mode == "blur":
        blur = int(metadata["width"] / 40)

        return (
            f"[0:v]scale=1080:1920:"
            f"force_original_aspect_ratio=increase,"
            f"crop=1080:1920,"
            f"boxblur={blur}:1[bg];"
            f"[0:v]scale=1080:1920:"
            f"force_original_aspect_ratio=decrease[fg];"
            f"[bg][fg]overlay=(W-w)/2:(H-h)/2"
        )

    return None



def choose_mode(metadata):
    w = metadata["width"]
    h = metadata["height"]

    if h > w:
        return "fit"

    target_ratio = 9 / 16
    cropped_w = h * target_ratio
    loss = 1 - (cropped_w / w)

    if loss < 0.45:
        return "crop"
    else:
        return "blur"
