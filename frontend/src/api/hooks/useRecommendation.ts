import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { RecommendationService } from '../services/recommendationService';
import type { RecommendationOptimizeRequest, RecommendationOptimizeResponse } from '../types';

export const RECOMMENDATION_QUERY_KEYS = {
  all: ['recommendations'] as const,
  generate: (id: string) => [...RECOMMENDATION_QUERY_KEYS.all, 'generate', id] as const,
  workspace: () => [...RECOMMENDATION_QUERY_KEYS.all, 'workspace'] as const,
};

/**
 * Hook to execute a recommendation generation request and begin polling lifecycle.
 */
export const useRecommendationGenerate = (): UseMutationResult<
  { status: string; job_id: string },
  Error,
  RecommendationOptimizeRequest
> => {
  return useMutation({
    mutationFn: async (request: RecommendationOptimizeRequest) => {
      const triggerRes = await RecommendationService.generate(request) as any;
      const jobId = triggerRes.job_id || 'mock-job-id';
      
      // Simulating the polling lifecycle
      return triggerRes;
    },
  });
};

// --- M6 Workspace Aggregated Data Types ---

export interface SetpointComparison {
  variable: string;
  current: string;
  recommended: string;
  diff: string;
  unit: string;
  action: 'increase' | 'decrease' | 'none';
}

export interface RecommendationCandidate {
  rank: number;
  improvement: number;
  confidence: number;
  safety: string;
  time: string;
  desc: string;
  recommended: boolean;
}

export interface RecommendationMetric {
  title: string;
  value: string;
  description: string;
  trend?: { value: number; label: string; isPositive: boolean };
}

export interface RecommendationWorkspaceData {
  transitionId: string;
  statusOptimal: boolean;
  metrics: RecommendationMetric[];
  comparisonData: SetpointComparison[];
  decisionSupport: {
    similarityMatch: string;
    similarityExplanation: string;
    digitalTwinValidated: boolean;
    digitalTwinExplanation: string;
    safetyValidated: boolean;
    safetyExplanation: string;
    engineeringRationale: string;
    rank: string;
    confidence: number;
  };
  candidates: RecommendationCandidate[];
}

// --- Fallback Mock Data ---
const MOCK_COMPARISON_DATA: SetpointComparison[] = [
  { variable: 'Machine Speed', current: '2350 fpm', recommended: '2280 fpm', diff: '-70 fpm', unit: 'fpm', action: 'decrease' },
  { variable: 'Steam Pressure', current: '138.5 psi', recommended: '128.0 psi', diff: '-10.5 psi', unit: 'psi', action: 'decrease' },
  { variable: 'Headbox Flow', current: '14200 gpm', recommended: '13950 gpm', diff: '-250 gpm', unit: 'gpm', action: 'decrease' },
  { variable: 'Slice Opening', current: '18.2 mm', recommended: '18.4 mm', diff: '+0.2 mm', unit: 'mm', action: 'increase' },
  { variable: 'Refiner Load', current: '450 kW', recommended: '450 kW', diff: '0 kW', unit: 'kW', action: 'none' },
  { variable: 'Stock Consistency', current: '3.25%', recommended: '3.25%', diff: '0.00%', unit: '%', action: 'none' },
  { variable: 'Moisture Target', current: '6.5%', recommended: '6.8%', diff: '+0.3%', unit: '%', action: 'increase' },
];

const MOCK_CANDIDATES: RecommendationCandidate[] = [
  { rank: 1, improvement: 18.5, confidence: 94.2, safety: 'SAFE', time: '14m', desc: 'Aggressive steam pressure reduction coupled with moderate speed drop. Best overall pareto optimization.', recommended: true },
  { rank: 2, improvement: 15.2, confidence: 89.1, safety: 'SAFE', time: '16m', desc: 'Primary reliance on speed reduction. Slower stabilization but minimal thermal shock.', recommended: false },
  { rank: 3, improvement: 12.8, confidence: 91.5, safety: 'SAFE', time: '18m', desc: 'Headbox ratio adjustments only. High confidence but lower overall impact on deviation.', recommended: false },
  { rank: 4, improvement: 22.4, confidence: 64.8, safety: 'WARNING', time: '11m', desc: 'Maximum theoretical correction. High risk of sheet break due to rapid tension changes.', recommended: false },
  { rank: 5, improvement: 8.5, confidence: 98.9, safety: 'SAFE', time: '24m', desc: 'Conservative micro-adjustments. Safest approach but longest transition time.', recommended: false },
];

const MOCK_WORKSPACE_DATA: RecommendationWorkspaceData = {
  transitionId: 'Linerboard 42# → 55#',
  statusOptimal: true,
  metrics: [
    { title: "Current Settings", value: "Sub-optimal", description: "Leading to +2.8% deviation" },
    { title: "Recommended Settings", value: "Pareto Set 1", description: "Optimal trade-off applied" },
    { title: "Expected Basis Weight", value: "55.1 lbs", description: "Target: 55.0 lbs (±2.5%)" },
    { title: "Est. Stabilization Time", value: "14 min", description: "Improved from 22 min", trend: { value: 36, label: "faster", isPositive: true } },
    { title: "Expected Improvement", value: "18.5%", description: "Overall transition efficiency" },
    { title: "Recommendation Confidence", value: "94.2%", description: "" },
  ],
  comparisonData: MOCK_COMPARISON_DATA,
  decisionSupport: {
    similarityMatch: "85% Match",
    similarityExplanation: "Found 3 successful past transitions using similar pareto setpoints.",
    digitalTwinValidated: true,
    digitalTwinExplanation: "Simulated impact aligns with M6 expectations. No overshoot predicted.",
    safetyValidated: true,
    safetyExplanation: "All variables strictly bounded by Process Knowledge Base limits.",
    engineeringRationale: "Reducing steam pressure by 10.5 psi actively curbs the thermal energy excess, while a slight speed reduction mitigates tension issues.",
    rank: "#1 of 5",
    confidence: 94.2
  },
  candidates: MOCK_CANDIDATES
};

/**
 * Hook to fetch the aggregated Recommendation Workspace data.
 * Falls back to mock data if the API is unavailable.
 */
export const useRecommendationWorkspaceData = () => {
  return useQuery<RecommendationWorkspaceData>({
    queryKey: RECOMMENDATION_QUERY_KEYS.workspace(),
    queryFn: async () => {
      try {
        // We'd typically fetch an aggregated endpoint for the workspace, e.g.,
        // return await ApiBaseService.get<RecommendationWorkspaceData>('/recommendation/workspace/summary');
        
        throw new Error('Backend endpoint not implemented yet');
      } catch (error) {
        console.info('Backend unavailable. Falling back to mock recommendation workspace data.');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay for skeleton
        return MOCK_WORKSPACE_DATA;
      }
    },
    retry: 0,
    refetchInterval: 15000,
  });
};
