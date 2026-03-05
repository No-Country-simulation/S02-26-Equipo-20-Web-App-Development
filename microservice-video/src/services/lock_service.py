import logging
import threading
from typing import Optional
from config import RedisConfig
from .redis_service import RedisService

logger = logging.getLogger(__name__)


class LockService:
    """Servicio para manejar locks distribuidos en Redis"""
    
    def __init__(self, redis_service: RedisService, consumer_id: str):
        self.redis = redis_service
        self.consumer_id = consumer_id
        self.config = RedisConfig
        
    def acquire_lock(self, job_id: str) -> bool:
        """
        Intenta adquirir un lock para un job específico
        
        Args:
            job_id: ID del job
            
        Returns:
            True si se adquirió el lock, False si ya existe
        """
        key = self.config.LOCK_PREFIX + job_id
        
        acquired = self.redis.client.set(
            key,
            self.consumer_id,
            nx=True,  # Solo si no existe
            ex=self.config.LOCK_TTL
        )
        
        if acquired:
            logger.info(f"Lock adquirido para job: {job_id}")
        else:
            logger.debug(f"Lock ya existe para job: {job_id}")
            
        return acquired
    
    def release_lock(self, job_id: str) -> bool:
        """
        Libera un lock de forma segura (solo si es propio)
        
        Args:
            job_id: ID del job
            
        Returns:
            True si se liberó el lock, False en caso contrario
        """
        key = self.config.LOCK_PREFIX + job_id
        
        try:
            pipe = self.redis.pipeline(transaction=True)
            pipe.watch(key)
            
            owner = pipe.get(key)
            
            if owner == self.consumer_id:
                pipe.multi()
                pipe.delete(key)
                pipe.execute()
                logger.info(f"Lock liberado para job: {job_id}")
                return True
            else:
                pipe.unwatch()
                logger.warning(f"Intento de liberar lock que no pertenece a este worker: {job_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error liberando lock para job {job_id}: {e}")
            return False
    
    def extend_lock(self, job_id: str) -> bool:
        """
        Extiende el TTL de un lock existente
        
        Args:
            job_id: ID del job
            
        Returns:
            True si se extendió, False si el lock no existe
        """
        key = self.config.LOCK_PREFIX + job_id
        
        if self.redis.exists(key):
            extended = self.redis.expire(key, self.config.LOCK_TTL)
            if extended:
                logger.debug(f"Lock extendido para job: {job_id}")
            return extended
        else:
            logger.warning(f"Lock perdido para job: {job_id}")
            return False
    
    def lock_exists(self, job_id: str) -> bool:
        """
        Verifica si existe un lock para un job
        
        Args:
            job_id: ID del job
            
        Returns:
            True si existe el lock
        """
        key = self.config.LOCK_PREFIX + job_id
        return self.redis.exists(key)
    
    def start_heartbeat(self, job_id: str, stop_event: threading.Event) -> threading.Thread:
        """
        Inicia un thread de heartbeat para mantener el lock vivo
        
        Args:
            job_id: ID del job
            stop_event: Evento para detener el heartbeat
            
        Returns:
            Thread del heartbeat
        """
        def heartbeat():
            interval = self.config.HEARTBEAT_INTERVAL
            
            while not stop_event.wait(interval):
                if not self.extend_lock(job_id):
                    logger.error(f"Heartbeat detenido - lock perdido para job: {job_id}")
                    break
        
        thread = threading.Thread(
            target=heartbeat,
            args=(),
            daemon=True,
            name=f"heartbeat-{job_id}"
        )
        thread.start()
        logger.info(f"Heartbeat iniciado para job: {job_id}")
        
        return thread
    
    def get_state(self, job_id: str) -> Optional[str]:
        """
        Obtiene el estado actual de un job
        
        Args:
            job_id: ID del job
            
        Returns:
            Estado del job o None si no existe
        """
        key = self.config.STATE_PREFIX + job_id
        state = self.redis.get(key)
        
        if state:
            logger.debug(f"Estado de job {job_id}: {state}")
        
        return state
    
    def set_state(self, job_id: str, state: str) -> bool:
        """
        Establece el estado de un job
        
        Args:
            job_id: ID del job
            state: Estado a establecer (processing, done, failed)
            
        Returns:
            True si se estableció correctamente
        """
        key = self.config.STATE_PREFIX + job_id
        
        # Estado persiste por 1 día
        result = self.redis.set(key, state, ex=86400)
        
        if result:
            logger.info(f"Estado actualizado para job {job_id}: {state}")
        
        return result
