# Data Flow Architecture — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-ARCH-DF-001
**Version:** 1.0
**Last Updated:** 2026-07-25

---

## 1. End-to-End Data Flow

### Primary Prediction Pipeline (Real-Time — < 500ms)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          PREDICTION PIPELINE                              │
│                                                                          │
│  ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  │  DCS    │    │  Edge    │    │  Kafka   │    │ Ingestion│           │
│  │ Experion│───►│ Gateway  │───►│  Topic:  │───►│ Service  │           │
│  │ PKS     │    │ OPC-UA   │    │ raw_data │    │ (M1)     │           │
│  └─────────┘    └──────────┘    └──────────┘    └─────┬────┘           │
│     50ms            30ms                          20ms │                │
│                                                       │                │
│                                                       ▼                │
│                                              ┌──────────────┐          │
│                                              │   Kafka       │          │
│                                              │   Topic:      │          │
│                                              │   normalized  │          │
│                                              └───────┬──────┘          │
│                                                      │                 │
│                                                      ▼                 │
│  ┌──────────────────────────────────────────────────────┐              │
│  │              Context Engine (M2)         30ms        │              │
│  │                                                      │              │
│  │  1. Is a grade change active?                        │              │
│  │     ├─ NO  → Pass through (monitoring mode)          │              │
│  │     └─ YES → Continue pipeline                       │              │
│  │  2. Retrieve recipe from Knowledge Base (M7)         │              │
│  │  3. Find top-K historical matches (KNN + DTW)        │              │
│  │  4. Assemble TransitionContext object                │              │
│  └──────────────────────┬───────────────────────────────┘              │
│                         │                                              │
│                         ▼                                              │
│  ┌──────────────────────────────────────────────────────┐              │
│  │            Prediction Engine (M3)        150ms       │              │
│  │                                                      │              │
│  │  1. Prepare input tensor (300s window × 12 vars)     │              │
│  │  2. Run TFT model (ONNX Runtime)                    │              │
│  │     → BW trajectory at t+30/60/90/120s               │              │
│  │  3. Run LightGBM classifier                         │              │
│  │     → Risk class: SAFE / WARNING / BREACH            │              │
│  │  4. Run Conformal Predictor                         │              │
│  │     → Calibrated confidence intervals                │              │
│  │  5. Compute SHAP values (TreeSHAP, top-5)           │              │
│  │  6. Emit DeviationForecast                          │              │
│  └──────────────────┬────┬──────────────────────────────┘              │
│                     │    │                                              │
│        ┌────────────┘    │                                              │
│        │ If risk ≥       │ Always                                       │
│        │ WARNING         │                                              │
│        ▼                 │                                              │
│  ┌──────────────────┐    │                                              │
│  │ Optimization     │    │                                              │
│  │ Engine (M4)      │    │                                              │
│  │     150ms        │    │                                              │
│  │                  │    │                                              │
│  │ 1. Query         │    │                                              │
│  │    constraints   │    │                                              │
│  │    from M7       │    │                                              │
│  │ 2. Simulate via  │    │                                              │
│  │    Neural ODE    │    │                                              │
│  │ 3. Optimize via  │    │                                              │
│  │    NSGA-III      │    │                                              │
│  │ 4. Validate      │    │                                              │
│  │    safety limits │    │                                              │
│  │ 5. Emit          │    │                                              │
│  │    Recommendation│    │                                              │
│  └────────┬─────────┘    │                                              │
│           │              │                                              │
│           └──────┬───────┘                                              │
│                  │                                                      │
│                  ▼                                                      │
│  ┌──────────────────────────────────────────────────────┐              │
│  │          Explainability Engine (M5)       30ms       │              │
│  │                                                      │              │
│  │  1. Render operator summary (template NLG)           │              │
│  │  2. Build engineering detail (SHAP waterfall)        │              │
│  │  3. Generate historical comparison narrative         │              │
│  │  4. Write audit record                              │              │
│  │  5. Emit AdvisoryPayload                            │              │
│  └──────────────────────┬───────────────────────────────┘              │
│                         │                                              │
│                         ▼                                              │
│  ┌──────────────────────────────────────────────────────┐              │
│  │          WebSocket Gateway               40ms        │              │
│  │                                                      │              │
│  │  Push AdvisoryPayload to all subscribed HMI clients  │              │
│  └──────────────────────────────────────────────────────┘              │
│                                                                        │
│                     TOTAL: < 500ms                                      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Feedback Loop Pipeline (Asynchronous — seconds to minutes)

