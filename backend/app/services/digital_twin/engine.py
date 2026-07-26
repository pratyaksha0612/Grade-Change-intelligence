import logging
import asyncio
import uuid
from typing import Dict, Any
from datetime import datetime, timezone

from app.db.session import AsyncSessionLocal
from app.crud.crud_digital_twin import digital_twin_repo
from app.schemas.digital_twin import DigitalTwinReportSchema
from app.services.digital_twin.simulator import ProcessResponsePredictor
from app.services.digital_twin.validator import SimulationValidator
from app.services.kafka_producer import kafka_producer
from app.services.kafka_consumer import KafkaConsumerClient
from app.services.context.loader import ContextLoader

logger = logging.getLogger(__name__)

class DigitalTwinEngine:
    """
    Orchestrates the Digital Twin (M9) Pipeline.
    Consumes AI Recommendations and simulates them before UI presentation.
    """
    def __init__(self):
        # We trigger simulations when a recommendation is generated
        self.consumer = KafkaConsumerClient(group_id="gci-m9-digital-twin-group")
        self.is_running = False

    async def _save_to_db(self, report: DigitalTwinReportSchema):
        async with AsyncSessionLocal() as db:
            await digital_twin_repo.create_simulation_report(db=db, obj_in=report)

    async def process_message(self, message: dict):
        """
        Callback for Kafka consumer listening to `gci.recommendations`.
        """
        try:
            recommendations = message.get("recommendations", [])
            
            if not recommendations:
                return
                
            machine_id_str = message["machine_id"]
            machine_id = uuid.UUID(machine_id_str)
            session_id = uuid.UUID(message["session_id"])
            timestamp = datetime.now(timezone.utc).isoformat()
            
            # Load static machine context for safety boundaries
            recipe_ctx = await ContextLoader.load_recipe_context(machine_id_str)
            
            # 1. Simulate Scenarios
            scenarios = []
            for rec in recommendations:
                setpoints = {sp["tag_name"]: sp["recommended_value"] for sp in rec["setpoints"]}
                
                # We need context here, mocking empty for scaffold
                scenario = ProcessResponsePredictor.simulate_scenario(
                    recommendation_id=rec["recommendation_id"],
                    setpoints=setpoints,
                    context={"recipe_context": recipe_ctx}
                )
                scenarios.append(scenario)
                
            # 2. Dynamic Safety Validation
            validated_scenarios = SimulationValidator.validate(scenarios, recipe_limits=recipe_ctx)
            
            # 3. Build Report
            report = DigitalTwinReportSchema(
                simulation_id=uuid.uuid4(),
                session_id=session_id,
                machine_id=machine_id,
                timestamp=timestamp,
                scenarios=validated_scenarios
            )
            
            # 4. Save to Database
            await self._save_to_db(report)
            
            # 5. Publish to Kafka (gci.simulations) for UI updates
            kafka_producer.publish_message(
                topic="gci.simulations",
                key=machine_id_str,
                message=report.model_dump(mode="json")
            )
            
            logger.info(f"Generated Digital Twin simulation with {len(validated_scenarios)} scenarios.")
            
        except Exception as e:
            logger.error(f"Digital Twin Engine error processing message: {str(e)}")

    async def start(self):
        """Start the Kafka consumer loop."""
        self.is_running = True
        logger.info("Starting Digital Twin Engine (M9)...")
        asyncio.create_task(
            self.consumer.consume_loop(topics=["gci.recommendations"], callback=self.process_message)
        )

    def stop(self):
        self.is_running = False
        self.consumer.stop()
        logger.info("Digital Twin Engine stopped.")

# Singleton instance
digital_twin_engine = DigitalTwinEngine()
