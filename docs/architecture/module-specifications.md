# Module Specifications — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-ARCH-MOD-001
**Version:** 2.0
**Last Updated:** 2026-07-25

---

## Module Summary Matrix

### Core Modules (Approved Architecture)

| ID | Module Name | Service | Primary Responsibility | Inbound Dependencies | Outbound Dependencies |
|---|---|---|---|---|---|
| M1 | Data Ingestion & Normalization | `ingestion` | Acquire, validate, align, normalize process data | Edge Gateway (Kafka) | M2 Context Engine |
| M2 | Grade Change Context Engine | `context` | Detect grade changes, build transition context | M1, M7 Knowledge Base | M3 Prediction, M4 Optimization, M11 Similarity |
| M3 | Deviation Prediction Engine | `prediction` | Forecast BW trajectory, classify deviation risk | M2, M7 | M4 Optimization, M5 Explainability, M12 Root Cause |
| M4 | Setpoint Optimization Engine | `optimization` | Recommend optimal setpoints via surrogate + optimizer | M3, M2, M7 | M5 Explainability, M9 Digital Twin |
| M5 | Explainability & Reasoning Engine | `explainability` | Generate engineering-language explanations | M3, M4, M2, M9, M10, M11, M12, M13 | Frontend (HMI) |
| M6 | Operator Feedback & Continuous Learning | `feedback` | Capture feedback, compute rewards, trigger retraining; Smart safeguards (E7) | Frontend (HMI) | M7, M8 MLOps |
| M7 | Process Knowledge Base | `knowledge` | Serve recipes, constraints, history, rules | M6 Feedback | M2, M3, M4, M5, M11 |
| M8 | Model Monitoring & MLOps | `mlops` | Drift detection, model registry, retraining pipelines | M6 Feedback | M3, M4 |

### Enhancement Modules (v2.0)

| ID | Module Name | Service | Primary Responsibility | Inbound Dependencies | Outbound Dependencies | Phase |
|---|---|---|---|---|---|---|
| M9 | Digital Twin Module | `digital-twin` | Simulate what-if scenarios; validate recommendations | M4, M2, M1 (Redis) | M5 Explainability, M10 Confidence | Phase 2 |
| M10 | Confidence Engine | `confidence` | Aggregate multi-dimensional confidence metrics | M3, M4, M9, M11 | M5 Explainability, Frontend | Phase 1/2 |
| M11 | Historical Similarity Engine | `similarity` | Find & rank similar past transitions (KNN-DTW) | M2, M7 | M3, M5, M10, M13, Frontend | Phase 1 |
| M12 | Root Cause Ranking Engine | `root-cause` | Rank variables by deviation contribution (SHAP) | M3, M7 | M5 Explainability, Frontend | Phase 1 |
| M13 | Transition Timeline Predictor | `timeline` | Predict stabilization time & phase schedule | M3, M9, M11 | M5 Explainability, Frontend | Phase 2 |

> **See** [enhancements.md](enhancements.md) **for full specifications of modules M9–M13.**

---

## Module 1: Data Ingestion & Normalization

### Overview
The first stage of the data pipeline. Responsible for converting raw industrial signals from heterogeneous sources into a clean, time-aligned, normalized feature vector suitable for ML consumption.

### Detailed Responsibilities

| # | Responsibility | Description | Non-Functional Requirement |
|---|---|---|---|
| 1.1 | Protocol Adaptation | Consume OPC-UA subscriptions (real-time) and REST/SQL queries (historian backfill) | Support 500+ simultaneous tag subscriptions |
| 1.2 | Tag Mapping | Map DCS tag names (e.g., `FIC-101.PV`) to canonical names (`stock_flow_pv`) using configurable tag dictionary | Hot-reloadable YAML config; no service restart |
| 1.3 | Schema Validation | Validate incoming data against expected schema (type, range, units) | Reject malformed records; emit to dead-letter topic |
| 1.4 | Time Alignment | Resample all signals to common 1-second grid; forward-fill 5-second QCS data | Max jitter tolerance: 100ms |
| 1.5 | Unit Conversion | Convert all values to SI units using configurable conversion factors | Support imperial-to-metric for US mills |
| 1.6 | Z-Score Normalization | Compute rolling z-scores (window: 1 hour) for ML feature normalization | Update statistics incrementally (no full recomputation) |
| 1.7 | Bad-Value Detection | Detect frozen signals, spikes, NaN, and communication dropouts | Configurable detection thresholds per tag |
| 1.8 | Imputation | Replace bad values using last-known-good, linear interpolation, or model-based methods | Configurable strategy per tag; log all imputations |
| 1.9 | Feature Store Write | Write aligned feature vectors to TimescaleDB (cold) and Redis (hot cache, last 10 min) | Write throughput: 1000 vectors/sec |
| 1.10 | Anomaly Pre-Filtering | Run Isolation Forest on incoming signals to flag sensor anomalies | False positive rate < 1%; alert on detection |

