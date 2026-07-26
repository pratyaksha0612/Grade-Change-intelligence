import logging
import pandas as pd
import uuid
from typing import Tuple, List, Dict
from app.schemas.prediction import PredictionHorizon
from app.services.prediction.model_loader import model_loader

logger = logging.getLogger(__name__)

class InferenceEngine:
    """
    Executes the trained XGBoost model to forecast basis weight trajectories.
    """
    
    @staticmethod
    def predict_trajectory(df: pd.DataFrame, target_bw: float) -> Tuple[float, List[PredictionHorizon]]:
        """
        Uses the loaded XGBoost model to predict the trajectory.
        Returns (max_deviation_pct, horizons).
        """
        horizons = []
        max_dev = 0.0
        
        model = model_loader.model
        
        # Clone DataFrame so we don't modify the original
        current_df = df.copy()
        
        for i in range(1, 13): # 12 horizons, 10 seconds each (120s total)
            horizon_sec = i * 10
            
            if model:
                predicted_bw = float(model.predict(current_df)[0])
            else:
                predicted_bw = target_bw
                
            dev_pct = abs((predicted_bw - target_bw) / target_bw) * 100
            if dev_pct > max_dev:
                max_dev = dev_pct
                
            horizons.append(
                PredictionHorizon(
                    horizon_sec=horizon_sec,
                    predicted_bw=round(predicted_bw, 3),
                    predicted_deviation_pct=round(dev_pct, 3),
                    confidence_lower=round(predicted_bw - (0.5 * i), 3),
                    confidence_upper=round(predicted_bw + (0.5 * i), 3)
                )
            )
            
            # Simple AR step: assume speed and pressure decay towards a steady state
            current_df['machine_speed_fpm'] *= 0.998
            current_df['steam_pressure_psi'] *= 0.999
            
        return max_dev, horizons
