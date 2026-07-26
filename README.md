# GradeChange Intelligence Platform

GradeChange Intelligence is an enterprise-grade Industrial AI platform built to autonomously optimize grade transitions in continuous manufacturing environments, specifically targeting the pulp and paper industry. By leveraging real-time telemetry, advanced machine learning (XGBoost), numeric optimization (L-BFGS-B), and explainable AI (SHAP), the platform drastically reduces stabilization time, material waste, and energy consumption during critical manufacturing state changes.

## Executive Summary

Grade transitions in continuous manufacturing are historically volatile periods where operators manually adjust machine setpoints (e.g., machine speed, steam pressure, slice opening) to hit new quality targets. These periods generate substantial off-spec waste and consume excess energy.

GradeChange Intelligence functions as a "Digital Twin" and "Executive Command Center," integrating directly into live process data streams to:
1. Predict the exact stabilization trajectory of key quality variables (e.g., Basis Weight, Moisture).
2. Recommend mathematically optimized machine setpoints to minimize the transition time.
3. Provide transparent, operator-friendly explainability for every AI-driven recommendation.

## Key Features

* **Real-Time Telemetry Ingestion**: Seamlessly consumes high-frequency IoT sensor data from industrial assets using a scalable event-driven architecture.
* **XGBoost Predictive Modeling**: Accurately forecasts process variables over a forward-looking horizon, identifying potential quality breaches before they occur.
* **Multi-Objective Optimization**: Employs Scipy L-BFGS-B algorithms to calculate the exact machine speed and steam pressure adjustments required to hit targets with minimal variance and energy expenditure.
* **Digital Twin Scenarios**: Instantly simulates and compares the "Current Operator Strategy" versus the "AI Recommended Strategy" side-by-side, projecting Time Saved, Waste Saved, Energy Savings, and CO2 Reductions.
* **Explainable AI (XAI)**: Utilizes SHapley Additive exPlanations (SHAP) to unpack the underlying causes of process drift, building trust with floor operators.
* **Executive Command Center**: A stunning, modern React frontend built for high-stakes industrial environments, providing an intuitive glass-pane view into autonomous operations.

## Architecture & Technology Stack

The platform is designed as a scalable, distributed microservices architecture masquerading as a cohesive monolith for seamless local deployment. 

**Frontend (Executive Command Center)**
* **Framework**: React 18 with Vite
* **Language**: TypeScript
* **Styling**: Tailwind CSS (Honeywell-compliant enterprise styling)
* **Data Fetching**: React Query
* **Visualization**: Recharts & Framer Motion
* **Icons**: Lucide React

**Backend (AI Engine & API Gateway)**
* **Framework**: FastAPI (Python)
* **Concurrency**: Asyncio with dedicated thread pools for CPU-bound ML workloads
* **Data Processing**: Pandas, NumPy
* **Machine Learning**: XGBoost, SHAP, Scipy
* **Streaming**: Apache Kafka Integration (confluent-kafka)

## Running the Application Locally

The application is configured to run locally out-of-the-box for development and evaluation purposes. The backend utilizes FastAPI's ASGI server, and the frontend uses Vite's optimized dev server.

### Prerequisites
* Node.js (v18+)
* Python (3.10+)
* Apache Kafka (Optional, mock consumers will gracefully degrade if unavailable)

### Starting the Backend API
Navigate to the backend directory, activate your virtual environment, and launch the Uvicorn server:

```powershell
cd backend
.venv\Scripts\activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API will be available at `http://localhost:8000`. You can access the interactive Swagger documentation at `http://localhost:8000/api/v1/openapi.json`.

### Starting the Frontend Dashboard
Open a new terminal window, navigate to the frontend directory, and start the Vite development server:

```powershell
cd frontend
npm install
npm run dev
```
The Executive Command Center will be available at `http://localhost:5173`. 

## Project Structure

* `/backend` - The FastAPI server, machine learning engines, dataset caching, and Kafka consumers.
* `/frontend` - The React application, components, and API integration hooks.
* `/configs` - Environment and system configuration variables.
* `/docs` - Runbooks, architecture diagrams, and system overviews.
* `/ml` - Data directories, training scripts, and serialized models.
* `/infrastructure` - Kubernetes manifests, Docker files, and Helm charts for production orchestration.

## Production Readiness & Optimization

Significant engineering effort has been invested to ensure the system is highly performant and production-ready:
* **Asynchronous ML Execution**: Heavy numeric operations (XGBoost inference, SHAP explanations, and L-BFGS-B optimization) are offloaded to background thread pools to prevent blocking the FastAPI event loop.
* **Dataset Caching**: The core telemetry dataset is globally cached in memory upon the first request, entirely eliminating file I/O bottlenecks during live dashboard polling.
* **Robust Error Handling**: The application gracefully degrades and catches payload parse exceptions, ensuring the dashboard remains highly available even if an underlying microservice is starved.
* **Enterprise Security**: Configured with strict but configurable Cross-Origin Resource Sharing (CORS) rules to protect endpoints while permitting authorized client applications.

## License & Attribution
Developed for the Honeywell Hackathon. All rights reserved by the original authors.