```
┌──────────────────────────────────────────────────────────────────────┐
│                          FEEDBACK PIPELINE                            │
│                                                                      │
│  ┌─────────────┐                                                     │
│  │ Operator HMI│                                                     │
│  │             │                                                     │
│  │ [ACCEPT]    │──── POST /api/v1/transitions/{id}/feedback ────┐    │
│  │ [REJECT]    │                                                │    │
│  │ [MODIFY]    │                                                │    │
│  └─────────────┘                                                │    │
│                                                                 │    │
│                                                                 ▼    │
│  ┌──────────────────────────────────────────────────────────┐   │    │
│  │              Feedback Service (M6)                       │   │    │
│  │                                                          │   │    │
│  │  1. Record operator decision + timestamp + rationale     │   │    │
│  │  2. Wait for transition to complete (~2-5 minutes)       │   │    │
│  │  3. Retrieve actual BW trajectory (post-transition)      │   │    │
│  │  4. Compare predicted vs. actual outcome                 │   │    │
│  │  5. Compute reward signal:                               │   │    │
│  │     R = 0.40×accuracy + 0.25×acceptance                 │   │    │
│  │       + 0.25×stabilization + 0.10×constraints            │   │    │
│  │  6. Update contextual bandit (online)                    │   │    │
│  │  7. Store feedback in Knowledge Base (M7)                │   │    │
│  │  8. Evaluate retraining triggers                         │   │    │
│  └─────────────────────┬──────────┬─────────────────────────┘   │    │
│                        │          │                              │    │
│              ┌─────────┘          └─────────┐                   │    │
│              │                              │                   │    │
│              ▼                              ▼                   │    │
│  ┌──────────────────┐           ┌──────────────────┐            │    │
│  │ Knowledge Base   │           │ MLOps Service    │            │    │
│  │ (M7)             │           │ (M8)             │            │    │
│  │                  │           │                  │            │    │
│  │ Store:           │           │ Evaluate:        │            │    │
│  │ - Feedback record│           │ - Data drift     │            │    │
│  │ - Outcome data   │           │ - Concept drift  │            │    │
│  │ - Reward score   │           │ - Model accuracy │            │    │
│  │ - Operator trust │           │                  │            │    │
│  └──────────────────┘           │ If trigger met:  │            │    │
│                                 │ - Schedule       │            │    │
│                                 │   retraining     │            │    │
│                                 │ - Run eval       │            │    │
│                                 │   pipeline       │            │    │
│                                 │ - Shadow deploy  │            │    │
│                                 │ - Promote if     │            │    │
│                                 │   improved       │            │    │
│                                 └──────────────────┘            │    │
└──────────────────────────────────────────────────────────────────────┘
```

---

### Model Retraining Pipeline (Scheduled — weekly)

