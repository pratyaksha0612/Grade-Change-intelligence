# Deployment Guide — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-OPS-DEP-001
**Version:** 1.0
**Last Updated:** 2026-07-25

---

## 1. Deployment Topology

### Target Environment

| Component | Specification |
|---|---|
| **Kubernetes Distribution** | Rancher RKE2 (FIPS-compliant, air-gap capable) |
| **Cluster Size** | 3 control-plane + 3 worker nodes (minimum) |
| **Worker Node Spec** | 8 vCPU, 32 GB RAM, 500 GB SSD |
| **GPU Node (optional)** | 1× NVIDIA T4 per Prediction/Optimization service |
| **Container Registry** | Harbor (self-hosted, air-gapped) |
| **Ingress** | NGINX Ingress Controller + cert-manager |
| **Service Mesh** | Istio (ambient mode for lightweight mTLS) |

### Network Requirements

| Connection | Protocol | Port | Direction | Purpose |
|---|---|---|---|---|
| Edge → Kafka | MQTT/TLS | 8883 | Inbound | Process data ingestion |
| Kafka (inter-broker) | TCP | 9093 | Internal | Broker replication |
| gRPC (inter-service) | HTTP/2 + mTLS | 50051-50058 | Internal | Module communication |
| REST API | HTTPS | 443 | Inbound | Frontend, external integrations |
| WebSocket | WSS | 443 | Inbound | Real-time advisory stream |
| PostgreSQL | TCP | 5432 | Internal | Relational data |
| TimescaleDB | TCP | 5433 | Internal | Time-series data |
| Redis | TCP | 6379 | Internal | Hot cache |
| Prometheus | HTTP | 9090 | Internal | Metrics collection |
| Grafana | HTTPS | 3000 | Inbound | Monitoring dashboards |

---

## 2. Helm Deployment

### Pre-Deployment Checklist

- [ ] Kubernetes cluster provisioned and healthy
- [ ] Container images built and pushed to Harbor registry
- [ ] TLS certificates provisioned (cert-manager or manual)
- [ ] Database instances provisioned (PostgreSQL, TimescaleDB, Redis)
- [ ] Kafka cluster provisioned and topics created
- [ ] MinIO cluster provisioned with buckets created
- [ ] OPC-UA gateway configured and tested
- [ ] Edge compute node deployed and connected
- [ ] Secrets stored in HashiCorp Vault
- [ ] MLflow server deployed and accessible
- [ ] Trained model artifacts uploaded to model registry

### Deployment Command

```bash
# Deploy infrastructure dependencies
helm upgrade --install gci-infra ./infrastructure/helm/gci-infra \
    -f ./infrastructure/helm/gci-infra/values-prod.yaml \
    --namespace gci-system \
    --create-namespace

# Deploy GCI platform services
helm upgrade --install gci-platform ./infrastructure/helm/gci-platform \
    -f ./infrastructure/helm/gci-platform/values-prod.yaml \
    --namespace gci-platform \
    --create-namespace

# Deploy monitoring stack
helm upgrade --install gci-monitoring ./infrastructure/helm/gci-monitoring \
    -f ./infrastructure/helm/gci-monitoring/values-prod.yaml \
    --namespace gci-monitoring \
    --create-namespace
```

### Environment-Specific Configuration

| Parameter | Development | Staging | Production |
|---|---|---|---|
| Replicas (per service) | 1 | 2 | 2-3 |
| Resource limits | Low | Medium | Full |
| GPU enabled | No | Optional | Yes (if available) |
| TLS | Self-signed | Let's Encrypt | Enterprise CA |
| Data retention | 7 days | 30 days | Per compliance policy |
| Log level | DEBUG | INFO | WARN |

---

## 3. Post-Deployment Verification

### Health Check Endpoints

```bash
# Check all services are healthy
for svc in ingestion context prediction optimization explainability feedback knowledge mlops; do
    echo "Checking $svc..."
    kubectl exec -n gci-platform deploy/gci-$svc -- \
        grpcurl -plaintext localhost:50051 grpc.health.v1.Health/Check
done

# Check REST API gateway
curl -s https://gci.mill.local/api/v1/health | jq .

# Check WebSocket connectivity
websocat wss://gci.mill.local/api/v1/advisory/stream
```

### Smoke Tests

1. **Data Pipeline:** Verify feature vectors are flowing from edge → Kafka → ingestion → TimescaleDB
2. **Prediction Pipeline:** Trigger a simulated grade change and verify advisory payload appears on HMI
3. **Feedback Loop:** Submit a test Accept/Reject feedback and verify it's stored in the Knowledge Base
4. **Monitoring:** Verify Prometheus is scraping all services and Grafana dashboards are populated

---

## 4. Rollback Procedure

```bash
# Rollback to previous release
helm rollback gci-platform <revision> --namespace gci-platform

# Check rollback status
helm history gci-platform --namespace gci-platform

# If model rollback needed (separate from service rollback):
# Promote previous champion model in MLflow
mlflow models transition-name "gci-tft" --version <previous> --stage Production
mlflow models transition-name "gci-lgbm" --version <previous> --stage Production
```

---

## 5. Backup & Recovery

| Component | Backup Method | Frequency | Retention | RTO | RPO |
|---|---|---|---|---|---|
| PostgreSQL | pg_dump + WAL archiving | Continuous | 30 days | 15 min | 0 (synchronous replication) |
| TimescaleDB | pg_dump + continuous archiving | Continuous | Per retention policy | 30 min | 5 min |
| Redis | RDB snapshots + AOF | Every 5 min | 24 hours | 5 min | 5 min |
| MinIO | Cross-site replication | Continuous | Indefinite | 30 min | 0 |
| Kafka | Topic replication (RF=3) | Built-in | Per topic retention | Automatic | 0 |
| Model Artifacts | MLflow artifact store (MinIO) | On publish | Indefinite | 5 min | 0 |
