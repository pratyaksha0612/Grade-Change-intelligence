# API Contracts — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-ARCH-API-001
**Version:** 1.0
**Last Updated:** 2026-07-25

---

## 1. API Strategy

| Communication Type | Protocol | Use Case |
|---|---|---|
| **Inter-Service (Internal)** | gRPC (Protocol Buffers 3) | Low-latency, typed communication between microservices |
| **Frontend-to-Backend (External)** | REST (OpenAPI 3.0) + WebSocket | Dashboard data, user interactions, real-time streaming |
| **Event Streaming** | Apache Kafka | Asynchronous, durable event processing between services |

### Why gRPC for Internal APIs?

| Property | Benefit |
|---|---|
| Binary serialization (protobuf) | ~10x smaller payload than JSON; ~5x faster serialization |
| Strong typing | Compile-time type safety; auto-generated client/server code |
| Bi-directional streaming | Real-time feature vector streaming from ingestion to context |
| HTTP/2 multiplexing | Multiple concurrent RPC calls over single connection |
| Service mesh compatible | Native Istio/Envoy integration for mTLS, load balancing |

---

## 2. Protocol Buffer Definitions

### 2.1 Common Types (`common.proto`)

```protobuf
syntax = "proto3";
package gci.common;

import "google/protobuf/timestamp.proto";

// Quality flags for sensor data validation
message QualityFlags {
    bool is_valid           = 1;
    bool is_frozen          = 2;
    bool is_imputed         = 3;
    bool is_anomalous       = 4;
    string imputation_method = 5;  // "none", "last_known_good", "linear_interpolation"
}

// Grade specification
message GradeSpec {
    string grade_id         = 1;
    string grade_name       = 2;
    double target_basis_weight = 3;  // g/m²
    double target_moisture     = 4;  // %
    double target_ash          = 5;  // %
    double target_caliper      = 6;  // μm
}

// Recipe control limits
message RecipeLimits {
    double bw_upper_pct     = 1;  // e.g., 2.5 (meaning +2.5%)
    double bw_lower_pct     = 2;  // e.g., 2.5 (meaning -2.5%)
    double moisture_upper   = 3;  // absolute %
    double moisture_lower   = 4;
    double ash_upper        = 5;
    double ash_lower        = 6;
    double caliper_upper_pct = 7;
    double caliper_lower_pct = 8;
}

// Risk levels
enum RiskLevel {
    RISK_UNKNOWN = 0;
    RISK_SAFE    = 1;
    RISK_WARNING = 2;
    RISK_BREACH  = 3;
}

// Transition phases
enum TransitionPhase {
    PHASE_IDLE        = 0;
    PHASE_INITIATED   = 1;
    PHASE_RAMPING     = 2;
    PHASE_STABILIZING = 3;
    PHASE_COMPLETE    = 4;
    PHASE_ABORTED     = 5;
}

// Standard acknowledgment
message Ack {
    bool   success = 1;
    string message = 2;
    google.protobuf.Timestamp timestamp = 3;
}
```

### 2.2 Ingestion Service (`ingestion.proto`)

```protobuf
syntax = "proto3";
package gci.ingestion;

import "common.proto";
import "google/protobuf/timestamp.proto";

// Normalized feature vector — the canonical data unit flowing through the pipeline
message FeatureVector {
    google.protobuf.Timestamp timestamp = 1;
    string machine_id                   = 2;

    // Process variables (normalized to SI units)
    double stock_flow_pv        = 3;   // kg/min
    double stock_flow_sp        = 4;   // kg/min
    double filler_flow_pv       = 5;   // kg/min
    double filler_flow_sp       = 6;   // kg/min
    double steam_pressure_pv    = 7;   // kPa
    double steam_pressure_sp    = 8;   // kPa
    double machine_speed_pv     = 9;   // m/min
    double machine_speed_sp     = 10;  // m/min

    // Quality variables
    double basis_weight         = 11;  // g/m²
    double moisture             = 12;  // %
    double ash_content          = 13;  // %
    double caliper              = 14;  // μm

    // Additional dynamic tags (extensible)
    map<string, double> additional_tags = 15;

    // Data quality metadata
    gci.common.QualityFlags quality_flags = 16;
    int32 anomaly_score         = 17;  // 0-100 (Isolation Forest output)
}

// Ingestion service — streams normalized features
service IngestionService {
    // Stream normalized feature vectors (server streaming)
    rpc StreamFeatures (StreamFeaturesRequest) returns (stream FeatureVector);

    // Get historical feature vectors for a time range
    rpc GetHistoricalFeatures (HistoricalFeaturesRequest) returns (HistoricalFeaturesResponse);

    // Health check
    rpc HealthCheck (HealthCheckRequest) returns (HealthCheckResponse);
}

message StreamFeaturesRequest {
    string machine_id = 1;
    int32  buffer_size = 2;  // Number of vectors to buffer before sending
}

message HistoricalFeaturesRequest {
    string machine_id = 1;
    google.protobuf.Timestamp start_time = 2;
    google.protobuf.Timestamp end_time   = 3;
    int32 sample_rate_ms = 4;  // Desired sample rate (for downsampling)
}

message HistoricalFeaturesResponse {
    repeated FeatureVector features = 1;
    int32 total_count = 2;
}

message HealthCheckRequest {}
message HealthCheckResponse {
    bool   healthy  = 1;
    string status   = 2;
    int32  tags_active = 3;
    double data_rate_hz = 4;
}
```

