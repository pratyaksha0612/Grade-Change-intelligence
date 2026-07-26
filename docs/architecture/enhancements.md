# Architecture Enhancements — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-ARCH-ENH-001
**Version:** 1.0
**Last Updated:** 2026-07-25
**Status:** Enhancement Specification — Extends Approved Architecture (HPS-GCI-ARCH-MOD-001 v1.0)

> [!IMPORTANT]
> This document **extends** the approved GCI architecture. No existing modules (M1–M8) are modified or replaced. All enhancements integrate with the existing module boundaries and communication patterns.

---

## Enhancement Summary

| ID | Enhancement | New Service? | Integrates With | Priority |
|---|---|---|---|---|
| E1 | Digital Twin Module | Yes → `digital-twin` (M9) | M4 Optimization, M5 Explainability, M3 Prediction | Phase 1 |
| E2 | Confidence Engine | Yes → `confidence` (M10) | M3 Prediction, M4 Optimization, M2 Context, M9 Digital Twin | Phase 1 |
| E3 | Historical Similarity Engine | Yes → `similarity` (M11) | M2 Context, M7 Knowledge, M5 Explainability | Phase 1 |
| E4 | Root Cause Ranking Engine | Yes → `root-cause` (M12) | M3 Prediction, M5 Explainability | Phase 1 |
| E5 | Transition Timeline Predictor | Yes → `timeline` (M13) | M3 Prediction, M9 Digital Twin, M11 Similarity | Phase 2 |
| E6 | Enterprise Dashboard Specification | No (Frontend) | All modules via REST/WebSocket | Phase 1 |
| E7 | Smart Operator Feedback | Enhancement to M6 | M6 Feedback, M7 Knowledge, M8 MLOps | Phase 2 |
| E8 | Implementation Priority Matrix | N/A | All modules | N/A |

### Updated Architecture Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     GCI PLATFORM — ENHANCED ARCHITECTURE                │
│                                                                         │
│  EXISTING MODULES (Approved)           NEW ENHANCEMENTS                 │
│  ────────────────────────────          ─────────────────                 │
│                                                                         │
│  ┌──────────┐  ┌──────────┐           ┌──────────────┐                 │
│  │ M1       │  │ M2       │      ┌───►│ M11          │                 │
│  │ Ingestion│─►│ Context  │──────┤    │ Historical   │                 │
│  │          │  │ Engine   │      │    │ Similarity   │                 │
│  └──────────┘  └────┬─────┘      │    └──────┬───────┘                 │
│                     │            │           │                          │
│                     ▼            │           ▼                          │
│  ┌──────────────────────────┐    │    ┌──────────────┐                 │
│  │ M3 Deviation Prediction  │────┤    │ M12          │                 │
│  │ Engine                   │────┼───►│ Root Cause   │                 │
│  └────────────┬─────────────┘    │    │ Ranking      │                 │
│               │                  │    └──────┬───────┘                 │
│               ▼                  │           │                          │
│  ┌──────────────────────────┐    │           │                          │
│  │ M4 Setpoint Optimization │    │           │                          │
│  │ Engine                   │    │           │                          │
│  └────────────┬─────────────┘    │           │                          │
│               │                  │           │                          │
│               ▼                  │           │                          │
│  ┌──────────────────────────┐    │    ┌──────┴───────┐                 │
│  │ M9  Digital Twin         │◄───┘    │ M10          │                 │
│  │     Simulation Engine    │────────►│ Confidence   │                 │
│  └────────────┬─────────────┘         │ Engine       │                 │
│               │                       └──────┬───────┘                 │
│               ▼                              │                          │
│  ┌──────────────────────────┐         ┌──────▼───────┐                 │
│  │ M5 Explainability        │◄────────│ M13          │                 │
│  │ & Reasoning Engine       │         │ Transition   │                 │
│  └────────────┬─────────────┘         │ Timeline     │                 │
│               │                       └──────────────┘                 │
│               ▼                                                        │
│  ┌──────────────────────────┐  ┌──────────────┐  ┌───────────────┐    │
│  │ M6 Operator Feedback     │  │ M7 Knowledge │  │ M8 MLOps      │    │
│  │ + Smart Safeguards (E7)  │  │ Base         │  │               │    │
│  └──────────────────────────┘  └──────────────┘  └───────────────┘    │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              ENTERPRISE DASHBOARD (E6)                          │   │
│  │  Navigation │ Live Status │ Advisory │ History │ Feedback │ Alarms│   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# Enhancement 1: Digital Twin Module (M9)

## Why This Improves the Operator's Workflow

Today, when the Optimization Engine (M4) recommends a setpoint change, the operator must trust the recommendation blindly or rely on personal experience. The Digital Twin adds a **visible simulation layer** — the operator can see *what the machine will do* before committing to a change. This transforms the system from "trust the AI" to "see the evidence, then decide."

**Operator value:**
- See predicted BW, Moisture, Ash, and Caliper trajectories for any setpoint scenario
- Compare "do nothing" vs. "apply recommendation" vs. "custom adjustment" side-by-side
- Build confidence through visual evidence before accepting setpoint changes
- Engineers can use it offline for process optimization studies

## Where It Fits in the Existing Architecture

The Digital Twin **sits between M4 (Optimization) and M5 (Explainability)** in the prediction pipeline. It also serves as a standalone simulation engine accessible to the Engineering Console.

```
                     M3 Prediction                  M2 Context
                         │                              │
                         ▼                              │
                    M4 Optimization                     │
                         │                              │
            ┌────────────┼────────────┐                 │
            │            │            │                 │
            ▼            ▼            ▼                 │
       ┌─────────────────────────────────┐              │
       │        M9 DIGITAL TWIN          │◄─────────────┘
       │                                 │
       │  ┌───────────┐  ┌───────────┐  │
       │  │ Process   │  │ Scenario  │  │
       │  │ Simulator │  │ Evaluator │  │
       │  │ (Neural   │  │           │  │
       │  │  ODE)     │  │ Compare:  │  │
       │  │           │  │ • Baseline│  │
       │  │ dx/dt =   │  │ • Recom.  │  │
       │  │ f(x,u,t)  │  │ • Custom  │  │
       │  └─────┬─────┘  └─────┬─────┘  │
       │        │               │        │
       │        ▼               ▼        │
       │  ┌────────────────────────────┐ │
       │  │ Validation Gate            │ │
       │  │ • Constraint check         │ │
       │  │ • Stability check          │ │
       │  │ • Confidence scoring       │ │
       │  └────────────────────────────┘ │
       └──────────────┬──────────────────┘
                      │
                      ▼
                 M5 Explainability
                      │
                      ▼
               Operator HMI
```

## Detailed Design

### Inputs

| Input | Source | Description |
|---|---|---|
| Current Process State | M1 Ingestion (Redis hot cache) | Latest feature vector: all PVs and SPs |
| Transition Context | M2 Context Engine | Source grade, target grade, recipe limits, phase |
| Recommended Setpoints | M4 Optimization Engine | NSGA-III Pareto-optimal setpoint actions |
| Custom Setpoints | Operator / Engineer (via HMI) | Manual "what-if" adjustments |
| Process Constraints | M7 Knowledge Base | Hard limits, soft limits, ramp rate limits |
| Surrogate Model | M8 MLOps (Model Registry) | Trained Neural ODE weights (ONNX) |

### Outputs

| Output | Consumer | Description |
|---|---|---|
| `SimulationResult` | M5 Explainability, Frontend | Predicted quality trajectories for each scenario |
| `ScenarioComparison` | Frontend (Engineering Console) | Side-by-side comparison matrix |
| `ValidationReport` | M4 Optimization (feedback) | Whether the recommended setpoints pass all checks |
| `SimulationConfidence` | M10 Confidence Engine | Surrogate model uncertainty for this scenario |

