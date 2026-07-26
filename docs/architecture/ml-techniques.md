# AI/ML Techniques — Decision Matrix & Justification

**Document ID:** HPS-GCI-ARCH-ML-001
**Version:** 1.0
**Last Updated:** 2026-07-25

---

## 1. Technique Selection Summary

| Module | Technique | Category | Training Data | Inference Latency | Interpretability | Industrial Maturity |
|---|---|---|---|---|---|---|
| M1 | Isolation Forest | Anomaly Detection | Unsupervised | < 1ms | Medium | ★★★★★ |
| M1 | Exponential Moving Average | Statistics | N/A | < 0.1ms | Full | ★★★★★ |
| M2 | KNN + DTW Distance | Similarity Search | Historical transitions | < 20ms | High | ★★★★☆ |
| M2 | Deterministic State Machine | Rule-Based Logic | None (configured) | < 0.1ms | Full | ★★★★★ |
| M3 | Temporal Fusion Transformer | Time-Series Forecasting | 500+ transitions | < 100ms | High (attention) | ★★★☆☆ |
| M3 | LightGBM | Gradient Boosted Trees | 500+ transitions | < 5ms | High (SHAP) | ★★★★★ |
| M3 | Conformal Prediction | Uncertainty Quantification | Calibration set | < 1ms | Full | ★★★★☆ |
| M3 | SHAP | Feature Attribution | N/A (post-hoc) | < 30ms | Full | ★★★★★ |
| M4 | Neural ODE | Surrogate Modeling | 500+ transitions | < 50ms | Medium | ★★★☆☆ |
| M4 | NSGA-III | Multi-Objective Optimization | None (optimizer) | < 100ms | High (Pareto) | ★★★★☆ |
| M4 | Bayesian Optimization | Sample-Efficient Optimization | Online | < 50ms | Medium | ★★★★☆ |
| M5 | Template-Based NLG | Natural Language Generation | None (templates) | < 5ms | Full | ★★★★★ |
| M5 | Case-Based Reasoning | Retrieval-Augmented Explanation | Historical cases | < 10ms | Full | ★★★★★ |
| M6 | Online Learning (SGD) | Incremental Model Update | Streaming | N/A | Medium | ★★★★☆ |
| M6 | Contextual Multi-Armed Bandit | Exploration/Exploitation | Online | < 5ms | Medium | ★★★☆☆ |
| M6 | Bayesian A/B Testing | Statistical Evaluation | Online | N/A | Full | ★★★★★ |
| M8 | Population Stability Index | Drift Detection | Baseline distribution | < 1ms | Full | ★★★★★ |
| M8 | Page-Hinkley Test | Change-Point Detection | Streaming | < 0.1ms | Full | ★★★★★ |

---

## 2. Detailed Justifications

### 2.1 Temporal Fusion Transformer (TFT) — Module 3

**Purpose:** Multi-horizon time-series forecasting of Basis Weight trajectory.

**Why TFT is the right choice:**

| Criterion | TFT Capability | Industrial Relevance |
|---|---|---|
| **Mixed Inputs** | Handles static metadata (grade pair, machine section) + dynamic time-series (stock flow, steam pressure) natively | Grade transitions involve both fixed context (target recipe) and evolving process signals |
| **Variable Selection** | Built-in variable selection network identifies which inputs matter most at each timestep | Automatically discovers that "steam pressure matters more in the first 30s but machine speed matters more during stabilization" |
| **Multi-Horizon** | Produces forecasts at multiple horizons simultaneously (t+30s, t+60s, t+90s, t+120s) | Operators need trajectory visibility, not just point predictions |
| **Quantile Output** | Natively produces quantile forecasts (10th, 50th, 90th percentile) | Feeds directly into conformal prediction for calibrated intervals |
| **Attention Mechanism** | Temporal attention provides interpretable "which past moments influenced this forecast" | Process engineers can verify that the model is "looking at" the right process events |
| **Proven Performance** | Google Research 2021; state-of-the-art on multiple time-series benchmarks | Adopted by multiple industrial forecasting applications |

**Alternatives Considered:**

| Model | Rejected Because |
|---|---|
| LSTM/GRU | No variable selection; no multi-horizon output; weaker with static covariates |
| Prophet | Designed for daily/weekly seasonality; not suitable for sub-minute industrial forecasting |
| ARIMA/SARIMA | Linear; no exogenous multi-variable support; requires stationarity |
| N-BEATS | No exogenous variables; pure univariate decomposition |
| Informer | More efficient for very long sequences; overkill for 300-second windows |
| DeepAR | Similar capability but no variable selection network |