### 2.3 Context Service (`context.proto`)

```protobuf
syntax = "proto3";
package gci.context;

import "common.proto";
import "ingestion.proto";
import "google/protobuf/timestamp.proto";

// Historical transition reference
message HistoricalTransition {
    string transition_id         = 1;
    google.protobuf.Timestamp occurred_at = 2;
    gci.common.GradeSpec source_grade     = 3;
    gci.common.GradeSpec target_grade     = 4;
    double stabilization_time_sec = 5;
    double max_bw_deviation_pct   = 6;
    bool   was_successful         = 7;
    double similarity_score       = 8;  // 0.0 - 1.0 (DTW distance, normalized)
    string operator_id            = 9;
    string outcome_summary        = 10;
}

// Alarm state snapshot
message AlarmState {
    int32   active_alarm_count   = 1;
    int32   critical_alarm_count = 2;
    repeated AlarmRecord recent_alarms = 3;
}

message AlarmRecord {
    google.protobuf.Timestamp timestamp = 1;
    string tag_name     = 2;
    string description  = 3;
    string priority     = 4;  // "CRITICAL", "HIGH", "MEDIUM", "LOW"
    string status       = 5;  // "ACTIVE", "ACKNOWLEDGED", "CLEARED"
}

// Scanner health status
message ScannerHealth {
    bool   is_online            = 1;
    bool   is_calibrated        = 2;
    double last_calibration_age_hours = 3;
    string scanner_model        = 4;
    repeated string active_faults = 5;
}

// Complete transition context — the core data object driving prediction and optimization
message TransitionContext {
    string transition_id                = 1;
    string machine_id                   = 2;
    gci.common.TransitionPhase phase    = 3;
    google.protobuf.Timestamp initiated_at = 4;

    gci.common.GradeSpec source_grade    = 5;
    gci.common.GradeSpec target_grade    = 6;
    gci.common.RecipeLimits recipe_limits = 7;

    repeated HistoricalTransition top_k_matches = 8;
    AlarmState current_alarms            = 9;
    ScannerHealth scanner_status         = 10;

    // Recent process data window (last 300 seconds)
    repeated gci.ingestion.FeatureVector recent_window = 11;

    // Derived context features
    double recipe_difficulty_score       = 12;  // 0-1 (based on delta between grades)
    int32  transitions_today             = 13;
    string current_shift                 = 14;  // "DAY", "EVENING", "NIGHT"
    string operator_id                   = 15;
}

// Context service
service ContextService {
    // Get the current transition context (if a grade change is active)
    rpc GetActiveTransition (ActiveTransitionRequest) returns (TransitionContext);

    // Subscribe to transition context updates (server streaming)
    rpc SubscribeTransitions (SubscribeRequest) returns (stream TransitionContext);

    // Get historical transition by ID
    rpc GetTransition (GetTransitionRequest) returns (TransitionContext);
}

message ActiveTransitionRequest {
    string machine_id = 1;
}

message SubscribeRequest {
    string machine_id = 1;
}

message GetTransitionRequest {
    string transition_id = 1;
}
```

### 2.4 Prediction Service (`prediction.proto`)