### Simulation Flow

```
Step 1: INITIALIZE
    ├── Load current process state x₀ = [BW, Moisture, Ash, Caliper]
    ├── Load control inputs u₀ = [StockFlow_SP, FillerFlow_SP, SteamPress_SP, MachSpeed_SP]
    └── Load Neural ODE model f(x, u, t)

Step 2: DEFINE SCENARIOS
    ├── Scenario A: "Baseline" — no intervention (current ramp trajectory)
    ├── Scenario B: "AI Recommended" — apply M4's setpoint recommendation
    ├── Scenario C: "Custom" — operator's manual what-if adjustments
    └── (Optional) Scenario D-N: parametric sweep (±1%, ±2%, ±3% on any variable)

Step 3: SIMULATE EACH SCENARIO
    For each scenario s ∈ {A, B, C, ...}:
    │
    ├── Apply control input profile u_s(t) over simulation horizon (0 → 300 seconds)
    │
    ├── Solve Neural ODE:
    │       dx/dt = f(x, u_s(t), t)
    │       x(0) = x₀
    │       → x(t) for t ∈ {1s, 2s, ..., 300s}
    │
    ├── Extract quality trajectory:
    │       BW(t), Moisture(t), Ash(t), Caliper(t)
    │
    ├── Compute metrics:
    │       • max_deviation = max(|BW(t) - BW_target|) / BW_target × 100
    │       • stabilization_time = first t where |BW(t) - BW_target| < 1% for 30+ seconds
    │       • total_off_spec_time = Σ(BW(t) outside ±2.5%) × dt
    │       • energy_cost_proxy = ∫ |SteamPressure_SP(t) - SteamPressure_SP₀| dt
    │
    └── Compute simulation confidence (see M10 Confidence Engine)

Step 4: VALIDATE
    ├── Hard constraint check: Does any setpoint exceed safety limits?
    ├── Stability check: Does the simulated trajectory converge or diverge?
    ├── Physically plausible? Is max |dx/dt| within reasonable bounds?
    └── Result: PASS / FAIL / WARN for each scenario

Step 5: COMPARE & RANK
    ├── Build comparison matrix across all scenarios
    ├── Rank by composite score: 0.50×deviation + 0.30×stabilization + 0.20×aggressiveness
    └── Emit ScenarioComparison to M5 and Frontend

Step 6: EMIT
    ├── SimulationResult → M5 Explainability (for explanation generation)
    ├── ValidationReport → M4 Optimization (feedback loop)
    └── SimulationConfidence → M10 Confidence Engine
```

### Example What-If Queries

| Query | Translation | Simulation |
|---|---|---|
| *"What happens if Steam Pressure increases by 3%?"* | u_SteamPress = current_SP × 1.03 | Simulate with modified steam SP; compare to baseline |
| *"What happens if Machine Speed decreases by 2%?"* | u_MachSpeed = current_SP × 0.98 | Simulate with reduced speed; compare to baseline |
| *"What if I apply the AI recommendation?"* | u = M4 recommended SPs | Simulate with M4 output; compare to baseline |
| *"What if I reduce Stock Flow by 5 kg/min and increase Steam by 2%?"* | Multi-variable custom | Simulate combined adjustment |

### Integration with Recommendation Engine (M4)

The Digital Twin enhances M4 in two ways:

1. **Pre-Validation:** Before M4 emits a SetpointRecommendation to M5, it passes the candidate through M9's Validation Gate. If the simulation shows divergence, constraint violation, or poor outcome, M4 re-optimizes with tighter constraints.

2. **Pareto Visualization:** M4 produces 3–5 Pareto-optimal candidates. M9 simulates each one, producing trajectory visualizations that the operator can compare visually — not just as abstract numbers.

```
M4 NSGA-III → 5 Pareto candidates
    │
    ├── Candidate 1 → M9 Simulate → Trajectory + Metrics
    ├── Candidate 2 → M9 Simulate → Trajectory + Metrics
    ├── Candidate 3 → M9 Simulate → Trajectory + Metrics
    ├── Candidate 4 → M9 Simulate → [FAIL: divergent] → Discard
    └── Candidate 5 → M9 Simulate → Trajectory + Metrics
    │
    └── Rank remaining 4 → Present top recommendation to operator
```

### Integration with Explainability Engine (M5)

M9's `SimulationResult` feeds M5's comparative explanation templates:

> **With recommended changes:** "Basis Weight will peak at +1.8% deviation at t+45s, then converge to target within 90 seconds. Off-spec time: 0 seconds."
>
> **Without changes (baseline):** "Basis Weight will peak at +3.2% deviation at t+60s, exceeding the ±2.5% limit for approximately 35 seconds."
>
> **Net benefit:** "The recommendation reduces peak deviation by 44% and eliminates off-spec production."

### New API

```protobuf
service DigitalTwinService {
    // Simulate a single scenario
    rpc SimulateScenario (SimulateRequest) returns (SimulationResult);

    // Compare multiple scenarios
    rpc CompareScenarios (CompareRequest) returns (ScenarioComparison);

    // Validate a recommendation before delivery
    rpc ValidateRecommendation (ValidateRequest) returns (ValidationReport);

    // Parametric sweep (engineer mode)
    rpc ParametricSweep (SweepRequest) returns (SweepResult);
}
```

### New Kafka Topic

| Topic | Purpose |
|---|---|
| `gci.simulations` | Stores simulation results for audit trail and M5 consumption |

### AI/ML Technique

| Technique | Purpose | Justification |
|---|---|---|
| **Neural ODE** (shared with M4) | Process dynamics simulation | Same surrogate model; avoids model duplication; continuous-time simulation with adaptive time-stepping |
| **Monte Carlo Dropout** | Simulation uncertainty | Run N forward passes with dropout enabled; variance across runs = epistemic uncertainty; lightweight (no ensemble needed) |

---

# Enhancement 2: Confidence Engine (M10)

## Why This Improves the Operator's Workflow

Operators need to know **how much to trust** each prediction and recommendation. A raw risk score ("78% risk of deviation") is meaningless without context: Is the model confident? Has it seen this scenario before? Did the simulation agree with the prediction? The Confidence Engine aggregates multiple uncertainty signals into a single, calibrated trust metric that the operator can act on.

**Operator value:**
- Clear trust level for every advisory: HIGH / MEDIUM / LOW / INSUFFICIENT
- When confidence is LOW, the operator knows to rely more on personal experience
- When confidence is HIGH, the operator can act quickly with conviction
- Prevents blind trust in AI outputs and prevents blind distrust equally

## Where It Fits in the Existing Architecture

M10 is a **cross-cutting service** that consumes uncertainty signals from M3, M4, M9, and M11, and emits a unified `ConfidenceReport` to M5 for presentation.

```
M3 Prediction ──── Prediction Confidence ────┐
                                              │
M4 Optimization ── Recommendation Confidence ─┤
                                              ├──► M10 CONFIDENCE ENGINE
M9 Digital Twin ── Simulation Confidence ─────┤        │
                                              │        ▼
M11 Similarity ─── Historical Confidence ─────┘   ConfidenceReport
                                                       │
                                                       ▼
                                                M5 Explainability
                                                       │
                                                       ▼
                                                 Operator HMI
```

## Confidence Dimensions

### 2.1 Prediction Confidence

**Source:** Module 3 (Deviation Prediction Engine)