```
┌──────────────────────────────────────────────────────────────────────┐
│                     MODEL RETRAINING PIPELINE                        │
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │  DATA    │───►│ TRAINING │───►│  EVAL    │───►│  SHADOW  │      │
│  │VALIDATION│    │          │    │          │    │DEPLOYMENT│      │
│  └──────────┘    └──────────┘    └──────────┘    └─────┬────┘      │
│                                                         │           │
│  Checks:          Trains:         Evaluates:       Runs in:        │
│  - Data volume    - TFT model     - MAE, RMSE      - Shadow mode   │
│  - Distribution   - LightGBM      - F1 score       - Parallel to   │
│  - Completeness   - Neural ODE    - Calibration      champion      │
│  - Label quality  - Conformal     - Latency        - No operator   │
│                                   - vs. champion     impact        │
│                                                         │           │
│                              ┌───────────────────────────┘           │
│                              │                                      │
│                              ▼                                      │
│                   ┌────────────────────┐                             │
│                   │ STATISTICAL TEST   │                             │
│                   │                    │                             │
│                   │ Bayesian A/B:      │                             │
│                   │ P(challenger >     │                             │
│                   │   champion) > 95%? │                             │
│                   └─────────┬──────────┘                             │
│                             │                                       │
│                   ┌─────────┼─────────┐                             │
│                   │ YES     │         │ NO                          │
│                   ▼         │         ▼                             │
│          ┌──────────┐       │  ┌──────────┐                         │
│          │ PROMOTE  │       │  │ DISCARD  │                         │
│          │ to       │       │  │ candidate│                         │
│          │ Champion │       │  │ Log      │                         │
│          └─────┬────┘       │  │ results  │                         │
│                │            │  └──────────┘                         │
│                ▼            │                                       │
│       ┌──────────────┐      │                                       │
│       │ PRODUCTION   │      │                                       │
│       │ DEPLOYMENT   │      │                                       │
│       │              │      │                                       │
│       │ Canary: 10%  │      │                                       │
│       │ → 50% → 100% │      │                                       │
│       └──────────────┘      │                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Volume Estimates

| Data Type | Rate | Daily Volume | Monthly Volume |
|---|---|---|---|
| Raw process tags (500 tags × 1 Hz) | ~4 KB/sec | ~350 MB/day | ~10 GB/month |
| QCS scanner data (4 vars × 0.2 Hz) | ~0.1 KB/sec | ~8 MB/day | ~250 MB/month |
| Normalized feature vectors | ~1 KB/sec | ~86 MB/day | ~2.5 GB/month |
| Predictions (during transitions) | ~5 KB/transition/sec | ~5 MB/day | ~150 MB/month |
| Recommendations | ~2 KB/recommendation | ~0.2 MB/day | ~6 MB/month |
| Feedback records | ~1 KB/record | ~0.1 MB/day | ~3 MB/month |
| Audit logs | ~10 KB/event | ~50 MB/day | ~1.5 GB/month |
| Model artifacts | ~500 MB/model | ~1 GB/week | ~4 GB/month |
| **Total (per machine)** | | **~500 MB/day** | **~15 GB/month** |

---

## 3. Kafka Topic Architecture

```
                              Apache Kafka Cluster
                              (3 Brokers, RF=3)
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌───────────────────────┐                                         │
│  │ gci.raw_data.PM-3     │ ← Edge Gateway (PM-3)                  │
│  │ Partitions: 3         │                                         │
│  │ Retention: 24h        │ → Ingestion Service                     │
│  └───────────────────────┘                                         │
│                                                                     │
│  ┌───────────────────────┐                                         │
│  │ gci.normalized.PM-3   │ ← Ingestion Service                    │
│  │ Partitions: 3         │                                         │
│  │ Retention: 72h        │ → Context Engine                        │
│  └───────────────────────┘                                         │
│                                                                     │
│  ┌───────────────────────┐                                         │
│  │ gci.transitions       │ ← Context Engine                       │
│  │ Partitions: 3         │                                         │
│  │ Retention: 30d        │ → Prediction, Optimization              │
│  └───────────────────────┘                                         │
│                                                                     │
│  ┌───────────────────────┐                                         │
│  │ gci.predictions       │ ← Prediction Engine                    │
│  │ Partitions: 3         │                                         │
│  │ Retention: 30d        │ → Optimization, Explainability          │
│  └───────────────────────┘                                         │
│                                                                     │
│  ┌───────────────────────┐                                         │
│  │ gci.recommendations   │ ← Optimization Engine                  │
│  │ Partitions: 3         │                                         │
│  │ Retention: 30d        │ → Explainability                        │
│  └───────────────────────┘                                         │
│                                                                     │
│  ┌───────────────────────┐                                         │
│  │ gci.advisories        │ ← Explainability Engine                │
│  │ Partitions: 3         │                                         │
│  │ Retention: 30d        │ → WebSocket Gateway → HMI               │
│  └───────────────────────┘                                         │
│                                                                     │
│  ┌───────────────────────┐                                         │
│  │ gci.feedback          │ ← Feedback Service                     │
│  │ Partitions: 1         │                                         │
│  │ Retention: ∞          │ → Knowledge Base, MLOps                 │
│  └───────────────────────┘                                         │
│                                                                     │
│  ┌───────────────────────┐                                         │
│  │ gci.alerts            │ ← All Services                         │
│  │ Partitions: 1         │                                         │
│  │ Retention: 7d         │ → Alerting Service                      │
│  └───────────────────────┘                                         │
│                                                                     │
│  ┌───────────────────────┐                                         │
│  │ gci.dead-letter       │ ← All Services (failed messages)       │
│  │ Partitions: 1         │                                         │
│  │ Retention: 30d        │ → Manual investigation                  │
│  └───────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA STORAGE LAYER                           │
│                                                                     │
│  ┌─────────────────────────┐                                       │
│  │     TimescaleDB         │                                       │
│  │  (Time-Series Data)     │                                       │
│  │                         │                                       │
│  │  ← M1: Feature vectors  │  Hypertable: feature_vectors          │
│  │  ← M3: Predictions      │  Hypertable: predictions              │
│  │  ← M4: Recommendations  │  Hypertable: recommendations          │
│  │  ← M6: Outcome data     │  Hypertable: transition_outcomes      │
│  │                         │                                       │
│  │  Continuous Aggregates:  │                                       │
│  │  - 1-min avg/min/max    │                                       │
│  │  - 1-hour rollups       │                                       │
│  │  - Daily summaries      │                                       │
│  │                         │                                       │
│  │  Retention: 2yr raw,    │                                       │
│  │  7yr aggregated         │                                       │
│  └─────────────────────────┘                                       │
│                                                                     │
│  ┌─────────────────────────┐                                       │
│  │     PostgreSQL          │                                       │
│  │  (Relational Data)      │                                       │
│  │                         │                                       │
│  │  ← M7: Recipes          │  Table: recipes, recipe_versions      │
│  │  ← M7: Constraints      │  Table: constraints                   │
│  │  ← M7: Glossary         │  Table: process_glossary              │
│  │  ← M6: Feedback         │  Table: operator_feedback             │
│  │  ← M6: Trust scores     │  Table: operator_trust                │
│  │  ← M8: Model registry   │  Table: model_versions               │
│  │  ← M5: Audit records    │  Table: audit_trail (append-only)     │
│  │                         │                                       │
│  │  Retention: Indefinite   │                                       │
│  └─────────────────────────┘                                       │
│                                                                     │
│  ┌─────────────────────────┐                                       │
│  │     Redis Cluster       │                                       │
│  │  (Hot Cache)            │                                       │
│  │                         │                                       │
│  │  ← M1: Last 600s of     │  Key: fv:{machine_id}:{timestamp}    │
│  │        feature vectors   │  TTL: 10 minutes                     │
│  │  ← M2: Active recipe    │  Key: recipe:{machine_id}:active     │
│  │  ← M2: Active context   │  Key: ctx:{transition_id}            │
│  │  ← M3: Latest prediction│  Key: pred:{transition_id}:latest    │
│  │  ← M4: Latest recommend │  Key: rec:{transition_id}:latest     │
│  │                         │                                       │
│  │  Eviction: LRU          │                                       │
│  └─────────────────────────┘                                       │
│                                                                     │
│  ┌─────────────────────────┐                                       │
│  │     MinIO               │                                       │
│  │  (Object Storage)       │                                       │
│  │                         │                                       │
│  │  ← ML: Training datasets│  Bucket: gci-training-data            │
│  │  ← ML: Model artifacts  │  Bucket: gci-model-artifacts          │
│  │  ← M1: Parquet backups  │  Bucket: gci-feature-archive          │
│  │  ← M8: Experiment logs  │  Bucket: gci-experiments              │
│  │                         │                                       │
│  │  Retention: Indefinite   │                                       │
│  └─────────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────┘
```
