import logging
from typing import Dict, Any, Tuple
from app.schemas.decision import DecisionAssessmentSchema

logger = logging.getLogger(__name__)

class ConfidenceFusion:
    """
    Fuses confidence scores from multiple AI subsystems to generate a single decision metric.
    """
    
    # Weights for each subsystem
    WEIGHTS = {
        "prediction": 0.15,
        "root_cause": 0.10,
        "similarity": 0.20,
        "recommendation": 0.25,
        "simulation": 0.20,
        "timeline": 0.10
    }
    
    @staticmethod
    def fuse(inputs: Dict[str, float]) -> Tuple[float, str, float]:
        """
        Returns (overall_confidence (0-100), reliability (str), acceptance_score (0-100))
        """
        score = 0.0
        total_weight = 0.0
        
        for key, weight in ConfidenceFusion.WEIGHTS.items():
            val = inputs.get(key)
            if val is not None:
                score += val * weight
                total_weight += weight
                
        # Normalize if some inputs are missing
        if total_weight > 0:
            final_score = (score / total_weight) * 100.0
        else:
            final_score = 0.0
            
        final_score = round(final_score, 1)
        
        if final_score >= 85.0:
            reliability = "HIGH"
        elif final_score >= 60.0:
            reliability = "MEDIUM"
        else:
            reliability = "LOW"
            
        # Acceptance score is highly dependent on simulation safety
        # We will assume simulation is a strong indicator
        sim = inputs.get("simulation", 0.0)
        acceptance = final_score * 0.8 + (sim * 100.0 * 0.2)
        
        return final_score, reliability, round(acceptance, 1)

class RiskAggregator:
    @staticmethod
    def aggregate_risk(inputs: Dict[str, Any]) -> str:
        # Simplistic risk aggregation based on highest risk flag from subsystems
        risk_flags = inputs.get("risk_flags", [])
        if "CRITICAL" in risk_flags or "BREACH" in risk_flags:
            return "CRITICAL"
        if "WARNING" in risk_flags or "HIGH" in risk_flags:
            return "HIGH"
        return "LOW"

class DecisionQualityScorer:
    @staticmethod
    def score(overall_confidence: float, risk_level: str) -> Tuple[str, str]:
        """
        Returns (status, summary)
        """
        if risk_level == "CRITICAL":
            return "REJECT", "Recommendation rejected due to critical risk factors detected by Digital Twin."
            
        if overall_confidence >= 85.0 and risk_level == "LOW":
            return "APPROVE", "High confidence decision with low risk. Safe to automate or approve."
            
        if overall_confidence >= 60.0:
            return "REVIEW", "Moderate confidence. Operator review strongly advised before execution."
            
        return "REJECT", "Low confidence decision. Insufficient AI certainty to proceed."
