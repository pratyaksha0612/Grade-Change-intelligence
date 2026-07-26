import logging
from typing import Dict, Any, List
from app.schemas.digital_twin import SimulationScenarioSchema

logger = logging.getLogger(__name__)

class SimulationValidator:
    """
    Validates the simulated trajectory against recipe constraints.
    """
    
    @staticmethod
    def validate(scenarios: List[SimulationScenarioSchema], recipe_limits: Dict[str, Any]) -> List[SimulationScenarioSchema]:
        """
        Iterates over scenarios and checks if the simulated basis weight stays within bounds.
        """
        bw_low_limit = recipe_limits.get("basis_weight_low_limit", 148.0)
        bw_high_limit = recipe_limits.get("basis_weight_high_limit", 152.0)
        
        for scenario in scenarios:
            # Only validate if the physics simulator thought it was safe initially
            if not scenario.pass_safety_validation:
                continue
                
            breach_count = 0
            # Check the last 3 horizons (representing the stabilization phase)
            for point in scenario.trajectory[-3:]:
                if point.basis_weight < bw_low_limit or point.basis_weight > bw_high_limit:
                    breach_count += 1
                    
            if breach_count > 0:
                scenario.pass_safety_validation = False
                scenario.expected_risk_level = "WARNING"
                scenario.validation_message = f"Simulated trajectory breaches recipe bounds ({bw_low_limit}-{bw_high_limit})."
                logger.warning(f"Scenario {scenario.scenario_id} failed dynamic validation.")
                
        return scenarios
