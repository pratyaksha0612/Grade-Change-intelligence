# GCI Platform — Makefile
# Shortcuts for common development and deployment tasks

.PHONY: help infra-up infra-down proto test lint format

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# === Infrastructure ===
infra-up: ## Start local infrastructure (Kafka, PostgreSQL, Redis, etc.)
	docker-compose up -d kafka postgres timescaledb redis minio mlflow

infra-down: ## Stop local infrastructure
	docker-compose down

infra-reset: ## Stop and remove all data volumes
	docker-compose down -v

# === Protocol Buffers ===
proto: ## Generate Python gRPC code from .proto files
	python -m grpc_tools.protoc \
		-I./proto \
		--python_out=./services/shared/generated \
		--grpc_python_out=./services/shared/generated \
		./proto/*.proto

# === Testing ===
test: ## Run all unit tests
	pytest services/ -v --tb=short --cov=services --cov-report=term-missing

test-integration: ## Run integration tests
	pytest tests/integration/ -v --tb=short

test-performance: ## Run performance/latency tests
	pytest tests/performance/ -v --tb=short

# === Code Quality ===
lint: ## Run linters (ruff + mypy)
	ruff check services/ ml/
	mypy services/ --ignore-missing-imports

format: ## Auto-format code (ruff)
	ruff format services/ ml/

# === ML Training ===
train-tft: ## Train TFT model
	python ml/scripts/train_tft.py --config ml/configs/tft_config.yaml

train-lgbm: ## Train LightGBM model
	python ml/scripts/train_lightgbm.py --config ml/configs/lightgbm_config.yaml

train-ode: ## Train Neural ODE surrogate
	python ml/scripts/train_neural_ode.py --config ml/configs/neural_ode_config.yaml

evaluate: ## Evaluate all models
	python ml/scripts/evaluate_models.py

export-onnx: ## Export models to ONNX format
	python ml/scripts/export_onnx.py

# === Deployment ===
build: ## Build all Docker images
	@for svc in ingestion context prediction optimization explainability feedback knowledge mlops; do \
		echo "Building gci-$$svc..."; \
		docker build -t gci-$$svc:latest -f services/$$svc/Dockerfile services/$$svc; \
	done
	docker build -t gci-frontend:latest -f infrastructure/docker/frontend.Dockerfile frontend/

deploy-dev: ## Deploy to development (Helm)
	helm upgrade --install gci-platform ./infrastructure/helm/gci-platform \
		-f ./infrastructure/helm/gci-platform/values-dev.yaml \
		--namespace gci-dev --create-namespace

deploy-staging: ## Deploy to staging (Helm)
	helm upgrade --install gci-platform ./infrastructure/helm/gci-platform \
		-f ./infrastructure/helm/gci-platform/values-staging.yaml \
		--namespace gci-staging --create-namespace

deploy-prod: ## Deploy to production (Helm) — requires approval
	@echo "⚠️  Production deployment requires manual approval"
	@read -p "Type 'DEPLOY' to confirm: " confirm && [ "$$confirm" = "DEPLOY" ] || exit 1
	helm upgrade --install gci-platform ./infrastructure/helm/gci-platform \
		-f ./infrastructure/helm/gci-platform/values-prod.yaml \
		--namespace gci-platform --create-namespace

# === Backend ===
backend-dev: ## Start backend dev server
	cd backend && uvicorn app.main:app --reload

# === Frontend ===
frontend-dev: ## Start frontend dev server
	cd frontend && npm run dev

frontend-build: ## Build frontend for production
	cd frontend && npm run build
