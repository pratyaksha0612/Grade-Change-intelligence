import logging
import pandas as pd
from typing import Dict, Any

logger = logging.getLogger(__name__)

FEATURES = [
    'machine_speed_fpm',
    'steam_pressure_psi',
    'headbox_flow',
    'stock_consistency',
    'refiner_load',
    'slice_opening',
    'steam_temperature',
    'dryer_temperature'
]

class FeaturePreprocessor:
    """
    Transforms the EnrichedContext from Kafka into a pandas DataFrame ready for XGBoost inference.
    """
    
    @staticmethod
    def preprocess(context_payload: Dict[str, Any]) -> pd.DataFrame:
        features = context_payload.get("features", {})
        
        data = {
            'machine_speed_fpm': [features.get("machine_speed_fpm", 2500.0)],
            'steam_pressure_psi': [features.get("steam_pressure_psi", 120.0)],
            'headbox_flow': [features.get("headbox_flow", 14000.0)],
            'stock_consistency': [features.get("stock_consistency", 3.2)],
            'refiner_load': [features.get("refiner_load", 850.0)],
            'slice_opening': [features.get("slice_opening", 20.5)],
            'steam_temperature': [features.get("steam_temperature", 420.0)],
            'dryer_temperature': [features.get("dryer_temperature", 336.0)]
        }
        return pd.DataFrame(data)
