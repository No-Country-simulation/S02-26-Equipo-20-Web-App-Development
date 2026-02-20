import json
import logging
import signal
import sys
import threading
import uuid
from typing import List, Tuple, Dict

from config import RedisConfig
from models import VideoJob, VideoResult
from services import RedisService, LockService, ProcessorService
from services.processor_service import process_video

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('worker.log')
    ]
)

logger = logging.getLogger(__name__)


class VideoWorker:
    """Worker que consume jobs de Redis Streams y procesa videos"""
    
    def __init__(self):
        self.config = RedisConfig
        self.consumer_id = f"worker-{uuid.uuid4().hex[:6]}"
        
        # Servicios
        self.redis_service = RedisService()
        self.lock_service = LockService(self.redis_service, self.consumer_id)
        self.processor_service = ProcessorService()
        
        # Control de ejecución
        self.running = False
        self.stop_event = threading.Event()
        
        logger.info(f"Worker inicializado: {self.consumer_id}")
    
    def setup(self) -> None:
        """Inicializa streams y grupos de consumidores"""
        logger.info("Configurando Redis Streams...")
        
        # Crear grupo para jobs
        self.redis_service.ensure_group(
            self.config.STREAM_JOBS,
            self.config.GROUP_NAME
        )
        
        logger.info("Configuración completada")
    
    def publish_result(self, result: VideoResult) -> None:
        """
        Publica el resultado del procesamiento al stream de resultados
        
        Args:
            result: VideoResult con el resultado del procesamiento
        """
        try:
            result_json = result.model_dump_json(by_alias=True)
            
            self.redis_service.xadd(
                self.config.STREAM_RESULTS,
                {"payload": result_json}
            )
            
            logger.info(f"Resultado publicado para job {result.id_job}: {result.state}")
            
        except Exception as e:
            logger.error(f"Error publicando resultado: {e}")
    
    def handle_entry(self, msg_id: str, fields: Dict[str, str]) -> None:
        """
        Procesa un mensaje individual del stream
        
        Args:
            msg_id: ID del mensaje en Redis
            fields: Campos del mensaje
        """
        try:
            # Parsear el payload
            payload_json = fields.get("payload")
            if not payload_json:
                logger.error(f"Mensaje sin payload: {msg_id}")
                self.redis_service.xack(self.config.STREAM_JOBS, self.config.GROUP_NAME, msg_id)
                return
            
            payload = json.loads(payload_json)
            job = VideoJob(**payload)
            
            logger.info(f"Mensaje recibido - Job ID: {job.id_job}")
            
            # Verificar estado actual
            state = self.lock_service.get_state(job.id_job)
            
            # -------- DECISIÓN POR ESTADO --------
            
            # Ya completado → solo hacer ACK y limpiar
            if state == "done":
                logger.info(f"Job {job.id_job} ya completado - Skipping")
                self.redis_service.xack(self.config.STREAM_JOBS, self.config.GROUP_NAME, msg_id)
                self.redis_service.xdel(self.config.STREAM_JOBS, msg_id)
                return
            
            # Estaba en processing
            if state == "processing":
                if self.lock_service.lock_exists(job.id_job):
                    logger.info(f"Job {job.id_job} siendo procesado por otro worker")
                    return
                else:
                    logger.warning(f"Recuperando job abandonado: {job.id_job}")
            
            # Intentar adquirir lock distribuido
            if not self.lock_service.acquire_lock(job.id_job):
                logger.info(f"Job {job.id_job} bloqueado por otro worker")
                return
            
            try:
                # Marcar como en procesamiento
                self.lock_service.set_state(job.id_job, "processing")
                
                # ---- Iniciar heartbeat ----
                stop_heartbeat = threading.Event()
                heartbeat_thread = self.lock_service.start_heartbeat(
                    job.id_job,
                    stop_heartbeat
                )
                
                # ---- Procesar el video ----
                success, result = process_video(job)
                
                # ---- Detener heartbeat ----
                stop_heartbeat.set()
                heartbeat_thread.join(timeout=2)
                
                # Actualizar estado final
                if success:
                    self.lock_service.set_state(job.id_job, "done")
                else:
                    self.lock_service.set_state(job.id_job, "failed")
                
                # Publicar resultado
                self.publish_result(result)
                
            finally:
                # Liberar lock
                self.lock_service.release_lock(job.id_job)
            
            # Hacer ACK del mensaje
            self.redis_service.xack(self.config.STREAM_JOBS, self.config.GROUP_NAME, msg_id)
            
            # ELIMINAR del stream (limpieza automática)
            self.redis_service.xdel(self.config.STREAM_JOBS, msg_id)
            
            logger.info(f"Mensaje procesado, confirmado y eliminado del stream: {msg_id}")
            
        except Exception as e:
            logger.error(f"Error procesando mensaje {msg_id}: {e}", exc_info=True)
    
    def handle_entries(self, entries: List[Tuple[str, Dict[str, str]]]) -> None:
        """
        Procesa múltiples mensajes
        
        Args:
            entries: Lista de tuples (msg_id, fields)
        """
        for msg_id, fields in entries:
            self.handle_entry(msg_id, fields)
    
    def claim_stuck_jobs(self) -> None:
        """Reclama jobs que están idle (workers caídos)"""
        next_id = "0-0"
        claimed_count = 0
        
        while True:
            next_id, messages, _ = self.redis_service.xautoclaim(
                self.config.STREAM_JOBS,
                self.config.GROUP_NAME,
                self.consumer_id,
                self.config.CLAIM_IDLE,
                next_id,
                count=10
            )
            
            if not messages:
                break
            
            claimed_count += len(messages)
            self.handle_entries(messages)
        
        if claimed_count > 0:
            logger.info(f"♻️ Reclamados {claimed_count} job(s) abandonado(s)")
    
    def run(self) -> None:
        """Loop principal del worker"""
        self.running = True
        logger.info(f"👷 {self.consumer_id} esperando trabajos...")
        logger.info(f"📡 Stream: {self.config.STREAM_JOBS}")
        logger.info(f"👥 Grupo: {self.config.GROUP_NAME}")
        logger.info("")
        
        while self.running:
            try:
                self.claim_stuck_jobs()

                messages = self.redis_service.xreadgroup(
                    self.config.GROUP_NAME,
                    self.consumer_id,
                    {self.config.STREAM_JOBS: ">"},
                    count=self.config.BATCH_SIZE,
                    block=self.config.BLOCK_TIME
                )

                if messages:
                    for stream_name, entries in messages:
                        self.handle_entries(entries)
                
            except KeyboardInterrupt:
                logger.info("Interrupción detectada")
                self.stop()
                break
            except Exception as e:
                logger.error(f"Error en loop principal: {e}", exc_info=True)
                # Pequeña pausa antes de reintentar
                threading.Event().wait(1)
    
    def stop(self) -> None:
        """Detiene el worker de forma limpia"""
        logger.info("Deteniendo worker...")
        self.running = False
        self.stop_event.set()
        
        # Cerrar conexión Redis
        self.redis_service.close()
        
        logger.info("Worker detenido correctamente")
    
    def signal_handler(self, signum):
        """Manejador de señales del sistema"""
        logger.info(f"Señal recibida: {signum}")
        self.stop()
        sys.exit(0)


def main():
    """Función principal"""
    worker = VideoWorker()
    
    # Registrar manejadores de señales
    signal.signal(signal.SIGINT, worker.signal_handler)
    signal.signal(signal.SIGTERM, worker.signal_handler)
    
    try:
        # Configurar Redis Streams
        worker.setup()
        
        # Iniciar worker
        worker.run()
        
    except Exception as e:
        logger.error(f"Error fatal: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
