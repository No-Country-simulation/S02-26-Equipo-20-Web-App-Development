import logging
from typing import Optional, List, Tuple, Dict

import redis

from config import RedisConfig

logger = logging.getLogger(__name__)


class RedisService:
    """Servicio para manejar todas las operaciones con Redis"""
    
    def __init__(self):
        self.config = RedisConfig
        self.client = self._create_client()
        
    def _create_client(self) -> redis.Redis:
        """Crea y retorna un cliente de Redis"""
        try:
            client = redis.Redis(
                host=self.config.REDIS_HOST,
                port=self.config.REDIS_PORT,
                password=self.config.REDIS_PASSWORD,
                db=self.config.REDIS_DB,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_keepalive=True,
                health_check_interval=30
            )
            # Verificar conexión
            client.ping()
            logger.info(f"Conectado a Redis en {self.config.REDIS_HOST}:{self.config.REDIS_PORT}")
            return client
        except redis.ConnectionError as e:
            logger.error(f"Error al conectar con Redis: {e}")
            raise
    
    def ensure_group(self, stream: str, group: str) -> None:
        """Crea el grupo de consumidores si no existe"""
        try:
            self.client.xgroup_create(stream, group, id="0", mkstream=True)
            logger.info(f"Grupo '{group}' creado para stream '{stream}'")
        except redis.exceptions.ResponseError as e:
            if "BUSYGROUP" in str(e):
                logger.info(f"Grupo '{group}' ya existe para stream '{stream}'")
            else:
                logger.error(f"Error al crear grupo: {e}")
                raise
    
    def xreadgroup(
        self,
        group: str,
        consumer: str,
        streams: Dict[str, str],
        count: int = 1,
        block: int = 5000
    ) -> List[Tuple[str, List[Tuple[str, Dict[str, str]]]]]:
        """Lee mensajes del stream usando consumer group"""
        try:
            return self.client.xreadgroup(
                group,
                consumer,
                streams,
                count=count,
                block=block
            ) or []
        except Exception as e:
            logger.error(f"Error leyendo stream: {e}")
            return []
    
    def xautoclaim(
        self,
        stream: str,
        group: str,
        consumer: str,
        min_idle_time: int,
        start_id: str = "0-0",
        count: int = 10
    ) -> Tuple[str, List[Tuple[str, Dict[str, str]]], List[str]]:
        """Reclama mensajes que están idle (workers caídos)"""
        try:
            return self.client.xautoclaim(
                stream,
                group,
                consumer,
                min_idle_time,
                start_id,
                count=count
            )
        except Exception as e:
            logger.error(f"Error en autoclaim: {e}")
            return "0-0", [], []
    
    def xack(self, stream: str, group: str, *message_ids: str) -> int:
        """Marca mensajes como procesados"""
        try:
            result = self.client.xack(stream, group, *message_ids)
            logger.debug(f"ACK enviado para {len(message_ids)} mensaje(s)")
            return result
        except Exception as e:
            logger.error(f"Error en ACK: {e}")
            return 0
    
    def xdel(self, stream: str, *message_ids: str) -> int:
        """Elimina mensajes del stream"""
        try:
            result = self.client.xdel(stream, *message_ids)
            logger.debug(f"{result} mensaje(s) eliminado(s) del stream")
            return result
        except Exception as e:
            logger.error(f"Error eliminando mensaje: {e}")
            return 0
    
    def xadd(self, stream: str, fields: Dict[str, str]) -> str:
        """Agrega un mensaje al stream"""
        try:
            message_id = self.client.xadd(stream, fields)
            logger.debug(f"Mensaje publicado en '{stream}': {message_id}")
            return message_id
        except Exception as e:
            logger.error(f"Error publicando mensaje: {e}")
            raise
    
    def get(self, key: str) -> Optional[str]:
        """Obtiene un valor de Redis"""
        return self.client.get(key)
    
    def set(self, key: str, value: str, ex: Optional[int] = None) -> bool:
        """Establece un valor en Redis"""
        return self.client.set(key, value, ex=ex)
    
    def exists(self, key: str) -> bool:
        """Verifica si una key existe"""
        return self.client.exists(key) > 0
    
    def delete(self, key: str) -> int:
        """Elimina una key"""
        return self.client.delete(key)
    
    def expire(self, key: str, seconds: int) -> bool:
        """Establece TTL para una key"""
        return self.client.expire(key, seconds)
    
    def pipeline(self, transaction: bool = True) -> redis.client.Pipeline:
        """Crea un pipeline para operaciones atómicas"""
        return self.client.pipeline(transaction=transaction)
    
    def close(self) -> None:
        """Cierra la conexión con Redis"""
        self.client.close()
        logger.info("Conexión con Redis cerrada")
