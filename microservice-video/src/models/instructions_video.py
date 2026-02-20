from typing import Optional
from pydantic import BaseModel, Field


class InstructionsVideo(BaseModel):
    """Instrucciones para el procesamiento del video"""
    
    with_scene_detector: bool = Field(alias="withSceneDetector")
    is_follow_face: bool = Field(alias="isFollowFace")
    min_scene_duration: int = Field(alias="minSceneDuration")
    max_scene_duration: int = Field(alias="maxSceneDuration")
    number_of_segments: int = Field(alias="numberOfSegments")
    vector_times: Optional[str] = Field(alias="vectorTimes", default=None)
    
    class Config:
        populate_by_name = True
#1 is_automatic= false, number_of_segments = 1
#2  is_follow_face=true, number_of_segments = 1