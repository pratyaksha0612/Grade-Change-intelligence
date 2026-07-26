import logging
import json
import asyncio
from typing import Dict
from app.schemas.context import ContextPayload
from app.services.context.state_machine import GradeChangeStateMachine
from app.services.context.loader import ContextLoader
from app.services.context.builder import FeatureVectorBuilder
from app.services.kafka_producer import kafka_producer
from app.services.redis_client import redis_client
from app.services.kafka_consumer import KafkaConsumerClient

logger = logging.getLogger(__name__)

class ContextEngine:
    """
    Orchestrates the context enrichment process.
    """
    def __init__(self):
        self.state_machines: Dict[str, GradeChangeStateMachine] = {}
        self.consumer = KafkaConsumerClient(group_id="gci-m2-context-group")
        self.is_running = False

    def get_state_machine(self, machine_id: str) -> GradeChangeStateMachine:
        if machine_id not in self.state_machines:
            # Try to restore state from Redis, fallback to STEADY_STATE
            self.state_machines[machine_id] = GradeChangeStateMachine(machine_id)
        return self.state_machines[machine_id]

    async def process_message(self, message: dict):
        """
        Callback for Kafka consumer. Processes M1 payload and publishes to M3/M11.
        """
        try:
            # 1. Parse incoming payload
            payload = ContextPayload(**message)
            machine_id_str = str(payload.machine_id)
            
            # 2. Load context (Recipe and Machine limits)
            recipe_ctx = await ContextLoader.load_recipe_context(machine_id_str)
            machine_ctx = await ContextLoader.load_machine_context(machine_id_str)
            
            # 3. Evaluate Grade Change State
            sm = self.get_state_machine(machine_id_str)
            current_state = sm.evaluate_state(payload.features, recipe_ctx)
            
            # Persist state to Redis for stateless resilience
            await redis_client.set_value(f"machine:{machine_id_str}:state", current_state)
            
            # 4. Build enriched feature vector
            enriched = FeatureVectorBuilder.build(
                payload=payload,
                state=current_state,
                recipe_context=recipe_ctx,
                machine_context=machine_ctx
            )
            
            enriched_dict = enriched.model_dump(mode="json")
            
            # 5. Publish to Kafka
            # M3 (Prediction) and M11 (Similarity) consume from gci.context
            kafka_producer.publish_message(
                topic="gci.context",
                key=machine_id_str,
                message=enriched_dict
            )
            
            logger.debug(f"Context published for machine {machine_id_str} at {payload.timestamp}. State: {current_state}")
            
        except Exception as e:
            logger.error(f"Error processing message in Context Engine: {str(e)}")

    async def start(self):
        """Start the background consumer loop."""
        self.is_running = True
        logger.info("Starting M2 Context Engine Kafka consumer...")
        # Fire and forget the consumer loop in an asyncio task
        asyncio.create_task(
            self.consumer.consume_loop(topics=["gci.features"], callback=self.process_message)
        )

    def stop(self):
        self.is_running = False
        self.consumer.stop()
        logger.info("M2 Context Engine stopped.")

# Singleton instance
context_engine = ContextEngine()
