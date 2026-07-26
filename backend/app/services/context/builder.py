import logging
from typing import Dict, Any
from app.schemas.context import ContextPayload, EnrichedContext

logger = logging.getLogger(__name__)

class FeatureVectorBuilder:
    """
    Merges raw sensor features with configuration limits to create the enriched context payload.
    """
    
    @staticmethod
    def build(
        payload: ContextPayload,
        state: str,
        recipe_context: Dict[str, Any],
        machine_context: Dict[str, Any],
        session_id: str = None
    ) -> EnrichedContext:
        """
        Constructs the EnrichedContext schema object.
        """
        return EnrichedContext(
            machine_id=payload.machine_id,
            timestamp=payload.timestamp,
            session_id=session_id,
            state=state,
            recipe_context=recipe_context,
            machine_context=machine_context,
            features=payload.features,
            anomalies=payload.anomalies
        )
