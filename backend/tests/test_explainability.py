import pytest
import uuid
from datetime import datetime, timezone
from app.services.explainability.generator import ExplanationGenerator

def test_explanation_generator_approve():
    decision = {
        "decision_id": str(uuid.uuid4()),
        "session_id": str(uuid.uuid4()),
        "machine_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "decision_status": "APPROVE",
        "overall_decision_confidence": 92.5
    }
    context = {"features": {"basis_weight": 150.0}}
    
    trace = ExplanationGenerator.build_trace(decision, context)
    
    assert trace.decision_status == "APPROVE"
    assert "Digital Twin" in trace.engineering_rationale
    assert trace.overall_decision_confidence == 92.5
    assert trace.supporting_evidence_payload == context
    assert "v3.0.0" in trace.model_version_references.values()

def test_explanation_generator_reject():
    decision = {
        "decision_id": str(uuid.uuid4()),
        "session_id": str(uuid.uuid4()),
        "machine_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "decision_status": "REJECT",
        "overall_decision_confidence": 45.0
    }
    context = {}
    
    trace = ExplanationGenerator.build_trace(decision, context)
    
    assert trace.decision_status == "REJECT"
    assert "unable to find" in trace.engineering_rationale