```protobuf
syntax = "proto3";
package gci.prediction;

import "common.proto";
import "context.proto";
import "google/protobuf/timestamp.proto";

// Single-horizon prediction
message HorizonPrediction {
    int32  horizon_seconds       = 1;   // 30, 60, 90, or 120
    double predicted_bw          = 2;   // g/m² (point estimate)
    double lower_bound           = 3;   // g/m² (conformal lower)
    double upper_bound           = 4;   // g/m² (conformal upper)
    double deviation_pct         = 5;   // % deviation from target
    gci.common.RiskLevel risk    = 6;
}

// Feature attribution (SHAP value)
message FeatureAttribution {
    string feature_name          = 1;   // e.g., "steam_pressure_ramp_rate"
    string display_name          = 2;   // e.g., "Steam Pressure Ramp Rate"
    double shap_value            = 3;   // Signed contribution
    double feature_value         = 4;   // Current value of the feature
    string engineering_unit      = 5;   // e.g., "kPa/s"
    string direction             = 6;   // "INCREASING_RISK" or "DECREASING_RISK"
}

// Complete deviation forecast
message DeviationForecast {
    string forecast_id                   = 1;
    string transition_id                 = 2;
    google.protobuf.Timestamp created_at = 3;

    repeated HorizonPrediction horizons  = 4;
    gci.common.RiskLevel overall_risk    = 5;
    int32 risk_score                     = 6;   // 0-100
    double confidence                    = 7;   // 0.0-1.0

    repeated FeatureAttribution top_attributions = 8;  // Top-5 SHAP values

    // Model metadata
    string model_version                 = 9;
    string tft_model_id                  = 10;
    string lgbm_model_id                 = 11;
}

// Prediction service
service PredictionService {
    // Get deviation forecast for active transition
    rpc PredictDeviation (PredictRequest) returns (DeviationForecast);

    // Subscribe to continuous predictions during active grade change
    rpc SubscribePredictions (SubscribePredictionsRequest) returns (stream DeviationForecast);
}

message PredictRequest {
    gci.context.TransitionContext context = 1;
}

message SubscribePredictionsRequest {
    string transition_id = 1;
    int32  interval_ms   = 2;  // Prediction refresh interval (default: 1000ms)
}
```

### 2.5 Optimization Service (`optimization.proto`)

```protobuf
syntax = "proto3";
package gci.optimization;

import "common.proto";
import "prediction.proto";
import "context.proto";
import "google/protobuf/timestamp.proto";

// A single setpoint adjustment action
message SetpointAction {
    string variable_name         = 1;   // e.g., "steam_pressure"
    string display_name          = 2;   // e.g., "Steam Pressure SP"
    double current_value         = 3;
    double recommended_value     = 4;
    double change_magnitude      = 5;   // |recommended - current|
    double change_pct            = 6;   // % change
    double ramp_rate             = 7;   // units/second
    string engineering_unit      = 8;   // e.g., "kPa"
    string rationale             = 9;   // Brief explanation for this specific adjustment
}

// Constraint satisfaction report
message ConstraintReport {
    bool   all_hard_constraints_met  = 1;
    bool   all_soft_constraints_met  = 2;
    repeated ConstraintStatus constraints = 3;
}

message ConstraintStatus {
    string constraint_name       = 1;
    string constraint_type       = 2;   // "HARD_SAFETY", "HARD_EQUIPMENT", "SOFT_QUALITY", "SOFT_PREFERENCE"
    bool   is_satisfied          = 3;
    double margin                = 4;   // Distance to constraint boundary (positive = satisfied)
    string description           = 5;
}

// Predicted process trajectory after applying recommendation
message TrajectoryForecast {
    repeated TrajectoryPoint points = 1;
}

message TrajectoryPoint {
    int32  seconds_from_now      = 1;
    double predicted_bw          = 2;
    double predicted_moisture    = 3;
    double predicted_ash         = 4;
    double predicted_caliper     = 5;
}

// Complete setpoint recommendation
message SetpointRecommendation {
    string recommendation_id             = 1;
    string transition_id                 = 2;
    google.protobuf.Timestamp created_at = 3;

    repeated SetpointAction actions      = 4;
    TrajectoryForecast predicted_outcome = 5;
    ConstraintReport constraint_report   = 6;

    double predicted_stabilization_sec   = 7;
    double predicted_max_deviation_pct   = 8;
    double predicted_improvement_pct     = 9;  // vs. no intervention

    // Pareto information
    int32  pareto_rank                   = 10;
    string strategy_type                 = 11;  // "CONSERVATIVE", "BALANCED", "AGGRESSIVE"

    // Model metadata
    string surrogate_model_version       = 12;
    string optimizer_config_hash         = 13;
}

// Optimization service
service OptimizationService {
    // Get optimized setpoint recommendation
    rpc OptimizeSetpoints (OptimizeRequest) returns (SetpointRecommendation);

    // What-if analysis: simulate a manual setpoint change
    rpc SimulateWhatIf (WhatIfRequest) returns (WhatIfResponse);
}

message OptimizeRequest {
    gci.prediction.DeviationForecast forecast = 1;
    gci.context.TransitionContext context      = 2;
}

message WhatIfRequest {
    gci.context.TransitionContext context     = 1;
    repeated SetpointAction manual_changes   = 2;
}

message WhatIfResponse {
    TrajectoryForecast predicted_outcome     = 1;
    ConstraintReport constraint_report       = 2;
    double predicted_stabilization_sec       = 3;
    double predicted_max_deviation_pct       = 4;
}
```

