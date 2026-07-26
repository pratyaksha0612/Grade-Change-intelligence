import logging
from typing import Dict, Any, List
from datetime import datetime
from pydantic import UUID4
from app.schemas.ingestion import IngestionPayload, IngestionResponse
from app.services.ingestion.validation import DataValidator
from app.services.ingestion.normalization import DataNormalizer
from app.services.kafka_producer import kafka_producer
from app.services.redis_client import redis_client

logger = logging.getLogger(__name__)

class IngestionPipeline:
    """
    Orchestrates the ingestion, validation, normalization, and publishing of data.
    """
    
    async def process_payload(self, payload: IngestionPayload) -> IngestionResponse:
        processed_count = 0
        rejected_count = 0
        errors = []
        
        # We will build a unified feature vector grouped by synchronized timestamp
        # In a real enterprise system, we would fetch ProcessVariable constraints from Redis/DB here.
        # For performance, we assume standard limits for this M1 implementation.
        
        feature_vectors = {}
        
        for reading in payload.readings:
            try:
                # 1. Quality Check
                is_quality_good, reason = DataValidator.check_quality(reading.model_dump())
                if not is_quality_good:
                    rejected_count += 1
                    errors.append({"tag": reading.tag_name, "error": reason})
                    continue
                
                # 2. Timestamp Synchronization (Aligning to 1-second bins)
                sync_time = DataNormalizer.synchronize_timestamp(reading.timestamp, resolution_ms=1000)
                sync_time_iso = sync_time.isoformat()
                
                # 3. Missing Value Handling & Outlier Detection
                # (Mocking config limits for demonstration)
                expected_min, expected_max = 0.0, 1000.0
                hard_min, hard_max = -500.0, 5000.0
                
                is_outlier, outlier_type = DataValidator.detect_outlier(
                    reading.value, expected_min, expected_max, hard_min, hard_max
                )
                
                if outlier_type == "HARD":
                    rejected_count += 1
                    errors.append({"tag": reading.tag_name, "error": f"Hard limit violation: {reading.value}"})
                    continue
                
                # 4. Normalization (Unit conversion skipped for now unless specified)
                normalized_value = reading.value
                
                # Group into feature vector
                if sync_time_iso not in feature_vectors:
                    feature_vectors[sync_time_iso] = {
                        "machine_id": str(payload.machine_id),
                        "timestamp": sync_time_iso,
                        "features": {},
                        "anomalies": {}
                    }
                
                feature_vectors[sync_time_iso]["features"][reading.tag_name] = normalized_value
                if outlier_type == "SOFT":
                    feature_vectors[sync_time_iso]["anomalies"][reading.tag_name] = True
                    
                processed_count += 1
                
                # 5. Update Redis Cache (Hot storage for Context/Prediction Engines)
                cache_key = f"machine:{payload.machine_id}:live:{reading.tag_name}"
                await redis_client.set_value(cache_key, normalized_value, expire_seconds=3600)
                
            except Exception as e:
                logger.error(f"Error processing reading {reading.tag_name}: {str(e)}")
                rejected_count += 1
                errors.append({"tag": reading.tag_name, "error": "Internal processing error"})

        # 6. Publish to Kafka
        for ts, vector in feature_vectors.items():
            kafka_producer.publish_message(
                topic="gci.features",
                key=str(payload.machine_id),
                message=vector
            )
            
        # Optional flush if batching requires immediate send
        kafka_producer.flush()
        
        status = "SUCCESS" if rejected_count == 0 else "PARTIAL_SUCCESS" if processed_count > 0 else "FAILED"
        
        return IngestionResponse(
            status=status,
            message=f"Processed {processed_count} readings. Rejected {rejected_count}.",
            processed_count=processed_count,
            rejected_count=rejected_count,
            errors=errors if errors else None
        )

# Singleton
ingestion_pipeline = IngestionPipeline()
