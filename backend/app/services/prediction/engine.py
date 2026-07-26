import logging
import json
import asyncio
import uuid
from typing import Dict, Any

from app.db.session import AsyncSessionLocal
from app.crud.crud_prediction import prediction as crud_prediction
from app.schemas.prediction import PredictionOutput
from app.services.prediction.model_loader import model_loader
from app.services.prediction.preprocessing import FeaturePreprocessor
from app.services.prediction.inference import InferenceEngine
from app.services.prediction.confidence import ConfidenceGenerator
from app.services.kafka_producer import kafka_producer
from app.services.kafka_consumer import KafkaConsumerClient

logger = logging.getLogger(__name__)

class PredictionEngine:
    """
    Orchestrates the entire prediction pipeline: consume context, preprocess, predict, save, and publish.
    """
    def __init__(self):
        self.consumer = KafkaConsumerClient(group_id="gci-m3-prediction-group")
        self.is_running = False

    async def _save_to_db(self, output: PredictionOutput, feature_time: str):
        async with AsyncSessionLocal() as db:
            await crud_prediction.create_prediction(db=db, obj_in=output, feature_time=feature_time)

    async def process_message(self, message: dict):
        """
        Callback for Kafka consumer listening to `gci.context`.
        """
        try:
            if not model_loader.is_loaded:
                logger.warning("Model not loaded yet. Skipping inference.")
                return

            machine_id = uuid.UUID(message.get("machine_id"))
            session_id = uuid.UUID(message.get("session_id")) if message.get("session_id") else uuid.uuid4()
            timestamp = message.get("timestamp")
            
            # 1. Preprocess
            df = FeaturePreprocessor.preprocess(message)
            
            # 2. Inference
            recipe = message.get("recipe_context", {})
            target_bw = recipe.get("basis_weight_sp", 150.0)
            max_dev, horizons = InferenceEngine.predict_trajectory(df, target_bw)
            
            # 3. Risk Assessment
            # If deviation > 2.5%, it's a BREACH. > 1.5% is WARNING.
            risk_class = "SAFE"
            prob_breach = 0.01
            risk_score = min(100.0, max_dev * 10)
            
            if max_dev > 2.5:
                risk_class = "BREACH"
                prob_breach = 0.85
            elif max_dev > 1.5:
                risk_class = "WARNING"
                prob_breach = 0.45
                
            # 4. Confidence
            confidence = ConfidenceGenerator.calculate(max_dev)
            
            # Build Output
            output = PredictionOutput(
                prediction_id=uuid.uuid4(),
                session_id=session_id,
                machine_id=machine_id,
                timestamp=timestamp,
                model_version_id=model_loader.get_version_id(),
                risk_score=round(risk_score, 2),
                risk_class=risk_class,
                probability_of_breach=prob_breach,
                confidence_score=round(confidence, 3),
                predicted_max_deviation_pct=round(max_dev, 3),
                horizons=horizons
            )
            
            # 5. Save to Database (PostgreSQL / Timescale)
            await self._save_to_db(output, timestamp)
            
            # 6. Publish to Kafka (gci.predictions) for M4 (Optimization) and M12 (Root Cause)
            kafka_producer.publish_message(
                topic="gci.predictions",
                key=str(machine_id),
                message=output.model_dump(mode="json")
            )
            
            logger.debug(f"Prediction {output.prediction_id} generated. Class: {risk_class}")
            
        except Exception as e:
            logger.error(f"Prediction Engine error processing message: {str(e)}")

    async def start(self):
        """Load models and start the Kafka consumer loop."""
        self.is_running = True
        logger.info("Starting M3 Prediction Engine...")
        await model_loader.load_model()
        
        asyncio.create_task(
            self.consumer.consume_loop(topics=["gci.context"], callback=self.process_message)
        )

    def stop(self):
        self.is_running = False
        self.consumer.stop()
        logger.info("M3 Prediction Engine stopped.")

# Singleton instance
prediction_engine = PredictionEngine()
