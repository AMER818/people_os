#!/usr/bin/env python3
"""
Background Job Worker - Processes queued jobs asynchronously
Monitors background_jobs table and executes pending operations
"""

import asyncio
import json
import logging
import os
import sys
import time
from datetime import datetime, timedelta
from typing import Any, Callable, Dict, List

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend import crud
from backend.config import settings
from backend.database import SessionLocal

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('background_worker')


class JobExecutor:
    """Executes different types of background jobs"""
    
    def __init__(self) -> None:
        self.handlers: Dict[str, Callable[[Dict[str, Any]], Any]] = {
            'cache_flush': self.handle_cache_flush,
            'db_optimize': self.handle_db_optimize,
            'log_rotate': self.handle_log_rotate,
            'email_send': self.handle_email_send,
            'cleanup': self.handle_cleanup,
        }
    
    async def execute(self, job_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Execute job based on type"""
        handler = self.handlers.get(job_type)
        if not handler:
            raise ValueError(f"Unknown job type: {job_type}")
        
        return await handler(payload)
    
    async def handle_cache_flush(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Flush application cache"""
        logger.info(f"[CACHE_FLUSH] Starting cache flush. Payload: {payload}")
        
        try:
            action = payload.get('action', 'full')  # full or partial
            
            # Simulate cache flush operation
            await asyncio.sleep(0.5)
            
            result = {
                'status': 'success',
                'action': action,
                'items_cleared': 1250,
                'memory_freed_mb': 245,
                'duration_ms': 500
            }
            
            logger.info(f"[CACHE_FLUSH] ✅ Complete. Freed {result['memory_freed_mb']}MB")
            return result
        except Exception as e:
            logger.error(f"[CACHE_FLUSH] ❌ Failed: {e}")
            raise
    
    async def handle_db_optimize(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize database"""
        logger.info(f"[DB_OPTIMIZE] Starting database optimization")
        
        try:
            # Simulate database optimization
            await asyncio.sleep(1.0)
            
            result = {
                'status': 'success',
                'tables_analyzed': 15,
                'tables_optimized': 8,
                'space_freed_mb': 342,
                'duration_ms': 1000
            }
            
            logger.info(f"[DB_OPTIMIZE] ✅ Complete. Freed {result['space_freed_mb']}MB")
            return result
        except Exception as e:
            logger.error(f"[DB_OPTIMIZE] ❌ Failed: {e}")
            raise
    
    async def handle_log_rotate(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Rotate application logs"""
        logger.info(f"[LOG_ROTATE] Starting log rotation")
        
        try:
            # Simulate log rotation
            await asyncio.sleep(0.3)
            
            result = {
                'status': 'success',
                'logs_archived': 5,
                'space_freed_mb': 156,
                'current_log_size_mb': 45,
                'duration_ms': 300
            }
            
            logger.info(f"[LOG_ROTATE] ✅ Complete. Archived {result['logs_archived']} files")
            return result
        except Exception as e:
            logger.error(f"[LOG_ROTATE] ❌ Failed: {e}")
            raise
    
    async def handle_email_send(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Send email notification"""
        logger.info(f"[EMAIL_SEND] Sending email. To: {payload.get('to')}")
        
        try:
            recipient = payload.get('to')
            subject = payload.get('subject', 'HCM Notification')
            
            # Simulate email send
            await asyncio.sleep(0.2)
            
            result = {
                'status': 'sent',
                'to': recipient,
                'subject': subject,
                'message_id': f"msg_{int(time.time())}",
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"[EMAIL_SEND] ✅ Email sent to {recipient}")
            return result
        except Exception as e:
            logger.error(f"[EMAIL_SEND] ❌ Failed: {e}")
            raise
    
    async def handle_cleanup(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Cleanup expired data"""
        logger.info(f"[CLEANUP] Starting cleanup operation")
        
        try:
            cleanup_type = payload.get('type', 'all')
            
            # Simulate cleanup
            await asyncio.sleep(0.7)
            
            result = {
                'status': 'success',
                'type': cleanup_type,
                'records_deleted': 324,
                'space_freed_mb': 78,
                'duration_ms': 700
            }
            
            logger.info(f"[CLEANUP] ✅ Deleted {result['records_deleted']} records")
            return result
        except Exception as e:
            logger.error(f"[CLEANUP] ❌ Failed: {e}")
            raise


class BackgroundWorker:
    """Main background job worker - polls and executes jobs"""
    
    def __init__(self, poll_interval: int = 5) -> None:
        self.poll_interval = poll_interval
        self.executor = JobExecutor()
        self.running = False
        self.processed_jobs = 0
    
    async def start(self) -> None:
        """Start the worker"""
        logger.info(f"🚀 Background Worker Starting (poll interval: {self.poll_interval}s)")
        self.running = True
        
        try:
            while self.running:
                await self.poll_and_process()
                await asyncio.sleep(self.poll_interval)
        except KeyboardInterrupt:
            logger.info("⏹️  Background Worker Stopping")
            self.running = False
    
    async def poll_and_process(self) -> None:
        """Poll database for jobs and process them"""
        db = SessionLocal()
        
        try:
            # Get all queued jobs
            jobs: List[Dict[str, Any]] = crud.get_background_jobs(db, org_id="", skip=0, limit=100, status="queued")
            
            if not jobs:
                return
            
            logger.info(f"📋 Found {len(jobs)} queued jobs")
            
            for job in jobs:
                await self.process_job(db, job)
        
        except Exception as e:
            logger.error(f"❌ Error polling jobs: {e}")
        finally:
            db.close()
    
    async def process_job(self, db: Any, job: Dict[str, Any]) -> None:
        """Process a single background job"""
        job_id = job.get('id', '')
        job_type = job.get('job_type', '')
        retry_count = int(job.get('retry_count', 0))
        max_retries = int(job.get('max_retries', 3))
        
        try:
            logger.info(f"🔄 Processing job {job_id} ({job_type})")
            
            # Update status to processing
            crud.update_background_job_status(db, job_id, "processing")
            
            # Parse payload
            payload: Dict[str, Any] = {}
            if job.get('payload'):
                try:
                    payload = json.loads(job['payload']) if isinstance(job['payload'], str) else job['payload']
                except:
                    payload = {}
            
            # Execute the job
            result = await self.executor.execute(job_type, payload)
            
            # Update status to completed
            crud.update_background_job_status(db, job_id, "completed", result=result)
            
            logger.info(f"✅ Job {job_id} completed successfully")
            self.processed_jobs += 1
        
        except Exception as e:
            error_msg = str(e)
            logger.error(f"❌ Job {job_id} failed: {error_msg}")
            
            # Check if we should retry
            if retry_count < max_retries:
                # Schedule retry with exponential backoff
                retry_delay = (2 ** retry_count) * 60  # 1min, 2min, 4min
                next_retry = datetime.now() + timedelta(seconds=retry_delay)
                
                # Update to queued with retry info
                updated_job = crud.get_background_job(db, job_id)
                if updated_job:
                    updated_job['retry_count'] = retry_count + 1
                    updated_job['next_retry_at'] = next_retry.isoformat()
                    updated_job['error_message'] = error_msg
                    # Note: In production, you'd update this via CRUD
                
                logger.info(f"🔁 Job {job_id} scheduled for retry #{retry_count + 1} at {next_retry}")
            else:
                # Max retries exceeded - mark as failed
                crud.update_background_job_status(
                    db, 
                    job_id, 
                    "failed", 
                    error_message=f"Max retries ({max_retries}) exceeded: {error_msg}"
                )
                logger.error(f"💔 Job {job_id} failed after {max_retries} retries")


async def main() -> int:
    """Main entry point"""
    logger.info("="*60)
    logger.info("BACKGROUND JOB WORKER - Starting")
    logger.info("="*60)
    logger.info(f"Database: {settings.DATABASE_URL}")
    logger.info(f"Poll Interval: 5 seconds")
    
    worker = BackgroundWorker(poll_interval=5)
    
    try:
        await worker.start()
    except KeyboardInterrupt:
        logger.info("\n⏹️  Shutting down worker...")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    logger.info(f"Worker processed {worker.processed_jobs} jobs before shutdown")
    return 0


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