### 2.6 Explainability Service (`explainability.proto`)

```protobuf
syntax = "proto3";
package gci.explainability;

import "prediction.proto";
import "optimization.proto";
import "context.proto";
import "google/protobuf/timestamp.proto";

// Multi-level explanation payload
message AdvisoryPayload {
    string advisory_id                   = 1;
    string transition_id                 = 2;
    google.protobuf.Timestamp created_at = 3;

    // The underlying data
    gci.prediction.DeviationForecast forecast       = 4;
    gci.optimization.SetpointRecommendation recommendation = 5;

    // Explanation levels
    OperatorSummary operator_summary     = 6;
    EngineeringDetail engineering_detail = 7;
    AuditRecord audit_record             = 8;
}

// Level 1: Operator-facing plain language summary
message OperatorSummary {
    string risk_headline         = 1;   // e.g., "WARNING: BW predicted to exceed +2.8%"
    string primary_driver        = 2;   // e.g., "Steam Pressure ramp rate (42% contribution)"
    string recommended_action    = 3;   // e.g., "Reduce Steam Pressure SP from 485 to 470 kPa"
    string expected_outcome      = 4;   // e.g., "BW within ±2.0%, stabilize 45s faster"
    string confidence_statement  = 5;   // e.g., "Prediction confidence: 87%"
    gci.common.RiskLevel risk_level = 6;
    int32 risk_score             = 7;
}

// Level 2: Engineering detail with quantitative data
message EngineeringDetail {
    repeated gci.prediction.FeatureAttribution feature_contributions = 1;
    repeated HistoricalComparison historical_comparisons              = 2;
    gci.optimization.ConstraintReport constraint_analysis             = 3;
    gci.optimization.TrajectoryForecast trajectory_comparison         = 4;  // with vs. without recommendation
}

message HistoricalComparison {
    string transition_id         = 1;
    string occurred_date         = 2;
    double similarity_score      = 3;
    string outcome_summary       = 4;   // e.g., "Stabilized in 180s after reducing steam ramp by 15%"
    double max_deviation_pct     = 5;
    double stabilization_sec     = 6;
}

// Level 3: Full audit record for compliance
message AuditRecord {
    string record_id             = 1;
    google.protobuf.Timestamp timestamp = 2;
    string model_versions_json   = 3;   // JSON: all model versions used
    string input_features_json   = 4;   // JSON: complete input feature set
    string output_json           = 5;   // JSON: complete model outputs
    string explanation_json      = 6;   // JSON: complete explanation data
}

// Explainability service
service ExplainabilityService {
    // Generate full advisory payload
    rpc GenerateAdvisory (GenerateAdvisoryRequest) returns (AdvisoryPayload);

    // Stream advisory updates during active transition (WebSocket relay)
    rpc StreamAdvisory (StreamAdvisoryRequest) returns (stream AdvisoryPayload);
}

message GenerateAdvisoryRequest {
    gci.prediction.DeviationForecast forecast       = 1;
    gci.optimization.SetpointRecommendation recommendation = 2;
    gci.context.TransitionContext context            = 3;
}

message StreamAdvisoryRequest {
    string transition_id = 1;
}
```

