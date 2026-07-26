# Model Retraining Guide — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-OPS-RT-001
**Version:** 1.0
**Last Updated:** 2026-07-25

---

## 1. Retraining Overview

### Models Requiring Retraining

| Model | Type | Retraining Frequency | Trigger Conditions |
|---|---|---|---|
| **Temporal Fusion Transformer** | Time-Series Forecaster | Weekly (scheduled) + on-demand | Data drift (PSI > 0.2); accuracy drop (MAE > 1.5 g/m²) |
| **LightGBM Classifier** | Deviation Risk Classifier | Weekly (scheduled) + on-demand | Concept drift (F1 < 0.80); 50+ new feedback records |
| **Neural ODE Surrogate** | Process Digital Twin | Monthly (scheduled) + on-demand | Surrogate error > 5% vs. actual; process equipment change |
| **Conformal Predictor** | Uncertainty Quantifier | Weekly (calibration only) | Coverage deviation (< 85% or > 95%) |
| **Isolation Forest** | Anomaly Detector | Monthly | Sensor configuration change; new tags added |

---

## 2. Automated Retraining Pipeline

### Pipeline Stages

```
DATA COLLECTION → DATA VALIDATION → FEATURE ENGINEERING → TRAINING →
EVALUATION → SHADOW DEPLOYMENT → A/B COMPARISON → PROMOTION/DISCARD
```

### Stage Details

| Stage | Duration | Compute | Automated? |
|---|---|---|---|
| Data Collection | 5 min | CPU | Yes |
| Data Validation | 10 min | CPU | Yes |
| Feature Engineering | 15 min | CPU | Yes |
| TFT Training | 2-4 hours | 1× T4 GPU | Yes |
| LightGBM Training | 10 min | CPU | Yes |
| Neural ODE Training | 4-6 hours | 1× T4 GPU | Yes |
| Evaluation | 30 min | CPU | Yes |
| Shadow Deployment | 24-72 hours | Same as production | Yes |
| A/B Comparison | Analyst review | N/A | Semi-automated |
| Promotion | 5 min | N/A | **Manual approval required** |

### Retraining Schedule

```
┌─────────────────────────────────────────────────────────┐
│                    Weekly Schedule                        │
│                                                          │
│  Sunday 02:00 UTC  ─── Data Collection & Validation      │
│  Sunday 02:30 UTC  ─── Feature Engineering                │
│  Sunday 03:00 UTC  ─── TFT Training (GPU)                │
│  Sunday 07:00 UTC  ─── LightGBM Training                 │
│  Sunday 07:30 UTC  ─── Conformal Recalibration            │
│  Sunday 08:00 UTC  ─── Evaluation Suite                   │
│  Sunday 09:00 UTC  ─── Shadow Deployment (auto)           │
│  Monday–Wednesday  ─── Shadow Running (parallel)          │
│  Thursday AM       ─── A/B Results Review (engineer)      │
│  Thursday PM       ─── Promotion Decision (manual)        │
│                                                          │
│  1st Sunday/Month  ─── Neural ODE Retraining (added)      │
│  1st Sunday/Month  ─── Isolation Forest Retraining        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Manual Retraining Procedure

### When to Trigger Manual Retraining

- Process equipment change (new felt, new headbox, refiner plate change)
- New paper grade introduced (no historical data)
- Significant raw material change (new pulp supplier)
- MLOps dashboard shows persistent drift alert
- Operator accept rate drops below 60%

### Procedure

1. **Notify stakeholders** — Inform process engineering and operations team
2. **Assess data** — Ensure sufficient post-change data (minimum 50 transitions for TFT)
3. **Launch pipeline** — Trigger via MLOps dashboard or CLI:
   ```bash
   # Trigger manual retraining
   curl -X POST https://gci.mill.local/api/v1/mlops/retrain \
       -H "Authorization: Bearer $TOKEN" \
       -d '{"models": ["tft", "lgbm"], "reason": "Felt change PM-3"}'
   ```
4. **Monitor training** — Watch MLflow experiment dashboard for training progress
5. **Review results** — Compare challenger metrics against champion
6. **Promote or discard** — Approve promotion if challenger shows improvement

---

## 4. Model Evaluation Criteria

### Promotion Requirements (ALL must be met)

| Metric | Threshold | Measurement |
|---|---|---|
| MAE (BW forecast) | ≤ champion MAE | On holdout test set (last 30 days) |
| F1 Score (risk class) | ≥ 0.80 AND ≥ champion F1 | On holdout test set |
| Conformal Coverage | 85–95% (nominal: 90%) | On calibration set |
| Inference Latency (p95) | ≤ 200ms | On production hardware |
| No safety violations | Zero recommendations exceeding hard limits | On all test scenarios |
