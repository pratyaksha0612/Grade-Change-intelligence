import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { DigitalTwinService } from '../services/digitalTwinService';
import type { DigitalTwinSimulateRequest, DigitalTwinSimulateResponse } from '../types';

export const DIGITAL_TWIN_QUERY_KEYS = {
  all: ['digital_twin'] as const,
  simulate: (id: string) => [...DIGITAL_TWIN_QUERY_KEYS.all, 'simulate', id] as const,
  workspace: () => [...DIGITAL_TWIN_QUERY_KEYS.all, 'workspace'] as const,
};

/**
 * Hook to execute a digital twin simulation request and begin polling lifecycle.
 */
export const useDigitalTwinSimulate = (): UseMutationResult<
  { status: string; job_id: string },
  Error,
  DigitalTwinSimulateRequest
> => {
  return useMutation({
    mutationFn: async (request: DigitalTwinSimulateRequest) => {
      const triggerRes = await DigitalTwinService.simulate(request) as any;
      const jobId = triggerRes.job_id || 'mock-job-id';
      
      // Simulating polling lifecycle
      return triggerRes;
    },
  });
};

// --- M9 Workspace Aggregated Data Types ---

export interface SimulationTimeSeriesPoint {
  time: string;
  isFuture: boolean;
  bwActual: number | null;
  bwSimulated: number | null;
  bwUpper: number | null;
  bwLower: number | null;
  speedActual: number | null;
  speedSimulated: number | null;
  steamActual: number | null;
  steamSimulated: number | null;
  moistActual: number | null;
  moistSimulated: number | null;
  headboxActual: number | null;
  headboxSimulated: number | null;
}

export interface SimulationTimelineEvent {
  time: string;
  event: string;
  details: string;
  active: boolean;
  highlight?: boolean;
}

export interface SimulationMetric {
  title: string;
  value: string;
  description: string;
  isWarning?: boolean;
  isSuccess?: boolean;
}

export interface DigitalTwinWorkspaceData {
  transitionId: string;
  confidence: number;
  dtVersion: string;
  metrics: SimulationMetric[];
  timeSeries: SimulationTimeSeriesPoint[];
  insights: {
    physicsValidation: string;
    physicsExplanation: string;
    safetyValidation: string;
    safetyExplanation: string;
    processStability: string;
    expectedOscillations: string;
    predictedAlarms: number;
    engineeringNotes: string;
  };
  timelineEvents: SimulationTimelineEvent[];
}

// --- Fallback Mock Data ---
const MOCK_SIMULATION_DATA: SimulationTimeSeriesPoint[] = Array.from({ length: 45 }, (_, i) => {
  const time = `14:${String(i).padStart(2, '0')}`;
  const isFuture = i >= 20; // Now is 14:20
  
  // Base formulas simulating a grade transition curve resolving smoothly
  const baseBW = 42.5 + (i > 10 ? Math.min((i - 10) * 0.8, 12.5) : 0); // Targets 55
  const baseSpeed = 2500 - (i > 10 ? Math.min((i - 10) * 15, 220) : 0); // Targets 2280
  const baseSteam = 120 + (i > 10 ? Math.min((i - 10) * 2, 8) : 0); // Targets 128
  const baseMoist = 6.5 + (i > 10 ? Math.min((i - 10) * 0.05, 0.3) : 0); // Targets 6.8
  const baseHeadbox = 14200 - (i > 10 ? Math.min((i - 10) * 20, 250) : 0); // Targets 13950

  return {
    time,
    isFuture,
    bwActual: isFuture ? null : baseBW + (Math.random() * 0.5 - 0.25),
    bwSimulated: isFuture ? baseBW + (Math.random() * 0.1) : null,
    bwUpper: isFuture ? baseBW + 0.5 : null,
    bwLower: isFuture ? baseBW - 0.5 : null,
    speedActual: isFuture ? null : baseSpeed + (Math.random() * 10 - 5),
    speedSimulated: isFuture ? baseSpeed : null,
    steamActual: isFuture ? null : baseSteam + (Math.random() * 2 - 1),
    steamSimulated: isFuture ? baseSteam : null,
    moistActual: isFuture ? null : baseMoist + (Math.random() * 0.1 - 0.05),
    moistSimulated: isFuture ? baseMoist : null,
    headboxActual: isFuture ? null : baseHeadbox + (Math.random() * 50 - 25),
    headboxSimulated: isFuture ? baseHeadbox : null,
  };
});

const MOCK_TIMELINE_EVENTS: SimulationTimelineEvent[] = [
  { time: '14:20:00', event: 'Simulation Started', details: 'Initialized from live PM3 state space', active: false },
  { time: '14:21:15', event: 'Speed Adjustment', details: 'Ramp down to 2280 fpm initiated', active: false },
  { time: '14:25:30', event: 'Steam Stabilization', details: 'Thermal equilibrium achieved at 128 psi', active: false },
  { time: '14:32:00', event: 'Basis Weight Stabilized', details: 'BW enters ±2.5% tolerance band', active: false, highlight: true },
  { time: '14:34:00', event: 'Quality Achieved', details: 'All primary CTQs verified safe', active: false },
  { time: '14:35:12', event: 'Simulation Completed', details: 'Trajectory mathematically verified', active: true },
];

const MOCK_WORKSPACE_DATA: DigitalTwinWorkspaceData = {
  transitionId: "Linerboard 42# → 55#",
  confidence: 98.4,
  dtVersion: "v2.1-DT",
  metrics: [
    { title: "Current Operating State", value: "Unstable", description: "High risk of BW overshoot", isWarning: true },
    { title: "Simulated Operating State", value: "Stable", description: "Optimal setpoints applied", isSuccess: true },
    { title: "Expected Basis Weight", value: "55.0 lbs", description: "Perfectly hits target (±2.5%)" },
    { title: "Est. Stabilization Time", value: "12 min", description: "From point of execution" },
    { title: "Predicted Quality", value: "Class A", description: "Zero out-of-spec paper" },
    { title: "Simulation Confidence", value: "98.4%", description: "Physics engine verified", isSuccess: true },
  ],
  timeSeries: MOCK_SIMULATION_DATA,
  insights: {
    physicsValidation: "Thermodynamic Models Passed",
    physicsExplanation: "Simulated thermal transfer aligns with historical machine inertia.",
    safetyValidation: "100% Constraints Met",
    safetyExplanation: "No risk of sheet break. Headbox flow ratio remains within 0.95 - 1.05 limit.",
    processStability: "High Stability",
    expectedOscillations: "None",
    predictedAlarms: 0,
    engineeringNotes: "The recommended setpoints effectively \"flatten\" the transition curve, eliminating the overshoot predicted by the baseline trajectory.",
  },
  timelineEvents: MOCK_TIMELINE_EVENTS
};

/**
 * Hook to fetch the aggregated Digital Twin Workspace data.
 * Falls back to mock data if the API is unavailable.
 */
export const useDigitalTwinWorkspaceData = () => {
  return useQuery<DigitalTwinWorkspaceData>({
    queryKey: DIGITAL_TWIN_QUERY_KEYS.workspace(),
    queryFn: async () => {
      try {
        // Simulating the API attempt that fails and triggers the fallback:
        throw new Error('Backend endpoint not implemented yet');
      } catch (error) {
        console.info('Backend unavailable. Falling back to mock digital twin workspace data.');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay for skeleton
        return MOCK_WORKSPACE_DATA;
      }
    },
    retry: 0,
    refetchInterval: 15000,
  });
};
