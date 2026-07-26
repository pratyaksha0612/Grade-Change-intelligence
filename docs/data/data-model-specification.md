# Enterprise Data Model — GradeChange Intelligence Platform

**Document ID:** HPS-GCI-DATA-001
**Version:** 1.0
**Last Updated:** 2026-07-25
**Author Role:** Principal Data Architect, Honeywell Process Solutions
**Audience:** Backend Engineering Team, DBA Team, Data Engineering Team
**Status:** Specification — Ready for Implementation

> [!IMPORTANT]
> This document specifies the **complete data model** for the GCI Platform. It contains no SQL, no ORM models, and no backend code. It is the definitive reference for backend engineers to implement all database schemas, indexes, and data lifecycle policies.

---

# TABLE OF CONTENTS

1. [Naming Conventions](#1-naming-conventions)
2. [Storage Architecture](#2-storage-architecture)
3. [Entity Catalog](#3-entity-catalog)
4. [Entity Specifications](#4-entity-specifications)
   - Domain A: Identity & Access
   - Domain B: Physical Assets
   - Domain C: Process Configuration
   - Domain D: Operational Data
   - Domain E: AI Outputs
   - Domain F: Operator Interaction
   - Domain G: Alerts & Events
   - Domain H: Audit & Compliance
   - Domain I: ML Operations
5. [Entity Relationship Diagram](#5-entity-relationship-diagram)
6. [Relationship Catalog](#6-relationship-catalog)
7. [Indexing Strategy](#7-indexing-strategy)
8. [Partitioning Strategy](#8-partitioning-strategy)
9. [Data Lifecycle & Retention](#9-data-lifecycle--retention)
10. [Security Classification](#10-security-classification)
11. [Growth Projections](#11-growth-projections)
12. [Data Governance](#12-data-governance)
13. [Scalability Recommendations](#13-scalability-recommendations)

---

# 1. Naming Conventions

| Element | Convention | Example |
|---|---|---|
| **Table names** | `snake_case`, plural, domain-prefixed | `iam_users`, `ops_grade_change_sessions` |
| **Column names** | `snake_case`, no abbreviations (except `id`, `pv`, `sp`) | `basis_weight_target`, `created_at` |
| **Primary keys** | `id` (UUID v7 for time-ordered uniqueness) | `id UUID PRIMARY KEY` |
| **Foreign keys** | `{referenced_table_singular}_id` | `machine_id`, `operator_id` |
| **Timestamps** | `{action}_at` with timezone, always UTC | `created_at`, `detected_at`, `acknowledged_at` |
| **Booleans** | `is_{adjective}` or `has_{noun}` | `is_active`, `has_setpoint`, `is_acknowledged` |
| **Enums** | Stored as `VARCHAR(50)`, validated at application level | `risk_class VARCHAR(50) CHECK (...)` |
| **JSONB columns** | `{noun}_data` or `{noun}_metadata` | `context_data`, `shap_metadata` |
| **Indexes** | `idx_{table}_{columns}` | `idx_predictions_session_id_created_at` |
| **Constraints** | `chk_{table}_{rule}` / `uq_{table}_{columns}` | `chk_feedback_decision`, `uq_users_employee_id` |

**Domain Prefixes:**

| Prefix | Domain | Tables |
|---|---|---|
| `iam_` | Identity & Access Management | Users, roles, permissions |
| `asset_` | Physical Assets | Plants, lines, machines, sections |
| `cfg_` | Process Configuration | Grades, recipes, process variables, constraints |
| `ops_` | Operational Data | Grade change sessions, phases, sensor data, feature vectors |
| `ai_` | AI Outputs | Predictions, recommendations, confidence, root cause, timeline, simulations, similarity |
| `fb_` | Operator Feedback | Feedback records, feedback validations |
| `alert_` | Alerts & Events | Alarms, notifications, system events |
| `audit_` | Audit & Compliance | Audit log |
| `ml_` | ML Operations | Models, versions, training runs, feature store, drift metrics |

---

# 2. Storage Architecture

## 2.1 Storage Engine Selection

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      GCI DATA STORAGE ARCHITECTURE                       │
│                                                                          │
│  ┌─────────────────────────┐     ┌─────────────────────────┐            │
│  │     PostgreSQL 16       │     │    TimescaleDB 2.x      │            │
│  │     (Relational)        │     │    (Time-Series)         │            │
│  │                         │     │                          │            │
│  │  • IAM tables           │     │  • ops_sensor_data       │            │
│  │  • Asset tables         │     │  • ops_feature_vectors   │            │
│  │  • Config tables        │     │  • ai_predictions        │            │
│  │  • Feedback tables      │     │  • ai_recommendations    │            │
│  │  • Audit log            │     │  • ai_confidence_scores  │            │
│  │  • ML model registry    │     │  • ai_root_cause_reports │            │
│  │  • Session metadata     │     │  • ai_timeline_preds     │            │
│  │                         │     │  • alert_alarms          │            │
│  │  ~25 tables             │     │  • ml_drift_metrics      │            │
│  │  Slow growth            │     │                          │            │
│  └─────────────────────────┘     │  ~10 hypertables         │            │
│                                  │  Fast growth             │            │
│                                  └─────────────────────────┘            │
│                                                                          │
│  ┌─────────────────────────┐     ┌─────────────────────────┐            │
│  │     Redis 7.x           │     │   Object Storage        │            │
│  │     (Hot Cache)          │     │   (S3 / MinIO)          │            │
│  │                         │     │                          │            │
│  │  • Live sensor data     │     │  • Model artifacts       │            │
│  │    (last 600s)          │     │    (ONNX, weights)       │            │
│  │  • Current feature      │     │  • Training datasets     │            │
│  │    vectors (last 10min) │     │  • Report PDFs           │            │
│  │  • Active transition    │     │  • Archived sensor data  │            │
│  │    context              │     │    (cold storage)        │            │
│  │  • Recipe cache         │     │  • Simulation snapshots  │            │
│  │  • Session state        │     │                          │            │
│  │                         │     │  Lifecycle-managed       │            │
│  │  TTL-managed            │     │  (tiering policies)      │            │
│  └─────────────────────────┘     └─────────────────────────┘            │
│                                                                          │
│  ┌─────────────────────────┐                                            │
│  │   Elasticsearch 8.x     │                                            │
│  │   (Full-Text Search)    │                                            │
│  │                         │                                            │
│  │  • Process glossary     │                                            │
│  │  • Audit log search     │                                            │
│  │  • Alarm text search    │                                            │
│  └─────────────────────────┘                                            │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2.2 Decision Matrix

| Data Characteristic | PostgreSQL | TimescaleDB | Redis | Object Storage |
|---|---|---|---|---|
| Relational with FK integrity | ✅ Primary | — | — | — |
| Time-series, append-heavy | — | ✅ Primary | — | — |
| Sub-second read latency | — | — | ✅ Primary | — |
| Large binary artifacts | — | — | — | ✅ Primary |
| Complex joins | ✅ Primary | ✅ Supported | — | — |
| Full-text search | Via Elasticsearch | — | — | — |
| TTL/auto-expiry | — | Via retention policies | ✅ Native | Via lifecycle rules |
| Compression | — | ✅ Native (90%+) | — | ✅ (Glacier-class) |

---

# 3. Entity Catalog

## Complete Entity List (42 Entities)

| # | Entity | Domain | Storage | Module Owner | Growth Rate |
|---|---|---|---|---|---|
| 1 | `iam_users` | A: Identity | PostgreSQL | Platform | Slow (~100 records) |
| 2 | `iam_roles` | A: Identity | PostgreSQL | Platform | Static (~5 records) |
| 3 | `iam_permissions` | A: Identity | PostgreSQL | Platform | Static (~30 records) |
| 4 | `iam_role_permissions` | A: Identity | PostgreSQL | Platform | Static (~50 records) |
| 5 | `iam_user_roles` | A: Identity | PostgreSQL | Platform | Slow (~100 records) |
| 6 | `iam_sessions` | A: Identity | PostgreSQL | Platform | Moderate |
| 7 | `asset_plants` | B: Assets | PostgreSQL | Platform | Static (~5 records) |
| 8 | `asset_production_lines` | B: Assets | PostgreSQL | Platform | Static (~20 records) |
| 9 | `asset_machines` | B: Assets | PostgreSQL | Platform | Static (~50 records) |
| 10 | `asset_machine_sections` | B: Assets | PostgreSQL | Platform | Static (~200 records) |
| 11 | `cfg_process_variables` | C: Config | PostgreSQL | M1, M7 | Slow (~500 per machine) |
| 12 | `cfg_grades` | C: Config | PostgreSQL | M7 | Slow (~100 records) |
| 13 | `cfg_grade_recipes` | C: Config | PostgreSQL | M7 | Slow (~100 records) |
| 14 | `cfg_recipe_parameters` | C: Config | PostgreSQL | M7 | Slow (~1000 records) |
| 15 | `cfg_process_constraints` | C: Config | PostgreSQL | M7 | Slow (~200 records) |
| 16 | `cfg_engineering_rules` | C: Config | PostgreSQL (JSONB) | M7 | Slow |
| 17 | `ops_grade_change_sessions` | D: Ops | PostgreSQL | M2 | Moderate (~10/day) |
| 18 | `ops_transition_phases` | D: Ops | PostgreSQL | M2 | Moderate (~40/day) |
| 19 | `ops_sensor_data` | D: Ops | TimescaleDB | M1 | **Extreme** (~500 rows/sec) |
| 20 | `ops_feature_vectors` | D: Ops | TimescaleDB | M1 | **High** (~1 row/sec) |
| 21 | `ops_imputation_log` | D: Ops | TimescaleDB | M1 | High |
| 22 | `ops_anomaly_detections` | D: Ops | TimescaleDB | M1 | Moderate |
| 23 | `ai_predictions` | E: AI | TimescaleDB | M3 | High (~1/5sec during GC) |
| 24 | `ai_prediction_horizons` | E: AI | TimescaleDB | M3 | High (~4 per prediction) |
| 25 | `ai_recommendations` | E: AI | PostgreSQL | M4 | Moderate (~1 per GC event) |
| 26 | `ai_recommendation_setpoints` | E: AI | PostgreSQL | M4 | Moderate |
| 27 | `ai_confidence_scores` | E: AI | TimescaleDB | M10 | High (~1/5sec during GC) |
| 28 | `ai_root_cause_reports` | E: AI | TimescaleDB | M12 | High (~1/5sec during GC) |
| 29 | `ai_root_cause_factors` | E: AI | TimescaleDB | M12 | High (~5 per report) |
| 30 | `ai_timeline_predictions` | E: AI | TimescaleDB | M13 | Moderate (~1/5sec during GC) |
| 31 | `ai_timeline_phases` | E: AI | PostgreSQL | M13 | Moderate |
| 32 | `ai_simulations` | E: AI | PostgreSQL | M9 | Low (~2–5 per GC) |
| 33 | `ai_simulation_trajectories` | E: AI | TimescaleDB | M9 | Moderate (~300 points per sim) |
| 34 | `ai_similarity_reports` | E: AI | PostgreSQL | M11 | Low (~1 per GC) |
| 35 | `ai_historical_matches` | E: AI | PostgreSQL | M11 | Low (~5 per report) |
| 36 | `fb_operator_feedback` | F: Feedback | PostgreSQL | M6 | Low (~1 per GC) |
| 37 | `fb_feedback_validations` | F: Feedback | PostgreSQL | M6 (E7) | Low |
| 38 | `alert_alarms` | G: Alerts | TimescaleDB | M1 | High |
| 39 | `alert_notifications` | G: Alerts | PostgreSQL | Platform | Moderate |
| 40 | `audit_log` | H: Audit | PostgreSQL | Platform | **High** (all user actions) |
| 41 | `ml_models` | I: MLOps | PostgreSQL | M8 | Static (~5 models) |
| 42 | `ml_model_versions` | I: MLOps | PostgreSQL | M8 | Slow |
| 43 | `ml_training_runs` | I: MLOps | PostgreSQL | M8 | Low |
| 44 | `ml_drift_metrics` | I: MLOps | TimescaleDB | M8 | Moderate |
| 45 | `ml_feature_store_metadata` | I: MLOps | PostgreSQL | M8 | Slow |

---

# 4. Entity Specifications

---

## DOMAIN A: Identity & Access Management

---

### Entity 1: `iam_users`

**Purpose:** All human users of the platform — operators, engineers, supervisors, administrators. Source of identity for 21 CFR Part 11 attribution.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | Unique user identifier |
| `employee_id` | VARCHAR(20) | UNIQUE, NOT NULL | Honeywell employee badge ID |
| `first_name` | VARCHAR(100) | NOT NULL | Legal first name |
| `last_name` | VARCHAR(100) | NOT NULL | Legal last name |
| `display_name` | VARCHAR(200) | NOT NULL | Name shown in UI (e.g., "J. Smith") |
| `email` | VARCHAR(255) | UNIQUE | Corporate email (nullable — not all operators use email) |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash (or LDAP/AD reference) |
| `auth_provider` | VARCHAR(50) | NOT NULL, DEFAULT 'LOCAL' | 'LOCAL', 'LDAP', 'ACTIVE_DIRECTORY' |
| `default_plant_id` | UUID | FK → `asset_plants.id` | Default plant assignment |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | Soft-delete flag |
| `last_login_at` | TIMESTAMPTZ | — | Last successful login timestamp |
| `login_count` | INTEGER | DEFAULT 0 | Total successful logins |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last profile update |
| `created_by` | UUID | FK → `iam_users.id` | Admin who created this account |

**Indexes:** `uq_users_employee_id` (unique), `idx_users_auth_provider`, `idx_users_is_active`
**Retention:** Indefinite (compliance requirement: audit attribution must be traceable forever)
**Estimated Size:** ~100 records per plant

---

### Entity 2: `iam_roles`

**Purpose:** Define access levels. Follows RBAC (Role-Based Access Control).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | Unique role identifier |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | Role name: 'OPERATOR', 'ENGINEER', 'SUPERVISOR', 'ADMIN', 'READONLY' |
| `display_name` | VARCHAR(100) | NOT NULL | UI display name |
| `description` | TEXT | — | Role description |
| `is_system_role` | BOOLEAN | NOT NULL, DEFAULT FALSE | System roles cannot be deleted |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

**Estimated Size:** 5 records (static)

---

### Entity 3: `iam_permissions`

**Purpose:** Granular permissions that control access to specific screens and actions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `code` | VARCHAR(100) | UNIQUE, NOT NULL | Permission code: 'VIEW_LIVE_GC', 'ACCEPT_RECOMMENDATION', 'RUN_SIMULATION', 'MANAGE_MODELS', 'VIEW_AUDIT', 'MANAGE_USERS' |
| `resource` | VARCHAR(100) | NOT NULL | Resource being protected: 'SCREEN', 'ACTION', 'DATA' |
| `description` | TEXT | — | — |

**Estimated Size:** ~30 records (static)

---

### Entity 4: `iam_role_permissions`

**Purpose:** Many-to-many relationship between roles and permissions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `role_id` | UUID | PK (composite), FK → `iam_roles.id` | — |
| `permission_id` | UUID | PK (composite), FK → `iam_permissions.id` | — |
| `granted_at` | TIMESTAMPTZ | NOT NULL | When this permission was assigned to this role |

---

### Entity 5: `iam_user_roles`

**Purpose:** Many-to-many relationship between users and roles. A user can hold multiple roles.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | UUID | PK (composite), FK → `iam_users.id` | — |
| `role_id` | UUID | PK (composite), FK → `iam_roles.id` | — |
| `assigned_at` | TIMESTAMPTZ | NOT NULL | — |
| `assigned_by` | UUID | FK → `iam_users.id` | Admin who assigned this role |

---

### Entity 6: `iam_sessions`

**Purpose:** Track active login sessions for security and audit.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | Session token |
| `user_id` | UUID | FK → `iam_users.id`, NOT NULL | — |
| `machine_id` | UUID | FK → `asset_machines.id` | Machine context for this session |
| `ip_address` | INET | NOT NULL | Source workstation IP |
| `user_agent` | VARCHAR(500) | — | Browser/client identifier |
| `started_at` | TIMESTAMPTZ | NOT NULL | Login time |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Session expiry |
| `ended_at` | TIMESTAMPTZ | — | Logout time (NULL = still active) |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | — |

**Retention:** 90 days after session ends

---

## DOMAIN B: Physical Assets

---

### Entity 7: `asset_plants`

**Purpose:** Manufacturing plant (mill) definition. Top of the asset hierarchy.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `plant_code` | VARCHAR(20) | UNIQUE, NOT NULL | Plant code (e.g., 'HPS-MILL-01') |
| `name` | VARCHAR(200) | NOT NULL | Plant name (e.g., 'Green Bay Paper Mill') |
| `location` | VARCHAR(500) | — | Physical address |
| `timezone` | VARCHAR(50) | NOT NULL | IANA timezone (e.g., 'America/Chicago') |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

**Estimated Size:** 1–5 records

---

### Entity 8: `asset_production_lines`

**Purpose:** Production line within a plant. A plant may have multiple lines.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `plant_id` | UUID | FK → `asset_plants.id`, NOT NULL | Parent plant |
| `line_code` | VARCHAR(20) | NOT NULL | Line code (e.g., 'LINE-A') |
| `name` | VARCHAR(200) | NOT NULL | — |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

**Constraint:** `uq_lines_plant_code` UNIQUE(plant_id, line_code)

---

### Entity 9: `asset_machines`

**Purpose:** Individual paper machine. The primary operational unit monitored by the GCI system.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `production_line_id` | UUID | FK → `asset_production_lines.id`, NOT NULL | Parent line |
| `machine_code` | VARCHAR(20) | NOT NULL | Machine ID (e.g., 'PM-3') |
| `name` | VARCHAR(200) | NOT NULL | (e.g., 'Paper Machine 3') |
| `machine_type` | VARCHAR(50) | NOT NULL | 'FOURDRINIER', 'GAP_FORMER', 'TWIN_WIRE' |
| `max_speed_mpm` | NUMERIC(8,2) | — | Maximum rated speed (meters/min) |
| `max_width_mm` | NUMERIC(8,2) | — | Maximum sheet width |
| `opc_ua_endpoint` | VARCHAR(500) | — | OPC-UA server URL for this machine |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

**Constraint:** `uq_machines_line_code` UNIQUE(production_line_id, machine_code)

---

### Entity 10: `asset_machine_sections`

**Purpose:** Sections of a paper machine (headbox, press, dryer, calender, reel). Used for contextual alarm and variable grouping.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `machine_id` | UUID | FK → `asset_machines.id`, NOT NULL | Parent machine |
| `section_code` | VARCHAR(30) | NOT NULL | 'HEADBOX', 'PRESS', 'DRYER', 'CALENDER', 'REEL', 'QCS' |
| `name` | VARCHAR(100) | NOT NULL | — |
| `display_order` | INTEGER | NOT NULL | UI display sequence |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | — |

---

## DOMAIN C: Process Configuration

---

### Entity 11: `cfg_process_variables`

**Purpose:** Master definition of every process variable (tag) monitored by the system. This is the tag dictionary that M1 uses for ingestion mapping.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `machine_id` | UUID | FK → `asset_machines.id`, NOT NULL | Which machine this tag belongs to |
| `section_id` | UUID | FK → `asset_machine_sections.id` | Which section (nullable) |
| `dcs_tag_name` | VARCHAR(100) | NOT NULL | DCS tag name (e.g., 'FIC-101.PV') |
| `canonical_name` | VARCHAR(100) | NOT NULL | Normalized name (e.g., 'stock_flow_pv') |
| `display_name` | VARCHAR(200) | NOT NULL | Human-readable (e.g., 'Stock Flow (PV)') |
| `variable_type` | VARCHAR(20) | NOT NULL | 'PV' (Process Variable), 'SP' (Setpoint), 'MV' (Manipulated), 'CV' (Controlled) |
| `engineering_unit` | VARCHAR(30) | NOT NULL | SI unit (e.g., 'kg/min', 'kPa', 'g/m2') |
| `expected_range_low` | NUMERIC(12,4) | — | Normal operating range lower bound |
| `expected_range_high` | NUMERIC(12,4) | — | Normal operating range upper bound |
| `hard_limit_low` | NUMERIC(12,4) | — | Safety hard limit low |
| `hard_limit_high` | NUMERIC(12,4) | — | Safety hard limit high |
| `sample_rate_ms` | INTEGER | NOT NULL, DEFAULT 1000 | Expected sample rate in milliseconds |
| `imputation_strategy` | VARCHAR(30) | NOT NULL, DEFAULT 'LAST_KNOWN_GOOD' | 'LAST_KNOWN_GOOD', 'LINEAR_INTERPOLATION', 'MODEL_BASED' |
| `anomaly_threshold` | NUMERIC(6,2) | DEFAULT 3.5 | Z-score threshold for anomaly detection |
| `has_setpoint` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether this variable can be directly adjusted |
| `is_quality_variable` | BOOLEAN | NOT NULL, DEFAULT FALSE | BW, Moisture, Ash, Caliper = TRUE |
| `is_ml_feature` | BOOLEAN | NOT NULL, DEFAULT TRUE | Include in ML feature vector |
| `description` | TEXT | — | Engineering description |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |
| `updated_at` | TIMESTAMPTZ | NOT NULL | — |

**Indexes:** `uq_process_vars_machine_dcs` UNIQUE(machine_id, dcs_tag_name), `uq_process_vars_machine_canonical` UNIQUE(machine_id, canonical_name), `idx_process_vars_machine_active` (machine_id, is_active)
**Estimated Size:** ~500 per machine

---

### Entity 12: `cfg_grades`

**Purpose:** Master list of paper grades that the machine can produce.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `machine_id` | UUID | FK → `asset_machines.id`, NOT NULL | — |
| `grade_code` | VARCHAR(30) | NOT NULL | Grade identifier (e.g., '70_GSM', '90_GSM') |
| `display_name` | VARCHAR(100) | NOT NULL | (e.g., '70 GSM Printing Paper') |
| `basis_weight_target` | NUMERIC(8,2) | NOT NULL | Target BW in g/m² |
| `product_category` | VARCHAR(50) | — | 'PRINTING', 'PACKAGING', 'SPECIALTY' |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

**Constraint:** `uq_grades_machine_code` UNIQUE(machine_id, grade_code)

---

### Entity 13: `cfg_grade_recipes`

**Purpose:** Versioned recipe for each grade. Contains target values and quality limits. Recipes are versioned — a new recipe row is created each time targets change.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `grade_id` | UUID | FK → `cfg_grades.id`, NOT NULL | Parent grade |
| `version` | INTEGER | NOT NULL | Recipe version number (incrementing) |
| `is_current` | BOOLEAN | NOT NULL, DEFAULT TRUE | Only one version per grade is current |
| `approved_by` | UUID | FK → `iam_users.id` | Who approved this recipe version |
| `approved_at` | TIMESTAMPTZ | — | — |
| `effective_from` | TIMESTAMPTZ | NOT NULL | When this recipe version takes effect |
| `effective_until` | TIMESTAMPTZ | — | NULL = still effective |
| `notes` | TEXT | — | Change reason |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

**Constraint:** `uq_recipes_grade_version` UNIQUE(grade_id, version)
**Constraint:** Only one row per grade_id should have `is_current = TRUE` (enforced at application level or partial unique index)

---

### Entity 14: `cfg_recipe_parameters`

**Purpose:** Individual parameter targets and limits within a recipe. One row per variable per recipe.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `recipe_id` | UUID | FK → `cfg_grade_recipes.id`, NOT NULL | Parent recipe |
| `variable_id` | UUID | FK → `cfg_process_variables.id`, NOT NULL | Which process variable |
| `target_value` | NUMERIC(12,4) | — | Target setpoint or quality value |
| `tolerance_pct` | NUMERIC(6,3) | — | Allowed deviation as percentage (e.g., 2.5 for ±2.5%) |
| `limit_high` | NUMERIC(12,4) | — | Upper quality limit |
| `limit_low` | NUMERIC(12,4) | — | Lower quality limit |
| `ramp_rate` | NUMERIC(8,4) | — | Recommended ramp rate (units/sec) |
| `ramp_strategy` | VARCHAR(30) | DEFAULT 'LINEAR' | 'LINEAR', 'S_CURVE', 'STEP' |

**Constraint:** `uq_recipe_params_recipe_var` UNIQUE(recipe_id, variable_id)

---

### Entity 15: `cfg_process_constraints`

**Purpose:** Hard and soft constraints applied during optimization (M4) and validation (M9). Separating from recipe parameters allows constraints that span multiple grades.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `machine_id` | UUID | FK → `asset_machines.id`, NOT NULL | — |
| `variable_id` | UUID | FK → `cfg_process_variables.id`, NOT NULL | — |
| `constraint_type` | VARCHAR(30) | NOT NULL | 'SAFETY', 'EQUIPMENT', 'QUALITY', 'OPERATIONAL' |
| `hard_min` | NUMERIC(12,4) | — | Absolute minimum (never violate) |
| `hard_max` | NUMERIC(12,4) | — | Absolute maximum (never violate) |
| `soft_min` | NUMERIC(12,4) | — | Preferred minimum (optimization penalty) |
| `soft_max` | NUMERIC(12,4) | — | Preferred maximum (optimization penalty) |
| `max_ramp_rate` | NUMERIC(8,4) | — | Maximum rate of change (units/sec) |
| `source` | VARCHAR(50) | NOT NULL | 'EQUIPMENT_MANUAL', 'SAFETY_STUDY', 'PROCESS_ENGINEER' |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT TRUE | — |
| `updated_at` | TIMESTAMPTZ | NOT NULL | — |
| `updated_by` | UUID | FK → `iam_users.id` | — |

---

### Entity 16: `cfg_engineering_rules`

**Purpose:** Codified process knowledge rules (e.g., "BW is proportional to Stock Flow / Machine Speed"). Used by M5 (Explainability) and M7 (Knowledge Base) for contextualization.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `machine_id` | UUID | FK → `asset_machines.id`, NOT NULL | — |
| `rule_code` | VARCHAR(50) | NOT NULL | 'BW_STOCK_SPEED_RATIO', 'MOISTURE_STEAM_CORRELATION' |
| `description` | TEXT | NOT NULL | Human-readable rule description |
| `rule_definition` | JSONB | NOT NULL | Structured rule: variables, relationship type, coefficients |
| `category` | VARCHAR(30) | NOT NULL | 'PHYSICAL_LAW', 'EMPIRICAL', 'OPERATIONAL_HEURISTIC' |
| `confidence_level` | VARCHAR(20) | DEFAULT 'HIGH' | 'HIGH', 'MEDIUM', 'LOW' |
| `created_by` | UUID | FK → `iam_users.id` | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

---

## DOMAIN D: Operational Data

---

### Entity 17: `ops_grade_change_sessions`

**Purpose:** Central entity for each grade transition event. Links to all predictions, recommendations, feedback, and outcomes. This is the core business entity of the entire platform.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | Session identifier (referenced by all AI outputs) |
| `machine_id` | UUID | FK → `asset_machines.id`, NOT NULL | — |
| `source_grade_id` | UUID | FK → `cfg_grades.id`, NOT NULL | Grade being changed from |
| `target_grade_id` | UUID | FK → `cfg_grades.id`, NOT NULL | Grade being changed to |
| `target_recipe_id` | UUID | FK → `cfg_grade_recipes.id`, NOT NULL | Recipe version active for target grade |
| `detection_method` | VARCHAR(30) | NOT NULL | 'DCS_EVENT', 'IMPLICIT_DETECTION' |
| `detected_at` | TIMESTAMPTZ | NOT NULL | When M2 detected the grade change |
| `started_at` | TIMESTAMPTZ | NOT NULL | When setpoints started moving |
| `completed_at` | TIMESTAMPTZ | — | When stabilization was confirmed (NULL = in progress) |
| `aborted_at` | TIMESTAMPTZ | — | If the transition was aborted |
| `current_phase` | VARCHAR(30) | NOT NULL, DEFAULT 'INITIATED' | 'INITIATED', 'RAMPING', 'STABILIZING', 'COMPLETE', 'ABORTED' |
| `duration_sec` | NUMERIC(8,1) | — | Total transition duration (computed on completion) |
| `stabilization_time_sec` | NUMERIC(8,1) | — | Time from start to BW within ±1% of target for 30s |
| `max_bw_deviation_pct` | NUMERIC(6,3) | — | Peak BW deviation during transition |
| `total_off_spec_time_sec` | NUMERIC(8,1) | — | Total time BW exceeded ±2.5% |
| `outcome` | VARCHAR(20) | — | 'ON_SPEC', 'OFF_SPEC', 'PARTIAL_OFF_SPEC', 'ABORTED' |
| `is_successful` | BOOLEAN | — | BW stayed within ±2.5% for entire transition |
| `operator_id` | UUID | FK → `iam_users.id` | Operator on duty during this transition |
| `shift` | VARCHAR(10) | — | 'DAY', 'NIGHT', 'EVENING' |
| `context_data` | JSONB | — | Snapshot of M2's TransitionContext at detection time |
| `notes` | TEXT | — | Operator notes |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |
| `updated_at` | TIMESTAMPTZ | NOT NULL | — |

**Indexes:** `idx_sessions_machine_detected` (machine_id, detected_at DESC), `idx_sessions_grades` (source_grade_id, target_grade_id), `idx_sessions_operator` (operator_id), `idx_sessions_outcome` (outcome), `idx_sessions_phase` (current_phase) WHERE current_phase != 'COMPLETE'
**Retention:** Indefinite (business-critical historical data)
**Estimated Growth:** ~10 sessions per machine per day; ~3,650 per machine per year

---

### Entity 18: `ops_transition_phases`

**Purpose:** Tracks each phase transition within a grade change session. Provides the state machine audit trail.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `session_id` | UUID | FK → `ops_grade_change_sessions.id`, NOT NULL | — |
| `phase` | VARCHAR(30) | NOT NULL | 'INITIATED', 'RAMPING', 'STABILIZING', 'COMPLETE', 'ABORTED' |
| `entered_at` | TIMESTAMPTZ | NOT NULL | When this phase began |
| `exited_at` | TIMESTAMPTZ | — | When this phase ended (NULL = current phase) |
| `duration_sec` | NUMERIC(8,1) | — | Computed on exit |
| `trigger_reason` | VARCHAR(100) | — | What caused the phase transition |

---

### Entity 19: `ops_sensor_data` ⚡ HYPERTABLE

**Purpose:** Raw, time-aligned sensor data from all process variables. The highest-volume table in the entire system. Stored as a TimescaleDB hypertable partitioned by time.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `time` | TIMESTAMPTZ | NOT NULL | Measurement timestamp (1-second grid) |
| `machine_id` | UUID | NOT NULL | — |
| `variable_id` | UUID | NOT NULL | FK → `cfg_process_variables.id` (logical, not enforced for perf) |
| `canonical_name` | VARCHAR(100) | NOT NULL | Denormalized for query performance |
| `value` | DOUBLE PRECISION | NOT NULL | Measured value in SI units |
| `raw_value` | DOUBLE PRECISION | — | Original value before normalization |
| `quality` | VARCHAR(10) | NOT NULL, DEFAULT 'GOOD' | 'GOOD', 'IMPUTED', 'BAD', 'STALE' |
| `z_score` | DOUBLE PRECISION | — | Normalized z-score value |
| `is_anomaly` | BOOLEAN | DEFAULT FALSE | Flagged by Isolation Forest |

**Primary Key:** Composite (time, machine_id, variable_id) — TimescaleDB hypertable
**Partitioning:** Time-based chunks (1-day intervals)
**Compression:** Enabled after 3 days; segment by machine_id, order by variable_id, time
**Retention:** Hot: 30 days in TimescaleDB; Warm: 1 year compressed; Cold: Archived to S3/MinIO after 1 year
**Estimated Growth:** ~500 rows/second per machine = ~43M rows/day per machine

**Continuous Aggregates:**
- `ops_sensor_data_1min` — 1-minute averages (for trend charts)
- `ops_sensor_data_5min` — 5-minute averages (for historical analysis)
- `ops_sensor_data_1hr` — 1-hour averages (for long-range trending)

---

### Entity 20: `ops_feature_vectors` ⚡ HYPERTABLE

**Purpose:** Aligned, normalized feature vectors ready for ML consumption. Output of M1 ingestion pipeline. One row per second containing all variables as a single composite record.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `time` | TIMESTAMPTZ | NOT NULL | Feature vector timestamp |
| `machine_id` | UUID | NOT NULL | — |
| `session_id` | UUID | — | FK → `ops_grade_change_sessions.id` (NULL if no active transition) |
| `feature_data` | JSONB | NOT NULL | Complete feature vector as key-value pairs |
| `feature_count` | INTEGER | NOT NULL | Number of features in this vector |
| `imputed_count` | INTEGER | DEFAULT 0 | Number of features that were imputed |
| `completeness_pct` | NUMERIC(5,2) | NOT NULL | (feature_count - imputed_count) / feature_count × 100 |

**Primary Key:** Composite (time, machine_id)
**Partitioning:** Time-based chunks (1-day intervals)
**Retention:** 90 days in TimescaleDB; archived to S3 after 90 days

---

### Entity 21: `ops_imputation_log` ⚡ HYPERTABLE

**Purpose:** Audit trail of every data imputation performed by M1. Required for data quality transparency and model debugging.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `time` | TIMESTAMPTZ | NOT NULL | When the imputation occurred |
| `machine_id` | UUID | NOT NULL | — |
| `variable_id` | UUID | NOT NULL | Which variable was imputed |
| `original_value` | DOUBLE PRECISION | — | The bad value (NULL if missing entirely) |
| `imputed_value` | DOUBLE PRECISION | NOT NULL | The replacement value |
| `imputation_method` | VARCHAR(30) | NOT NULL | 'LAST_KNOWN_GOOD', 'LINEAR_INTERPOLATION', 'MODEL_BASED' |
| `reason` | VARCHAR(30) | NOT NULL | 'MISSING', 'NAN', 'FROZEN', 'SPIKE', 'OUT_OF_RANGE' |

**Retention:** 30 days

---

### Entity 22: `ops_anomaly_detections` ⚡ HYPERTABLE

**Purpose:** Log of sensor anomalies detected by M1's Isolation Forest.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `time` | TIMESTAMPTZ | NOT NULL | Detection time |
| `machine_id` | UUID | NOT NULL | — |
| `variable_id` | UUID | NOT NULL | Anomalous variable |
| `anomaly_score` | DOUBLE PRECISION | NOT NULL | Isolation Forest anomaly score |
| `z_score` | DOUBLE PRECISION | NOT NULL | Z-score of the anomalous value |
| `value` | DOUBLE PRECISION | NOT NULL | The anomalous value |
| `anomaly_type` | VARCHAR(30) | NOT NULL | 'SPIKE', 'FROZEN', 'DRIFT', 'DROPOUT' |

**Retention:** 90 days

---

## DOMAIN E: AI Outputs

---

### Entity 23: `ai_predictions` ⚡ HYPERTABLE

**Purpose:** Every prediction generated by M3 (Deviation Prediction Engine). One row per prediction cycle during an active transition.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | UNIQUE | Prediction identifier (referenced by other AI outputs) |
| `time` | TIMESTAMPTZ | NOT NULL | Prediction timestamp |
| `session_id` | UUID | NOT NULL | FK → `ops_grade_change_sessions.id` |
| `machine_id` | UUID | NOT NULL | — |
| `model_version_id` | UUID | NOT NULL | FK → `ml_model_versions.id` |
| `risk_score` | NUMERIC(5,2) | NOT NULL | Composite risk score (0–100) |
| `risk_class` | VARCHAR(10) | NOT NULL | 'SAFE', 'WARNING', 'BREACH' |
| `predicted_max_deviation_pct` | NUMERIC(6,3) | NOT NULL | Predicted peak BW deviation |
| `conformal_lower` | NUMERIC(8,3) | — | 90% conformal prediction interval lower bound |
| `conformal_upper` | NUMERIC(8,3) | — | 90% conformal prediction interval upper bound |
| `attention_entropy` | DOUBLE PRECISION | — | TFT attention weight entropy |
| `inference_latency_ms` | INTEGER | NOT NULL | Time taken for this prediction |
| `feature_vector_time` | TIMESTAMPTZ | NOT NULL | Timestamp of the feature vector used as input |

**Primary Key:** Composite (time, session_id)
**Indexes:** `idx_predictions_session` (session_id, time DESC), `idx_predictions_risk_class` (risk_class)
**Retention:** 1 year in TimescaleDB; archived to S3

---

### Entity 24: `ai_prediction_horizons` ⚡ HYPERTABLE

**Purpose:** Per-horizon forecast values for each prediction (t+30s, t+60s, t+90s, t+120s).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `time` | TIMESTAMPTZ | NOT NULL | Prediction timestamp (same as parent) |
| `prediction_id` | UUID | NOT NULL | FK → `ai_predictions.id` |
| `horizon_sec` | INTEGER | NOT NULL | 30, 60, 90, or 120 |
| `predicted_bw` | NUMERIC(8,3) | NOT NULL | Predicted Basis Weight at this horizon |
| `predicted_deviation_pct` | NUMERIC(6,3) | NOT NULL | Predicted deviation from target |
| `confidence_lower` | NUMERIC(8,3) | — | Lower confidence bound |
| `confidence_upper` | NUMERIC(8,3) | — | Upper confidence bound |

**Primary Key:** Composite (time, prediction_id, horizon_sec)

---

### Entity 25: `ai_recommendations`

**Purpose:** Setpoint recommendations generated by M4 (Optimization Engine). One per recommendation event.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `session_id` | UUID | FK → `ops_grade_change_sessions.id`, NOT NULL | — |
| `prediction_id` | UUID | FK → `ai_predictions.id`, NOT NULL | The prediction that triggered this recommendation |
| `model_version_id` | UUID | FK → `ml_model_versions.id`, NOT NULL | Neural ODE version used |
| `trigger_risk_class` | VARCHAR(10) | NOT NULL | Risk class that triggered optimization |
| `predicted_outcome_bw_deviation_pct` | NUMERIC(6,3) | — | Expected max BW deviation if recommendation is applied |
| `predicted_stabilization_improvement_sec` | NUMERIC(8,1) | — | Expected stabilization time improvement |
| `on_spec_probability` | NUMERIC(5,4) | — | Probability of staying within ±2.5% |
| `optimization_converged` | BOOLEAN | NOT NULL | Whether NSGA-III converged |
| `pareto_candidate_count` | INTEGER | NOT NULL | Number of Pareto-optimal candidates evaluated |
| `validation_status` | VARCHAR(10) | — | 'PASS', 'FAIL', 'WARN' (from M9 Digital Twin validation) |
| `simulation_id` | UUID | FK → `ai_simulations.id` | M9 validation simulation (if performed) |
| `is_delivered` | BOOLEAN | NOT NULL, DEFAULT FALSE | Whether this was shown to the operator |
| `delivered_at` | TIMESTAMPTZ | — | When the operator saw this recommendation |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | 'PENDING', 'DELIVERED', 'ACCEPTED', 'REJECTED', 'EXPIRED' |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

**Indexes:** `idx_recommendations_session` (session_id, created_at DESC), `idx_recommendations_status` (status)

---

### Entity 26: `ai_recommendation_setpoints`

**Purpose:** Individual setpoint changes within a recommendation. One row per adjusted variable.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `recommendation_id` | UUID | FK → `ai_recommendations.id`, NOT NULL | Parent recommendation |
| `variable_id` | UUID | FK → `cfg_process_variables.id`, NOT NULL | Which variable to adjust |
| `current_value` | NUMERIC(12,4) | NOT NULL | Current setpoint value |
| `recommended_value` | NUMERIC(12,4) | NOT NULL | Recommended new value |
| `change_absolute` | NUMERIC(12,4) | NOT NULL | Absolute change (new - current) |
| `change_pct` | NUMERIC(6,3) | NOT NULL | Percentage change |
| `ramp_rate` | NUMERIC(8,4) | — | Recommended ramp rate (units/sec) |

---

### Entity 27: `ai_confidence_scores` ⚡ HYPERTABLE

**Purpose:** Composite confidence metrics from M10 (Confidence Engine). One row per prediction cycle.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `time` | TIMESTAMPTZ | NOT NULL | — |
| `session_id` | UUID | NOT NULL | — |
| `prediction_id` | UUID | NOT NULL | FK → `ai_predictions.id` |
| `prediction_confidence` | NUMERIC(5,4) | NOT NULL | Dimension 1 (0.0–1.0) |
| `recommendation_confidence` | NUMERIC(5,4) | — | Dimension 2 (NULL if no recommendation) |
| `historical_confidence` | NUMERIC(5,4) | — | Dimension 3 (NULL if M11 not active) |
| `simulation_confidence` | NUMERIC(5,4) | — | Dimension 4 (NULL if M9 not active) |
| `composite_confidence` | NUMERIC(5,4) | NOT NULL | Weighted aggregate |
| `trust_level` | VARCHAR(15) | NOT NULL | 'HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT' |
| `limiting_factor` | VARCHAR(50) | — | Which dimension is lowest |
| `dimensions_available` | INTEGER | NOT NULL | How many of 4 dimensions had data |

**Primary Key:** Composite (time, session_id)

---

### Entity 28: `ai_root_cause_reports` ⚡ HYPERTABLE

**Purpose:** Root cause ranking report from M12. One per prediction cycle.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | UNIQUE | Report identifier |
| `time` | TIMESTAMPTZ | NOT NULL | — |
| `session_id` | UUID | NOT NULL | — |
| `prediction_id` | UUID | NOT NULL | FK → `ai_predictions.id` |
| `summary_sentence` | TEXT | NOT NULL | (e.g., "BW deviation primarily driven by aggressive steam ramp (38%)") |
| `total_explained_pct` | NUMERIC(5,2) | NOT NULL | — |

**Primary Key:** Composite (time, session_id)

---

### Entity 29: `ai_root_cause_factors` ⚡ HYPERTABLE

**Purpose:** Individual ranked factors within a root cause report.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `time` | TIMESTAMPTZ | NOT NULL | Same as parent report |
| `report_id` | UUID | NOT NULL | FK → `ai_root_cause_reports.id` |
| `rank` | INTEGER | NOT NULL | 1-indexed rank |
| `variable_id` | UUID | NOT NULL | FK → `cfg_process_variables.id` |
| `contribution_pct` | NUMERIC(5,2) | NOT NULL | SHAP-based percentage contribution |
| `shap_value` | DOUBLE PRECISION | NOT NULL | Raw SHAP value |
| `direction` | VARCHAR(20) | NOT NULL | 'INCREASING_RISK', 'DECREASING_RISK' |
| `current_value` | NUMERIC(12,4) | NOT NULL | — |
| `deviation_from_normal` | NUMERIC(12,4) | — | — |
| `engineering_context` | TEXT | — | Generated by M12 from M7 glossary |
| `actionability` | VARCHAR(15) | NOT NULL | 'ACTIONABLE', 'OBSERVABLE', 'CONTEXTUAL', 'NOISE' |

**Primary Key:** Composite (time, report_id, rank)

---

### Entity 30: `ai_timeline_predictions` ⚡ HYPERTABLE

**Purpose:** Transition timeline predictions from M13. Updated every 5 seconds during active transition.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | UNIQUE | — |
| `time` | TIMESTAMPTZ | NOT NULL | — |
| `session_id` | UUID | NOT NULL | — |
| `current_phase` | VARCHAR(30) | NOT NULL | — |
| `estimated_total_time_sec` | NUMERIC(8,1) | NOT NULL | — |
| `confidence_interval_sec` | NUMERIC(8,1) | — | ± uncertainty |
| `time_elapsed_sec` | NUMERIC(8,1) | NOT NULL | — |
| `time_remaining_sec` | NUMERIC(8,1) | — | — |
| `on_spec_probability` | NUMERIC(5,4) | — | — |
| `estimated_offgrade_sec` | NUMERIC(8,1) | — | — |
| `peak_deviation_pct` | NUMERIC(6,3) | — | — |
| `progress_status` | VARCHAR(15) | NOT NULL | 'ON_TRACK', 'BEHIND', 'AHEAD', 'AT_RISK' |

**Primary Key:** Composite (time, session_id)

---

### Entity 31: `ai_timeline_phases`

**Purpose:** Phase schedule within a timeline prediction.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `timeline_prediction_id` | UUID | FK → `ai_timeline_predictions.id`, NOT NULL | — |
| `phase_name` | VARCHAR(30) | NOT NULL | 'RAMPING', 'PEAK', 'RECOVERY', 'STABILIZING', 'COMPLETE' |
| `start_time_sec` | NUMERIC(8,1) | NOT NULL | Predicted start (seconds from transition start) |
| `end_time_sec` | NUMERIC(8,1) | NOT NULL | Predicted end |
| `predicted_bw_at_start` | NUMERIC(8,3) | — | — |
| `predicted_bw_at_end` | NUMERIC(8,3) | — | — |
| `status` | VARCHAR(15) | NOT NULL | 'COMPLETED', 'CURRENT', 'UPCOMING' |
| `risk_assessment` | VARCHAR(15) | — | 'SAFE', 'WARNING', 'BREACH_RISK' |

---

### Entity 32: `ai_simulations`

**Purpose:** Digital Twin simulation runs from M9. Each row represents a complete simulation execution.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `session_id` | UUID | FK → `ops_grade_change_sessions.id` | NULL for standalone what-if |
| `machine_id` | UUID | FK → `asset_machines.id`, NOT NULL | — |
| `triggered_by` | VARCHAR(20) | NOT NULL | 'RECOMMENDATION_VALIDATION', 'OPERATOR_WHATIF', 'ENGINEER_STUDY' |
| `user_id` | UUID | FK → `iam_users.id` | Who initiated (NULL if auto-triggered) |
| `model_version_id` | UUID | FK → `ml_model_versions.id`, NOT NULL | Neural ODE version used |
| `scenario_count` | INTEGER | NOT NULL | Number of scenarios simulated |
| `horizon_sec` | INTEGER | NOT NULL | Simulation horizon (default: 300s) |
| `best_scenario_label` | VARCHAR(50) | — | Label of top-ranked scenario |
| `overall_validation_status` | VARCHAR(10) | — | 'PASS', 'FAIL', 'WARN' |
| `input_state_data` | JSONB | NOT NULL | Snapshot of process state at simulation time |
| `scenarios_data` | JSONB | NOT NULL | Scenario definitions (setpoint adjustments per scenario) |
| `metrics_data` | JSONB | NOT NULL | Comparison metrics for all scenarios |
| `simulation_confidence` | NUMERIC(5,4) | — | Monte Carlo Dropout confidence |
| `compute_time_ms` | INTEGER | NOT NULL | Wall-clock simulation time |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

**Indexes:** `idx_simulations_session` (session_id), `idx_simulations_machine_created` (machine_id, created_at DESC)
**Retention:** 1 year

---

### Entity 33: `ai_simulation_trajectories` ⚡ HYPERTABLE

**Purpose:** Time-series trajectory points for each simulation scenario. Stored separately from the simulation metadata for efficient trajectory rendering.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `time` | TIMESTAMPTZ | NOT NULL | Simulated timestamp |
| `simulation_id` | UUID | NOT NULL | FK → `ai_simulations.id` |
| `scenario_label` | VARCHAR(50) | NOT NULL | 'BASELINE', 'AI_RECOMMENDED', 'CUSTOM_A', etc. |
| `time_offset_sec` | INTEGER | NOT NULL | Seconds from simulation start |
| `basis_weight` | NUMERIC(8,3) | NOT NULL | — |
| `moisture` | NUMERIC(6,3) | — | — |
| `ash_content` | NUMERIC(6,3) | — | — |
| `caliper` | NUMERIC(8,4) | — | — |
| `bw_deviation_pct` | NUMERIC(6,3) | NOT NULL | — |

**Primary Key:** Composite (time, simulation_id, scenario_label, time_offset_sec)
**Retention:** 90 days

---

### Entity 34: `ai_similarity_reports`

**Purpose:** Historical similarity analysis from M11. One per grade change session.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `session_id` | UUID | FK → `ops_grade_change_sessions.id`, NOT NULL, UNIQUE | One report per session |
| `candidates_searched` | INTEGER | NOT NULL | Total historical transitions evaluated |
| `matches_found` | INTEGER | NOT NULL | Number of matches above threshold |
| `overall_historical_confidence` | NUMERIC(5,4) | NOT NULL | Aggregate confidence for M10 |
| `pattern_summary` | TEXT | — | (e.g., "3 of 5 similar transitions succeeded with reduced steam ramp") |
| `compute_time_ms` | INTEGER | NOT NULL | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

---

### Entity 35: `ai_historical_matches`

**Purpose:** Individual historical match results within a similarity report. Top-K matches.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `report_id` | UUID | FK → `ai_similarity_reports.id`, NOT NULL | Parent report |
| `match_session_id` | UUID | FK → `ops_grade_change_sessions.id`, NOT NULL | The historical session that matched |
| `rank` | INTEGER | NOT NULL | 1-indexed rank by similarity |
| `similarity_score` | NUMERIC(5,4) | NOT NULL | 0.0–1.0 |
| `dtw_distance` | DOUBLE PRECISION | NOT NULL | Raw DTW distance |
| `context_bonus` | NUMERIC(5,4) | DEFAULT 0 | Bonus for same grade pair/shift/season |
| `dtw_scores_data` | JSONB | — | Per-variable DTW breakdown |
| `operator_action` | TEXT | — | What the operator did in that historical session |
| `key_lesson` | TEXT | — | Engineering lesson extracted |

---

## DOMAIN F: Operator Interaction

---

### Entity 36: `fb_operator_feedback`

**Purpose:** Captures the operator's Accept/Reject decision on each recommendation. Core input to the continuous learning loop (M6).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `recommendation_id` | UUID | FK → `ai_recommendations.id`, NOT NULL, UNIQUE | One feedback per recommendation |
| `session_id` | UUID | FK → `ops_grade_change_sessions.id`, NOT NULL | — |
| `operator_id` | UUID | FK → `iam_users.id`, NOT NULL | Who made the decision |
| `decision` | VARCHAR(10) | NOT NULL | 'ACCEPT', 'REJECT', 'MODIFY', 'IGNORE' |
| `reject_reason` | VARCHAR(50) | — | 'TOO_AGGRESSIVE', 'NOT_APPLICABLE', 'OPERATOR_OVERRIDE', 'OTHER' |
| `reject_comment` | TEXT | — | Free-text (only if reason = 'OTHER') |
| `response_time_sec` | NUMERIC(6,2) | NOT NULL | Seconds from recommendation delivery to decision |
| `viewed_explanation` | BOOLEAN | DEFAULT FALSE | Whether operator scrolled the explanation panel |
| `ran_simulation` | BOOLEAN | DEFAULT FALSE | Whether operator used the Digital Twin |
| `created_at` | TIMESTAMPTZ | NOT NULL | When the decision was made |

**Indexes:** `idx_feedback_operator` (operator_id, created_at DESC), `idx_feedback_session` (session_id), `idx_feedback_decision` (decision)

---

### Entity 37: `fb_feedback_validations`

**Purpose:** E7 Smart Safeguard gate results for each feedback record. Stores the 4-gate validation pipeline output.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `feedback_id` | UUID | FK → `fb_operator_feedback.id`, NOT NULL, UNIQUE | One validation per feedback |
| `gate1_engagement_score` | NUMERIC(5,4) | NOT NULL | Engagement check factor (0.3–1.0) |
| `gate1_flags` | JSONB | — | Flags: fast_response, unreviewed, habitual_pattern |
| `gate2_consistency_score` | NUMERIC(5,4) | NOT NULL | Consistency check factor (0.3–1.0) |
| `gate2_contradictions_found` | INTEGER | DEFAULT 0 | — |
| `gate3_outcome_verified` | BOOLEAN | DEFAULT FALSE | Whether outcome verification has run |
| `gate3_outcome_match` | BOOLEAN | — | Did operator's decision align with actual outcome? |
| `gate3_outcome_score` | NUMERIC(5,4) | — | Outcome factor (0.5–1.0) |
| `gate4_final_weight` | NUMERIC(5,4) | NOT NULL | Final computed feedback weight |
| `operator_trust_score` | NUMERIC(5,4) | NOT NULL | Operator's trust score at time of feedback |
| `is_included_in_training` | BOOLEAN | NOT NULL | Whether this feedback qualifies for retraining data |
| `exclusion_reason` | VARCHAR(50) | — | If excluded, why |
| `validated_at` | TIMESTAMPTZ | — | When outcome verification completed |

---

## DOMAIN G: Alerts & Events

---

### Entity 38: `alert_alarms` ⚡ HYPERTABLE

**Purpose:** All process alarms from the DCS/QCS alarm system, correlated with AI predictions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | UNIQUE | — |
| `time` | TIMESTAMPTZ | NOT NULL | Alarm occurrence time |
| `machine_id` | UUID | NOT NULL | — |
| `variable_id` | UUID | — | FK → `cfg_process_variables.id` |
| `dcs_tag_name` | VARCHAR(100) | NOT NULL | Source DCS tag |
| `alarm_type` | VARCHAR(30) | NOT NULL | 'HIGH', 'HIHI', 'LOW', 'LOLO', 'RATE_OF_CHANGE', 'DEVIATION' |
| `priority` | VARCHAR(15) | NOT NULL | 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO' |
| `description` | TEXT | NOT NULL | Alarm message text |
| `value_at_alarm` | DOUBLE PRECISION | — | Process value that triggered the alarm |
| `limit_value` | DOUBLE PRECISION | — | Alarm setpoint/limit |
| `session_id` | UUID | — | FK → `ops_grade_change_sessions.id` (if during a transition) |
| `is_acknowledged` | BOOLEAN | NOT NULL, DEFAULT FALSE | — |
| `acknowledged_by` | UUID | — | FK → `iam_users.id` |
| `acknowledged_at` | TIMESTAMPTZ | — | — |
| `cleared_at` | TIMESTAMPTZ | — | When alarm condition cleared |
| `is_shelved` | BOOLEAN | DEFAULT FALSE | Temporarily suppressed |
| `shelved_until` | TIMESTAMPTZ | — | — |
| `is_ai_correlated` | BOOLEAN | DEFAULT FALSE | Correlates with an AI-predicted deviation |
| `correlated_prediction_id` | UUID | — | FK → `ai_predictions.id` |

**Primary Key:** Composite (time, id)
**Indexes:** `idx_alarms_machine_time` (machine_id, time DESC), `idx_alarms_unacknowledged` (machine_id, is_acknowledged) WHERE is_acknowledged = FALSE, `idx_alarms_session` (session_id)
**Retention:** 90 days in TimescaleDB; archived to S3

---

### Entity 39: `alert_notifications`

**Purpose:** System-generated notifications for the UI notification bell.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `user_id` | UUID | FK → `iam_users.id`, NOT NULL | Recipient |
| `notification_type` | VARCHAR(30) | NOT NULL | 'GRADE_CHANGE_DETECTED', 'PREDICTION_WARNING', 'RECOMMENDATION_READY', 'MODEL_DRIFT', 'SYSTEM_ALERT' |
| `title` | VARCHAR(200) | NOT NULL | — |
| `body` | TEXT | NOT NULL | — |
| `severity` | VARCHAR(10) | NOT NULL | 'INFO', 'WARNING', 'CRITICAL' |
| `related_entity_type` | VARCHAR(50) | — | 'SESSION', 'PREDICTION', 'RECOMMENDATION', 'MODEL' |
| `related_entity_id` | UUID | — | ID of the related entity |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT FALSE | — |
| `read_at` | TIMESTAMPTZ | — | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

**Indexes:** `idx_notifications_user_unread` (user_id, is_read) WHERE is_read = FALSE
**Retention:** 30 days

---

## DOMAIN H: Audit & Compliance

---

### Entity 40: `audit_log`

**Purpose:** Immutable, append-only record of every user action and significant system event. Supports 21 CFR Part 11 compliance. This table is NEVER updated or deleted — only INSERTed.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `timestamp` | TIMESTAMPTZ | NOT NULL | Event time (application-level, not DB-level) |
| `user_id` | UUID | FK → `iam_users.id` | NULL for system-initiated events |
| `user_employee_id` | VARCHAR(20) | — | Denormalized for query without join |
| `action` | VARCHAR(50) | NOT NULL | 'LOGIN', 'LOGOUT', 'ACCEPT_RECOMMENDATION', 'REJECT_RECOMMENDATION', 'ACK_ALARM', 'SHELVE_ALARM', 'RUN_SIMULATION', 'CONFIG_CHANGE', 'RECIPE_UPDATE', 'MODEL_PROMOTION', 'MODEL_ROLLBACK', 'REPORT_GENERATED', 'USER_CREATED', 'ROLE_ASSIGNED' |
| `resource_type` | VARCHAR(50) | NOT NULL | 'SESSION', 'RECOMMENDATION', 'ALARM', 'SIMULATION', 'CONFIG', 'RECIPE', 'MODEL', 'REPORT', 'USER', 'ROLE' |
| `resource_id` | UUID | — | ID of the affected resource |
| `machine_id` | UUID | — | Machine context |
| `session_id` | UUID | — | Grade change session context |
| `details` | JSONB | NOT NULL | Complete action details (before/after values, setpoints, etc.) |
| `model_version` | VARCHAR(30) | — | Active model version at time of action |
| `ip_address` | INET | NOT NULL | Source workstation |
| `client_info` | VARCHAR(500) | — | Browser/client user agent |
| `hash_chain` | VARCHAR(128) | NOT NULL | SHA-512 hash of (previous_hash + this_record) for tamper detection |

**Indexes:** `idx_audit_timestamp` (timestamp DESC), `idx_audit_user` (user_id, timestamp DESC), `idx_audit_action` (action, timestamp DESC), `idx_audit_resource` (resource_type, resource_id), `idx_audit_session` (session_id)
**Retention:** 7 years (regulatory minimum for FDA 21 CFR Part 11)
**Partitioning:** Monthly range partitions on `timestamp`
**Immutability:** Application-level enforcement — no UPDATE or DELETE queries permitted. Enforced via database role with INSERT-only privilege.

---

## DOMAIN I: ML Operations

---

### Entity 41: `ml_models`

**Purpose:** Registry of all ML models in the platform.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `model_name` | VARCHAR(100) | UNIQUE, NOT NULL | 'TFT_BW_PREDICTOR', 'LGBM_RISK_CLASSIFIER', 'NEURAL_ODE_SURROGATE', 'ISOLATION_FOREST_ANOMALY', 'DTW_SIMILARITY' |
| `model_type` | VARCHAR(50) | NOT NULL | 'FORECASTING', 'CLASSIFICATION', 'SURROGATE', 'ANOMALY_DETECTION', 'SIMILARITY' |
| `serving_module` | VARCHAR(20) | NOT NULL | 'M3', 'M3', 'M4/M9', 'M1', 'M11' |
| `description` | TEXT | — | — |
| `framework` | VARCHAR(30) | NOT NULL | 'PYTORCH', 'LIGHTGBM', 'TORCHDIFFEQ', 'SKLEARN', 'TSLEARN' |
| `input_schema` | JSONB | NOT NULL | Expected input features and shapes |
| `output_schema` | JSONB | NOT NULL | Output format specification |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

---

### Entity 42: `ml_model_versions`

**Purpose:** Individual trained versions of each model. Tracks the full lifecycle from training through production to retirement.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `model_id` | UUID | FK → `ml_models.id`, NOT NULL | Parent model |
| `version_tag` | VARCHAR(30) | NOT NULL | Semantic version (e.g., 'v2.3.1') |
| `status` | VARCHAR(20) | NOT NULL | 'TRAINING', 'EVALUATING', 'SHADOW', 'CHAMPION', 'RETIRED' |
| `artifact_path` | VARCHAR(500) | NOT NULL | S3/MinIO path to model artifact (ONNX, pickle) |
| `artifact_size_bytes` | BIGINT | — | — |
| `training_run_id` | UUID | FK → `ml_training_runs.id` | — |
| `training_dataset_path` | VARCHAR(500) | — | S3 path to training dataset |
| `training_dataset_size` | INTEGER | — | Number of samples |
| `validation_metrics` | JSONB | NOT NULL | MAE, RMSE, F1, coverage, etc. |
| `promoted_at` | TIMESTAMPTZ | — | When this version became champion |
| `promoted_by` | UUID | FK → `iam_users.id` | — |
| `retired_at` | TIMESTAMPTZ | — | — |
| `retirement_reason` | VARCHAR(100) | — | — |
| `created_at` | TIMESTAMPTZ | NOT NULL | — |

**Constraint:** `uq_model_versions_model_tag` UNIQUE(model_id, version_tag)
**Business Rule:** At most one version per model_id can have status = 'CHAMPION' (enforced at application level)

---

### Entity 43: `ml_training_runs`

**Purpose:** Log of every model training execution.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `model_id` | UUID | FK → `ml_models.id`, NOT NULL | — |
| `trigger_type` | VARCHAR(30) | NOT NULL | 'SCHEDULED', 'DRIFT_DETECTED', 'FEEDBACK_ACCUMULATED', 'MANUAL' |
| `triggered_by` | UUID | FK → `iam_users.id` | NULL if automated |
| `status` | VARCHAR(20) | NOT NULL | 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED' |
| `started_at` | TIMESTAMPTZ | NOT NULL | — |
| `completed_at` | TIMESTAMPTZ | — | — |
| `dataset_start_date` | DATE | NOT NULL | Training data start |
| `dataset_end_date` | DATE | NOT NULL | Training data end |
| `dataset_sample_count` | INTEGER | — | — |
| `hyperparameters` | JSONB | NOT NULL | — |
| `training_metrics` | JSONB | — | Loss curves, epoch metrics |
| `validation_metrics` | JSONB | — | Hold-out set metrics |
| `error_message` | TEXT | — | If failed |
| `compute_time_sec` | NUMERIC(10,1) | — | — |

---

### Entity 44: `ml_drift_metrics` ⚡ HYPERTABLE

**Purpose:** Time-series of data drift and concept drift metrics from M8. Used for the Model Health dashboard.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `time` | TIMESTAMPTZ | NOT NULL | — |
| `model_version_id` | UUID | NOT NULL | FK → `ml_model_versions.id` |
| `metric_type` | VARCHAR(30) | NOT NULL | 'PSI', 'PAGE_HINKLEY', 'ROLLING_MAE', 'ROLLING_F1', 'COVERAGE' |
| `feature_name` | VARCHAR(100) | — | For PSI: which feature (NULL for model-level metrics) |
| `metric_value` | DOUBLE PRECISION | NOT NULL | — |
| `threshold` | DOUBLE PRECISION | NOT NULL | Alert threshold for this metric |
| `is_alert` | BOOLEAN | NOT NULL | Whether value exceeds threshold |

**Primary Key:** Composite (time, model_version_id, metric_type, feature_name)
**Retention:** 1 year

---

### Entity 45: `ml_feature_store_metadata`

**Purpose:** Metadata describing each feature in the ML feature store. Used for feature lineage, documentation, and drift monitoring.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID (v7) | PK | — |
| `feature_name` | VARCHAR(100) | UNIQUE, NOT NULL | Canonical feature name |
| `display_name` | VARCHAR(200) | NOT NULL | — |
| `description` | TEXT | — | — |
| `data_type` | VARCHAR(20) | NOT NULL | 'FLOAT', 'INTEGER', 'BOOLEAN', 'CATEGORICAL' |
| `source_variable_id` | UUID | FK → `cfg_process_variables.id` | — |
| `derivation` | VARCHAR(30) | NOT NULL | 'RAW', 'NORMALIZED', 'COMPUTED', 'LAGGED', 'ROLLING_STAT' |
| `derivation_logic` | TEXT | — | Description of how the feature is computed |
| `used_by_models` | JSONB | — | List of model_ids that use this feature |
| `statistics` | JSONB | — | Training distribution: mean, std, min, max, quantiles |
| `updated_at` | TIMESTAMPTZ | NOT NULL | — |

---

# 5. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            GCI PLATFORM — ENTITY RELATIONSHIP DIAGRAM                        │
│                                                                                              │
│  ┌──────────────────── IDENTITY & ACCESS ────────────────────┐                               │
│  │                                                            │                               │
│  │  iam_permissions ◄──M2M──► iam_roles ◄──M2M──► iam_users │                               │
│  │                                                    │       │                               │
│  │                                              iam_sessions  │                               │
│  └──────────────────────────────────────────────────┬─────────┘                               │
│                                                      │                                        │
│  ┌──────── PHYSICAL ASSETS ─────────┐               │ operator_id, created_by, etc.           │
│  │                                   │               │                                        │
│  │  asset_plants                     │               │                                        │
│  │     │ 1:N                         │               │                                        │
│  │     ▼                             │               │                                        │
│  │  asset_production_lines           │               │                                        │
│  │     │ 1:N                         │               │                                        │
│  │     ▼                             │               │                                        │
│  │  asset_machines ──────────────────┼───────────────┼────────────────────────────┐           │
│  │     │ 1:N                         │               │                            │           │
│  │     ▼                             │               │                            │           │
│  │  asset_machine_sections           │               │                            │           │
│  └───────────────────────────────────┘               │                            │           │
│           │                                           │                            │           │
│  ┌────────┼── PROCESS CONFIG ────────────────────────┐│                            │           │
│  │        ▼                                          ││                            │           │
│  │  cfg_process_variables ◄── cfg_process_constraints││                            │           │
│  │     │         │                                   ││                            │           │
│  │     │    cfg_engineering_rules                    ││                            │           │
│  │     │                                             ││                            │           │
│  │  cfg_grades                                       ││                            │           │
│  │     │ 1:N                                         ││                            │           │
│  │     ▼                                             ││                            │           │
│  │  cfg_grade_recipes                                ││                            │           │
│  │     │ 1:N                                         ││                            │           │
│  │     ▼                                             ││                            │           │
│  │  cfg_recipe_parameters ──► cfg_process_variables  ││                            │           │
│  └───────────────────────────────────────────────────┘│                            │           │
│                                                       │                            │           │
│  ┌─── OPERATIONAL DATA ─────────────────────────────────────────────────────┐     │           │
│  │                                                                           │     │           │
│  │  ops_sensor_data ⚡ ◄── machine_id, variable_id                          │     │           │
│  │  ops_feature_vectors ⚡ ◄── machine_id                                   │     │           │
│  │  ops_imputation_log ⚡                                                    │     │           │
│  │  ops_anomaly_detections ⚡                                                │     │           │
│  │                                                                           │     │           │
│  │  ops_grade_change_sessions ◄── machine_id, operator_id,                  │     │           │
│  │     │                           source_grade_id, target_grade_id          │     │           │
│  │     │ 1:N                                                                 │     │           │
│  │     ▼                                                                     │     │           │
│  │  ops_transition_phases                                                    │     │           │
│  └───────┬───────────────────────────────────────────────────────────────────┘     │           │
│          │                                                                          │           │
│          │ session_id (the central FK for all AI outputs)                           │           │
│          │                                                                          │           │
│  ┌───────┼── AI OUTPUTS ────────────────────────────────────────────────────────────┼──────┐   │
│  │       │                                                                          │      │   │
│  │       ├──► ai_predictions ⚡ ──────┬──► ai_prediction_horizons ⚡               │      │   │
│  │       │          │                 │                                              │      │   │
│  │       │          │                 ├──► ai_confidence_scores ⚡                  │      │   │
│  │       │          │                 │                                              │      │   │
│  │       │          │                 ├──► ai_root_cause_reports ⚡                 │      │   │
│  │       │          │                 │        │ 1:N                                 │      │   │
│  │       │          │                 │        ▼                                     │      │   │
│  │       │          │                 │   ai_root_cause_factors ⚡                  │      │   │
│  │       │          │                 │                                              │      │   │
│  │       │          │                 └──► ai_recommendations                       │      │   │
│  │       │          │                         │ 1:N                                  │      │   │
│  │       │          │                         ▼                                      │      │   │
│  │       │          │                    ai_recommendation_setpoints                │      │   │
│  │       │          │                         │                                      │      │   │
│  │       │          │                         │ 1:1                                  │      │   │
│  │       │          │                         ▼                                      │      │   │
│  │       │          │              ┌── fb_operator_feedback                         │      │   │
│  │       │          │              │       │ 1:1                                     │      │   │
│  │       │          │              │       ▼                                         │      │   │
│  │       │          │              │  fb_feedback_validations                       │      │   │
│  │       │          │              │                                                 │      │   │
│  │       ├──► ai_timeline_predictions ⚡                                            │      │   │
│  │       │          │ 1:N                                                            │      │   │
│  │       │          ▼                                                                │      │   │
│  │       │   ai_timeline_phases                                                     │      │   │
│  │       │                                                                           │      │   │
│  │       ├──► ai_simulations ─────────► ai_simulation_trajectories ⚡               │      │   │
│  │       │                                                                           │      │   │
│  │       └──► ai_similarity_reports ──► ai_historical_matches                       │      │   │
│  │                                           │                                       │      │   │
│  │                                           └──► match_session_id → sessions       │      │   │
│  └──────────────────────────────────────────────────────────────────────────────────┘      │   │
│                                                                                             │   │
│  ┌───── ALERTS ─────────────────────────────────────────────────────────────────────────────┘   │
│  │                                                                                              │
│  │  alert_alarms ⚡ ◄── machine_id, session_id, variable_id                                   │
│  │  alert_notifications ◄── user_id                                                            │
│  └──────────────────────────────────────────────────────────────────────────────────────────────┘
│                                                                                                  │
│  ┌───── AUDIT ──────────────────────────────────────────────────────────────────┐                │
│  │  audit_log ◄── user_id, machine_id, session_id, resource_id (polymorphic)   │                │
│  └──────────────────────────────────────────────────────────────────────────────┘                │
│                                                                                                  │
│  ┌───── ML OPS ─────────────────────────────────────────────────────────────────┐                │
│  │                                                                               │                │
│  │  ml_models ──1:N──► ml_model_versions ──1:1──► ml_training_runs              │                │
│  │                           │                                                    │                │
│  │                           └──► ml_drift_metrics ⚡                            │                │
│  │                                                                               │                │
│  │  ml_feature_store_metadata ──► cfg_process_variables                          │                │
│  └───────────────────────────────────────────────────────────────────────────────┘                │
│                                                                                                  │
│  Legend:  ──1:N──  One-to-Many    ──M2M──  Many-to-Many    ──1:1──  One-to-One                  │
│           ⚡ = TimescaleDB hypertable    FK references shown as arrows                           │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 6. Relationship Catalog

## One-to-Many (1:N) Relationships

| Parent Entity | Child Entity | FK Column | Cardinality | Cascade |
|---|---|---|---|---|
| `asset_plants` | `asset_production_lines` | `plant_id` | 1 plant : N lines | RESTRICT on delete |
| `asset_production_lines` | `asset_machines` | `production_line_id` | 1 line : N machines | RESTRICT |
| `asset_machines` | `asset_machine_sections` | `machine_id` | 1 machine : N sections | CASCADE |
| `asset_machines` | `cfg_process_variables` | `machine_id` | 1 machine : ~500 variables | RESTRICT |
| `asset_machines` | `cfg_grades` | `machine_id` | 1 machine : N grades | RESTRICT |
| `asset_machines` | `ops_grade_change_sessions` | `machine_id` | 1 machine : N sessions | RESTRICT |
| `cfg_grades` | `cfg_grade_recipes` | `grade_id` | 1 grade : N recipe versions | RESTRICT |
| `cfg_grade_recipes` | `cfg_recipe_parameters` | `recipe_id` | 1 recipe : N parameters | CASCADE |
| `ops_grade_change_sessions` | `ops_transition_phases` | `session_id` | 1 session : 4–5 phases | CASCADE |
| `ops_grade_change_sessions` | `ai_predictions` | `session_id` | 1 session : ~100–600 predictions | RESTRICT |
| `ops_grade_change_sessions` | `ai_recommendations` | `session_id` | 1 session : 0–5 recommendations | RESTRICT |
| `ai_predictions` | `ai_prediction_horizons` | `prediction_id` | 1 prediction : 4 horizons | CASCADE |
| `ai_recommendations` | `ai_recommendation_setpoints` | `recommendation_id` | 1 recommendation : 1–4 setpoints | CASCADE |
| `ai_root_cause_reports` | `ai_root_cause_factors` | `report_id` | 1 report : 5 factors | CASCADE |
| `ai_timeline_predictions` | `ai_timeline_phases` | `timeline_prediction_id` | 1 timeline : 5 phases | CASCADE |
| `ai_simulations` | `ai_simulation_trajectories` | `simulation_id` | 1 simulation : ~300–1500 points | CASCADE |
| `ai_similarity_reports` | `ai_historical_matches` | `report_id` | 1 report : K matches (default 5) | CASCADE |
| `ml_models` | `ml_model_versions` | `model_id` | 1 model : N versions | RESTRICT |
| `iam_users` | `alert_notifications` | `user_id` | 1 user : N notifications | CASCADE |

## One-to-One (1:1) Relationships

| Entity A | Entity B | FK | Rationale for Separation |
|---|---|---|---|
| `ai_recommendations` | `fb_operator_feedback` | `recommendation_id` (UNIQUE) | Feedback is created asynchronously; may never exist for some recommendations |
| `fb_operator_feedback` | `fb_feedback_validations` | `feedback_id` (UNIQUE) | Validation runs asynchronously 2–5 minutes after feedback; E7 may not be enabled |
| `ops_grade_change_sessions` | `ai_similarity_reports` | `session_id` (UNIQUE) | Similarity is computed once per session; some sessions may have no report |

## Many-to-Many (M2M) Relationships

| Entity A | Entity B | Junction Table | Purpose |
|---|---|---|---|
| `iam_users` | `iam_roles` | `iam_user_roles` | A user can hold multiple roles; a role has many users |
| `iam_roles` | `iam_permissions` | `iam_role_permissions` | A role grants many permissions; a permission belongs to many roles |

## Polymorphic References

| Entity | Column | Targets | Pattern |
|---|---|---|---|
| `audit_log` | `resource_type` + `resource_id` | Any entity in the system | The `resource_type` discriminator identifies which table `resource_id` refers to. No formal FK constraint (intentional for audit flexibility). |
| `alert_notifications` | `related_entity_type` + `related_entity_id` | SESSION, PREDICTION, RECOMMENDATION, MODEL | Same polymorphic pattern. No FK. |

---

# 7. Indexing Strategy

## Index Categories

### High-Priority Indexes (Create First)

| Table | Index | Type | Justification |
|---|---|---|---|
| `ops_sensor_data` | `(time, machine_id, variable_id)` | Composite (PK via hypertable) | Primary query pattern: "get all values for machine X, variable Y in time range" |
| `ops_grade_change_sessions` | `(machine_id, detected_at DESC)` | B-tree | "Get recent transitions for this machine" — most common dashboard query |
| `ops_grade_change_sessions` | `(source_grade_id, target_grade_id)` | B-tree | Similarity search by grade pair |
| `ai_predictions` | `(session_id, time DESC)` | B-tree | "Get latest prediction for this transition" |
| `alert_alarms` | `(machine_id, is_acknowledged)` WHERE FALSE | Partial B-tree | "Get unacknowledged alarms for this machine" — alarm panel query |
| `audit_log` | `(timestamp DESC)` | B-tree | Default audit log display; most recent first |
| `audit_log` | `(user_id, timestamp DESC)` | B-tree | "Show all actions by this user" |

### Query-Optimized Indexes

| Table | Index | Purpose |
|---|---|---|
| `ops_grade_change_sessions` | `(current_phase)` WHERE `!= 'COMPLETE'` | Find active transitions quickly |
| `ops_grade_change_sessions` | `(operator_id, detected_at DESC)` | Operator performance analysis |
| `ops_grade_change_sessions` | `(outcome)` | Filter by outcome in historical analysis |
| `ai_recommendations` | `(session_id, created_at DESC)` | Latest recommendation for a session |
| `ai_recommendations` | `(status)` | Filter active/pending recommendations |
| `fb_operator_feedback` | `(operator_id, created_at DESC)` | Operator feedback history |
| `fb_operator_feedback` | `(decision)` | Aggregate accept/reject statistics |
| `alert_notifications` | `(user_id, is_read)` WHERE FALSE | Unread notification count (badge) |
| `ml_model_versions` | `(model_id, status)` WHERE `= 'CHAMPION'` | Find current champion quickly |
| `cfg_process_variables` | `(machine_id, is_active)` | Active tag list for ingestion |

### Full-Text / Specialized Indexes

| Table | Index | Type | Purpose |
|---|---|---|---|
| `audit_log` | `details` | GIN (on JSONB) | Search audit details by arbitrary fields |
| `cfg_process_variables` | `description` | GIN (tsvector) | Full-text search on variable descriptions |
| `alert_alarms` | `description` | GIN (tsvector) | Full-text search on alarm messages |

---

# 8. Partitioning Strategy

## TimescaleDB Hypertables

| Hypertable | Chunk Interval | Space Partition | Compression | Compression Delay |
|---|---|---|---|---|
| `ops_sensor_data` | 1 day | `machine_id` (if multi-machine) | Yes: segment by machine_id, order by variable_id, time | After 3 days |
| `ops_feature_vectors` | 1 day | `machine_id` | Yes | After 7 days |
| `ops_imputation_log` | 1 day | — | Yes | After 3 days |
| `ops_anomaly_detections` | 7 days | — | Yes | After 7 days |
| `ai_predictions` | 7 days | — | Yes | After 14 days |
| `ai_prediction_horizons` | 7 days | — | Yes | After 14 days |
| `ai_confidence_scores` | 7 days | — | Yes | After 14 days |
| `ai_root_cause_reports` | 7 days | — | Yes | After 14 days |
| `ai_root_cause_factors` | 7 days | — | Yes | After 14 days |
| `ai_timeline_predictions` | 7 days | — | Yes | After 14 days |
| `ai_simulation_trajectories` | 7 days | — | Yes | After 7 days |
| `alert_alarms` | 7 days | — | Yes | After 14 days |
| `ml_drift_metrics` | 30 days | — | Yes | After 30 days |

## PostgreSQL Native Partitioning

| Table | Strategy | Partition Key | Rationale |
|---|---|---|---|
| `audit_log` | Range (monthly) | `timestamp` | Grow indefinitely (7-year retention); monthly partitions enable efficient archival |

---

# 9. Data Lifecycle & Retention

## Retention Tiers

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA LIFECYCLE TIERS                               │
│                                                                      │
│  HOT (Redis)          WARM (TimescaleDB)       COLD (S3/MinIO)     │
│  ─────────            ──────────────────       ────────────────     │
│  Last 10 minutes      Last 30-365 days         1+ years             │
│  Sub-ms reads         1-10ms reads             Seconds to retrieve  │
│  No compression       Compressed (90%+)        Maximum compression  │
│  TTL auto-expiry      Retention policies        Lifecycle rules     │
│                                                                      │
│  ● Live sensor data   ● Historical sensor data ● Archived sensor   │
│  ● Current features   ● All AI outputs         ● Training datasets │
│  ● Active context     ● Alarm history          ● Model artifacts   │
│  ● Recipe cache       ● Drift metrics          ● Report PDFs       │
│  ● Session state      ● Imputation logs        ● Audit archives    │
└─────────────────────────────────────────────────────────────────────┘
```

## Per-Entity Retention Policies

| Entity | Hot (Redis) | Warm (TimescaleDB/PG) | Cold (S3) | Total Retention |
|---|---|---|---|---|
| `ops_sensor_data` | 600 seconds | 30 days (raw), 1 year (aggregated) | Indefinite | Indefinite |
| `ops_feature_vectors` | 10 minutes | 90 days | 2 years | 2 years |
| `ops_imputation_log` | — | 30 days | — | 30 days |
| `ops_anomaly_detections` | — | 90 days | — | 90 days |
| `ops_grade_change_sessions` | Active session | Indefinite | — | Indefinite |
| `ai_predictions` | — | 1 year | 5 years | 5 years |
| `ai_recommendations` | — | Indefinite | — | Indefinite |
| `ai_confidence_scores` | — | 1 year | — | 1 year |
| `ai_root_cause_reports` | — | 1 year | — | 1 year |
| `ai_simulations` | — | 1 year | 5 years | 5 years |
| `ai_similarity_reports` | — | Indefinite | — | Indefinite |
| `fb_operator_feedback` | — | Indefinite | — | Indefinite |
| `alert_alarms` | — | 90 days | 1 year | 1 year |
| `alert_notifications` | — | 30 days | — | 30 days |
| `audit_log` | — | 2 years (online) | 5+ years | **7 years** (regulatory) |
| `ml_drift_metrics` | — | 1 year | — | 1 year |

## Backup Strategy

| Component | Method | Frequency | Retention | RPO |
|---|---|---|---|---|
| **PostgreSQL** | pg_basebackup + WAL archiving | Daily full + continuous WAL | 30 days | ~0 (WAL streaming) |
| **TimescaleDB** | pg_dump of non-compressed + WAL | Daily full + continuous WAL | 30 days | ~0 |
| **Redis** | RDB snapshots + AOF | RDB every 1 hour; AOF always-on | 24 hours | 1 hour (RDB), ~0 (AOF) |
| **S3/MinIO** | Cross-region replication | Continuous | Same as source | ~0 |

## Versioning

| Entity Type | Versioning Strategy |
|---|---|
| **Grade Recipes** | New row per version; `version` integer + `is_current` flag; full history preserved |
| **Process Constraints** | `updated_at` + `updated_by` track changes; audit_log captures before/after via JSONB |
| **ML Models** | Full version history in `ml_model_versions`; artifact immutable in S3 |
| **Engineering Rules** | `rule_definition` is JSONB; changes tracked via audit_log |
| **User Profiles** | `updated_at` field; role changes logged in audit_log |

---

# 10. Security Classification

## Table Access Control Matrix

| Access Level | Tables | Role |
|---|---|---|
| **PUBLIC** (read-only, no sensitive data) | `asset_plants`, `asset_production_lines`, `asset_machines`, `asset_machine_sections`, `cfg_grades` | All authenticated users |
| **OPERATOR** (read + limited write) | All PUBLIC + `ops_sensor_data` (read), `ops_feature_vectors` (read), `ops_grade_change_sessions` (read), `ai_predictions` (read), `ai_recommendations` (read + status update), `ai_confidence_scores` (read), `ai_root_cause_reports` (read), `ai_timeline_predictions` (read), `ai_similarity_reports` (read), `alert_alarms` (read + acknowledge), `fb_operator_feedback` (insert), `alert_notifications` (read + mark read) | OPERATOR role |
| **ENGINEER** (read + analysis + simulation) | All OPERATOR + `cfg_process_variables` (read), `cfg_grade_recipes` (read), `cfg_recipe_parameters` (read), `cfg_process_constraints` (read), `cfg_engineering_rules` (read), `ai_simulations` (read + insert), `ai_simulation_trajectories` (read), `ai_historical_matches` (read), `fb_feedback_validations` (read), `ml_models` (read), `ml_model_versions` (read), `ml_drift_metrics` (read), `ml_training_runs` (read), `ml_feature_store_metadata` (read) | ENGINEER role |
| **SUPERVISOR** (read + review + limited admin) | All ENGINEER + `fb_feedback_validations` (read all operators), `iam_users` (read limited: operator list + trust scores), `ops_grade_change_sessions` (read + add notes), `audit_log` (read, limited to own plant) | SUPERVISOR role |
| **ADMINISTRATOR** (full access) | All tables, all operations. Includes: `iam_users` (full CRUD), `iam_roles` (read), `iam_user_roles` (manage), `cfg_process_variables` (CRUD), `cfg_grade_recipes` (CRUD), `cfg_process_constraints` (CRUD), `cfg_engineering_rules` (CRUD), `ml_model_versions` (promote/rollback), `ml_training_runs` (trigger), `audit_log` (read all + export) | ADMIN role |

## Column-Level Security

| Table | Restricted Columns | Visible To |
|---|---|---|
| `iam_users` | `password_hash` | Never exposed via API; internal auth service only |
| `iam_users` | `last_login_at`, `login_count` | SUPERVISOR, ADMIN only |
| `fb_feedback_validations` | `operator_trust_score` | SUPERVISOR, ADMIN only (never shown to the operator themselves) |
| `fb_feedback_validations` | `gate1_flags`, `gate2_contradictions_found` | ENGINEER, SUPERVISOR, ADMIN only |
| `audit_log` | `ip_address`, `client_info` | ADMIN only |
| `ml_training_runs` | `hyperparameters` | ENGINEER, ADMIN only |

## Database Role Separation

| DB Role | Permissions | Used By |
|---|---|---|
| `gci_app_read` | SELECT on all tables | All application read queries |
| `gci_app_write` | INSERT, UPDATE on operational + feedback tables | Application write queries |
| `gci_app_audit` | INSERT only on `audit_log` | Audit logging service (no UPDATE/DELETE ever) |
| `gci_ingestion` | INSERT on sensor_data, feature_vectors, anomaly_detections, imputation_log | M1 Ingestion service |
| `gci_ai_write` | INSERT on all `ai_*` tables | M3, M4, M9, M10, M11, M12, M13 services |
| `gci_admin` | ALL on all tables | Admin operations, migrations |
| `gci_backup` | SELECT on all tables | Backup processes |

---

# 11. Growth Projections

## Table Growth Rates (Per Machine Per Day)

| Table | Rows/Day | Row Size (est.) | Daily Growth | Annual Growth |
|---|---|---|---|---|
| `ops_sensor_data` | **43,200,000** | ~100 bytes | ~4.3 GB | ~1.6 TB |
| `ops_sensor_data` (compressed) | — | — | ~430 MB | ~160 GB |
| `ops_feature_vectors` | 86,400 | ~2 KB | ~173 MB | ~63 GB |
| `ai_predictions` | ~2,000 | ~200 bytes | ~400 KB | ~146 MB |
| `ai_prediction_horizons` | ~8,000 | ~100 bytes | ~800 KB | ~292 MB |
| `ai_confidence_scores` | ~2,000 | ~150 bytes | ~300 KB | ~110 MB |
| `ai_root_cause_reports` | ~2,000 | ~300 bytes | ~600 KB | ~219 MB |
| `ai_root_cause_factors` | ~10,000 | ~200 bytes | ~2 MB | ~730 MB |
| `alert_alarms` | ~500 | ~300 bytes | ~150 KB | ~55 MB |
| `audit_log` | ~1,000 | ~500 bytes | ~500 KB | ~183 MB |
| `ml_drift_metrics` | ~500 | ~100 bytes | ~50 KB | ~18 MB |

## Top 5 Fastest-Growing Tables

| Rank | Table | Why | Mitigation |
|---|---|---|---|
| 1 | `ops_sensor_data` | 500 tags × 1 Hz = 43M rows/day | TimescaleDB compression (10:1); continuous aggregates; 30-day raw retention |
| 2 | `ops_feature_vectors` | 1 vector/sec = 86.4K rows/day | TimescaleDB compression; 90-day retention; S3 archival |
| 3 | `ai_root_cause_factors` | 5 factors per report, ~2K reports/day | Compression after 14 days; 1-year retention |
| 4 | `ai_predictions` | ~1 per 5 seconds during transitions | Compression; 1-year retention |
| 5 | `audit_log` | Every user action logged | Monthly partitioning; archival after 2 years |

## Disk Capacity Planning (Single Machine, 1 Year)

| Storage Engine | Uncompressed | Compressed | Recommended Allocation |
|---|---|---|---|
| TimescaleDB | ~1.7 TB | ~200 GB | 500 GB (with headroom) |
| PostgreSQL | ~5 GB | N/A | 20 GB (with headroom) |
| Redis | ~100 MB (steady state) | N/A | 2 GB |
| S3/MinIO | ~200 GB (archives + artifacts) | ~100 GB | 500 GB |
| **Total** | — | — | **~1 TB per machine per year** |

---

# 12. Data Governance

## Data Quality Rules

| Rule | Applies To | Enforcement |
|---|---|---|
| **No orphan AI outputs** | All `ai_*` tables | `session_id` must reference an existing `ops_grade_change_sessions` row |
| **Temporal consistency** | `ops_transition_phases` | `entered_at` of phase N+1 must equal `exited_at` of phase N |
| **Recipe integrity** | `cfg_grade_recipes` | Exactly one `is_current = TRUE` per `grade_id` at any time |
| **Feedback timing** | `fb_operator_feedback` | `created_at` must be after `ai_recommendations.delivered_at` |
| **Audit immutability** | `audit_log` | No UPDATE or DELETE operations; enforced at database role level |
| **Sensor range validation** | `ops_sensor_data` | Values outside `cfg_process_variables.hard_limit_low/high` flagged with `quality = 'BAD'` |
| **Model version uniqueness** | `ml_model_versions` | At most one version per model can have `status = 'CHAMPION'` |

## Data Ownership

| Domain | Data Owner (Role) | Data Steward (Team) |
|---|---|---|
| Identity & Access | IT Security | IAM Team |
| Physical Assets | Plant Engineering | Asset Management |
| Process Configuration | Process Engineering | Process Control Team |
| Operational Data | Production Management | Data Engineering |
| AI Outputs | Data Science | ML Engineering |
| Operator Feedback | Production Management | Product Team |
| Alerts | Operations | DCS Support Team |
| Audit | Quality Assurance | Compliance Team |
| ML Operations | Data Science | ML Engineering |

## Compliance Requirements

| Regulation | Requirement | Implementation |
|---|---|---|
| **21 CFR Part 11** | Electronic records must be attributable, legible, contemporaneous, original, accurate (ALCOA) | All actions logged in `audit_log` with user_id, timestamp, and hash chain |
| **21 CFR Part 11** | Electronic signatures | Operator Accept/Reject is the electronic signature; captured with employee_id + timestamp |
| **21 CFR Part 11** | Audit trail must be tamper-proof | Hash chain in `audit_log`; INSERT-only database role; integrity verification function |
| **GDPR** (if applicable) | Right to erasure for personal data | Employee data (iam_users) can be anonymized but not deleted (audit trail dependency) |
| **ISA-88** | Batch record integrity | Grade change sessions with full lifecycle tracking |

---

# 13. Scalability Recommendations

## Horizontal Scaling Path

| Phase | Scale | Architecture |
|---|---|---|
| **Phase 1** (1 machine) | ~43M sensor rows/day | Single TimescaleDB instance; single PostgreSQL instance; Redis standalone |
| **Phase 2** (3–5 machines) | ~215M sensor rows/day | TimescaleDB with space partitioning by machine_id; PostgreSQL with read replicas; Redis Sentinel |
| **Phase 3** (10+ machines, multi-mill) | ~430M+ sensor rows/day | TimescaleDB multi-node (distributed hypertables); PostgreSQL Citus for horizontal sharding; Redis Cluster |

## Read Scaling

| Strategy | When to Implement | Benefit |
|---|---|---|
| **Read replicas** (PostgreSQL streaming replication) | When dashboard query load impacts ingestion write performance | Separate read/write workloads; historical analysis queries on replica |
| **Continuous aggregates** (TimescaleDB) | From day one | Pre-computed 1-min, 5-min, 1-hr aggregates eliminate expensive real-time rollups |
| **Materialized views** | When report generation impacts operational queries | Pre-compute shift summaries, grade performance matrices |
| **Redis caching** | From day one | Cache recipe lookups, grade configs, process variable metadata |

## Write Scaling

| Strategy | When to Implement | Benefit |
|---|---|---|
| **Batch inserts** | From day one for sensor data | Buffer 100–500 rows per insert instead of single-row inserts; 10× throughput |
| **Async writes** | From day one for audit log | Kafka → audit log consumer; decouples audit writes from request latency |
| **Connection pooling** (PgBouncer) | From day one | Prevent connection exhaustion from microservice architecture |
| **Partitioning** | From day one (TimescaleDB auto) | Automatic chunk management; drop old partitions instead of DELETE |

## Migration Recommendations

| Consideration | Recommendation |
|---|---|
| **Schema migrations** | Use Flyway or Liquibase; all migrations version-controlled; no manual DDL |
| **Zero-downtime migrations** | Use expand-contract pattern: add new columns first, backfill, then remove old |
| **Data backfill** | For historical data import: use COPY command with TimescaleDB chunks; disable indexes during bulk load |
| **Multi-tenant** | Use `machine_id` as the tenant discriminator; avoid schema-per-tenant for operational simplicity |
