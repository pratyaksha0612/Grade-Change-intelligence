import logging
from typing import Dict, Any
from app.services.redis_client import redis_client
import json

logger = logging.getLogger(__name__)

class ContextLoader:
    """
    Loads dynamic recipe limits and static machine physical constraints from cache.
    (In a full implementation, if cache misses, it queries DB via M7).
    """
    
    @staticmethod
    async def load_recipe_context(machine_id: str) -> Dict[str, Any]:
        """
        Loads the active grade recipe targets and bounds.
        """
        key = f"machine:{machine_id}:config:active_recipe"
        cached = await redis_client.get_value(key)
        if cached:
            return json.loads(cached)
            
        # Mocking recipe context for the scaffold
        return {
            "basis_weight_sp": 150.0,
            "basis_weight_low_limit": 148.0,
            "basis_weight_high_limit": 152.0,
            "machine_speed_sp": 900.0,
            "moisture_sp": 5.5
        }

    @staticmethod
    async def load_machine_context(machine_id: str) -> Dict[str, Any]:
        """
        Loads physical operating limits of the machine.
        """
        key = f"machine:{machine_id}:config:physical_limits"
        cached = await redis_client.get_value(key)
        if cached:
            return json.loads(cached)
            
        # Mocking machine context
        return {
            "max_speed_mpm": 1200.0,
            "min_speed_mpm": 300.0,
            "max_steam_pressure_kpa": 450.0
        }
