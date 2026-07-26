from typing import List
from app.schemas.recommendation import RecommendationSchema

class RecommendationRanker:
    """
    Ranks safe recommendations and computes confidence scores.
    """
    
    @staticmethod
    def rank_and_score(candidates: List[RecommendationSchema], similarity_confidence: float = 1.0) -> List[RecommendationSchema]:
        """
        Filters rejected candidates, sorts by expected improvement, and calculates final confidence.
        """
        safe_candidates = [c for c in candidates if c.safety_status == "SAFE"]
        
        # Sort descending by expected improvement %
        ranked = sorted(safe_candidates, key=lambda x: x.expected_improvement_pct, reverse=True)
        
        for i, rec in enumerate(ranked):
            rec.rank = i + 1
            
            # Confidence Calculation:
            # Base confidence from the optimizer model (e.g. 0.9)
            # Degraded if historical similarity confidence is low (acting as supporting evidence)
            base_conf = 0.90
            
            # Higher improvement might carry more risk, slightly reducing confidence
            if rec.expected_improvement_pct > 30.0:
                base_conf -= 0.1
                
            # Blend with historical evidence confidence
            final_conf = (base_conf * 0.7) + (similarity_confidence * 0.3)
            rec.confidence_score = round(max(0.0, min(1.0, final_conf)), 3)
            
            rec.engineering_rationale += f" Ranked #{rec.rank} based on an expected improvement of {rec.expected_improvement_pct}%."
            
        return ranked
