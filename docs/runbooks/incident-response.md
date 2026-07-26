# Incident Response Runbook — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-OPS-IR-001
**Version:** 1.0
**Last Updated:** 2026-07-25

---

## 1. Severity Classification

| Severity | Definition | Response Time | Examples |
|---|---|---|---|
| **SEV-1 (Critical)** | Platform is completely unavailable; no predictions during active grade changes | 15 minutes | All prediction services down; Kafka cluster failure |
| **SEV-2 (Major)** | Degraded predictions or significantly increased latency (> 2s) | 30 minutes | Model inference failure; database primary down |
| **SEV-3 (Minor)** | Non-critical feature unavailable; system functional | 2 hours | Feedback service down; Grafana unavailable |
| **SEV-4 (Low)** | Cosmetic issue; workaround available | Next business day | Dashboard rendering glitch; log formatting |

> **CRITICAL REMINDER:** GCI is an advisory-only system. Even a complete platform outage does **NOT** affect DCS operation or plant safety. Operators continue using standard DCS controls.

---

## 2. Common Incident Playbooks

### INC-01: Prediction Service Not Responding

**Symptoms:** No advisory updates on HMI during active grade change; WebSocket disconnected.

**Diagnosis:**
```bash
# Check pod status
kubectl get pods -n gci-platform -l app=gci-prediction

# Check logs
kubectl logs -n gci-platform deploy/gci-prediction --tail=100

# Check model loading
kubectl exec -n gci-platform deploy/gci-prediction -- curl localhost:8080/health

# Check ONNX Runtime
kubectl exec -n gci-platform deploy/gci-prediction -- python -c "import onnxruntime; print(onnxruntime.get_device())"
```

**Resolution:**
1. If OOM: Increase memory limit in Helm values and redeploy
2. If model corrupt: Re-download model from MLflow registry
3. If ONNX Runtime crash: Fallback to CPU inference (set `GPU_ENABLED=false`)
4. If persistent: Rollback to previous deployment version

---

### INC-02: Data Pipeline Stalled (No New Feature Vectors)

**Symptoms:** Feature store shows stale data; ingestion metrics show zero throughput.

**Diagnosis:**
```bash
# Check Kafka consumer lag
kubectl exec -n gci-system kafka-0 -- kafka-consumer-groups.sh \
    --bootstrap-server localhost:9092 \
    --group gci-ingestion \
    --describe

# Check edge gateway connectivity
kubectl logs -n gci-system deploy/edge-gateway --tail=50

# Check OPC-UA connection
kubectl exec -n gci-system deploy/edge-gateway -- opcua-health-check
```

**Resolution:**
1. If Kafka lag increasing: Restart ingestion consumer group
2. If edge gateway disconnected: Check VPN tunnel; restart edge service
3. If OPC-UA timeout: Verify OPC-UA gateway is running; check certificate expiry
4. Alert operators: Display "DATA FEED INTERRUPTED" warning on HMI

---

### INC-03: Model Drift Detected

**Symptoms:** MLOps dashboard shows PSI > 0.2 or accuracy drop below 80%.

**Diagnosis:**
```bash
# Check drift metrics
curl https://gci.mill.local/api/v1/models/tft-latest/drift | jq .

# Check recent prediction accuracy
curl https://gci.mill.local/api/v1/models/tft-latest/performance?window=7d | jq .
```

**Resolution:**
1. Verify drift is genuine (not a sensor fault)
2. If genuine: Trigger manual retraining
3. Review recent process changes (new pulp supplier, felt change, etc.)
4. Notify process engineering team

---

## 3. Escalation Matrix

| Level | Role | Contact Method | When |
|---|---|---|---|
| L1 | On-Call Engineer | PagerDuty alert | All SEV-1 and SEV-2 incidents |
| L2 | ML Engineer | PagerDuty escalation | Model-related incidents; drift alerts |
| L3 | Platform Architect | Phone | Persistent SEV-1; architectural failures |
| L4 | Product Owner | Email | Business impact assessment; communication to mill management |