### AI/ML Techniques

| Technique | Component | Justification |
|---|---|---|
| **Isolation Forest** | Anomaly pre-filtering (1.10) | Unsupervised; no labeled data required; sub-millisecond inference; ideal for detecting sensor faults, frozen values, and out-of-range readings in real-time streams |
| **Exponential Moving Average** | Rolling statistics (1.6) | Memory-efficient; naturally weights recent data more heavily; suitable for slowly drifting process baselines |

### Configuration

```yaml
# tag_dictionary.yaml (example)
tags:
  - dcs_tag: "FIC-101.PV"
    canonical: "stock_flow_pv"
    unit: "kg/min"
    expected_range: [50, 500]
    sample_rate_ms: 1000
    imputation: "last_known_good"
    anomaly_threshold: 3.5  # z-score

  - dcs_tag: "QCS-BW.MD"
    canonical: "basis_weight"
    unit: "g/m2"
    expected_range: [30, 350]
    sample_rate_ms: 5000
    imputation: "linear_interpolation"
    anomaly_threshold: 4.0
```

---

## Module 2: Grade Change Context Engine

### Overview
Detects grade change events, retrieves recipe parameters, finds similar historical transitions, and assembles the complete context object that drives prediction and optimization.

### Detailed Responsibilities

| # | Responsibility | Description | Non-Functional Requirement |
|---|---|---|---|
| 2.1 | Grade Change Detection | Monitor DCS sequence-of-events for grade change initiation signals | Detect within 1 second of DCS event; zero false negatives |
| 2.2 | Implicit Change Detection | Detect grade changes via setpoint step-changes exceeding thresholds (fallback) | Configurable thresholds per variable |
| 2.3 | Recipe Retrieval | Pull target grade recipe: BW, Moisture, Ash, Caliper targets + limits | Cache recipes in Redis; refresh on recipe update event |
| 2.4 | Historical Matching | Find top-K most similar past transitions (same source→target pair) | K configurable (default: 5); sub-100ms retrieval |
| 2.5 | Context Assembly | Build `TransitionContext` object with current state + recipe + history + alarms | Immutable object; versioned for audit |
| 2.6 | Transition Lifecycle | Track transition phases: INITIATED → RAMPING → STABILIZING → COMPLETE | Persist state transitions to database |

### AI/ML Techniques

| Technique | Component | Justification |
|---|---|---|
| **KNN with Dynamic Time Warping (DTW)** | Historical matching (2.4) | DTW handles transitions of different durations (faster/slower ramps); KNN retrieves the most operationally similar past transitions; similarity metric is physically meaningful |
| **Deterministic State Machine** | Grade change detection (2.1, 2.6) | Safety-critical detection logic must be deterministic and auditable; matches ISA-88 batch state model; no probabilistic uncertainty in event detection |

### State Machine Diagram

```
                     ┌──────────┐
           ┌────────►│  IDLE    │◄──────────┐
           │         └─────┬────┘           │
           │               │ Grade Change   │ Transition
           │               │ Detected       │ Complete
           │         ┌─────▼────┐           │
           │         │INITIATED │           │
           │         └─────┬────┘           │
           │               │ Setpoints      │
           │               │ Start Moving   │
           │         ┌─────▼────┐           │
           │         │ RAMPING  │           │
    Abort  │         └─────┬────┘           │
    Event  │               │ Setpoints      │
           │               │ Within 1%      │
           │         ┌─────▼────────┐       │
           │         │ STABILIZING  ├───────┘
           │         └─────┬────────┘
           │               │ Timeout
           └───────────────┘ (Abnormal)
```

---

## Module 3: Deviation Prediction Engine

### Overview
The core intelligence module. Predicts whether Basis Weight will deviate beyond ±2.5% during the current grade transition, with multi-horizon forecasting and calibrated confidence estimation.

### Detailed Responsibilities

