import os

import cv2
import imageio_ffmpeg
import mediapipe as mp
import whisper
from mediapipe.tasks import python
from mediapipe.tasks.python import vision
from moviepy import VideoFileClip

# Esto localiza el ffmpeg que acabamos de instalar con pip
ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
os.environ["PATH"] += os.pathsep + os.path.dirname(ffmpeg_path)

# Configuración de ImageMagick (que ya tenías)
os.environ["IMAGEMAGICK_BINARY"] = r"C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe"

# RUTA DE FFmpeg: Pon aquí la ruta de la carpeta 'bin' que descargaste
# O si lo pegaste en tu proyecto, usa '.'
os.environ["PATH"] += os.pathsep + r"C:\ruta\donde\esta\tu\ffmpeg\bin"

# --- 1. CONFIGURACIÓN GPU ---
base_path = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_path, 'efficientdet_lite0.tflite')
input_video = os.path.join(base_path, 'video_horizontal4.mp4')
temp_video = os.path.join(base_path, 'temp_mudo.mp4')
output_final = os.path.join(base_path, 'VIDEO_FINAL_GPU.mp4')

# Configurar MediaPipe para usar GPU (NVIDIA via DirectML/CUDA)
base_options = python.BaseOptions(
    model_asset_path=model_path,
    delegate=python.BaseOptions.Delegate.GPU  # <-- Activa GPU
)
options = vision.ObjectDetectorOptions(base_options=base_options, score_threshold=0.3)
detector = vision.ObjectDetector.create_from_options(options)

cap = cv2.VideoCapture(input_video)
w, h = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
fps = cap.get(cv2.CAP_PROP_FPS)
final_w = int(h * 9 / 16)

# Encoder para Windows (H264)
out = cv2.VideoWriter(temp_video, cv2.VideoWriter_fourcc(*'mp4v'), fps, (final_w, h))

# Suavizado
smooth_center_x, smooth_fov_h = w // 2, h
alpha = 0.03

print("Procesando con aceleración NVIDIA...")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret: break

    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    res = detector.detect(mp_image)

    # Lógica de detección (limpia)
    if res.detections:
        min_x, max_x, min_y, max_y = w, 0, h, 0
        for det in res.detections:
            bbox = det.bounding_box
            min_x, max_x = min(min_x, bbox.origin_x), max(max_x, bbox.origin_x + bbox.width)
            min_y, max_y = min(min_y, bbox.origin_y), max(max_y, bbox.origin_y + bbox.height)

        target_center_x = (min_x + max_x) // 2
        target_fov_h = max(h * 0.4, min(h, (max_y - min_y) * 1.8, ((max_x - min_x) * 1.8) * (16 / 9)))
    else:
        target_center_x, target_fov_h = w // 2, h

    smooth_center_x = int(alpha * target_center_x + (1 - alpha) * smooth_center_x)
    smooth_fov_h = int(alpha * target_fov_h + (1 - alpha) * smooth_fov_h)

    start_x = max(0, min(w - int(smooth_fov_h * 9 / 16), smooth_center_x - int(smooth_fov_h * 9 / 16) // 2))
    cropped = frame[int((h - smooth_fov_h) // 2):int((h + smooth_fov_h) // 2), int(start_x):int(
        start_x + int(smooth_fov_h * 9 / 16))]

    final_frame = cv2.resize(cropped, (final_w, h))
    out.write(final_frame)

    # EVITAR QUE SE CONGELE: cv2.pollKey() o waitKey(1) mantienen viva la ventana
    cv2.imshow('Procesando...', cv2.resize(final_frame, (final_w // 2, h // 2)))
    if cv2.waitKey(1) & 0xFF == ord('q'): break

cap.release()
out.release()
cv2.destroyAllWindows()

# --- 2. EXPORTACIÓN FINAL CON NVIDIA (NVENC) ---
print("Renderizando audio con NVIDIA NVENC...")
try:
    with VideoFileClip(input_video) as clip_orig, VideoFileClip(temp_video) as clip_vert:
        final = clip_vert.with_audio(clip_orig.audio) if clip_orig.audio else clip_vert
        # Usamos h264_nvenc para que la placa NVIDIA haga el trabajo pesado
        final.write_videofile(output_final, codec="h264_nvenc", audio_codec="aac", bitrate="5000k")
    os.remove(temp_video)
    print("¡Listo!")
except Exception as e:
    print(f"Error en renderizado final: {e}")

model = whisper.load_model("base") # 'base' es rápido, 'medium' es más preciso
result = model.transcribe("video_vertical.mp4")

video = VideoFileClip("video_vertical.mp4")
clips_de_texto = []

# 2. Convertimos lo que escuchó en clips de MoviePy

