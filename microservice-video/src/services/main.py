import logging
from datetime import datetime
from models import VideoJob, InstructionsVideo
from processor_service import process_with_smart_crop

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)

def build_job(video_path: str, **instructions) -> VideoJob:
    return VideoJob(**{
        "idJob": f"test-job-{datetime.now().strftime('%H%M%S')}",
        "videoPath": video_path,
        "instructionsVideo": InstructionsVideo(**instructions),
        "timestamp": datetime.now()
    })


if __name__ == "__main__":

    VIDEO_PATH = r"C:\Users\matia\PyCharmMiscProject\video_horizontal2.mp4"  # <-- cambia esto

    # Caso 1: Sin scene detector, 1 segmento, sin seguir cara
    print("\n" + "="*50)
    print("CASO 2: Multipe - sin scene detector")
    print("="*50)
    job = build_job(
        VIDEO_PATH,
        withSceneDetector=False,
        isFollowFace=True,
        minSceneDuration=15,
        maxSceneDuration=30,
        numberOfSegments=1
    )
    success, result = process_with_smart_crop(job)
    print(f"Success: {success}")
    print(f"State: {result.state}")
    print(f"Videos generados: {len(result.videos)}")
    for v in result.videos:
        print(f"  - {v.file_name} ({v.duration_seconds}s)")