---

## 3. REST API Specification (Frontend)

### Base URL

```
Production:  https://gci.{mill-domain}/api/v1
Development: http://localhost:8080/api/v1
```

### Authentication

All REST endpoints require a valid OAuth 2.0 Bearer token:
```
Authorization: Bearer <access_token>
```

### 3.1 Transitions API

| Method | Endpoint | Description | Auth Role |
|---|---|---|---|
| `GET` | `/transitions` | List recent transitions (paginated) | Operator, Engineer |
| `GET` | `/transitions/active` | Get currently active transition | Operator, Engineer |
| `GET` | `/transitions/{id}` | Get transition detail by ID | Operator, Engineer |
| `GET` | `/transitions/{id}/timeline` | Get transition event timeline | Engineer |

**Response: `GET /transitions`**

```json
{
    "transitions": [
        {
            "transition_id": "GC-2026-07-25-001",
            "machine_id": "PM-3",
            "source_grade": { "grade_id": "G-120", "grade_name": "Copy 80gsm" },
            "target_grade": { "grade_id": "G-145", "grade_name": "Bond 90gsm" },
            "phase": "COMPLETE",
            "initiated_at": "2026-07-25T14:00:00Z",
            "completed_at": "2026-07-25T14:03:45Z",
            "stabilization_time_sec": 225,
            "max_bw_deviation_pct": 1.8,
            "was_successful": true,
            "predictions_count": 12,
            "recommendation_accepted": true
        }
    ],
    "pagination": {
        "page": 1,
        "page_size": 20,
        "total_count": 1547,
        "total_pages": 78
    }
}
```

### 3.2 Predictions API

| Method | Endpoint | Description | Auth Role |
|---|---|---|---|
| `GET` | `/transitions/{id}/predictions` | Get all predictions for a transition | Operator, Engineer |
| `GET` | `/transitions/{id}/predictions/latest` | Get most recent prediction | Operator, Engineer |

**Response: `GET /transitions/{id}/predictions/latest`**

```json
{
    "forecast_id": "PRED-2026-07-25-001-012",
    "transition_id": "GC-2026-07-25-001",
    "created_at": "2026-07-25T14:01:30Z",
    "horizons": [
        { "horizon_sec": 30, "predicted_bw": 81.2, "deviation_pct": 1.5, "risk": "SAFE" },
        { "horizon_sec": 60, "predicted_bw": 82.8, "deviation_pct": 2.8, "risk": "BREACH" },
        { "horizon_sec": 90, "predicted_bw": 82.1, "deviation_pct": 2.1, "risk": "WARNING" },
        { "horizon_sec": 120, "predicted_bw": 81.0, "deviation_pct": 1.0, "risk": "SAFE" }
    ],
    "overall_risk": "BREACH",
    "risk_score": 78,
    "confidence": 0.87,
    "top_attributions": [
        { "feature": "Steam Pressure Ramp Rate", "shap_value": 0.42, "value": 8.5, "unit": "kPa/s", "direction": "INCREASING_RISK" },
        { "feature": "Stock Flow PV", "shap_value": 0.23, "value": 245, "unit": "kg/min", "direction": "INCREASING_RISK" },
        { "feature": "Machine Speed Delta", "shap_value": 0.18, "value": 15, "unit": "m/min", "direction": "INCREASING_RISK" }
    ],
    "model_version": "tft-v2.3.1+lgbm-v1.8.0"
}
```

### 3.3 Recommendations API

| Method | Endpoint | Description | Auth Role |
|---|---|---|---|
| `GET` | `/transitions/{id}/recommendations` | Get all recommendations | Operator, Engineer |
| `GET` | `/transitions/{id}/recommendations/latest` | Get latest recommendation | Operator, Engineer |
| `POST` | `/transitions/{id}/what-if` | Run what-if simulation | Engineer |

### 3.4 Feedback API

| Method | Endpoint | Description | Auth Role |
|---|---|---|---|
| `POST` | `/transitions/{id}/feedback` | Submit operator feedback | Operator |
| `GET` | `/feedback/analytics` | Get feedback analytics | Engineer, Admin |

**Request: `POST /transitions/{id}/feedback`**

