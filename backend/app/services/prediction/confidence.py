class ConfidenceGenerator:
    """
    Generates a statistical confidence score for the prediction based on 
    model uncertainty and input feature completeness.
    """
    
    @staticmethod
    def calculate(max_deviation_pct: float, feature_completeness: float = 1.0) -> float:
        """
        Simplified confidence calculation.
        Lower deviation and higher feature completeness = higher confidence.
        """
        base_confidence = 0.95
        
        # Penalize confidence if max deviation is extremely high (model is unsure)
        if max_deviation_pct > 5.0:
            base_confidence -= 0.15
        elif max_deviation_pct > 2.5:
            base_confidence -= 0.05
            
        # Penalize if features were missing/imputed in M1
        confidence = base_confidence * feature_completeness
        
        return max(0.0, min(1.0, confidence)) # Clamp between 0 and 1
