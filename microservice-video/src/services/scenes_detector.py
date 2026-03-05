from scenedetect import SceneManager, open_video
from scenedetect.detectors import ContentDetector, AdaptiveDetector
import webrtcvad
import subprocess

def detect_scenes(
        video_path,
        min_scene_duration,
        max_scene_duration,
        duration=0.1,
        threshold=30.0
):
    video_source = open_video(str(video_path))
    scene_manager = SceneManager()
    scene_manager.add_detector(ContentDetector(threshold=threshold))
    scene_manager.add_detector(AdaptiveDetector())

    scene_manager.detect_scenes(video_source)
    scenes = scene_manager.get_scene_list()

    raw_segments = [
        (start.get_seconds(), end.get_seconds())
        for start, end in scenes
    ]

    if not raw_segments:
        raw_segments = [(0, duration)]

    merged = []
    cur_start, cur_end = raw_segments[0]

    for start, end in raw_segments[1:]:
        cur_length = cur_end - cur_start

        if cur_length < float(min_scene_duration):

            cur_end = end
        else:
            merged.append((cur_start, cur_end))
            cur_start, cur_end = start, end

    merged.append((cur_start, cur_end))

    processed = []

    for start, end in merged:
        length = end - start

        if 0 < max_scene_duration < length:
            cur = start
            while cur < end:
                new_end = min(cur + max_scene_duration, end)
                processed.append((cur, new_end))
                cur = new_end
        else:
            processed.append((start, end))

    return processed

MIN_SCENE_DURATION = 15.0

def create_scenes(segments_requested: int, duration: float):

    if segments_requested == 0:
        return [(0.0, duration)]

    max_segments = int(duration // MIN_SCENE_DURATION)

    if max_segments == 0:
        return [(0.0, duration)]

    segments = min(segments_requested, max_segments)

    seg_len = duration / segments

    scenes = []
    start = 0.0

    for i in range(segments):
        end = start + seg_len

        if i == segments - 1:
            end = duration

        scenes.append((start, end))
        start = end

    return scenes


def adjust_scenes_with_vad(
        video_path,
        scenes,
        aggressiveness=2,
        frame_ms=30,
        max_shift=3.0
):
    """
    Ajusta las fronteras de segmentos usando el silencio más cercano.
    Reconstruye los segmentos globalmente para evitar cortes en medio de voz.
    """

    # ---- 1. Extraer audio PCM mono 16kHz ----
    cmd = [
        "ffmpeg", "-i", str(video_path),
        "-ac", "1",
        "-ar", "16000",
        "-f", "s16le",
        "-"
    ]

    proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    raw_audio = proc.stdout
    sample_rate = 16000

    # ---- 2. Inicializar VAD ----
    vad = webrtcvad.Vad(aggressiveness)
    bytes_per_frame = int(sample_rate * frame_ms / 1000) * 2

    voiced_frames = []

    for i in range(0, len(raw_audio), bytes_per_frame):
        frame = raw_audio[i:i+bytes_per_frame]
        if len(frame) < bytes_per_frame:
            break

        t_start = i / (2 * sample_rate)
        t_end = t_start + frame_ms / 1000

        if vad.is_speech(frame, sample_rate):
            voiced_frames.append((t_start, t_end))

    if not voiced_frames:
        return scenes

    # ---- 3. Merge bloques de voz continuos ----
    merged_voiced = []
    cur_start, cur_end = voiced_frames[0]

    for start, end in voiced_frames[1:]:
        if start - cur_end <= 0.05:
            cur_end = end
        else:
            merged_voiced.append((cur_start, cur_end))
            cur_start, cur_end = start, end

    merged_voiced.append((cur_start, cur_end))

    # ---- 4. Construir silencios entre bloques de voz ----
    silences = []

    for i in range(len(merged_voiced) - 1):
        silence_start = merged_voiced[i][1]
        silence_end = merged_voiced[i + 1][0]

        if silence_end > silence_start:
            silences.append((silence_start, silence_end))

    if not silences:
        return scenes

    # ---- 5. Función para encontrar silencio más cercano ----
    def find_closest_silence(boundary):
        closest_point = boundary
        min_distance = float("inf")

        for s_start, s_end in silences:
            silence_center = (s_start + s_end) / 2
            distance = abs(silence_center - boundary)

            if distance < min_distance and distance <= max_shift:
                min_distance = distance
                closest_point = silence_center

        return closest_point

    # ---- 6. Construir nuevas fronteras ----
    new_boundaries = [scenes[0][0]]

    # Primer límite siempre es el inicio real

    # Ajustar cada frontera final de cada segmento
    for start, end in scenes[:-1]:
        adjusted_boundary = find_closest_silence(end)
        new_boundaries.append(adjusted_boundary)

    # Última frontera es el final real del último segmento
    new_boundaries.append(scenes[-1][1])

    # ---- 7. Reconstruir segmentos ----
    adjusted_segments = []

    for i in range(len(new_boundaries) - 1):
        seg_start = new_boundaries[i]
        seg_end = new_boundaries[i + 1]

        # Seguridad básica
        if seg_end > seg_start:
            adjusted_segments.append((seg_start, seg_end))
        else:
            adjusted_segments.append(scenes[i])

    return adjusted_segments