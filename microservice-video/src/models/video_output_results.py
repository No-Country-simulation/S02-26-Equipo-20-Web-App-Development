from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class VideoResult(BaseModel):
    """Resultado del procesamiento de video que se envía de vuelta a Java"""
    
    id_job: str = Field(alias="idJob")
    state: str  # "done" / "failed"
    video_result_paths: List[str] = Field(alias="videoResultPaths", default_factory=list)
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)
    
    class Config:
        populate_by_name = True