| # | Responsibility | Description | Non-Functional Requirement |
|---|---|---|---|
| 3.1 | Feature Preparation | Assemble input tensor: last 300s of process data + static context features | < 10ms assembly time |
| 3.2 | Multi-Horizon Forecast | Predict BW trajectory at t+30s, t+60s, t+90s, t+120s | TFT model; ONNX Runtime inference |
| 3.3 | Deviation Classification | Classify each horizon: SAFE / WARNING (within 1% of limit) / BREACH | LightGBM classifier on TFT output + context |
| 3.4 | Confidence Estimation | Compute calibrated prediction intervals using conformal prediction | Guaranteed 90% coverage probability |
| 3.5 | Feature Attribution | Compute SHAP values for top contributing features | Top-5 features per prediction |
| 3.6 | Risk Scoring | Compute composite risk score (0–100) from classification + confidence + alarm state | Deterministic formula; auditable |

### Model Architecture

```
Input Features (300s window × 12 variables + static context)
        │
        ▼
┌───────────────────────┐
│  Temporal Fusion      │     Static Features:
│  Transformer (TFT)    │◄─── Grade pair, recipe difficulty,
│                       │     shift, machine section, season
│  - Variable Selection │
│  - LSTM Encoder       │
│  - Multi-Head Attn    │
│  - Quantile Output    │
└───────────┬───────────┘
            │ BW trajectory (t+30, t+60, t+90, t+120)
            │ + Attention weights
            ▼
┌───────────────────────┐
│  LightGBM Classifier  │     Additional Features:
│                       │◄─── Alarm count, scanner health,
│  - TFT forecast       │     operator action history,
│  - Trajectory shape   │     time-since-last-change
│  - Rate of change     │
└───────────┬───────────┘
            │ Risk class + probability
            ▼
┌───────────────────────┐
│  Conformal Predictor   │
│  - Calibrated CI       │
│  - Coverage guarantee  │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│  SHAP Explainer        │
│  - Top-5 attributions  │
│  - Waterfall chart     │
└───────────────────────┘
```

### AI/ML Technique Justification

#### Temporal Fusion Transformer (TFT)

**Why TFT over alternatives?**

| Alternative | Limitation for this use case |
|---|---|
| LSTM / GRU | No built-in variable selection; poor with static covariates; no attention for interpretability |
| Prophet / ARIMA | Designed for long-horizon trends; not suitable for 30–120s industrial forecasting |
| N-BEATS | No support for exogenous variables; pure time-series decomposition |
| Transformer (vanilla) | No variable selection network; no static covariate handling; requires more data |
| **TFT (selected)** | ✅ Variable selection, ✅ static + dynamic inputs, ✅ multi-horizon, ✅ interpretable attention, ✅ quantile output |

#### LightGBM (Risk Classification)

**Why a separate classifier?**

The TFT outputs a continuous BW trajectory. However, the operational decision is discrete: "Will BW breach the ±2.5% limit?" The LightGBM classifier:
- Ingests the TFT trajectory as features (predicted values, slopes, curvatures)
- Adds contextual features the TFT cannot process (alarm state, operator actions, scanner health)
- Provides a crisp probability for threshold-based alerting
- Is extremely fast (< 5ms inference)
- Supports SHAP natively for explainability

#### Conformal Prediction

**Why not just use TFT quantile outputs?**

TFT quantile outputs are not guaranteed to be calibrated. Conformal prediction provides **distribution-free, finite-sample coverage guarantees** — meaning if we say "90% confidence interval," exactly 90% of future observations will fall within the interval. This is critical for industrial trustworthiness.

---

## Module 4: Setpoint Optimization Engine

### Overview
When Module 3 predicts a deviation risk, Module 4 computes optimal setpoint adjustments that minimize BW deviation while respecting all operational constraints.

### Detailed Responsibilities

| # | Responsibility | Description | Non-Functional Requirement |
|---|---|---|---|
| 4.1 | Constraint Formulation | Build optimization constraint set from recipe + equipment limits | Constraints are hard (safety) and soft (quality) |
| 4.2 | Surrogate Simulation | Simulate process response using Neural ODE surrogate model | < 50ms per simulation; accuracy > 95% vs historian |
| 4.3 | Multi-Objective Optimization | Optimize for min(BW deviation) + min(stabilization time) + min(aggressiveness) | NSGA-III; Pareto front with 3–5 candidates |
| 4.4 | Recommendation Selection | Select best candidate from Pareto front using preference weights | Weights configurable per mill; default: 50/30/20 |
| 4.5 | Safety Validation | Verify every recommendation against hard limits; reject violations | Zero tolerance for safety limit violations |
| 4.6 | What-If Simulation | Allow engineers to manually adjust setpoints and see predicted outcome | Interactive mode via Engineering Console |

### Constraint Categories

