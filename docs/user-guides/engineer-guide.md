# Engineer User Guide — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-UG-ENG-001
**Version:** 1.0
**Last Updated:** 2026-07-25

---

## 1. Overview

As a process engineer, you have access to the **Engineering Analytics Console** — an advanced interface for analyzing grade change performance, reviewing model behavior, configuring recipes and constraints, and managing the continuous learning pipeline.

---

## 2. Engineering Analytics Console

### 2.1 Transition Analysis

**Purpose:** Deep-dive into any past grade change to understand what happened and why.

**Available Views:**
- **Trajectory Overlay:** Overlay predicted vs. actual BW trajectory for any transition
- **SHAP Waterfall:** Full feature attribution chart showing what drove each prediction
- **Constraint Analysis:** Which constraints were active, binding, or violated
- **Historical Comparison:** Side-by-side comparison of similar past transitions
- **Operator Actions:** Timeline of all operator actions during the transition

### 2.2 Performance Dashboard

**Purpose:** Track system performance over time.

**Key Metrics:**
| Metric | Target | How to Read |
|---|---|---|
| Prediction Accuracy (MAE) | < 1.0 g/m² | Lower is better; trending up = model degradation |
| Risk Classification F1 | > 0.85 | Higher is better; balanced precision/recall |
| Conformal Coverage | 85–95% | Should hover around 90% |
| Operator Accept Rate | > 70% | Below 60% triggers investigation |
| Stabilization Improvement | > 20% vs. baseline | Measures business value |
| End-to-End Latency (p95) | < 500ms | Higher = investigate infrastructure |

### 2.3 Model Health Monitor

**Purpose:** Monitor model drift and performance degradation.

**Drift Indicators:**
- **PSI (Population Stability Index):** Measures feature distribution shift. PSI > 0.1 = monitor; PSI > 0.2 = investigate
- **Page-Hinkley Statistic:** Detects change-points in prediction error stream
- **Calibration Plot:** Compares predicted confidence to actual outcomes

---

## 3. Configuration Management

### 3.1 Recipe Management

Recipes define the target setpoints and quality limits for each paper grade. Only users with the **Admin** role can modify recipes.

**Recipe Fields:**
| Field | Description | Unit |
|---|---|---|
| Grade ID | Unique identifier | String |
| Grade Name | Human-readable name | String |
| Target Basis Weight | Target BW for this grade | g/m² |
| Target Moisture | Target moisture content | % |
| Target Ash | Target ash content | % |
| Target Caliper | Target caliper | μm |
| BW Tolerance | Allowable deviation | ±% |
| Ramp Profile | Setpoint trajectory template | JSON |

### 3.2 Constraint Management

Constraints define the operational boundaries for the optimization engine.

**Constraint Types:**
| Type | Examples | Can be Modified? |
|---|---|---|
| Hard Safety | Steam pressure max, machine speed max | Admin only; requires engineering approval |
| Hard Equipment | Valve range (0–100%), ramp rate max | Admin only |
| Soft Quality | BW ±2.5%, moisture ±0.5% | Engineer |
| Soft Preference | Aggressiveness penalty weight | Engineer |

### 3.3 Tag Dictionary

The tag dictionary maps DCS tag names to canonical names used by the platform. Modifying this requires service restart (hot-reload planned for v2.0).

---

## 4. What-If Simulation

The Engineering Console provides a **What-If Simulator** that allows you to:

1. Select a current or past transition context
2. Manually adjust setpoint values
3. See the predicted BW trajectory using the Neural ODE surrogate model
4. Compare against the system's recommended setpoints

**Use Cases:**
- Evaluate alternative strategies before a grade change
- Understand the sensitivity of BW to individual setpoint changes
- Train new operators on grade change dynamics
- Validate the surrogate model against known process behavior

---

## 5. Feedback Analytics

Review aggregated operator feedback to understand:
- Which recommendation types are most frequently accepted/rejected
- Which grade pairs have the lowest accept rates (may indicate model weakness)
- Operator-specific patterns (experience level correlations)
- Common rejection rationale themes

---

## 6. Triggering Manual Retraining

If you observe sustained model degradation (e.g., after a felt change or new pulp supplier):

1. Navigate to **Model Health → Retraining**
2. Select models to retrain (TFT, LightGBM, Neural ODE)
3. Specify reason for retraining
4. Click **Submit Retraining Request**
5. Monitor progress on the MLflow experiment dashboard
6. Review evaluation results when training completes
7. Approve promotion if challenger model shows improvement
