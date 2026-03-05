import os
from dotenv import load_dotenv

load_dotenv()


class RedisConfig:
    """Configuración de Redis y Streams"""
    
    # Conexión Redis
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
    REDIS_DB = int(os.getenv("REDIS_DB", "0"))
    
    # Streams
    STREAM_JOBS = "video-jobs"
    STREAM_RESULTS = "video-results"
    
    # Consumer Group
    GROUP_NAME = "python-workers"
    
    # Locks y TTL
    LOCK_TTL = int(os.getenv("LOCK_TTL", "900"))  # 15 minutos
    CLAIM_IDLE = int(os.getenv("CLAIM_IDLE", "60000"))  # 60 segundos
    HEARTBEAT_INTERVAL = int(os.getenv("HEARTBEAT_INTERVAL", "30"))  # 30 segundos
    
    # Prefijos
    STATE_PREFIX = "jobstate:"
    LOCK_PREFIX = "joblock:"
    
    # Worker
    BLOCK_TIME = int(os.getenv("BLOCK_TIME", "5000"))  # 5 segundos
    BATCH_SIZE = int(os.getenv("BATCH_SIZE", "1"))
    
    @classmethod
    def get_redis_url(cls) -> str:
        """Retorna la URL de conexión a Redis"""
        if cls.REDIS_PASSWORD:
            return f"redis://:{cls.REDIS_PASSWORD}@{cls.REDIS_HOST}:{cls.REDIS_PORT}/{cls.REDIS_DB}"
        return f"redis://{cls.REDIS_HOST}:{cls.REDIS_PORT}/{cls.REDIS_DB}"
