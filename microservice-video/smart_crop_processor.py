import cv2
import numpy as np
from moviepy import VideoFileClip
from pathlib import Path

base_path = Path(__file__).parent

def process_with_smart_crop(input_path, output_path):
    # 1. Cargar el video original
    clip = VideoFileClip(input_path)
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

    # 4. Guardar el archivo final
    # Usamos 'preset="ultrafast"' para que no tarde tanto en procesar
    nuevo_clip.write_videofile(
        output_path,
        codec="libx264",
        audio_codec="aac",
        fps=clip.fps,
        preset="ultrafast"
    )

    clip.close()
    nuevo_clip.close()


if __name__ == "__main__":
    video_in = str(base_path / 'video_horizontal2.mp4')
    video_out = str(base_path / 'video_vertical_output.mp4')

    process_with_smart_crop(video_in, video_out)