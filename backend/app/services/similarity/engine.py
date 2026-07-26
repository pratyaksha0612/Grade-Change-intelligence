import logging
import asyncio
import uuid
from typing import Dict, Any
from datetime import datetime, timezone

from app.db.session import AsyncSessionLocal
from app.crud.crud_similarity import similarity_repo
from app.schemas.similarity import SimilarityReportSchema
from app.services.similarity.search import FeatureVectorSearch
from app.services.similarity.ranking import SimilarityRanker
from app.services.kafka_producer import kafka_producer
from app.services.kafka_consumer import KafkaConsumerClient

logger = logging.getLogger(__name__)

class HistoricalSimilarityEngine:
    """
    Orchestrates the Historical Similarity (M11/M5) Pipeline.
    (Note: Referred to as M11 in Architecture, M5 in prompt. Engine logic remains identical).
    """
    def __init__(self):
        # Listens to context vectors published by M2
        self.consumer = KafkaConsumerClient(group_id="gci-m5-similarity-group")
        self.is_running = False

    async def _save_to_db(self, report: SimilarityReportSchema):
        async with AsyncSessionLocal() as db:
            await similarity_repo.create_report(db=db, obj_in=report)

    async def process_message(self, message: dict):
        """
        Callback for Kafka consumer listening to `gci.context`.
        """
        try:
            state = message.get("state", "STEADY_STATE")
            
            # We don't need historical similarity unless a grade change is active
            if state == "STEADY_STATE":
                return
                
            machine_id = uuid.UUID(message["machine_id"])
            session_id = uuid.UUID(message["session_id"]) if message.get("session_id") else uuid.uuid4()
            timestamp = datetime.now(timezone.utc).isoformat()
            
            # 1. Search for matches using KNN/DTW abstraction
            raw_matches = FeatureVectorSearch.search(message, top_k=3)
            
            if not raw_matches:
                return
                
            # 2. Rank and calculate confidence
            ranked_matches = SimilarityRanker.rank_matches(raw_matches)
            confidence = SimilarityRanker.calculate_confidence(ranked_matches)
            
            # 3. Build Report
            report = SimilarityReportSchema(
                report_id=uuid.uuid4(),
                session_id=session_id,
                machine_id=machine_id,
                timestamp=timestamp,
                confidence_in_matches=confidence,
                matches=ranked_matches
            )
            
            # 4. Save to Database
            await self._save_to_db(report)
            
            # 5. Publish to Kafka (gci.similarity) for M6 (UI)
            kafka_producer.publish_message(
                topic="gci.similarity",
                key=str(machine_id),
                message=report.model_dump(mode="json")
            )
            
            logger.info(f"Generated Similarity Report {report.report_id} with {len(ranked_matches)} matches.")
            
        except Exception as e:
            logger.error(f"Similarity Engine error processing message: {str(e)}")

    async def start(self):
        """Start the Kafka consumer loop."""
        self.is_running = True
        logger.info("Starting Historical Similarity Engine...")
        asyncio.create_task(
            self.consumer.consume_loop(topics=["gci.context"], callback=self.process_message)
        )

    def stop(self):
        self.is_running = False
        self.consumer.stop()
        logger.info("Historical Similarity Engine stopped.")

# Singleton instance
similarity_engine = HistoricalSimilarityEngine()
