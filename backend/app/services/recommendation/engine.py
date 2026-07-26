import logging
import asyncio
import uuid
from typing import Dict, Any
from datetime import datetime, timezone

from app.db.session import AsyncSessionLocal
from app.crud.crud_recommendation import recommendation_repo
from app.schemas.recommendation import RecommendationReportSchema
from app.services.recommendation.optimizer import MultiObjectiveOptimizer
from app.services.recommendation.safety import SafetyValidator
from app.services.recommendation.ranking import RecommendationRanker
from app.services.kafka_producer import kafka_producer
from app.services.kafka_consumer import KafkaConsumerClient
from app.services.context.loader import ContextLoader

logger = logging.getLogger(__name__)

class RecommendationEngine:
    """
    Orchestrates the AI Recommendation (M6) Pipeline.
    Consumes predictions, generates optimizations, validates safety, and publishes.
    """
    def __init__(self):
        # We trigger optimization when a prediction indicates a deviation (WARNING/BREACH)
        self.consumer = KafkaConsumerClient(group_id="gci-m6-recommendation-group")
        self.is_running = False

    async def _save_to_db(self, report: RecommendationReportSchema):
        async with AsyncSessionLocal() as db:
            await recommendation_repo.create_report(db=db, obj_in=report)

    async def process_message(self, message: dict):
        """
        Callback for Kafka consumer listening to `gci.predictions`.
        (In a full microservice, it would also merge state from gci.root-cause and gci.similarity)
        """
        try:
            risk_class = message.get("risk_class", "SAFE")
            
            if risk_class == "SAFE":
                return
                
            machine_id_str = message["machine_id"]
            machine_id = uuid.UUID(machine_id_str)
            session_id = uuid.UUID(message["session_id"])
            prediction_id = uuid.UUID(message["prediction_id"])
            timestamp = datetime.now(timezone.utc).isoformat()
            
            # Load static machine context for safety boundaries
            machine_ctx = await ContextLoader.load_machine_context(machine_id_str)
            
            # 1. Generate Candidates (NSGA-II)
            raw_candidates = MultiObjectiveOptimizer.generate_candidates(prediction=message, context={})
            
            # 2. Safety & Engineering Validation
            validated_candidates = SafetyValidator.validate(raw_candidates, machine_limits=machine_ctx)
            
            # 3. Ranking & Confidence 
            # (Assuming a similarity confidence of 0.85 from M5)
            ranked_candidates = RecommendationRanker.rank_and_score(validated_candidates, similarity_confidence=0.85)
            
            if not ranked_candidates:
                logger.warning(f"No safe recommendations could be generated for Prediction {prediction_id}")
                return
                
            # 4. Build Report
            report = RecommendationReportSchema(
                report_id=uuid.uuid4(),
                session_id=session_id,
                machine_id=machine_id,
                timestamp=timestamp,
                prediction_id=prediction_id,
                recommendations=ranked_candidates
            )
            
            # 5. Save to Database
            await self._save_to_db(report)
            
            # 6. Publish to Kafka (gci.recommendations) for M8 (Action/UI)
            kafka_producer.publish_message(
                topic="gci.recommendations",
                key=machine_id_str,
                message=report.model_dump(mode="json")
            )
            
            logger.info(f"Generated {len(ranked_candidates)} safe Recommendations for Prediction {prediction_id}.")
            
        except Exception as e:
            logger.error(f"Recommendation Engine error processing message: {str(e)}")

    async def start(self):
        """Start the Kafka consumer loop."""
        self.is_running = True
        logger.info("Starting AI Recommendation Engine (M6)...")
        asyncio.create_task(
            self.consumer.consume_loop(topics=["gci.predictions"], callback=self.process_message)
        )

    def stop(self):
        self.is_running = False
        self.consumer.stop()
        logger.info("Recommendation Engine stopped.")

# Singleton instance
recommendation_engine = RecommendationEngine()
