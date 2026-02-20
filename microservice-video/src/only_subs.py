import os
import sys

# 1. CONFIGURACIÓN DE RUTAS (Ajusta estas rutas a tus carpetas reales)
IMAGEMAGICK_PATH = r"C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe"
FFMPEG_BIN_PATH = r"C:\ffmpeg\bin"
VIDEO_INPUT = "vertical_bjj.mp4"  # Asegúrate que este archivo esté en la carpeta del proyecto
VIDEO_OUTPUT = "video_con_subtitulos.mp4"

# Configurar variables de entorno antes de importar MoviePy
os.environ["IMAGEMAGICK_BINARY"] = IMAGEMAGICK_PATH
os.environ["PATH"] += os.pathsep + FFMPEG_BIN_PATH

try:
    import whisper
    from moviepy import VideoFileClip, TextClip, CompositeVideoClip
except ImportError as e:
    print(f"Error: Te falta instalar una librería. Ejecuta: pip install openai-whisper moviepy")
    sys.exit()


def generar_video():
    print("--- Iniciando proceso ---")

    # 2. ESCUCHAR EL VIDEO (Whisper)
    print("Escuchando audio con Whisper (esto puede tardar)...")
    model = whisper.load_model("medium")  # El modelo 'base' es el equilibrio ideal

    # fp16=False es vital si no tienes una tarjeta de video dedicada (GPU)
    result = model.transcribe(VIDEO_INPUT, fp16=False)
    print("Transcripción completada.")

    # 3. PROCESAR EL VIDEO (MoviePy)
    video = VideoFileClip(VIDEO_INPUT)
    clips_de_texto = []

    print("Generando clips de texto...")

    for segment in result['segments']:
        # 1. Calculamos dimensiones seguras (enteros)
        ancho_texto = int(video.w * 0.85)  # Un poco más ancho para dar espacio
        alto_texto = int(video.h * 0.2)  # Le damos un 20% de la altura del video como margen

        txt = (TextClip(
            text=segment['text'].strip(),
            font_size=15,
            color='white',
            font=r"C:\Windows\Fonts\arialbd.ttf",
            stroke_color='black',
            stroke_width=1.5,
            method='caption',
            size=(ancho_texto, alto_texto),  # Definimos ancho y alto fijos
            horizontal_align='center',  # Centra el texto dentro del cuadro
            vertical_align='center'
        )
               .with_start(segment['start'])
               .with_duration(segment['end'] - segment['start'])
               # 2. POSICIÓN: 'center' para X, y 0.85 para Y (bien abajo)
               .with_position(('center', int(video.h * 0.85))))

        clips_de_texto.append(txt)

    # 4. MEZCLAR Y GUARDAR
    print(f"Renderizando video final: {VIDEO_OUTPUT}...")
    video_final = CompositeVideoClip([video] + clips_de_texto)

    # Usamos el codec libx264 que es el más compatible
    video_final.write_videofile(VIDEO_OUTPUT, codec="libx264", audio_codec="aac")

    print("--- ¡Proceso finalizado con éxito! ---")


if __name__ == "__main__":
    # Verificación rápida de archivo
    if not os.path.exists(VIDEO_INPUT):
        print(f"Error: No encuentro el archivo {VIDEO_INPUT}")
    else:
        generar_video()