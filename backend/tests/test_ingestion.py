import pytest
from datetime import datetime, timezone
import uuid
from app.services.ingestion.validation import DataValidator
from app.services.ingestion.normalization import DataNormalizer

def test_quality_check():
    valid, msg = DataValidator.check_quality({"quality": "GOOD"})
    assert valid is True
    
    valid, msg = DataValidator.check_quality({"quality": "BAD"})
    assert valid is False
    assert "Invalid quality" in msg

def test_missing_values():
    assert DataValidator.handle_missing_values(None, "LAST_KNOWN_GOOD", 10.0) == 10.0
    assert DataValidator.handle_missing_values(None, "ZERO") == 0.0
    assert DataValidator.handle_missing_values(5.5, "ZERO") == 5.5

def test_outlier_detection():
    # Inside bounds
    is_outlier, type_ = DataValidator.detect_outlier(100.0, 50, 150, 0, 200)
    assert not is_outlier
    assert type_ == "NONE"
    
    # Soft limits
    is_outlier, type_ = DataValidator.detect_outlier(160.0, 50, 150, 0, 200)
    assert is_outlier
    assert type_ == "SOFT"
    
    # Hard limits
    is_outlier, type_ = DataValidator.detect_outlier(250.0, 50, 150, 0, 200)
    assert is_outlier
    assert type_ == "HARD"

def test_timestamp_sync():
    raw_time = datetime(2026, 7, 25, 12, 0, 0, 200000, tzinfo=timezone.utc)
    sync_time = DataNormalizer.synchronize_timestamp(raw_time, resolution_ms=1000)
    
    # .200000 should round down to .000000
    assert sync_time.microsecond == 0
    
    raw_time_up = datetime(2026, 7, 25, 12, 0, 0, 800000, tzinfo=timezone.utc)
    sync_time_up = DataNormalizer.synchronize_timestamp(raw_time_up, resolution_ms=1000)
    # .800000 should round up to the next second
    assert sync_time_up.second == 1
    assert sync_time_up.microsecond == 0