**Training Requirements:**
- Minimum 500 grade transitions (ideally 1000+)
- 300-second input window × 12 process variables
- Static features: grade pair encoding, shift, machine section
- Training time: ~2–4 hours on single GPU (T4)
- ONNX export for production inference

---

### 2.2 LightGBM — Module 3

**Purpose:** Binary/ternary classification of deviation risk (SAFE / WARNING / BREACH).

**Why a separate classifier on top of TFT:**

The TFT outputs a continuous BW trajectory. The operational question is binary: "Will BW breach ±2.5%?" Adding a LightGBM classifier:

1. **Ingests richer features** — TFT trajectory + alarm state + scanner health + operator action count + recipe difficulty score
2. **Sharper decision boundary** — Gradient boosting excels at threshold-based classification
3. **Ultra-fast inference** — < 5ms; critical for overall latency budget
4. **Native SHAP** — Tree-based SHAP is exact (not approximate); zero computational overhead vs. kernel SHAP
5. **Handles categoricals** — Grade pair, shift ID, machine section are categorical; LightGBM handles these natively without one-hot encoding

**Hyperparameter Ranges:**

| Parameter | Range | Selected |
|---|---|---|
| n_estimators | 100–1000 | Tuned via Optuna |
| max_depth | 4–10 | Tuned via Optuna |
| learning_rate | 0.01–0.1 | Tuned via Optuna |
| min_child_samples | 10–50 | 20 |
| subsample | 0.7–1.0 | 0.8 |
| colsample_bytree | 0.7–1.0 | 0.8 |

---

### 2.3 Neural ODE — Module 4

**Purpose:** Process surrogate model (digital twin) that approximates paper machine dynamics for optimization.

**Why Neural ODE:**

| Property | Benefit for Paper Machine Modeling |
|---|---|
| **Continuous-time dynamics** | Paper machine processes evolve continuously; Neural ODE models dx/dt = f(x, u) directly, unlike discrete-time models |
| **Physics-interpretable** | The learned function f(x, u) can be interpreted as a dynamical system; engineers can inspect the learned "equations of motion" |
| **Irregular time steps** | Handles the mixed 1-second (DCS) and 5-second (QCS) sampling naturally |
| **Differentiable** | Enables gradient-based optimization in Module 4 as an alternative to evolutionary methods |
| **Sample-efficient** | Inductive bias of ODE structure means fewer training samples needed vs. black-box networks |
| **Coupled dynamics** | Models the coupling between stock flow ↔ basis weight ↔ moisture ↔ machine speed as a system of coupled ODEs |

**State Vector:**

```
x = [basis_weight, moisture, ash_content, caliper]       # Quality states
u = [stock_flow_sp, filler_flow_sp, steam_pressure_sp,    # Control inputs
     machine_speed_sp]
```

**Training:**
- Input: Historical (x, u) trajectories during grade transitions
- Loss: MSE on predicted quality trajectories vs. actual
- Regularization: Physics-informed penalty (e.g., mass balance consistency)
- Training time: ~4–6 hours on single GPU

---

### 2.4 NSGA-III — Module 4

**Purpose:** Multi-objective constrained optimization of setpoint recommendations.

**Three Objectives:**

| Objective | Description | Weight |
|---|---|---|
| **Minimize BW Deviation** | Predicted max |BW - target| during transition | Primary |
| **Minimize Stabilization Time** | Time until BW remains within ±1% of target for 30+ seconds | Secondary |
| **Minimize Aggressiveness** | Sum of |recommended_SP - current_SP| / actuator_range | Tertiary |

**Why NSGA-III over alternatives:**

| Alternative | Limitation |
|---|---|
| Linear Programming | Paper machine dynamics are non-linear; LP cannot handle |
| Sequential Quadratic Programming | Requires gradients; sensitive to local minima; single objective only |
| Particle Swarm Optimization | Good for single objective; poor Pareto diversity for multi-objective |
| **NSGA-III** | ✅ Multi-objective native; ✅ handles non-linear constraints; ✅ gradient-free (works with Neural ODE as black-box); ✅ Pareto front for operator trade-off visibility |

**Configuration:**
- Population size: 100
- Generations: 50
- Constraint handling: Death penalty for hard limits; penalty function for soft limits
- Reference directions: Das-Dennis simplex for 3 objectives

---

### 2.5 Conformal Prediction — Module 3

**Purpose:** Calibrated confidence intervals with guaranteed coverage probability.

