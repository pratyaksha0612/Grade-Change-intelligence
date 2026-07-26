import pytest
import uuid
from app.services.timeline.builder import TimelineBuilder

def test_timeline_builder_with_simulation():
    session_id = uuid.uuid4()
    machine_id = uuid.uuid4()
    
    simulation_result = {
        "simulation_id": str(uuid.uuid4()),
        "scenarios": [
            {
                "pass_safety_validation": True,
                "expected_stabilization_time_minutes": 25.0
            },
            {
                "pass_safety_validation": False,
                "expected_stabilization_time_minutes": 15.0
            }
        ]
    }
    
    timeline = TimelineBuilder.build_timeline(session_id, machine_id, simulation_result)
    
    assert timeline.overall_transition_duration_minutes == 25.0
    assert len(timeline.events) == 6
    assert any(e.event_type == "START" for e in timeline.events)
    assert any(e.event_type == "COMPLETION" for e in timeline.events)
    assert any(e.variable_name == "Basis Weight" for e in timeline.events)

def test_timeline_builder_fallback():
    session_id = uuid.uuid4()
    machine_id = uuid.uuid4()
    
    # Missing scenarios
    simulation_result = {}
    
    timeline = TimelineBuilder.build_timeline(session_id, machine_id, simulation_result)
    
    # Fallback duration should be between 20.0 and 45.0
    assert 20.0 <= timeline.overall_transition_duration_minutes <= 45.0
    assert len(timeline.events) == 6
