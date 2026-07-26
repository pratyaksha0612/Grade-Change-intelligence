import logging
import asyncio
import uuid
from typing import Dict, Any
from datetime import datetime, timezone

from app.db.session import AsyncSessionLocal
from app.crud.crud_root_cause import root_cause_repo
from app.schemas.root_cause import RootCauseReportSchema
from app.services.root_cause.attribution import FeatureAttributionEngine
from app.services.root_cause.ranking import RootCauseRanker
from app.services.kafka_producer import kafka_producer
from app.services.kafka_consumer import KafkaConsumerClient

logger = logging.getLogger(__name__)

class RootCauseEngine:
    """
    Orchestrates the Root Cause Analysis (M4/M12) Pipeline.
    """
    def __init__(self):
        # Listens to predictions that were published by M3
        self.consumer = KafkaConsumerClient(group_id="gci-m4-root-cause-group")
        self.is_running = False

    async def _save_to_db(self, report: RootCauseReportSchema):
        async with AsyncSessionLocal() as db:
            await root_cause_repo.create_report(db=db, obj_in=report)

    async def process_message(self, message: dict):
        """
        Callback for Kafka consumer listening to `gci.predictions`.
        """
        try:
            risk_class = message.get("risk_class", "SAFE")
            
            # We only generate Root Cause reports if there's a risk of breach
            if risk_class == "SAFE":
                return
                
            prediction_id = uuid.UUID(message["prediction_id"])
            session_id = uuid.UUID(message["session_id"])
            timestamp = datetime.now(timezone.utc).isoformat()
            
            # 1. Feature Attribution (SHAP)
            raw_factors = FeatureAttributionEngine.calculate_shap_values(message)
            
            if not raw_factors:
                return
                
            # 2. Engineering Rule Mapping
            for factor in raw_factors:
                factor["engineering_context"] = FeatureAttributionEngine.apply_engineering_rules(factor)
                
            # 3. Ranking and Severity Classification
            ranked_factors = RootCauseRanker.rank_factors(raw_factors)
            
            # Calculate total explanation
            total_explained = sum([f.contribution_pct for f in ranked_factors])
            
            # Generate summary sentence
            top_cause = ranked_factors[0]
            summary = f"Predicted deviation primarily driven by {top_cause.variable_name} ({top_cause.contribution_pct}% contribution)."
            
            # 4. Build Report
            report = RootCauseReportSchema(
                report_id=uuid.uuid4(),
                session_id=session_id,
                prediction_id=prediction_id,
                timestamp=timestamp,
                summary_sentence=summary,
                total_explained_pct=round(total_explained, 2),
                factors=ranked_factors
            )
            
            # 5. Save to Database
            await self._save_to_db(report)
            
            # 6. Publish to Kafka (gci.root-cause) for M5/M6 Recommendation/UI
            kafka_producer.publish_message(
                topic="gci.root-cause",
                key=str(prediction_id),
                message=report.model_dump(mode="json")
            )
            
            logger.info(f"Generated Root Cause Report {report.report_id} for Prediction {prediction_id}")
            
        except Exception as e:
            logger.error(f"Root Cause Engine error processing message: {str(e)}")

    async def start(self):
        """Start the Kafka consumer loop."""
        self.is_running = True
        logger.info("Starting Root Cause Analysis Engine...")
        asyncio.create_task(
            self.consumer.consume_loop(topics=["gci.predictions"], callback=self.process_message)
        )

    def stop(self):
        self.is_running = False
        self.consumer.stop()
        logger.info("Root Cause Analysis Engine stopped.")

# Singleton instance
root_cause_engine = RootCauseEngine()