```json
{
    "recommendation_id": "REC-4521",
    "decision": "ACCEPT",
    "operator_id": "OP-1042",
    "modified_setpoints": null,
    "rationale": "",
    "timestamp_utc": "2026-07-25T14:01:45Z"
}
```

### 3.5 Explanation API

| Method | Endpoint | Description | Auth Role |
|---|---|---|---|
| `GET` | `/transitions/{id}/explanation` | Get full advisory payload | Operator, Engineer |

### 3.6 Model Health API

| Method | Endpoint | Description | Auth Role |
|---|---|---|---|
| `GET` | `/models/status` | Get all model health metrics | Engineer, Admin |
| `GET` | `/models/{model_id}/drift` | Get drift analysis for a model | Engineer, Admin |
| `GET` | `/models/{model_id}/performance` | Get performance history | Engineer, Admin |

### 3.7 Configuration API

| Method | Endpoint | Description | Auth Role |
|---|---|---|---|
| `GET` | `/config/recipes` | List all grade recipes | Engineer, Admin |
| `PUT` | `/config/recipes/{grade_id}` | Update a grade recipe | Admin |
| `GET` | `/config/constraints` | List all constraints | Engineer, Admin |
| `PUT` | `/config/constraints/{id}` | Update a constraint | Admin |
| `GET` | `/config/tags` | List tag dictionary | Engineer, Admin |

### 3.8 WebSocket API

```
Endpoint: ws://gci.{mill-domain}/api/v1/advisory/stream

// Client sends subscription message:
{
    "action": "subscribe",
    "machine_id": "PM-3"
}

// Server pushes AdvisoryPayload on every prediction cycle during active grade change:
{
    "type": "advisory_update",
    "payload": { /* Full AdvisoryPayload JSON */ }
}

// Server sends transition lifecycle events:
{
    "type": "transition_event",
    "event": "INITIATED" | "RAMPING" | "STABILIZING" | "COMPLETE" | "ABORTED",
    "transition_id": "GC-2026-07-25-001"
}
```

---

## 4. Kafka Topic Contracts

| Topic | Producer | Consumer(s) | Key | Value Schema | Partitions | Retention |
|---|---|---|---|---|---|---|
| `gci.raw_data.{machine_id}` | Edge Gateway | Ingestion Service | timestamp | Raw OPC-UA data | 3 | 24 hours |
| `gci.normalized.{machine_id}` | Ingestion Service | Context Engine | timestamp | FeatureVector (protobuf) | 3 | 72 hours |
| `gci.transitions` | Context Engine | Prediction, Optimization | transition_id | TransitionContext (protobuf) | 3 | 30 days |
| `gci.predictions` | Prediction Engine | Optimization, Explainability | forecast_id | DeviationForecast (protobuf) | 3 | 30 days |
| `gci.recommendations` | Optimization Engine | Explainability | recommendation_id | SetpointRecommendation (protobuf) | 3 | 30 days |
| `gci.advisories` | Explainability Engine | WebSocket Gateway | advisory_id | AdvisoryPayload (protobuf) | 3 | 30 days |
| `gci.feedback` | Feedback Service | Knowledge Base, MLOps | feedback_id | OperatorFeedback (JSON) | 1 | Indefinite |
| `gci.alerts` | All Services | Alerting Service | alert_id | SystemAlert (JSON) | 1 | 7 days |

---

## 5. Error Handling Convention

All gRPC services use standard gRPC status codes:

| Status Code | Usage |
|---|---|
| `OK` | Successful response |
| `INVALID_ARGUMENT` | Malformed request (e.g., missing required field) |
| `NOT_FOUND` | Requested resource does not exist (e.g., unknown transition_id) |
| `UNAVAILABLE` | Service temporarily unavailable (e.g., model loading) |
| `DEADLINE_EXCEEDED` | Inference latency exceeded timeout |
| `INTERNAL` | Unexpected server error |
| `PERMISSION_DENIED` | Insufficient role for the requested operation |

All REST APIs return standard HTTP status codes with error body:

```json
{
    "error": {
        "code": "TRANSITION_NOT_FOUND",
        "message": "Transition GC-2026-07-25-999 does not exist",
        "details": { "transition_id": "GC-2026-07-25-999" },
        "request_id": "req-abc123",
        "timestamp": "2026-07-25T14:00:00Z"
    }
}
```
