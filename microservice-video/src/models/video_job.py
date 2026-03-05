from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from .instructions_video import InstructionsVideo


class VideoJob(BaseModel):
    """Job de procesamiento de video recibido desde Java/Spring Boot"""
    
    id_job: str = Field(alias="idJob")
    video_path: str = Field(alias="videoPath")
    instructions_video: InstructionsVideo = Field(alias="instructionsVideo")
    timestamp: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