| Signal | How Computed | What It Measures |
|---|---|---|
| **Conformal Interval Width** | Width of the 90% conformal prediction interval | Narrower = more confident; wider = more uncertain |
| **LightGBM Probability Margin** | Distance of predicted probability from the 0.5 decision boundary | Higher margin = more decisive classification |
| **TFT Attention Entropy** | Entropy of the temporal attention weights | Low entropy = model is focused on specific time steps; high entropy = model is uncertain about what to attend to |
| **Feature Completeness** | Fraction of input features that are non-imputed | Imputed features reduce data quality and prediction reliability |

**Calculation:**

```
prediction_confidence =
    0.35 × normalize(1 / conformal_width)      # Narrower interval = higher confidence
  + 0.25 × normalize(probability_margin)        # Decisive classification = higher confidence
  + 0.20 × normalize(1 - attention_entropy)     # Focused attention = higher confidence
  + 0.20 × feature_completeness                 # Complete data = higher confidence
```

### 2.2 Recommendation Confidence

**Source:** Module 4 (Setpoint Optimization Engine)

| Signal | How Computed | What It Measures |
|---|---|---|
| **Pareto Spread** | Standard deviation of objective values across Pareto candidates | Tight cluster = strong consensus; wide spread = ambiguous trade-offs |
| **Constraint Margin** | Minimum margin to any active constraint | Large margin = robust recommendation; small margin = fragile |
| **Surrogate Model Uncertainty** | Monte Carlo Dropout variance on Neural ODE output | High variance = model unsure about process response |
| **Optimization Convergence** | NSGA-III hypervolume indicator convergence rate | Fast convergence = well-conditioned problem; slow = ill-conditioned |

**Calculation:**

```
recommendation_confidence =
    0.30 × normalize(1 / pareto_spread)
  + 0.25 × normalize(min_constraint_margin)
  + 0.25 × normalize(1 / surrogate_uncertainty)
  + 0.20 × normalize(convergence_rate)
```

### 2.3 Historical Confidence

**Source:** Module 11 (Historical Similarity Engine)

| Signal | How Computed | What It Measures |
|---|---|---|
| **Best Match Similarity Score** | DTW distance of the best historical match (0.0–1.0) | Higher = current transition closely matches a known pattern |
| **Match Consistency** | Variance of outcomes across top-K matches | Low variance = historical transitions had consistent outcomes |
| **Sample Size** | Number of historical transitions with similarity > 0.7 | More matches = more statistical evidence |
| **Recency** | Age of the most recent high-similarity match | Recent matches are more relevant than old ones |

**Calculation:**

```
historical_confidence =
    0.35 × best_similarity_score
  + 0.25 × normalize(1 / outcome_variance)
  + 0.20 × normalize(log(sample_size + 1))
  + 0.20 × normalize(recency_decay(best_match_age))
```

### 2.4 Simulation Confidence

**Source:** Module 9 (Digital Twin)

| Signal | How Computed | What It Measures |
|---|---|---|
| **Baseline-vs-Actual Agreement** | RMSE between recent simulated baseline and actual process trajectory | Low RMSE = surrogate model is accurate right now |
| **Monte Carlo Variance** | Variance across N=20 stochastic forward passes | Low variance = model is confident in its simulation |
| **Stability Indicator** | Whether simulated trajectory converges or diverges | Convergent = trustworthy; divergent = unreliable |
| **Operating Region Coverage** | Is the current operating point within the training data convex hull? | Inside = interpolation (safe); outside = extrapolation (risky) |

**Calculation:**

```
simulation_confidence =
    0.30 × normalize(1 / baseline_rmse)
  + 0.25 × normalize(1 / mc_variance)
  + 0.25 × stability_indicator (binary: 1.0 if convergent, 0.3 if divergent)
  + 0.20 × operating_region_coverage (1.0 if inside hull, 0.5 if marginal, 0.2 if outside)
```

### 2.5 Composite Confidence Score

The four dimension scores are aggregated into a single composite:

```
composite_confidence =
    0.35 × prediction_confidence
  + 0.25 × recommendation_confidence
  + 0.20 × historical_confidence
  + 0.20 × simulation_confidence
```

### Confidence Thresholds & Operator Actions

| Composite Score | Trust Level | HMI Display | Operator Action |
|---|---|---|---|
| **≥ 0.85** | 🟢 **HIGH** | Green badge; "High Confidence" | Act on recommendation with assurance |
| **0.70 – 0.84** | 🟡 **MEDIUM** | Yellow badge; "Moderate Confidence" | Review explanation details before acting |
| **0.50 – 0.69** | 🟠 **LOW** | Orange badge; "Low Confidence — Review Carefully" | Cross-reference with personal experience; consider manual approach |
| **< 0.50** | 🔴 **INSUFFICIENT** | Red badge; "Insufficient Confidence — Use Manual Control" | AI advisory is unreliable for this scenario; rely on standard SOPs |

### UI Presentation

```
┌─────────────────────────────────────────────────────────┐
│  CONFIDENCE BREAKDOWN                                    │
│                                                          │
│  Overall Confidence: ██████████░░  82% (MEDIUM)         │
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ Prediction: 89% │  │ Recommendation: │               │
│  │ ████████████░    │  │ 78%             │               │
│  │ Model is focused │  │ ████████████    │               │
│  │ on steam ramp    │  │ Good constraint │               │
│  │                  │  │ margins         │               │
│  └─────────────────┘  └─────────────────┘               │
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ Historical: 85% │  │ Simulation: 76% │               │
│  │ ████████████░   │  │ ███████████░    │               │
│  │ 12 similar past │  │ Surrogate model │               │
│  │ transitions     │  │ in known region │               │
│  └─────────────────┘  └─────────────────┘               │
│                                                          │
│  Lowest factor: Simulation (Monte Carlo variance high    │
│  near current operating point — model extrapolating      │
│  slightly beyond training envelope)                      │
└─────────────────────────────────────────────────────────┘
```

### New API

```protobuf
service ConfidenceService {
    rpc ComputeConfidence (ConfidenceRequest) returns (ConfidenceReport);
    rpc GetConfidenceHistory (ConfidenceHistoryRequest) returns (ConfidenceHistoryResponse);
}

message ConfidenceReport {
    double prediction_confidence      = 1;
    double recommendation_confidence  = 2;
    double historical_confidence      = 3;
    double simulation_confidence      = 4;
    double composite_confidence       = 5;
    string trust_level                = 6;  // HIGH, MEDIUM, LOW, INSUFFICIENT
    string limiting_factor            = 7;  // Which dimension is lowest + explanation
    repeated ConfidenceFactor factors  = 8;  // Breakdown of individual signals
}
```

---

# Enhancement 3: Historical Similarity Engine (M11)

## Why This Improves the Operator's Workflow