**Why Conformal Prediction:**

| Property | Industrial Value |
|---|---|
| **Distribution-free** | No Gaussian assumption; works with any forecast distribution |
| **Finite-sample guarantee** | If we say "90% CI," exactly 90% of future observations fall within (guaranteed, not asymptotic) |
| **Model-agnostic** | Wraps around TFT without modifying it; applied as a post-processing step |
| **Simple calibration** | Requires only a held-out calibration set (100+ samples) |
| **Adaptive width** | Intervals naturally widen when the model is uncertain (novel operating region) and narrow when confident (well-known grade pair) |

**Implementation:**
- Split conformal prediction with a calibration set of the most recent 200 transitions
- Nonconformity score: |predicted_BW - actual_BW|
- Nominal coverage: 90%
- Recalibrate weekly with new data

---

### 2.6 SHAP (SHapley Additive exPlanations) — Module 3 & 5

**Purpose:** Quantitative feature attribution for every prediction.

**Why SHAP over alternatives:**

| Alternative | Limitation |
|---|---|
| LIME | Local linear approximation; unstable; different runs give different explanations |
| Attention Weights | Not faithful explanations (shown by research); attention ≠ attribution |
| Permutation Importance | Global only; no local explanations; expensive |
| Integrated Gradients | Requires differentiable model; not applicable to LightGBM |
| **SHAP** | ✅ Game-theoretic foundation; ✅ consistent & additive; ✅ local explanations; ✅ exact for trees; ✅ model-agnostic |

**Implementation:**
- **LightGBM SHAP:** Exact TreeSHAP (O(TLD) complexity; < 5ms)
- **TFT SHAP:** DeepSHAP (approximation; background set of 100 samples; < 25ms)
- **Display:** Waterfall chart (top-5 features) + force plot (engineering detail view)

---

### 2.7 Contextual Multi-Armed Bandit — Module 6

**Purpose:** Learn which recommendation strategies operators prefer, conditioned on context.

**Context Variables:**
- Grade pair difficulty score
- Operator experience level
- Time of day / shift
- Current alarm state
- Machine section (wet end vs. dry end dominated)

**Arms (Recommendation Strategies):**
- Conservative (small setpoint changes, longer stabilization)
- Balanced (moderate changes, moderate stabilization)
- Aggressive (large setpoint changes, fastest stabilization)

**Why Contextual Bandit:**

The optimal recommendation aggressiveness depends on context. Experienced night-shift operators may prefer aggressive strategies, while new operators prefer conservative ones. A contextual bandit learns these preferences without explicit programming, while still exploring new strategies periodically.

**Algorithm:** LinUCB (Linear Upper Confidence Bound)
- Computationally lightweight (matrix operations only)
- Well-studied regret bounds
- Easy to implement and debug

---

## 3. Model Training Data Requirements

| Model | Minimum Transitions | Recommended | Features | Update Frequency |
|---|---|---|---|---|
| TFT | 500 | 1000+ | 12 dynamic + 6 static | Weekly retrain; daily incremental |
| LightGBM | 300 | 500+ | TFT output + 8 context | Weekly retrain |
| Neural ODE | 500 | 1000+ | 4 states + 4 controls | Monthly retrain |
| Conformal | 100 (calibration) | 200+ | Prediction residuals | Weekly recalibrate |
| Isolation Forest | 1000 (data points) | 10000+ | Per-tag statistics | Monthly retrain |
| Contextual Bandit | 0 (cold start capable) | 100+ feedbacks | 5 context features | Continuous (online) |

---

## 4. Risk Assessment — ML Techniques

| Risk | Impact | Mitigation |
|---|---|---|
| **Insufficient training data** | Poor TFT/LightGBM accuracy | Phase 1 data audit; synthetic augmentation via Neural ODE; transfer learning from similar machines |
| **Distribution shift** | Model degradation over time | PSI + Page-Hinkley monitoring (Module 8); automatic retraining triggers |
| **Adversarial inputs** | Sensor failure causes nonsensical predictions | Isolation Forest pre-filtering (Module 1); confidence thresholds (< 70% → flag as uncertain) |
| **Neural ODE instability** | Divergent surrogate simulations | Clip ODE derivatives; fallback to lookup-table surrogate; bounded simulation horizon |
| **Operator distrust** | Low adoption rate | Explainability-first design (Module 5); gradual rollout; operator training program |
| **SHAP computational cost** | Latency budget exceeded | Pre-compute SHAP for top-5 features only; use TreeSHAP (exact, fast) for LightGBM |
