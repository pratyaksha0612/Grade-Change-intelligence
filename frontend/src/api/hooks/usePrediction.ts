import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { PredictionService } from '../services/predictionService';
import type { PredictionForecastRequest, PredictionForecastResponse } from '../types';

export const PREDICTION_QUERY_KEYS = {
  all: ['predictions'] as const,
  forecast: (id: string) => [...PREDICTION_QUERY_KEYS.all, 'forecast', id] as const,
  status: () => [...PREDICTION_QUERY_KEYS.all, 'status'] as const,
  workspace: () => [...PREDICTION_QUERY_KEYS.all, 'workspace'] as const,
};

/**
 * Hook to fetch the prediction engine status.
 */
export const usePredictionStatus = (): UseQueryResult<{ status: string; latency: number }> => {
  return useQuery({
    queryKey: PREDICTION_QUERY_KEYS.status(),
    queryFn: () => PredictionService.getStatus(),
    refetchInterval: 5000,
  });
};

/**
 * Hook to execute a forecast request and begin the polling lifecycle.
 * In a real implementation, this would return the job_id and another hook would poll /status.
 * For scaffolding, we map this to the trigger endpoint.
 */
export const usePredictionForecast = (): UseMutationResult<
  { status: string; job_id: string },
  Error,
  PredictionForecastRequest
> => {
  return useMutation({
    mutationFn: async (request: PredictionForecastRequest) => {
      // 1. Trigger job
      const triggerRes = await PredictionService.getForecast(request) as any;
      const jobId = triggerRes.job_id || 'mock-job-id';
      
      // 2. Poll status (simulated short-circuit for scaffolding)
      // await PredictionService.getStatus(jobId);
      
      // 3. Fetch result
      // const result = await PredictionService.getResult(jobId);
      // return result;
      return triggerRes;
    },
  });
};

// --- M3 Workspace Aggregated Data Types ---

export interface PredictionMetric {
  title: string;
  value: string;
  description?: string;
  trend?: { value: number; label: string; isPositive: boolean };
  isWarning?: boolean;
  isDestructive?: boolean;
}

export interface PredictionTimeSeriesPoint {
  time: string;
  isFuture: boolean;
  bwActual: number | null;
  bwPredicted: number | null;
  bwUpper: number | null;
  bwLower: number | null;
  speedActual: number | null;
  speedPredicted: number | null;
  steamActual: number | null;
  steamPredicted: number | null;
  moistActual: number | null;
  moistPredicted: number | null;
}

export interface PredictionTimelineEvent {
  time: string;
  event: string;
  details: string;
  active: boolean;
  warning?: boolean;
}

export interface PredictionWorkspaceData {
  currentGrade: string;
  targetGrade: string;
  statusWarning: boolean;
  metrics: PredictionMetric[];
  timeSeries: PredictionTimeSeriesPoint[];
  insights: {
    topIssue: string;
    highestContributor: string;
    confidenceExplanation: string;
    forecastHorizon: string;
    predictionLatency: string;
    modelVersion: string;
  };
  timelineEvents: PredictionTimelineEvent[];
}

// --- Fallback Mock Data ---
const MOCK_TIME_SERIES: PredictionTimeSeriesPoint[] = Array.from({ length: 40 }, (_, i) => {
  const time = `14:${String(i).padStart(2, '0')}`;
  const isFuture = i >= 20;
  
  const baseBW = 42.5 + (i > 10 ? (i - 10) * 0.45 : 0);
  const baseSpeed = 2500 - (i > 10 ? (i - 10) * 12 : 0);
  const baseSteam = 120 + (i > 10 ? (i - 10) * 1.5 : 0);
  const baseMoist = 6.5 + (i > 10 ? (i - 10) * 0.05 : 0);

  return {
    time,
    isFuture,
    bwActual: isFuture ? null : baseBW + (Math.random() * 0.5 - 0.25),
    bwPredicted: isFuture ? baseBW + (Math.random() * 0.2) : null,
    bwUpper: isFuture ? baseBW + 1.2 : null,
    bwLower: isFuture ? baseBW - 1.2 : null,
    
    speedActual: isFuture ? null : baseSpeed + (Math.random() * 10 - 5),
    speedPredicted: isFuture ? baseSpeed : null,
    
    steamActual: isFuture ? null : baseSteam + (Math.random() * 2 - 1),
    steamPredicted: isFuture ? baseSteam : null,
    
    moistActual: isFuture ? null : baseMoist + (Math.random() * 0.1 - 0.05),
    moistPredicted: isFuture ? baseMoist : null,
  };
});

const MOCK_WORKSPACE_DATA: PredictionWorkspaceData = {
  currentGrade: "Linerboard 42#",
  targetGrade: "Linerboard 55#",
  statusWarning: true,
  metrics: [
    { title: "Current Basis Weight", value: "47.1 lbs" },
    { title: "Predicted Basis Weight", value: "55.8 lbs", description: "Warning: Exceeds target 55.0", trend: { value: 1.4, label: "deviation", isPositive: false }, isWarning: true },
    { title: "Expected Deviation", value: "+2.8%", description: "Violates ±2.5% specification", isDestructive: true },
    { title: "Prediction Confidence", value: "91.2%" },
    { title: "Risk Level", value: "HIGH", description: "Requires operator intervention", isDestructive: true },
    { title: "Est. Stabilization Time", value: "18 min", description: "At current trajectory" },
  ],
  timeSeries: MOCK_TIME_SERIES,
  insights: {
    topIssue: "Basis Weight overshoot likely at stabilization point.",
    highestContributor: "Steam Pressure ramp rate (35% attribution)",
    confidenceExplanation: "Model confidence is 91.2% due to high correlation with 3 recent similar transitions and stable sensor telemetry.",
    forecastHorizon: "20 minutes",
    predictionLatency: "24 ms",
    modelVersion: "v4.2.1-prod",
  },
  timelineEvents: [
    { time: '14:05:12', event: 'Prediction Generated', details: 'Trajectory computed by Model v4.2.1', active: false },
    { time: '14:05:18', event: 'Risk Escalated', details: 'Basis Weight deviation predicted (+2.8%)', active: false, warning: true },
    { time: '14:05:25', event: 'Recommendation Requested', details: 'Triggered NSGA-II optimizer', active: false },
    { time: '14:05:42', event: 'Digital Twin Started', details: 'Simulating 3 optimal parameter sets', active: false },
    { time: '14:06:05', event: 'Decision Pending', details: 'Awaiting Confidence Aggregation', active: true },
  ],
};

/**
 * Hook to fetch the aggregated Prediction Workspace data.
 * Falls back to mock data if the API is unavailable.
 */
export const usePredictionWorkspaceData = () => {
  return useQuery<PredictionWorkspaceData>({
    queryKey: PREDICTION_QUERY_KEYS.workspace(),
    queryFn: async () => {
      try {
        // We'd typically fetch an aggregated endpoint for the workspace, e.g.,
        // return await ApiBaseService.get<PredictionWorkspaceData>('/predictions/workspace/summary');
        
        // Simulating the API attempt that fails and triggers the fallback:
        throw new Error('Backend endpoint not implemented yet');
      } catch (error) {
        console.info('Backend unavailable. Falling back to mock prediction workspace data.');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay for skeleton
        return MOCK_WORKSPACE_DATA;
      }
    },
    retry: 0,
    refetchInterval: 15000,
  });
};
