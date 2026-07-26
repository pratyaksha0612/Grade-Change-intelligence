# System Architecture — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-ARCH-SYS-001
**Version:** 1.0
**Last Updated:** 2026-07-25
**Classification:** Honeywell Confidential — Engineering Design

---

## 1. Architecture Philosophy

The GCI Platform is designed as an **advisory intelligence layer** that sits above the Experion PKS DCS, consuming real-time process data and delivering predictive insights and setpoint recommendations to paper machine operators during grade transitions.

### Core Principles

| Principle | Description |
|---|---|
| **Defense in Depth** | OT/IT segmentation via industrial DMZ; no direct IT-to-DCS connectivity |
| **Edge-First Processing** | Signal conditioning and anomaly pre-filtering at the edge node |
| **Loosely Coupled Modules** | Each module is an independent microservice communicating via async message bus |
| **Fail-Safe Advisory** | System is advisory-only; never writes directly to DCS without operator confirmation |
| **Deterministic Latency** | Prediction pipeline completes in < 500ms from data arrival to recommendation |
| **Horizontal Scalability** | Kubernetes-based deployment supports multi-machine, multi-mill scaling |
| **Explainability First** | Every prediction carries a human-readable engineering explanation |
| **Continuous Learning** | Operator feedback closes the learning loop without requiring full retraining |

---

## 2. ISA-95 / Purdue Model Alignment

The GCI Platform aligns with the ISA-95 (Purdue) reference architecture for industrial control systems:

```
┌─────────────────────────────────────────────────────────────────┐
│ Level 5: Enterprise Network                                      │
│   Corporate IT, ERP (SAP), Business Analytics                    │
├─────────────────────────────────────────────────────────────────┤
│ Level 4: Site Business Planning & Logistics    ◄── GCI PLATFORM │
│   AI Decision Intelligence, Historian Analytics                  │
│   ┌─────────────────────────────────────────┐                    │
│   │  Kubernetes Cluster                      │                    │
│   │  8 Microservices + Infrastructure        │                    │
│   │  Operator HMI / Engineering Console      │                    │
│   └─────────────────────────────────────────┘                    │
├─────────────────────────────────────────────────────────────────┤
│ Level 3.5: Industrial DMZ                      ◄── EDGE GATEWAY │
│   OPC-UA Gateway (Matrikon)                                      │
│   Edge Compute Node (Honeywell Edge)                             │
│   Data Diode Behavior (Read-Only from OT)                        │
├─────────────────────────────────────────────────────────────────┤
│ Level 3: Site Manufacturing Operations                           │
│   Experion PKS Server, Uniformance PHD Historian                 │
│   Recipe Management, Alarm & Event Server                        │
├─────────────────────────────────────────────────────────────────┤
│ Level 2: Area Supervisory Control                                │
│   Experion PKS Controllers (C300/ACE)                            │
│   Quality Control System (QCS)                                   │
├─────────────────────────────────────────────────────────────────┤
│ Level 1: Basic Process Control                                   │
│   I/O Modules, Transmitters, Valves, Drives                     │
├─────────────────────────────────────────────────────────────────┤
│ Level 0: Physical Process                                        │
│   Paper Machine (Headbox, Press, Dryer, Calender, Reel)          │
└─────────────────────────────────────────────────────────────────┘
```

### Key Security Boundary

The **Industrial DMZ (Level 3.5)** enforces the following rules:

1. **Data flows UP only** — Process data flows from OT (Levels 0-3) to IT (Level 4) via OPC-UA subscriptions
2. **No direct IT-to-DCS writes** — The GCI Platform cannot write setpoints to the DCS; recommendations are displayed on the HMI for operator action
3. **OPC-UA Gateway** — Single point of controlled data exchange; supports certificate-based authentication and encrypted transport
4. **Edge Compute** — Pre-processes, buffers, and forwards data to the platform; provides store-and-forward during network outages

---

## 3. High-Level System Architecture

