import logging
from typing import Dict, Any, List
from app.schemas.recommendation import RecommendationSchema

logger = logging.getLogger(__name__)

class SafetyValidator:
    """
    Validates recommendations against engineering rules and safety constraints.
    """
    
    @staticmethod
    def validate(candidates: List[RecommendationSchema], machine_limits: Dict[str, Any]) -> List[RecommendationSchema]:
        """
        Iterates over candidates and marks them as SAFE or REJECTED.
        """
        # Mock limits
        max_steam_pressure = machine_limits.get("max_steam_pressure_kpa", 450.0)
        min_speed = machine_limits.get("min_speed_mpm", 300.0)
        max_speed = machine_limits.get("max_speed_mpm", 1200.0)
        
        for candidate in candidates:
            is_safe = True
            rejection_reason = ""
            
            for sp in candidate.setpoints:
                if "Steam" in sp.tag_name and sp.recommended_value > max_steam_pressure:
                    is_safe = False
                    rejection_reason = f"Steam pressure {sp.recommended_value} exceeds maximum {max_steam_pressure} kPa."
                    break
                    
                if "Speed" in sp.tag_name and (sp.recommended_value < min_speed or sp.recommended_value > max_speed):
                    is_safe = False
                    rejection_reason = f"Machine speed {sp.recommended_value} violates limits ({min_speed}-{max_speed})."
                    break
                    
            if is_safe:
                candidate.safety_status = "SAFE"
                # Keep existing rationale or enhance it
            else:
                candidate.safety_status = "REJECTED"
                candidate.engineering_rationale = rejection_reason
                logger.warning(f"Candidate {candidate.recommendation_id} rejected: {rejection_reason}")
                
        return candidates
