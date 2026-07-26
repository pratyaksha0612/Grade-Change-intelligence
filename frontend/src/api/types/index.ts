export * from '../../types/api';

export interface AsyncJobResponse {
  status: 'accepted' | 'started' | 'already_running';
  job_id: string;
}

export interface JobStatusResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_found';
}

// Prediction API Types
export interface PredictionForecastRequest {
  transition_id: string;
  horizon_minutes: number;
}

export interface PredictionForecastResponse {
  id: string;
  transition_id: string;
  timestamp: string;
  confidence: number;
  trajectory: Array<{
    time: string;
    basis_weight_predicted: number;
    machine_speed_predicted: number;
    upper_bound: number;
    lower_bound: number;
  }>;
}

// Root Cause API Types
export interface RootCauseAnalyzeRequest {
  prediction_id: string;
}

export interface RootCauseAnalyzeResponse {
  analysis_id: string;
  primary_issue: string;
  features: Array<{
    variable: string;
    contribution: number;
    severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    trend: 'up' | 'down' | 'stable';
  }>;
}

// Recommendation API Types
export interface RecommendationOptimizeRequest {
  root_cause_id: string;
  optimization_mode: 'speed' | 'balanced' | 'safety';
}

export interface RecommendationCandidate {
  rank: number;
  setpoints: Record<string, number>;
  improvement_pct: number;
  confidence: number;
  is_safe: boolean;
}

export interface RecommendationOptimizeResponse {
  recommendation_id: string;
  candidates: RecommendationCandidate[];
}

// Digital Twin API Types
export interface DigitalTwinSimulateRequest {
  recommendation_id: string;
  parameters: Record<string, number>;
}

export interface DigitalTwinSimulateResponse {
  simulation_id: string;
  status: string;
  results: Record<string, any>;
}
