import logging
import uuid
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class FeatureAttributionEngine:
    """
    Calculates SHAP values for model predictions and provides fallback rule-based explanations.
    """
    
    @staticmethod
    def calculate_shap_values(prediction_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Placeholder for SHAP TreeExplainer / DeepExplainer integration.
        Simulates extracting the top contributing features for a deviation.
        """
        # Mock SHAP extraction
        risk_class = prediction_data.get("risk_class", "SAFE")
        
        if risk_class == "SAFE":
            return [] # No deviation to explain
            
        # Simulate that Steam Pressure and Machine Speed caused the issue
        factors = [
            {
                "variable_id": str(uuid.uuid4()),
                "variable_name": "Steam Pressure Group 2",
                "shap_value": 0.45,
                "contribution_pct": 65.0,
                "current_value": 410.5,
                "deviation_from_normal": 15.5,
                "direction": "INCREASING",
                "actionability": "ACTIONABLE"
            },
            {
                "variable_id": str(uuid.uuid4()),
                "variable_name": "Machine Speed",
                "shap_value": -0.15,
                "contribution_pct": 20.0,
                "current_value": 950.0,
                "deviation_from_normal": -50.0,
                "direction": "DECREASING",
                "actionability": "ACTIONABLE"
            }
        ]
        return factors

    @staticmethod
    def apply_engineering_rules(factor: Dict[str, Any]) -> str:
        """
        Maps abstract statistical deviations to operator-friendly explanations using engineering rules.
        """
        name = factor.get("variable_name", "")
        direction = factor.get("direction", "")
        
        if "Steam Pressure" in name and direction == "INCREASING":
            return "Elevated steam pressure is causing rapid moisture loss, leading to basis weight instability."
            
        if "Speed" in name and direction == "DECREASING":
            return "Machine speed drop is causing excessive stock build-up on the wire."
            
        return f"{name} is {direction.lower()} beyond normal operating bounds."
