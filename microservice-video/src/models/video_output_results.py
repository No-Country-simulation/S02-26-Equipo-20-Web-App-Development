from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class VideoOutput(BaseModel):
    """Información técnica de un video procesado"""

    file_name: str = Field(alias="fileName")
    path: str
    duration_seconds: int = Field(alias="durationSeconds")
    video_size_bytes: int = Field(alias="videoSizeBytes")

    class Config:
        populate_by_name = True



class VideoOutputResults(BaseModel):
    """Resultado del procesamiento de video que se envía de vuelta a Java"""

    id_job: str = Field(alias="idJob")
    state: str  # "done" / "failed"
    base_video_duration_seconds: int = Field(alias="baseVideoDurationSeconds")
    videos: List[VideoOutput] = Field(default_factory=list)
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)
    class Config:
        populate_by_name = True