| Category | Examples | Enforcement |
|---|---|---|
| **Hard Safety Limits** | Steam Pressure < max rating; Machine Speed < mechanical limit | Absolute; never violated; gate check before output |
| **Equipment Limits** | Valve position 0–100%; ramp rate < max actuator speed | Absolute; never violated |
| **Quality Limits** | BW ±2.5%; Moisture ±0.5%; Ash ±1.0% | Optimization objective (minimize violation) |
| **Operational Preferences** | Prefer smaller setpoint changes; avoid oscillation | Soft constraint (penalty term in objective) |

### Neural ODE Surrogate Model

**Why Neural ODE over alternatives?**

| Alternative | Limitation |
|---|---|
| First-Principles Model | Requires detailed process knowledge; long development time; brittle to unmeasured disturbances |
| Standard Neural Network | Black-box; no continuous-time dynamics; requires fixed time steps |
| Gaussian Process | Scales poorly with training data (O(n³)); too slow for real-time optimization |
| **Neural ODE (selected)** | ✅ Learns continuous-time dynamics from data; ✅ physically interpretable as ODE system; ✅ handles irregular time steps; ✅ sample-efficient; ✅ differentiable (gradient-based optimization possible) |

---

## Module 5: Explainability & Reasoning Engine

### Overview
Translates ML outputs into actionable, trustworthy engineering explanations at three detail levels.

### Explanation Levels

| Level | Audience | Content | Delivery |
|---|---|---|---|
| **L1: Operator Summary** | Machine operator | 2–3 sentences in plain language; color-coded risk indicator | HMI advisory panel (WebSocket push) |
| **L2: Engineering Detail** | Process engineer | SHAP waterfall, trajectory charts, historical comparisons, constraint tables | Engineering console (REST + WebSocket) |
| **L3: Audit Record** | Compliance / QA | Complete JSON record: inputs, outputs, model version, operator decision | Immutable audit database (21 CFR Part 11) |

### Example Explanations

**L1 — Operator Summary:**
> ⚠️ **WARNING: Basis Weight predicted to exceed +2.8% at t+60s.**
> Primary driver: Steam Pressure ramp rate is too aggressive (42% contribution).
> Recommended: Reduce Steam Pressure SP from 485 kPa to 470 kPa. This is expected to bring BW within ±2.0% and stabilize 45 seconds faster.
> [ACCEPT] [REJECT] [VIEW DETAILS]

**L2 — Engineering Detail:**
> | Feature | Current Value | Contribution | Direction |
> |---|---|---|---|
> | Steam Pressure Ramp Rate | 8.5 kPa/s | +42% | ↑ Driving overshoot |
> | Stock Flow PV | 245 kg/min | +23% | ↑ Above optimal |
> | Machine Speed Delta | +15 m/min | +18% | ↑ Speed increase |
> | Moisture | 6.2% | -8% | ↓ Counteracting |
> | Filler Flow | 12 kg/min | -5% | ↓ Stable |
>
> **Similar Historical Transition:** GC-2025-11-14-003 (91% similarity)
> - That transition stabilized in 180s after reducing Steam Pressure ramp by 15%
> - Current model confidence: 87% (34 similar transitions in training data)

### Design Decision: No LLMs

Template-based NLG is used exclusively. Rationale:
1. **Determinism** — Same inputs always produce same explanation
2. **Auditability** — Templates are version-controlled; every explanation is traceable
3. **Safety** — No hallucination risk in safety-critical industrial context
4. **Performance** — Sub-5ms generation; no GPU required
5. **Compliance** — 21 CFR Part 11 requires reproducible electronic records

---

## Module 6: Operator Feedback & Continuous Learning

### Overview
Captures operator Accept/Reject decisions, evaluates actual transition outcomes, computes reward signals, and triggers model improvement.

### Feedback Loop Architecture

```
Operator Action                Actual Outcome
     │                              │
     │  Accept / Reject / Modify    │  BW trajectory (post-transition)
     │                              │
     ▼                              ▼
┌─────────────┐            ┌──────────────┐
│  Feedback   │            │   Outcome    │
│  Collector  │            │  Evaluator   │
└──────┬──────┘            └──────┬───────┘
       │                          │
       └──────────┬───────────────┘
                  │
         ┌────────▼────────┐
         │  Reward Signal  │
         │  Calculator     │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌───────┐  ┌──────────┐  ┌──────────┐
│Online │  │Contextual│  │Retraining│
│Learner│  │ Bandit   │  │ Trigger  │
└───────┘  └──────────┘  └──────────┘
```

### Reward Function

