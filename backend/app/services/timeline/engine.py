import logging
import asyncio
import uuid
from typing import Dict, Any
from datetime import datetime, timezone

from app.db.session import AsyncSessionLocal
from app.crud.crud_timeline import timeline_repo
from app.schemas.timeline import TimelinePredictionSchema
from app.services.timeline.builder import TimelineBuilder
from app.services.kafka_producer import kafka_producer
from app.services.kafka_consumer import KafkaConsumerClient

logger = logging.getLogger(__name__)

class TimelinePredictionEngine:
    """
    Orchestrates the Timeline Prediction (M8) Pipeline.
    Consumes Digital Twin output to generate a complete chronological forecast.
    """
    def __init__(self):
        # Listens to simulations to finalize the timeline
        self.consumer = KafkaConsumerClient(group_id="gci-m8-timeline-group")
        self.is_running = False

    async def _save_to_db(self, report: TimelinePredictionSchema):
        async with AsyncSessionLocal() as db:
            await timeline_repo.create_timeline(db=db, obj_in=report)

    async def process_message(self, message: dict):
        """
        Callback for Kafka consumer listening to `gci.simulations`.
        """
        try:
            machine_id_str = message.get("machine_id")
            session_id_str = message.get("session_id")
            
            if not machine_id_str or not session_id_str:
                return
                
            machine_id = uuid.UUID(machine_id_str)
            session_id = uuid.UUID(session_id_str)
            
            # 1. Build Timeline based on simulation
            timeline = TimelineBuilder.build_timeline(
                session_id=session_id,
                machine_id=machine_id,
                simulation_result=message
            )
            
            # 2. Save to Database
            await self._save_to_db(timeline)
            
            # 3. Publish to Kafka (gci.timeline) for UI rendering
            kafka_producer.publish_message(
                topic="gci.timeline",
                key=machine_id_str,
                message=timeline.model_dump(mode="json")
            )
            
            logger.info(f"Generated Timeline Prediction {timeline.timeline_id} with {len(timeline.events)} milestones.")
            
        except Exception as e:
            logger.error(f"Timeline Engine error processing message: {str(e)}")

    async def start(self):
        """Start the Kafka consumer loop."""
        self.is_running = True
        logger.info("Starting Timeline Prediction Engine (M8)...")
        asyncio.create_task(
            self.consumer.consume_loop(topics=["gci.simulations"], callback=self.process_message)
        )

    def stop(self):
        self.is_running = False
        self.consumer.stop()
        logger.info("Timeline Engine stopped.")

# Singleton instance
timeline_engine = TimelinePredictionEngine()
