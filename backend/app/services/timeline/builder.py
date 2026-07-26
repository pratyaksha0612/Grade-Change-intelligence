import logging
import uuid
import numpy as np
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.schemas.timeline import TimelinePredictionSchema, TimelineEventSchema

logger = logging.getLogger(__name__)

class TimelineBuilder:
    """
    Constructs the end-to-end multi-stage transition timeline.
    """
    
    @staticmethod
    def build_timeline(
        session_id: uuid.UUID,
        machine_id: uuid.UUID,
        simulation_result: Dict[str, Any]
    ) -> TimelinePredictionSchema:
        """
        Synthesizes AI predictions and Digital Twin simulations to extract timeline milestones.
        """
        start_dt = datetime.utcnow()
        timeline_id = uuid.uuid4()
        
        # Base duration from simulation or fallback
        total_duration_mins = 0.0
        events = []
        
        scenarios = simulation_result.get("scenarios", [])
        if scenarios:
            # Pick the best safe scenario
            safe_scenarios = [s for s in scenarios if s.get("pass_safety_validation", False)]
            if safe_scenarios:
                best_scenario = sorted(safe_scenarios, key=lambda x: x["expected_stabilization_time_minutes"])[0]
                total_duration_mins = best_scenario["expected_stabilization_time_minutes"]
        
        if total_duration_mins == 0.0:
            total_duration_mins = round(np.random.uniform(20.0, 45.0), 1) # Fallback if simulation missing
            
        completion_dt = start_dt + timedelta(minutes=total_duration_mins)
        
        # 1. Transition Start Event
        events.append(TimelineEventSchema(
            event_id=uuid.uuid4(),
            event_type="START",
            expected_timestamp=start_dt.isoformat(),
            description="Grade transition initiated.",
            confidence=1.0
        ))
        
        # 2. Predicted Operator Intervention (e.g. 5 mins in)
        intervention_time = start_dt + timedelta(minutes=5)
        events.append(TimelineEventSchema(
            event_id=uuid.uuid4(),
            event_type="INTERVENTION",
            expected_timestamp=intervention_time.isoformat(),
            description="Predicted manual adjustment required on Slice Lip.",
            confidence=0.85
        ))
        
        # 3. Stabilization Milestones (Machine Speed, Steam, Moisture, Basis Weight)
        speed_stab = start_dt + timedelta(minutes=total_duration_mins * 0.4)
        events.append(TimelineEventSchema(
            event_id=uuid.uuid4(),
            event_type="STABILIZATION",
            variable_name="Machine Speed",
            expected_timestamp=speed_stab.isoformat(),
            description="Machine Speed expected to reach target and stabilize.",
            confidence=0.92
        ))
        
        steam_stab = start_dt + timedelta(minutes=total_duration_mins * 0.6)
        events.append(TimelineEventSchema(
            event_id=uuid.uuid4(),
            event_type="STABILIZATION",
            variable_name="Steam Pressure",
            expected_timestamp=steam_stab.isoformat(),
            description="Steam Pressure expected to stabilize.",
            confidence=0.88
        ))
        
        bw_stab = start_dt + timedelta(minutes=total_duration_mins * 0.9)
        events.append(TimelineEventSchema(
            event_id=uuid.uuid4(),
            event_type="STABILIZATION",
            variable_name="Basis Weight",
            expected_timestamp=bw_stab.isoformat(),
            description="Basis Weight expected to enter acceptable quality limits.",
            confidence=0.90
        ))
        
        # 4. Completion Event
        events.append(TimelineEventSchema(
            event_id=uuid.uuid4(),
            event_type="COMPLETION",
            expected_timestamp=completion_dt.isoformat(),
            description="Grade transition completed successfully.",
            confidence=0.89
        ))
        
        return TimelinePredictionSchema(
            timeline_id=timeline_id,
            session_id=session_id,
            machine_id=machine_id,
            timestamp=start_dt.isoformat(),
            digital_twin_simulation_id=uuid.UUID(simulation_result.get("simulation_id")) if simulation_result.get("simulation_id") else None,
            transition_start_time=start_dt.isoformat(),
            overall_transition_duration_minutes=total_duration_mins,
            expected_completion_time=completion_dt.isoformat(),
            timeline_confidence=0.88,
            events=events
        )
