import logging
from typing import Dict, Any, Tuple
from datetime import datetime
import numpy as np

logger = logging.getLogger(__name__)

class DataValidator:
    """
    Handles data quality checks, missing value detection, and outlier identification.
    """
    
    @staticmethod
    def check_quality(reading: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validates OPC-UA quality codes.
        Returns (is_valid, reason)
        """
        quality = reading.get("quality", "GOOD").upper()
        if quality in ["BAD", "UNCERTAIN"]:
            return False, f"Invalid quality code: {quality}"
        return True, ""

    @staticmethod
    def handle_missing_values(value: float, strategy: str = "LAST_KNOWN_GOOD", last_good_value: float = None) -> float:
        """
        Handles missing (NaN or None) values based on strategy.
        """
        if value is not None and not np.isnan(value):
            return value
            
        if strategy == "LAST_KNOWN_GOOD" and last_good_value is not None:
            return last_good_value
        elif strategy == "ZERO":
            return 0.0
        
        # If no strategy matches or last_good_value is missing, return None
        return None

    @staticmethod
    def detect_outlier(value: float, expected_min: float, expected_max: float, hard_min: float, hard_max: float) -> Tuple[bool, str]:
        """
        Detects if a value is an outlier (soft limit) or invalid (hard limit).
        Returns (is_outlier, outlier_type). Type can be "NONE", "SOFT", "HARD".
        """
        if value is None:
            return False, "NONE"
            
        # Hard limits check (Sensor failure / Physically impossible)
        if (hard_min is not None and value < hard_min) or (hard_max is not None and value > hard_max):
            return True, "HARD"
            
        # Soft limits check (Process deviation / anomaly)
        if (expected_min is not None and value < expected_min) or (expected_max is not None and value > expected_max):
            return True, "SOFT"
            
        return False, "NONE"