Operators think in terms of past experience: *"This transition looks like what happened last Thursday."* The Historical Similarity Engine formalizes this reasoning, finding the most relevant past transitions and showing the operator what worked (and what didn't). This grounds AI predictions in real operational history that operators can verify and trust.

**Operator value:**
- "I can see this has happened before — here's what my colleague did"
- Past outcomes provide evidence for or against the AI's recommendation
- Reduces cognitive load by surfacing the most relevant precedents
- New operators can learn from the collective experience of all shifts

## Where It Fits in the Existing Architecture

M11 **elevates and expands** the historical matching capability that currently lives in M2 (Context Engine, responsibility 2.4). M2 remains responsible for grade change detection and context assembly, but delegates detailed similarity analysis to M11.

```
M2 Context Engine ──── (transition detected) ───► M11 Historical Similarity Engine
                                                       │
M7 Knowledge Base ──── (transition history) ──────────►│
                                                       │
                                                       ▼
                                               SimilarityReport
                                                       │
                                     ┌─────────────────┼─────────────────┐
                                     ▼                 ▼                 ▼
                               M3 Prediction    M5 Explainability   M10 Confidence
```

## AI Technique: K-Nearest Neighbors with Dynamic Time Warping (KNN-DTW)

### Why KNN-DTW?

Grade transitions vary in duration and shape. A transition that took 180 seconds last time might take 220 seconds now due to different initial conditions. **Dynamic Time Warping (DTW)** handles this by warping the time axis to find the optimal alignment between two transitions, making similarity measurement invariant to speed differences.

```
Transition A (current):     ─────╱──────╲───────────
                                 /        \
Transition B (historical):  ────╱────────────╲──────
                               /              \
DTW Alignment:              ═══╬══════════════╬═════
                           (stretches time to align shapes)
```

### Similarity Computation

```
For each historical transition h in the database:

1. EXTRACT MULTIVARIATE TIME SERIES
   current_ts  = [BW(t), Moisture(t), StockFlow(t), SteamPress(t), MachSpeed(t)]  # last 300s
   historical_ts = same variables for transition h

2. COMPUTE DTW DISTANCE (per variable)
   For each variable v:
       dtw_distance_v = DTW(current_ts[v], historical_ts[v])

3. WEIGHTED MULTI-VARIABLE DISTANCE
   distance = Σ(w_v × dtw_distance_v)
   where:
       w_BW          = 0.30  (primary quality variable)
       w_Moisture    = 0.15
       w_StockFlow   = 0.20  (primary manipulated variable)
       w_SteamPress  = 0.20
       w_MachSpeed   = 0.15

4. CONTEXT SIMILARITY BONUS
   If same grade pair (source→target):  bonus = 0.15
   If same shift:                       bonus += 0.05
   If same season (±30 days):           bonus += 0.05

5. FINAL SIMILARITY SCORE
   similarity = 1.0 - normalize(distance) + context_bonus
   (clipped to [0.0, 1.0])

6. RANK and return top-K (K=5)
```

### Output: Similarity Report

For each of the top-K matches:

| Field | Description | Example |
|---|---|---|
| **Transition ID** | Unique identifier | GC-2025-11-14-003 |
| **Similarity Score** | 0–100% | 89% |
| **Grade Pair** | Source → Target | 70 GSM → 90 GSM |
| **Date** | When it occurred | 2025-11-14 |
| **Operator** | Who handled it | OP-1038 (J. Smith) |
| **Previous Operator Action** | What setpoint changes were made | Reduced Steam Pressure SP by 12 kPa; held Stock Flow constant |
| **Result** | Successful or failed transition | ✅ Successful — BW stayed within ±2.1% |
| **Stabilization Time** | How long to reach steady state | 185 seconds |
| **Max BW Deviation** | Peak deviation during transition | +2.1% |
| **Quality Outcome** | Was product on-spec? | On-spec; no off-grade production |
| **Key Lesson** | What made this transition succeed/fail | "Slower steam ramp (8→6 kPa/s) prevented overshoot" |

### Example Presentation

```
┌─────────────────────────────────────────────────────────────────┐
│  HISTORICAL MATCHES — Current: 70 GSM → 90 GSM                  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ MATCH #1                                     SIMILARITY: 89% │ │
│  │ GC-2025-11-14-003  │  Operator: J. Smith  │  Shift: Day      │ │
│  │                                                               │ │
│  │ Action: Reduced Steam Pressure ramp by 15%, held Stock Flow   │ │
│  │ Result: ✅ Successful — BW ±2.1%, Stabilized in 185s          │ │
│  │ Lesson: Slower steam ramp prevented overshoot                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ MATCH #2                                     SIMILARITY: 82% │ │
│  │ GC-2025-09-22-007  │  Operator: K. Patel  │  Shift: Night    │ │
│  │                                                               │ │
│  │ Action: Increased Stock Flow by 8 kg/min proactively          │ │
│  │ Result: ✅ Successful — BW ±1.8%, Stabilized in 160s          │ │
│  │ Lesson: Proactive stock adjustment shortened stabilization    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ MATCH #3                                     SIMILARITY: 74% │ │
│  │ GC-2026-01-08-012  │  Operator: R. Kumar  │  Shift: Evening  │ │
│  │                                                               │ │
│  │ Action: No intervention (followed standard ramp)              │ │
│  │ Result: ❌ Failed — BW exceeded +3.4%, Stabilized in 290s     │ │
│  │ Lesson: Standard ramp was too aggressive for this grade pair  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### New API

```protobuf
service SimilarityService {
    rpc FindSimilarTransitions (SimilarityRequest) returns (SimilarityReport);
    rpc GetTransitionDetail (TransitionDetailRequest) returns (TransitionDetail);
}

message SimilarityReport {
    string transition_id                          = 1;
    repeated HistoricalMatch matches              = 2;
    double overall_historical_confidence          = 3;
    string pattern_summary                        = 4;  // "3 of 5 similar transitions succeeded with reduced steam ramp"
}

message HistoricalMatch {
    string  match_transition_id    = 1;
    double  similarity_score       = 2;
    string  grade_pair             = 3;
    string  date                   = 4;
    string  operator_id            = 5;
    string  operator_action        = 6;
    bool    was_successful         = 7;
    double  stabilization_time_sec = 8;
    double  max_bw_deviation_pct   = 9;
    string  quality_outcome        = 10;
    string  key_lesson             = 11;
}
```

### Communication with Existing Modules

| Direction | Module | Data |
|---|---|---|
| **From** M2 | Context Engine | `TransitionContext` triggers similarity search |
| **From** M7 | Knowledge Base | Historical transition database (TimescaleDB) |
| **To** M3 | Prediction Engine | Historical outcome statistics inform prediction calibration |
| **To** M5 | Explainability | Match summaries for comparative explanation templates |
| **To** M10 | Confidence Engine | `historical_confidence` score |
| **To** Frontend | HMI | Full match cards for operator review |

---

# Enhancement 4: Root Cause Ranking Engine (M12)

## Why This Improves the Operator's Workflow

Instead of telling the operator *"BW will deviate"* (which they can see on the trend themselves), the Root Cause Ranking tells them *"BW will deviate **because** Steam Pressure ramp is too aggressive"* — with quantitative attribution. This directs the operator's attention to the right variable, saving critical seconds during a grade change.

**Operator value:**
- Instantly know which variable to focus on
- Understand the magnitude of each variable's contribution
- See whether a variable is driving deviation up or down
- Trust the recommendation because the reasoning is visible

## Where It Fits in the Existing Architecture

M12 **formalizes and extends** the SHAP-based feature attribution currently computed inside M3 (Prediction Engine, responsibility 3.5). M3 still computes raw SHAP values, but M12 transforms them into ranked, engineering-contextualized root cause cards.

```
M3 Prediction Engine ──── Raw SHAP Values ────► M12 Root Cause Ranking
                                                       │
M7 Knowledge Base ──── Process Glossary ──────────────►│
                                                       │
                                                       ▼
                                              RootCauseReport
                                                       │
                                     ┌─────────────────┼──────────┐
                                     ▼                 ▼          ▼
                              M5 Explainability   M10 Confidence  Frontend
```

## How Feature Importance Is Calculated

### Step 1: Raw SHAP Values (from M3)

SHAP (SHapley Additive exPlanations) decomposes each prediction into additive contributions from each feature. For the LightGBM classifier:

```
Risk Score = Base Value + Σ SHAP(feature_i)

Example:
    Base Value (average prediction):     45
    + SHAP(steam_pressure_ramp_rate):   +16.7   ← Largest positive contributor
    + SHAP(stock_flow_pv):              +10.1
    + SHAP(moisture):                    +7.9
    + SHAP(machine_speed_delta):         +4.4
    + SHAP(caliper_trend):               +1.2
    + SHAP(filler_flow_error):           -0.8
    + SHAP(other_features):              -6.5
    ─────────────────────────────────────────
    = Final Risk Score:                   78
```

### Step 2: Percentage Attribution

M12 converts raw SHAP values to percentage contributions:

```
For each feature i:
    contribution_pct_i = |SHAP_i| / Σ|SHAP_j| × 100

Result:
    Steam Pressure Ramp Rate:   38% ████████████████████
    Stock Flow PV:              23% ████████████
    Moisture:                   18% █████████
    Machine Speed Delta:        10% █████
    Caliper Trend:               4% ██
    Others:                      7% ███
```

### Step 3: Engineering Contextualization

M12 enriches each root cause with process knowledge from M7:

| Rank | Variable | Contribution | Direction | Current Value | Normal Range | Deviation | Engineering Context |
|---|---|---|---|---|---|---|---|
| 1 | Steam Pressure Ramp Rate | 38% | ↑ Increasing risk | 8.5 kPa/s | 4–6 kPa/s | **+42% above normal** | Ramp rate exceeds typical profile; dryer section may over-respond |
| 2 | Stock Flow PV | 23% | ↑ Increasing risk | 245 kg/min | 220–240 kg/min | **+2% above SP** | Flow is above setpoint; possible valve issue or headbox pressure shift |
| 3 | Moisture | 18% | ↑ Increasing risk | 6.2% | 5.5–6.0% | **+0.2% absolute** | Moisture slightly high; may offset BW response to steam changes |
| 4 | Machine Speed | 10% | ↑ Increasing risk | 685 m/min | 670–700 m/min | Within range | Speed ramp is contributing to BW variance during transition |
| 5 | Others | 11% | Mixed | — | — | — | Minor contributors: caliper trend, filler flow error, alarm state |

### Step 4: Actionability Classification

| Classification | Criteria | Operator Implication |
|---|---|---|
| **ACTIONABLE** | Contribution > 15% AND variable is a manipulated variable (has a setpoint) | Operator can directly adjust this variable |
| **OBSERVABLE** | Contribution > 15% AND variable is a measured variable (no setpoint) | Operator should monitor; may indicate upstream issue |
| **CONTEXTUAL** | Contribution 5–15% | Background factor; no immediate action needed |
| **NOISE** | Contribution < 5% | Statistically insignificant; ignore |

### New API

```protobuf
service RootCauseService {
    rpc GetRootCauseRanking (RootCauseRequest) returns (RootCauseReport);
}

message RootCauseReport {
    string forecast_id                         = 1;
    repeated RootCauseFactor ranked_factors    = 2;
    string summary_sentence                    = 3;
}

message RootCauseFactor {
    int32   rank                = 1;
    string  variable_name       = 2;
    string  display_name        = 3;
    double  contribution_pct    = 4;
    double  shap_value          = 5;
    string  direction           = 6;   // "INCREASING_RISK" | "DECREASING_RISK"
    double  current_value       = 7;
    double  normal_range_low    = 8;
    double  normal_range_high   = 9;
    double  deviation_from_normal = 10;
    string  engineering_context = 11;
    string  actionability       = 12;  // "ACTIONABLE" | "OBSERVABLE" | "CONTEXTUAL" | "NOISE"
    string  engineering_unit    = 13;
}
```

---

# Enhancement 5: Transition Timeline Predictor (M13)

## Why This Improves the Operator's Workflow

Operators constantly ask: *"How long until this stabilizes?"* The Timeline Predictor provides a **forward-looking schedule** of the transition — when each phase will occur, when quality will stabilize, and when the machine will be fully on-grade.

**Operator value:**
- Know exactly when to expect stabilization
- Plan downstream operations (e.g., reel change scheduling)
- See if the transition is progressing normally or falling behind
- Manage stress by having visibility into the future

## Where It Fits

```
M3 Prediction ──── BW trajectory forecast ──────┐
                                                 │
M9 Digital Twin ── Simulated trajectories ──────┤──► M13 TIMELINE PREDICTOR
                                                 │         │
M11 Similarity ─── Historical stabilization ────┘         ▼
                    times                          TransitionTimeline
                                                          │
                                               ┌──────────┼──────────┐
                                               ▼          ▼          ▼
                                         M5 Explain    M10 Conf    Frontend
```

## Timeline Phases

```
Phase 1: RAMPING           Phase 2: OVERSHOOT        Phase 3: CORRECTION
(Setpoints moving)         (Peak deviation)           (Returning to target)
                                    ╱╲
                                   ╱  ╲
                                  ╱    ╲
    ──────╱                      ╱      ╲
         ╱                      ╱        ╲───────
        ╱                      ╱               ───────────── Target ±2.5%
       ╱                                                     ────────────
                                                              ─ ─ ─ ─ ─ ─ Target BW
├── t+0 ──┤├── t+45s ──┤├── t+90s ──┤├── t+150s ──┤├── t+180s ──┤
   START      PEAK DEV      RECOVERY     STABILIZING    QUALITY STABLE
```

## Predictions

| Prediction | How Computed | Example |
|---|---|---|
| **Expected Stabilization Time** | Weighted average: 40% M9 simulation + 30% M11 historical mean + 30% M3 trajectory extrapolation | "Estimated stabilization: 3 min 15 sec (±45 sec)" |
| **Future Deviation Trajectory** | M3 TFT multi-horizon forecast + M9 Neural ODE trajectory | "BW will peak at +2.3% at t+50s, then decay to <1% by t+120s" |
| **Estimated Recovery Time** | Time from peak deviation back to within ±1% of target | "Recovery from peak: ~75 seconds" |
| **Expected Product Quality** | Based on total off-spec time and max deviation | "On-spec probability: 92%. Estimated off-grade: 0 seconds" |

## Example Timeline Output

```
┌────────────────────────────────────────────────────────────────┐
│  TRANSITION TIMELINE — 70 GSM → 90 GSM                         │
│                                                                  │
│  ●━━━━━━━━━━━━━━━━━━━●━━━━━━━━━●━━━━━━━━━━━━●━━━━━━━●          │
│  NOW              t+1:30    t+3:00       t+5:00   t+7:00        │
│  ├─ RAMPING ──────┤                                              │
│  │ Setpoints moving to target                                    │
│  │ BW deviation: +1.2% (and rising)                              │
│                    ├─ PEAK ──┤                                    │
│                    │ Max deviation: +2.3%                         │
│                    │ Still within ±2.5% ✅                        │
│                               ├─ RECOVERY ────┤                  │
│                               │ BW returning to target            │
│                               │ Rate: -0.05 g/m²/sec             │
│                                                ├─ STABLE ──┤     │
│                                                │ BW within ±1%    │
│                                                │ Quality: ON-SPEC │
│                                                                  │
│  ⏱ Expected total time: 5 min 15 sec (±45 sec)                  │
│  📊 On-spec probability: 92%                                     │
│  📉 Off-grade estimate: 0 seconds                                │
└────────────────────────────────────────────────────────────────┘
```

### New API

```protobuf
service TimelineService {
    rpc PredictTimeline (TimelineRequest) returns (TransitionTimeline);
    rpc SubscribeTimeline (TimelineSubscribeRequest) returns (stream TransitionTimeline);
}

message TransitionTimeline {
    string transition_id                      = 1;
    repeated TimelinePhase phases             = 2;
    double estimated_total_time_sec           = 3;
    double confidence_interval_sec            = 4;
    double on_spec_probability                = 5;
    double estimated_offgrade_sec             = 6;
    DeviationTrajectory predicted_trajectory  = 7;
}

message TimelinePhase {
    string phase_name             = 1;  // RAMPING, PEAK, RECOVERY, STABILIZING, COMPLETE
    double start_time_sec         = 2;
    double end_time_sec           = 3;
    double predicted_bw_at_start  = 4;
    double predicted_bw_at_end    = 5;
    string status                 = 6;  // CURRENT, UPCOMING, COMPLETED
    string description            = 7;
}
```

### AI/ML Technique

| Technique | Purpose | Justification |
|---|---|---|
| **Quantile Regression (from TFT)** | Predict stabilization time distribution | Provides median + uncertainty bounds (10th, 90th percentile) |
| **Survival Analysis (Kaplan-Meier + Cox PH)** | Estimate time-to-stabilization | Models the probability of "not yet stabilized" as a function of time and covariates; natural fit for "how long until event X?" questions |

---

# Enhancement 6: Enterprise Dashboard Specification

## Design Philosophy

The dashboard is designed for **control room environments**: dark theme, high contrast, large text, glanceable status indicators. It follows **Honeywell Forge UX guidelines** with modifications for AI advisory workflows.

> [!IMPORTANT]
> This section specifies the dashboard **design**, not UI code. Implementation uses React 18 + TypeScript + Apache ECharts as defined in the approved tech stack.

## Navigation Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌─ HEADER BAR ────────────────────────────────────────────────────────┐ │
│ │  🔷 GradeChange Intelligence          PM-3  │  OP-1042  │  ⚙  🔔  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─ SIDEBAR NAV ─┐  ┌─ MAIN CONTENT AREA ─────────────────────────────┐ │
│ │               │  │                                                   │ │
│ │  📊 Live      │  │  (Content changes based on selected nav item)     │ │
│ │     Advisory  │  │                                                   │ │
│ │               │  │                                                   │ │
│ │  📈 Transition│  │                                                   │ │
│ │     History   │  │                                                   │ │
│ │               │  │                                                   │ │
│ │  🔍 Similarity│  │                                                   │ │
│ │     Search    │  │                                                   │ │
│ │               │  │                                                   │ │
│ │  🧠 Model     │  │                                                   │ │
│ │     Health    │  │                                                   │ │
│ │               │  │                                                   │ │
│ │  ⚙ Config    │  │                                                   │ │
│ │               │  │                                                   │ │
│ │  📋 Audit Log │  │                                                   │ │
│ │               │  │                                                   │ │
│ └───────────────┘  └───────────────────────────────────────────────────┘ │
│                                                                         │
│ ┌─ STATUS BAR ────────────────────────────────────────────────────────┐ │
│ │  Data Feed: ● LIVE  │  Model: v2.3.1  │  Latency: 342ms  │  14:32  │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## Live Advisory View (Primary Screen)

### Layout Specification

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         LIVE ADVISORY VIEW                               │
│                                                                          │
│  ┌─ STATUS CARDS (Row 1) ──────────────────────────────────────────────┐ │
│  │                                                                     │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │ │
│  │  │ TRANSITION   │ │ RISK LEVEL   │ │ CONFIDENCE   │ │ STABILIZE  │ │ │
│  │  │ STATUS       │ │              │ │              │ │ ESTIMATE   │ │ │
│  │  │              │ │   ⚠ WARNING  │ │  82%         │ │            │ │ │
│  │  │ ● RAMPING    │ │   Score: 78  │ │  MEDIUM      │ │  3:15      │ │ │
│  │  │ 70→90 GSM    │ │              │ │              │ │  ±45s      │ │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─ CHARTS (Row 2) ───────────────────────────────────────────────────┐ │
│  │                                                                     │ │
│  │  ┌─ BW TRAJECTORY CHART (60% width) ──────┐ ┌─ ROOT CAUSE (40%) ┐ │ │
│  │  │                                         │ │                    │ │ │
│  │  │  Live BW ────── Predicted ─ ─ ─        │ │ Steam Press   38% │ │ │
│  │  │  Target  ─·─·─  Conf Band ░░░░        │ │ ████████████████  │ │ │
│  │  │  Limits  ─ ─ ─                         │ │                    │ │ │
│  │  │                                         │ │ Stock Flow    23% │ │ │
│  │  │  [Historical BW overlay toggle]         │ │ ██████████        │ │ │
│  │  │  [Simulation trajectory overlay]        │ │                    │ │ │
│  │  │                                         │ │ Moisture      18% │ │ │
│  │  │  Timeline: ●━━━━━●━━━━●━━━━●            │ │ ████████          │ │ │
│  │  │            NOW  PEAK RECOV STABLE       │ │                    │ │ │
│  │  └─────────────────────────────────────────┘ │ Machine Spd   10% │ │ │
│  │                                               │ ████              │ │ │
│  │                                               │                    │ │ │
│  │                                               │ Others         7% │ │ │
│  │                                               │ ███                │ │ │
│  │                                               └────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─ PANELS (Row 3) ───────────────────────────────────────────────────┐ │
│  │                                                                     │ │
│  │  ┌─ RECOMMENDATION (40%) ──────┐ ┌─ EXPLAINABILITY (35%) ────────┐ │ │
│  │  │                              │ │                                │ │ │
│  │  │ Reduce Steam Press SP       │ │ "BW predicted to exceed       │ │ │
│  │  │   485 kPa → 470 kPa        │ │  +2.8% at t+60s. Primary     │ │ │
│  │  │                              │ │  driver: Steam Pressure ramp │ │ │
│  │  │ Expected outcome:           │ │  rate (38%). Reducing SP to   │ │ │
│  │  │   BW within ±2.0%           │ │  470 kPa matches the action  │ │ │
│  │  │   Stabilize 45s faster      │ │  taken in 3 of 5 similar     │ │ │
│  │  │                              │ │  past transitions (89% avg   │ │ │
│  │  │ Simulation:                  │ │  similarity)."               │ │ │
│  │  │   [With Rec] ─── [Without]  │ │                                │ │ │
│  │  │                              │ │ Confidence: 82% (MEDIUM)      │ │ │
│  │  │                              │ │ Limiting: Simulation variance │ │ │
│  │  │ ┌────────┐  ┌────────┐      │ │                                │ │ │
│  │  │ │ ACCEPT │  │ REJECT │      │ │ [View Full Detail ▸]          │ │ │
│  │  │ └────────┘  └────────┘      │ │                                │ │ │
│  │  └──────────────────────────────┘ └────────────────────────────────┘ │ │
│  │                                                                     │ │
│  │  ┌─ HISTORICAL MATCHES (25%) ──────────────────────────────────────┐ │ │
│  │  │                                                                  │ │ │
│  │  │  #1  89%  GC-2025-11-14  ✅ Reduced steam ramp → stabilized 185s│ │ │
│  │  │  #2  82%  GC-2025-09-22  ✅ Proactive stock adj → stabilized 160s│ │ │
│  │  │  #3  74%  GC-2026-01-08  ❌ No action → BW exceeded +3.4%       │ │ │
│  │  │                                                                  │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌─ ALARM PANEL (Row 4, collapsible) ─────────────────────────────────┐ │
│  │  ⚠ 14:31:42  PIC-301 Steam Pressure HIGH  │  Priority: HIGH       │ │
│  │  ℹ 14:30:15  Grade Change Initiated: 70→90 GSM  │  Sequence #4521 │ │
│  │  ✅ 14:28:03  QCS Scanner Calibration OK  │  Priority: INFO        │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Specifications

| Component | Data Source | Refresh Rate | Interaction |
|---|---|---|---|
| **Status Cards** | M2 Context, M3 Prediction, M10 Confidence, M13 Timeline | 1 second (WebSocket) | Click to expand detail |
| **BW Trajectory Chart** | M1 live data + M3 prediction + M9 simulation | 1 second (WebSocket) | Toggle overlays: historical, simulation, confidence band |
| **Root Cause Ranking** | M12 Root Cause | On each prediction cycle | Hover for engineering detail; click for SHAP waterfall |
| **Recommendation Panel** | M4 Optimization + M9 Digital Twin | On WARNING/BREACH | Accept/Reject/Modify buttons; simulation comparison chart |
| **Explainability Panel** | M5 Explainability | On each prediction cycle | "View Full Detail" expands to engineering-level panel |
| **Historical Matches** | M11 Similarity | On transition start | Click to expand match detail card |
| **Alarm Panel** | M1 Ingestion (alarm feed) | Real-time (event-driven) | Collapsible; filter by priority; acknowledge button |
| **Timeline Bar** | M13 Timeline | 5 seconds | Integrated into trajectory chart as timeline axis |

### Dark Enterprise Theme Specification

| Element | Specification |
|---|---|
| **Background** | Primary: `#0D1117` (near-black); Surface: `#161B22`; Card: `#1C2128` |
| **Text** | Primary: `#E6EDF3` (95% white); Secondary: `#8B949E`; Muted: `#484F58` |
| **Accent** | Honeywell Blue: `#2B7CD4`; Success: `#3FB950`; Warning: `#D29922`; Danger: `#F85149` |
| **Charts** | Dark canvas; bright data lines with glow effect; gridlines at 8% opacity |
| **Typography** | Font: Inter (Google Fonts); Headings: 600 weight; Body: 400 weight; Monospace: JetBrains Mono |
| **Cards** | 1px border `rgba(255,255,255,0.08)`; border-radius: 8px; subtle box-shadow |
| **Status Indicators** | Pulsing dot animation for live data; color-coded badges for risk levels |
| **Transitions** | 200ms ease-out for state changes; 300ms for panel expand/collapse |
| **Accessibility** | WCAG 2.1 AA; minimum contrast ratio 4.5:1; keyboard navigation; screen reader labels |
| **Control Room** | Optimized for 55" displays at 3m viewing distance; minimum 16px body text |

---

# Enhancement 7: Smart Operator Feedback (M6 Extension)

## Why This Improves the Operator's Workflow

The existing M6 Feedback module captures Accept/Reject decisions. This enhancement adds **safeguards** to prevent poor-quality feedback from degrading model performance, while making the feedback process more informative for both the operator and the learning system.

## Safeguards Against Poor Feedback

### Problem: Feedback Quality Risks

| Risk | Example | Impact if Unmitigated |
|---|---|---|
| **Habitual Accept** | Operator always clicks Accept without reading | Model learns that all recommendations are good, even bad ones |
| **Habitual Reject** | Frustrated operator always rejects | Model learns to distrust its own correct recommendations |
| **Inconsistent Feedback** | Same scenario → Accept on Monday, Reject on Tuesday | Noisy reward signal confuses the learning algorithm |
| **Outcome Mismatch** | Operator Accepts, but transition fails anyway | Positive feedback on a bad recommendation reinforces bad behavior |
| **Gaming** | Operator provides feedback to manipulate future recommendations | Corrupts the learning signal |

### Safeguard Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              SMART FEEDBACK PIPELINE                         │
│                                                              │
│  Operator Decision ──► GATE 1: Engagement Check             │
│  (Accept/Reject)            │                                │
│                             ▼                                │
│                        GATE 2: Consistency Check             │
│                             │                                │
│                             ▼                                │
│                        GATE 3: Outcome Verification          │
│                             │                                │
│                             ▼                                │
│                        GATE 4: Weight Assignment             │
│                             │                                │
│                             ▼                                │
│                     Validated Feedback Record                │
│                             │                                │
│                   ┌─────────┼─────────┐                     │
│                   ▼         ▼         ▼                     │
│              Knowledge   Reward    Retraining               │
│              Base (M7)   Signal   Trigger (M8)              │
└─────────────────────────────────────────────────────────────┘
```

### Gate 1: Engagement Check

**Purpose:** Detect habitual clicking (Accept/Reject without reading).

| Signal | Detection | Action |
|---|---|---|
| Response time < 3 seconds | Timer from advisory display to button click | Flag as "fast response"; reduce feedback weight by 50% |
| No scroll on explanation panel | Track whether operator viewed the explanation | Flag as "unreviewed"; reduce weight by 30% |
| Same decision for 10+ consecutive recommendations | Pattern detection | Alert shift supervisor; reduce weight by 70% |

### Gate 2: Consistency Check

**Purpose:** Detect contradictory feedback from the same operator on similar scenarios.

```
For feedback F on transition T:
    1. Find operator's past feedback on transitions with similarity > 0.8
    2. If decision contradicts > 50% of past decisions on similar scenarios:
       → Flag as "inconsistent"
       → Do NOT discard — store with reduced weight (0.3×)
       → Generate consistency report for engineering review
```

### Gate 3: Outcome Verification

**Purpose:** Validate feedback against actual transition outcome.

```
After transition completes (async, 2-5 minutes later):
    1. Compare operator's decision to actual outcome:

       ┌──────────┬─────────────────┬─────────────────┐
       │ Decision │ Good Outcome    │ Bad Outcome      │
       ├──────────┼─────────────────┼─────────────────┤
       │ ACCEPT   │ Validated ✅     │ Outcome Mismatch │
       │          │ Weight: 1.0×    │ Weight: 0.5×     │
       ├──────────┼─────────────────┼─────────────────┤
       │ REJECT   │ Operator was    │ Validated ✅      │
       │          │ wrong? → 0.5×   │ Weight: 1.0×     │
       └──────────┴─────────────────┴─────────────────┘

    2. "Good Outcome" = BW stayed within ±2.5% AND stabilization ≤ median
    3. "Bad Outcome" = BW exceeded ±2.5% OR stabilization > 2× median
```

### Gate 4: Weight Assignment

**Purpose:** Compute a final feedback weight that reflects quality.

```
feedback_weight =
    base_weight (1.0)
    × engagement_factor     (0.3–1.0, from Gate 1)
    × consistency_factor    (0.3–1.0, from Gate 2)
    × outcome_factor        (0.5–1.0, from Gate 3)
    × operator_trust_factor (0.5–1.0, from historical accuracy)

Effective range: 0.045 (worst case) to 1.0 (best case)
```

### Operator Trust Score

Each operator accumulates a trust score based on the accuracy of their feedback over time:

```
operator_trust = (validated_feedbacks) / (total_feedbacks)

Decay: Trust decays 5% per month without new feedback (prevents stale scores)
Minimum: 0.5 (never fully distrust any operator)
Display: Available to shift supervisors on the engineering console (NOT shown to operators)
```

### How the System Learns Without Degrading

| Mechanism | How It Works |
|---|---|
| **Weighted Updates** | Feedback with weight < 0.3 is stored for audit but excluded from retraining data |
| **Outcome-Verified Only** | Only feedback records that pass Gate 3 are used for reward signal computation |
| **Bounded Learning Rate** | Online learning updates are bounded: max parameter change per feedback = 0.1% of current value |
| **Rollback Capability** | Model checkpoints are saved before every feedback-triggered update; automatic rollback if validation metrics degrade by > 5% |
| **Human-in-the-Loop** | Monthly engineering review of feedback analytics; anomalous patterns flagged for investigation |
| **A/B Safety Net** | New model versions trained on feedback must pass Bayesian A/B test against champion before promotion |

---

# Enhancement 8: Implementation Priority Matrix

## Phase Categorization

### Phase 1: Must Build (Weeks 1–18)

These are core capabilities required for a minimum viable product that delivers real operator value.

| Module/Enhancement | Justification | Effort |
|---|---|---|
| **M1** Data Ingestion & Normalization | Foundation — nothing works without data | 4 weeks |
| **M2** Grade Change Context Engine | Must detect transitions and build context | 3 weeks |
| **M3** Deviation Prediction Engine (TFT + LightGBM) | Core value proposition — predict deviations | 5 weeks |
| **M7** Process Knowledge Base | Required by M2, M3, M4 for recipes and constraints | 3 weeks |
| **M12** Root Cause Ranking Engine | Extends M3 SHAP output into actionable rankings — low incremental effort | 1 week |
| **M5** Explainability & Reasoning Engine | Operators won't trust predictions without explanations | 2 weeks |
| **E6** Enterprise Dashboard (Live Advisory view only) | Must have a UI for operators to see predictions | 4 weeks |
| **M10** Confidence Engine (Prediction confidence only) | Critical for operator trust from day one | 2 weeks |
| **M11** Historical Similarity Engine | High operator value; grounds predictions in real history | 2 weeks |

**Phase 1 Total: ~18 weeks** (with parallelization: ~12 weeks with 3-person team)

**Phase 1 Deliverable:** Live advisory dashboard showing BW deviation predictions, root cause rankings, confidence scores, historical matches, and explanations during active grade changes. No recommendations yet.

---

### Phase 2: Should Build (Weeks 19–30)

These add optimization, simulation, and feedback loops — transforming the system from "observe and predict" to "recommend and learn."

| Module/Enhancement | Justification | Effort |
|---|---|---|
| **M4** Setpoint Optimization Engine | Adds actionable recommendations — operator can now act on predictions | 4 weeks |
| **M9** Digital Twin Module | Validates recommendations via simulation; builds operator trust | 3 weeks |
| **M13** Transition Timeline Predictor | High operator value; answers "how long will this take?" | 2 weeks |
| **M6** Operator Feedback (basic Accept/Reject) | Closes the learning loop | 2 weeks |
| **M10** Confidence Engine (full: all 4 dimensions) | Adds recommendation + simulation + historical confidence | 2 weeks |
| **E6** Enterprise Dashboard (full: recommendation panel, simulation, timeline) | Extends UI with recommendation and simulation views | 3 weeks |

**Phase 2 Total: ~12 weeks** (with parallelization: ~8 weeks)

**Phase 2 Deliverable:** Full advisory system with setpoint recommendations, digital twin simulation comparison, transition timeline, and basic operator feedback.

---

### Phase 3: Future Enhancement (Weeks 31+)

These are advanced capabilities for long-term value and enterprise scaling.

| Module/Enhancement | Justification | Effort |
|---|---|---|
| **E7** Smart Operator Feedback (safeguards) | Important but only valuable after 3+ months of feedback data | 3 weeks |
| **M8** Model Monitoring & MLOps | Essential for production but not needed for initial deployment | 4 weeks |
| **M6** Continuous Learning (contextual bandit, online learning) | Requires substantial feedback data; risky to enable early | 3 weeks |
| **E6** Enterprise Dashboard (engineering analytics, audit log, configuration management) | Advanced views for process engineers and admins | 4 weeks |
| Multi-machine support | Scaling to additional paper machines | 3 weeks |
| Multi-mill federation | Scaling to additional mill sites | 4 weeks |
| Mobile push notifications | Operator alerts on mobile devices | 2 weeks |
| What-If simulation (standalone engineer tool) | Offline process optimization studies | 2 weeks |
| LLM-powered analytics queries | Natural language querying of transition history | 3 weeks |

**Phase 3 Total: Ongoing**

---

### Implementation Priority Visualization

```
WEEK  1    4    8    12   16   18   22   26   30   34   38
      │    │    │    │    │    │    │    │    │    │    │
      ├════╪════╪════╪════╪════╪════╪════╪════╪════╪════┤
      │         PHASE 1: MUST BUILD           │         │
      │                                       │         │
      │  M1 ████░░░░                          │         │
      │  M2 ░░░████░                          │         │
      │  M7 ░░░████░                          │         │
      │  M3 ░░░░░██████████░                  │         │
      │  M12░░░░░░░░░░░░░██░                  │         │
      │  M10░░░░░░░░░░░░░░██░                 │         │
      │  M11░░░░░░░░░░░░░██░░                 │         │
      │  M5 ░░░░░░░░░░░░░░░██░               │         │
      │  E6 ░░░░░░░░░░░░░░░░████░            │         │
      │                                       │         │
      │              PHASE 2: SHOULD BUILD    │         │
      │                                       │         │
      │                           M4 ░░░░████████░      │
      │                           M9 ░░░░░░░░██████░    │
      │                           M13░░░░░░░░░░░░██░░   │
      │                           M6 ░░░░░░░░░░░░░██░   │
      │                           E6+░░░░░░░░░░░░░░████ │
      │                                                  │
      │                              PHASE 3: FUTURE ─── ─ ─ ─►
      │                                       E7, M8, Multi-mill
      └──────────────────────────────────────────────────────────
```

### Hackathon / Assessment Scope Recommendation

For a **hackathon or hiring assessment** (1–3 days), focus on demonstrating:

| Priority | Component | What to Show |
|---|---|---|
| **P0** | M3 Prediction (simplified) + M12 Root Cause | Predict BW deviation with SHAP attribution |
| **P0** | M10 Confidence (prediction only) | Show calibrated confidence with the prediction |
| **P0** | M11 Similarity (simplified) | Show top-3 historical matches with outcomes |
| **P1** | M9 Digital Twin (simplified) | Show "with recommendation" vs. "without" trajectory comparison |
| **P1** | M13 Timeline | Show expected stabilization time |
| **P1** | E6 Dashboard (single page) | Dark-themed advisory panel with all components |

This subset demonstrates the full AI decision intelligence value chain without requiring production infrastructure.

---

## Updated Module Summary Matrix

| ID | Module Name | Service | Status | Phase |
|---|---|---|---|---|
| M1 | Data Ingestion & Normalization | `ingestion` | Approved | Phase 1 |
| M2 | Grade Change Context Engine | `context` | Approved | Phase 1 |
| M3 | Deviation Prediction Engine | `prediction` | Approved | Phase 1 |
| M4 | Setpoint Optimization Engine | `optimization` | Approved | Phase 2 |
| M5 | Explainability & Reasoning Engine | `explainability` | Approved | Phase 1 |
| M6 | Operator Feedback & Continuous Learning | `feedback` | Approved + Enhanced (E7) | Phase 2 (basic), Phase 3 (smart) |
| M7 | Process Knowledge Base | `knowledge` | Approved | Phase 1 |
| M8 | Model Monitoring & MLOps | `mlops` | Approved | Phase 3 |
| **M9** | **Digital Twin Module** | `digital-twin` | **NEW** | **Phase 2** |
| **M10** | **Confidence Engine** | `confidence` | **NEW** | **Phase 1** (partial), **Phase 2** (full) |
| **M11** | **Historical Similarity Engine** | `similarity` | **NEW** | **Phase 1** |
| **M12** | **Root Cause Ranking Engine** | `root-cause` | **NEW** | **Phase 1** |
| **M13** | **Transition Timeline Predictor** | `timeline` | **NEW** | **Phase 2** |
