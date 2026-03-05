from scenedetect import SceneManager, open_video
from scenedetect.detectors import ContentDetector, AdaptiveDetector
import webrtcvad
import subprocess


def parse_vector_times(vector_times: str, video_duration: float) -> list[tuple[float, float]]:
    """
    Convierte el string normalizado "ss-ss,ss-ss,..." a lista de tuplas (start, end).
    El string ya viene validado y normalizado desde Java (todos en segundos).

    - Si end supera la duración real del video, se ajusta a video_duration.
    - Si start supera la duración real del video, el segmento se descarta.

    Ejemplo:
        "1-50,60-99999" con duration=120 → [(1.0, 50.0), (60.0, 120.0)]
    """
    segments = []
    for part in vector_times.split(","):
        part = part.strip()
        if not part:
            continue
        start_str, end_str = part.split("-")
        start = float(start_str.strip())
        end = float(end_str.strip())

        if start >= video_duration:
            continue

        end = min(end, video_duration)
        segments.append((start, end))

    return segments


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

    # ---- Merge escenas más cortas que min_scene_duration ----
    # Pasada hacia adelante: acumula escenas cortas fusionándolas con la siguiente
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

    # Pasada hacia atrás: si la ÚLTIMA escena quedó corta, fusionarla con la anterior
    if len(merged) > 1 and (merged[-1][1] - merged[-1][0]) < float(min_scene_duration):
        prev_start, _ = merged[-2]
        last_end = merged[-1][1]
        merged = merged[:-2] + [(prev_start, last_end)]

    # ---- Dividir escenas más largas que max_scene_duration ----
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


MIN_SCENE_DURATION = 5.0


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



def _merge_short_segments(
        segments: list[tuple[float, float]],
        min_duration: float
) -> list[tuple[float, float]]:
    """
    Fusiona segmentos contiguos que quedaron por debajo de min_duration
    con su vecino anterior. Pasada hacia adelante + corrección del último.
    Se usa como limpieza post-VAD para evitar segmentos residuales muy cortos.
    """
    if not segments:
        return segments

    merged = [list(segments[0])]

    for start, end in segments[1:]:
        prev = merged[-1]
        if (prev[1] - prev[0]) < min_duration:
            # El anterior es muy corto: extenderlo absorbiendo el actual
            prev[1] = end
        else:
            merged.append([start, end])

    # Corrección del último: si quedó corto, fusionar con el anterior
    if len(merged) > 1 and (merged[-1][1] - merged[-1][0]) < min_duration:
        merged[-2][1] = merged[-1][1]
        merged.pop()

    return [(s, e) for s, e in merged]


def adjust_scenes_with_vad(
        video_path,
        scenes,
        aggressiveness=2,
        frame_ms=30,
        max_shift=3.0
):
    """
    Ajusta las fronteras de cada segmento buscando el silencio más cercano.

    IMPORTANTE: cuando los segmentos tienen gaps entre ellos (ej: vector_times),
    cada segmento se procesa de forma independiente para no unir tiempos
    que el usuario dejó separados intencionalmente.
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
        frame = raw_audio[i:i + bytes_per_frame]
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

    # ---- 5. Detectar si los segmentos son estrictamente contiguos ----
    # Solo son contiguos si cada inicio coincide exactamente (tolerancia 0.1s)
    # con el fin del anterior. Solapados o con gaps → independientes.
    def segments_are_contiguous(segs: list[tuple[float, float]]) -> bool:
        for i in range(len(segs) - 1):
            gap = segs[i + 1][0] - segs[i][1]
            if abs(gap) > 0.1:   # gap real o solapamiento → NO contiguos
                return False
        return True

    # ---- 6. Función para encontrar silencio más cercano dentro de un rango ----
    def find_closest_silence(boundary: float, search_start: float, search_end: float) -> float:
        """
        Busca el silencio más cercano a boundary, restringido al rango
        [search_start, search_end] para no salirse del segmento actual.
        """
        closest_point = boundary
        min_distance = float("inf")

        for s_start, s_end in silences:
            silence_center = (s_start + s_end) / 2

            # El silencio debe estar dentro del rango permitido
            if silence_center < search_start or silence_center > search_end:
                continue

            distance = abs(silence_center - boundary)
            if distance < min_distance and distance <= max_shift:
                min_distance = distance
                closest_point = silence_center

        return closest_point

    # ---- 7a. Segmentos CONTIGUOS: ajuste global de fronteras compartidas ----
    if segments_are_contiguous(scenes):
        new_boundaries = [scenes[0][0]]

        for i, (start, end) in enumerate(scenes[:-1]):
            next_start = scenes[i + 1][0]
            search_start = (start + end) / 2
            search_end = (next_start + scenes[i + 1][1]) / 2
            adjusted = find_closest_silence(end, search_start, search_end)
            new_boundaries.append(adjusted)

        new_boundaries.append(scenes[-1][1])

        adjusted_segments = []
        for i in range(len(new_boundaries) - 1):
            seg_start = new_boundaries[i]
            seg_end = new_boundaries[i + 1]
            if seg_end > seg_start:
                adjusted_segments.append((seg_start, seg_end))
            else:
                adjusted_segments.append(scenes[i])

        # ---- Post-VAD: el VAD puede mover fronteras y dejar segmentos muy cortos.
        # Se fusionan los que quedaron por debajo de min_duration con su vecino anterior.
        adjusted_segments = _merge_short_segments(adjusted_segments, min_duration=max_shift * 2)

        return adjusted_segments

    # ---- 7b. Segmentos con GAPS (ej: vector_times): ajuste independiente por segmento ----
    adjusted_segments = []

    for seg_start, seg_end in scenes:
        # Solo ajustar la frontera de fin; el inicio lo eligió el usuario
        # Rango de búsqueda: segunda mitad del segmento para no adelantar el corte demasiado
        search_start = (seg_start + seg_end) / 2
        search_end = seg_end

        new_end = find_closest_silence(seg_end, search_start, search_end)

        if new_end > seg_start:
            adjusted_segments.append((seg_start, new_end))
        else:
            adjusted_segments.append((seg_start, seg_end))

    return adjusted_segments