from typing import List, Dict, Any
from app.schemas.root_cause import RootCauseFactorSchema

class RootCauseRanker:
    """
    Ranks factors and determines their severity impact score.
    """
    
    @staticmethod
    def rank_factors(raw_factors: List[Dict[str, Any]]) -> List[RootCauseFactorSchema]:
        """
        Sorts factors by absolute SHAP value (contribution) and assigns severity classes.
        """
        if not raw_factors:
            return []
            
        # Sort descending by contribution percentage
        sorted_factors = sorted(raw_factors, key=lambda x: x["contribution_pct"], reverse=True)
        
        ranked = []
        for i, factor in enumerate(sorted_factors):
            rank = i + 1
            contrib = factor["contribution_pct"]
            
            # Severity Classification
            severity_class = "Low"
            if contrib >= 50.0:
                severity_class = "Critical"
            elif contrib >= 25.0:
                severity_class = "High"
            elif contrib >= 10.0:
                severity_class = "Medium"
                
            ranked.append(
                RootCauseFactorSchema(
                    variable_id=factor["variable_id"],
                    variable_name=factor["variable_name"],
                    rank=rank,
                    contribution_pct=contrib,
                    shap_value=factor["shap_value"],
                    direction=factor["direction"],
                    current_value=factor["current_value"],
                    deviation_from_normal=factor["deviation_from_normal"],
                    severity_class=severity_class,
                    engineering_context=factor.get("engineering_context", ""),
                    actionability=factor["actionability"]
                )
            )
            
        return ranked