```
                            ┌──────────────────────────┐
                            │     PLANT FLOOR (OT)     │
                            │                          │
                            │  ┌─────────────────────┐ │
                            │  │  Experion PKS DCS   │ │
                            │  │  ─ Stock Flow SP/PV │ │
                            │  │  ─ Steam Press SP/PV│ │
                            │  │  ─ Machine Speed    │ │
                            │  │  ─ Filler Flow      │ │
                            │  └────────┬────────────┘ │
                            │           │              │
                            │  ┌────────▼────────────┐ │
                            │  │  QCS Scanner        │ │
                            │  │  ─ Basis Weight     │ │
                            │  │  ─ Moisture         │ │
                            │  │  ─ Ash Content      │ │
                            │  │  ─ Caliper          │ │
                            │  └────────┬────────────┘ │
                            │           │              │
                            │  ┌────────▼────────────┐ │
                            │  │  Uniformance PHD    │ │
                            │  │  (Historian)        │ │
                            │  └────────┬────────────┘ │
                            │           │              │
                            │  ┌────────▼────────────┐ │
                            │  │  Alarm & Event Svr  │ │
                            │  └────────┬────────────┘ │
                            └───────────┼──────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │    INDUSTRIAL DMZ │(Level 3.5)        │
                    │   ┌───────────────▼────────────────┐  │
                    │   │  OPC-UA Gateway (Matrikon)     │  │
                    │   │  Certificate Auth + TLS 1.3    │  │
                    │   └───────────────┬────────────────┘  │
                    │   ┌───────────────▼────────────────┐  │
                    │   │  Edge Compute Node             │  │
                    │   │  ─ Signal Conditioning         │  │
                    │   │  ─ Store-and-Forward           │  │
                    │   │  ─ Kafka/MQTT Producer         │  │
                    │   └───────────────┬────────────────┘  │
                    └───────────────────┼───────────────────┘
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          │         GCI PLATFORM (Kubernetes Cluster — Level 4)       │
          │                             │                             │
          │  ┌──────────────────────────▼────────────────────────┐    │
          │  │              Apache Kafka (Event Bus)             │    │
          │  │   Topics: raw_data, normalized, predictions,      │    │
          │  │           recommendations, feedback, alerts       │    │
          │  └──┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬──┘    │
          │     │     │     │     │     │     │     │     │        │
          │  ┌──▼──┐┌─▼──┐┌▼───┐┌▼───┐┌▼───┐┌▼───┐┌▼───┐┌▼───┐   │
          │  │ M1  ││ M2 ││ M3 ││ M4 ││ M5 ││ M6 ││ M7 ││ M8 │   │
          │  │Ingest││Ctx ││Pred││Opt ││Expl││Fdbk││Know││MLOp│   │
          │  └──┬──┘└─┬──┘└┬───┘└┬───┘└┬───┘└┬───┘└┬───┘└┬───┘   │
          │     │     │    │     │     │     │     │     │        │
          │  ┌──▼─────▼────▼─────▼─────▼─────▼─────▼─────▼──┐    │
          │  │           Shared Infrastructure                │    │
          │  │  TimescaleDB │ PostgreSQL │ Redis │ MinIO      │    │
          │  │  MLflow │ Prometheus │ Grafana │ Jaeger        │    │
          │  └────────────────────────────────────────────────┘    │
          └──────────────────────┬─────────────────────────────────┘
                                 │
          ┌──────────────────────▼─────────────────────────────────┐
          │              OPERATOR & ENGINEER INTERFACES             │
          │                                                        │
          │  ┌────────────────┐ ┌──────────────┐ ┌──────────────┐  │
          │  │ Operator HMI   │ │ Engineering  │ │ Mobile Push  │  │
          │  │ Advisory Panel │ │ Analytics    │ │ Alerts       │  │
          │  │ (React + WS)   │ │ Console      │ │ (PWA)        │  │
          │  └────────────────┘ └──────────────┘ └──────────────┘  │
          └────────────────────────────────────────────────────────┘
```

---

## 4. Data Sources & Process Variables

### Real-Time Tags (OPC-UA Subscriptions, 1-second sample rate)

| Variable | Tag Pattern | Engineering Unit | Role |
|---|---|---|---|
| Stock Flow | `FIC-1xx.PV / .SP` | kg/min | Primary BW manipulated variable |
| Filler Flow | `FIC-2xx.PV / .SP` | kg/min | Ash content control |
| Steam Pressure | `PIC-3xx.PV / .SP` | kPa | Dryer section energy input |
| Machine Speed | `SIC-4xx.PV / .SP` | m/min | Production rate |
| Headbox Pressure | `PIC-1xx.PV` | kPa | Sheet formation |
| Slice Opening | `ZIC-1xx.PV` | mm | Jet-to-wire ratio |
| Dryer Temperature | `TIC-3xx.PV` | °C | Moisture control |

### Quality Variables (QCS Scanner, 5-second sample rate)

| Variable | Measurement | Engineering Unit | Control Limit |
|---|---|---|---|
| Basis Weight | Beta gauge | g/m² | ±2.5% of target |
| Moisture | Infrared | % | ±0.5% absolute |
| Ash Content | X-ray fluorescence | % | ±1.0% absolute |
| Caliper | Contact/laser | μm | ±5.0% of target |

### Event Data (Asynchronous)

