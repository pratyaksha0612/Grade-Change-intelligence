import logging
import asyncio
import uuid
from typing import Dict, Any
from datetime import datetime, timezone

from app.db.session import AsyncSessionLocal
from app.crud.crud_decision import decision_repo
from app.schemas.decision import DecisionAssessmentSchema
from app.services.decision.fusion import ConfidenceFusion, RiskAggregator, DecisionQualityScorer
from app.services.kafka_producer import kafka_producer
from app.services.kafka_consumer import KafkaConsumerClient

logger = logging.getLogger(__name__)

class DecisionIntelligenceEngine:
    """
    Orchestrates the Confidence & Decision Intelligence (M10) Pipeline.
    Consumes outputs from the Timeline (or end of pipeline) to make a final assessment.
    """
    def __init__(self):
        # Listens to timeline events as the final step in the chain
        self.consumer = KafkaConsumerClient(group_id="gci-m10-decision-group")
        self.is_running = False

    async def _save_to_db(self, report: DecisionAssessmentSchema):
        async with AsyncSessionLocal() as db:
            await decision_repo.create_assessment(db=db, obj_in=report)

    async def process_message(self, message: dict):
        """
        Callback for Kafka consumer listening to `gci.timeline`.
        In a true event-driven setup, this might aggregate state from Redis for the session.
        For scaffold, we mock extraction of previous confidences.
        """
        try:
            machine_id_str = message.get("machine_id")
            session_id_str = message.get("session_id")
            
            if not machine_id_str or not session_id_str:
                return
                
            machine_id = uuid.UUID(machine_id_str)
            session_id = uuid.UUID(session_id_str)
            timestamp = datetime.now(timezone.utc).isoformat()
            
            # Mock pulling state from previous steps
            inputs = {
                "prediction": 0.92,
                "root_cause": 0.88,
                "similarity": 0.85,
                "recommendation": 0.90,
                "simulation": 0.95,
                "timeline": message.get("timeline_confidence", 0.90)
            }
            
            # 1. Fuse Confidence
            overall, reliability, acceptance = ConfidenceFusion.fuse(inputs)
            
            # 2. Aggregate Risk
            risk_level = RiskAggregator.aggregate_risk({"risk_flags": ["LOW"]})
            
            # 3. Decision Quality Score
            status, summary = DecisionQualityScorer.score(overall, risk_level)
            
            # 4. Build Report
            assessment = DecisionAssessmentSchema(
                decision_id=uuid.uuid4(),
                session_id=session_id,
                machine_id=machine_id,
                timestamp=timestamp,
                prediction_confidence=inputs["prediction"],
                root_cause_confidence=inputs["root_cause"],
                similarity_confidence=inputs["similarity"],
                recommendation_confidence=inputs["recommendation"],
                simulation_confidence=inputs["simulation"],
                timeline_confidence=inputs["timeline"],
                overall_decision_confidence=overall,
                decision_reliability=reliability,
                risk_level=risk_level,
                recommendation_acceptance_score=acceptance,
                decision_status=status,
                decision_summary=summary
            )
            
            # 5. Save to Database
            await self._save_to_db(assessment)
            
            # 6. Publish to Kafka (gci.decisions)
            kafka_producer.publish_message(
                topic="gci.decisions",
                key=machine_id_str,
                message=assessment.model_dump(mode="json")
            )
            
            logger.info(f"Generated Decision Assessment {assessment.decision_id} (Status: {status})")
            
        except Exception as e:
            logger.error(f"Decision Engine error processing message: {str(e)}")

    async def start(self):
        """Start the Kafka consumer loop."""
        self.is_running = True
        logger.info("Starting Decision Intelligence Engine (M10)...")
        asyncio.create_task(
            self.consumer.consume_loop(topics=["gci.timeline"], callback=self.process_message)
        )

    def stop(self):
        self.is_running = False
        self.consumer.stop()
        logger.info("Decision Engine stopped.")

# Singleton instance
decision_engine = DecisionIntelligenceEngine()
