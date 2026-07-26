import logging
import asyncio
import uuid
from typing import Dict, Any
from datetime import datetime, timezone

from app.db.session import AsyncSessionLocal
from app.crud.crud_explainability import explainability_repo
from app.schemas.explainability import ExplainabilityAuditSchema
from app.services.explainability.generator import ExplanationGenerator
from app.services.kafka_producer import kafka_producer
from app.services.kafka_consumer import KafkaConsumerClient

logger = logging.getLogger(__name__)

class ExplainabilityEngine:
    """
    Orchestrates the Explainability & Decision Audit (M13) Pipeline.
    Listens to final decisions and packages the complete audit trace.
    """
    def __init__(self):
        # Listens to final decisions from M10
        self.consumer = KafkaConsumerClient(group_id="gci-m13-explainability-group")
        self.is_running = False

    async def _save_to_db(self, report: ExplainabilityAuditSchema):
        async with AsyncSessionLocal() as db:
            await explainability_repo.create_audit_record(db=db, obj_in=report)

    async def process_message(self, message: dict):
        """
        Callback for Kafka consumer listening to `gci.decisions`.
        """
        try:
            machine_id_str = message.get("machine_id")
            
            if not machine_id_str:
                return
                
            # Mock pulling full context history from Redis using session_id
            context_history = {"mock_payload": "full_history_dump_here"}
            
            # 1. Build Explanation Trace
            audit_package = ExplanationGenerator.build_trace(decision=message, context=context_history)
            
            # 2. Save to Database
            await self._save_to_db(audit_package)
            
            # 3. Publish to Kafka (gci.explainability)
            kafka_producer.publish_message(
                topic="gci.explainability",
                key=machine_id_str,
                message=audit_package.model_dump(mode="json")
            )
            
            logger.info(f"Generated Explainability Audit Package {audit_package.audit_id}")
            
        except Exception as e:
            logger.error(f"Explainability Engine error processing message: {str(e)}")

    async def start(self):
        """Start the Kafka consumer loop."""
        self.is_running = True
        logger.info("Starting Explainability & Decision Audit Engine (M13)...")
        asyncio.create_task(
            self.consumer.consume_loop(topics=["gci.decisions"], callback=self.process_message)
        )

    def stop(self):
        self.is_running = False
        self.consumer.stop()
        logger.info("Explainability Engine stopped.")

# Singleton instance
explainability_engine = ExplainabilityEngine()