| Source | Data Type | Format |
|---|---|---|
| Alarm & Event Server | Process alarms, operator actions | SOE records (timestamp, tag, description, priority) |
| DCS Sequence Events | Grade change initiation, recipe downloads | Batch event journal |
| Recipe Management | Target setpoints, quality limits | Structured records (JSON/XML) |
| Scanner Diagnostics | Sensor health, calibration status | Status registers |

### Historical Data (Historian Backfill)

| Dataset | Volume | Retention |
|---|---|---|
| Process tag history | ~500 tags × 1-sec × 2 years | 2 years raw, 7 years aggregated |
| Transition records | ~5–15 transitions/day × 2 years | Indefinite |
| Operator feedback | All Accept/Reject decisions | Indefinite |

---

## 5. Latency Architecture

The end-to-end prediction pipeline must complete in **< 500ms** to provide actionable advisory during active grade transitions.

```
┌────────┬────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│  DCS   │  Edge  │Ingest  │Context │Predict │Optimize│Explain │  HMI   │
│  →Edge │ →Kafka │Pipeline│ Engine │ Engine │ Engine │ Engine │Delivery│
│  50ms  │  30ms  │  20ms  │  30ms  │ 150ms  │ 150ms  │  30ms  │  40ms  │
└────────┴────────┴────────┴────────┴────────┴────────┴────────┴────────┘
├─────────────────────── TOTAL: < 500ms ────────────────────────────────┤
```

### Latency Optimization Strategies

| Strategy | Applied To | Savings |
|---|---|---|
| **gRPC streaming** | Inter-service communication | ~30% vs REST JSON serialization |
| **ONNX Runtime** | TFT inference | ~3x faster than native PyTorch |
| **Redis hot cache** | Recent feature vectors, active recipes | Eliminates DB round-trips |
| **Pre-computed SHAP** | Feature attribution | Background SHAP for top-K features only |
| **Connection pooling** | All database connections | Eliminates connection setup overhead |

---

## 6. Fault Tolerance & High Availability

| Failure Scenario | Mitigation | Recovery |
|---|---|---|
| **OPC-UA gateway failure** | Edge node buffers data locally (store-and-forward, 24h buffer) | Auto-reconnect with exponential backoff; replay buffered data |
| **Kafka broker failure** | 3-broker cluster with replication factor 3 | Automatic leader election; no data loss |
| **Prediction service crash** | 3 replicas with Kubernetes health checks | Auto-restart within 5 seconds; stale prediction displayed with warning |
| **Database failure** | Primary + synchronous replica | Automatic failover; RPO = 0 (synchronous replication) |
| **GPU failure** | CPU fallback inference (ONNX Runtime CPU) | Transparent failover; ~2x latency increase (still within budget) |
| **Full platform outage** | Operators continue using DCS manual controls | No safety impact (advisory-only system) |

---

## 7. Multi-Mill Scaling Architecture

### Option A: Centralized (Recommended for < 5 mills)

```
Mill 1 ──Edge──┐
Mill 2 ──Edge──┼── VPN ── Central Kubernetes Cluster
Mill 3 ──Edge──┘          (Single MLOps, shared models)
```

### Option B: Federated (Recommended for 5+ mills)

```
Mill 1 ── Local K8s Cluster ──┐
Mill 2 ── Local K8s Cluster ──┼── Central MLOps Hub
Mill 3 ── Local K8s Cluster ──┘   (Model registry, aggregated analytics)
```

| Dimension | Centralized | Federated |
|---|---|---|
| Latency | Higher (WAN dependency) | Lower (local inference) |
| Data sovereignty | All data centralized | Data stays at mill |
| Model consistency | Uniform | Per-mill adaptation |
| Ops complexity | Lower | Higher |
| Recommended for | Small deployments, reliable WAN | Large deployments, regulatory constraints |

---

## 8. Compliance & Standards Matrix

| Standard | Requirement | GCI Implementation |
|---|---|---|
| **IEC 61511** | Safety instrumented systems | GCI is advisory-only; does not participate in safety loops; SIL assessment not required but documented |
| **21 CFR Part 11** | Electronic records & signatures | Immutable audit trail; operator authentication; timestamp integrity |
| **ISA-95** | OT/IT network segmentation | Industrial DMZ with data diode behavior |
| **ISA-88** | Batch control model | Grade change detection aligned with S88 state model |
| **IEC 62443** | Industrial cybersecurity | Network segmentation, mTLS, certificate management |
| **WCAG 2.1 AA** | Accessibility | HMI designed for control room readability (high contrast, large fonts) |
| **GDPR** | Data protection (EU mills) | Operator ID pseudonymization; data retention policies |