```
R = α × prediction_accuracy
  + β × operator_acceptance
  + γ × stabilization_improvement
  + δ × constraint_satisfaction

where:
  α = 0.40  (prediction accuracy is most important)
  β = 0.25  (operator trust matters)
  γ = 0.25  (business value: time savings)
  δ = 0.10  (safety: no limit violations)
```

### Retraining Triggers

| Trigger | Condition | Action |
|---|---|---|
| **Accumulated Feedback** | 50+ new feedback records since last training | Schedule incremental retraining |
| **Data Drift Detected** | PSI > 0.2 on any key feature | Alert + schedule retraining |
| **Concept Drift Detected** | Rolling accuracy drops below 80% | Alert + schedule retraining |
| **Scheduled** | Weekly (Sunday 02:00 UTC) | Full retraining with latest data |
| **Manual** | Engineer-triggered | On-demand retraining |

---

## Module 7: Process Knowledge Base

### Overview
Single source of truth for all domain knowledge. Serves as a shared dependency for Modules 2, 3, 4, and 5.

### Data Model

```
┌─────────────────────────────────────────────┐
│              Process Knowledge Base          │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │  Recipe   │  │Constraint│  │Engineering│ │
│  │  Library  │  │  Library │  │   Rules   │ │
│  │          │  │          │  │           │ │
│  │ - Grades  │  │ - Hard   │  │ - BW ∝    │ │
│  │ - Targets │  │ - Soft   │  │   StockF/ │ │
│  │ - Limits  │  │ - Ramp   │  │   Speed   │ │
│  │ - Ramps   │  │ - Equip  │  │ - Moist ∝ │ │
│  └──────────┘  └──────────┘  │   Steam   │ │
│                              └───────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │Transition│  │ Operator │  │  Process   │ │
│  │ History  │  │Knowledge │  │  Glossary  │ │
│  │          │  │          │  │           │ │
│  │ - Past   │  │ - Prefer │  │ - Tag desc│ │
│  │   changes│  │ - Trust  │  │ - Units   │ │
│  │ - Outcomes│  │ - Notes  │  │ - Ranges  │ │
│  │ - Scores │  │ - Shifts │  │ - Groups  │ │
│  └──────────┘  └──────────┘  └───────────┘ │
└─────────────────────────────────────────────┘
```

### Storage Backend

| Sub-Component | Storage | Justification |
|---|---|---|
| Recipe Library | PostgreSQL (relational, versioned) | Structured data; version control; referential integrity |
| Constraint Library | PostgreSQL + JSONB | Mixed structured/semi-structured; flexible schema evolution |
| Engineering Rules | YAML files (version-controlled in Git) | Human-readable; reviewed by process engineers; CI/CD integrated |
| Transition History | TimescaleDB (time-series extension on PostgreSQL) | Time-partitioned; compression; continuous aggregates for analytics |
| Operator Knowledge | PostgreSQL | Relational; joins with transition history |
| Process Glossary | PostgreSQL + Elasticsearch | Full-text search for explanability engine; fast lookups |

---

## Module 8: Model Monitoring & MLOps

### Overview
Ensures all deployed models remain accurate and performant. Manages the complete model lifecycle.

### Model Lifecycle

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   DATA   │───►│ TRAINING │───►│  EVAL    │───►│  SHADOW  │
│VALIDATION│    │          │    │          │    │DEPLOYMENT│
└──────────┘    └──────────┘    └──────────┘    └─────┬────┘
                                                       │
                                                       │ Statistical
                                                       │ improvement
                                                       │ confirmed
                                                       ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ RETIRED  │◄───│MONITORING│◄───│PRODUCTION│◄───│ CHAMPION │
│          │    │          │    │          │    │PROMOTION │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### Monitoring Metrics

| Metric Category | Specific Metrics | Alert Threshold |
|---|---|---|
| **Prediction Accuracy** | MAE, RMSE, MAPE on BW forecast | MAE > 1.5 g/m² |
| **Classification Performance** | Accuracy, Precision, Recall, F1 for SAFE/WARNING/BREACH | F1 < 0.80 |
| **Confidence Calibration** | Empirical coverage vs. nominal (90%) | Coverage < 85% or > 95% |
| **Data Drift** | PSI per feature | PSI > 0.2 (any feature) |
| **Concept Drift** | Page-Hinkley statistic on rolling error | PH > threshold |
| **Latency** | p50, p95, p99 inference latency | p95 > 200ms |
| **Throughput** | Predictions per second | < 10 pred/sec |
| **Operator Trust** | Accept rate (rolling 30-day) | Accept rate < 60% |
