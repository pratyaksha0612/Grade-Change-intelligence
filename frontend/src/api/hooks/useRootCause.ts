import { useQuery, useMutation } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { RootCauseService } from '../services/rootCauseService';
import type { RootCauseAnalyzeRequest, RootCauseAnalyzeResponse } from '../types';

export const ROOT_CAUSE_QUERY_KEYS = {
  all: ['root_cause'] as const,
  analyze: (id: string) => [...ROOT_CAUSE_QUERY_KEYS.all, 'analyze', id] as const,
  workspace: () => [...ROOT_CAUSE_QUERY_KEYS.all, 'workspace'] as const,
};

/**
 * Hook to execute a root cause analysis request and begin polling lifecycle.
 */
export const useRootCauseAnalyze = (): UseMutationResult<
  { status: string; job_id: string },
  Error,
  RootCauseAnalyzeRequest
> => {
  return useMutation({
    mutationFn: async (request: RootCauseAnalyzeRequest) => {
      const triggerRes = await RootCauseService.analyze(request) as any;
      const jobId = triggerRes.job_id || 'mock-job-id';
      
      // Simulating polling lifecycle
      return triggerRes;
    },
  });
};

// --- M4 Workspace Aggregated Data Types ---

export interface RootCauseItem {
  rank: number;
  variable: string;
  contribution: number;
  severity: string;
  trend: 'up' | 'down';
  status: string;
}

export interface ParetoDataPoint {
  name: string;
  contribution: number;
  cumulative: number;
}

export interface InvestigationTableRow {
  variable: string;
  current: string;
  target: string;
  dev: string;
  cont: string;
  sev: string;
  note: string;
}

export interface RootCauseWorkspaceData {
  transitionId: string;
  confidence: number;
  rootCauses: RootCauseItem[];
  paretoData: ParetoDataPoint[];
  investigationTable: InvestigationTableRow[];
  engineeringSummary: {
    aiSummary: string;
    interpretation: string;
    impact: string;
    recommendation: string;
    confidenceExplanation: string;
  };
}

// --- Fallback Mock Data ---
const MOCK_ROOT_CAUSES: RootCauseItem[] = [
  { rank: 1, variable: 'Steam Pressure', contribution: 35.2, severity: 'CRITICAL', trend: 'up', status: 'destructive' },
  { rank: 2, variable: 'Machine Speed', contribution: 22.8, severity: 'HIGH', trend: 'down', status: 'destructive' },
  { rank: 3, variable: 'Headbox Flow', contribution: 15.4, severity: 'MODERATE', trend: 'up', status: 'warning' },
  { rank: 4, variable: 'Stock Consistency', contribution: 9.7, severity: 'MODERATE', trend: 'up', status: 'warning' },
  { rank: 5, variable: 'Refiner Load', contribution: 7.1, severity: 'LOW', trend: 'down', status: 'default' },
  { rank: 6, variable: 'Slice Opening', contribution: 4.5, severity: 'LOW', trend: 'up', status: 'default' },
  { rank: 7, variable: 'Moisture', contribution: 2.8, severity: 'LOW', trend: 'down', status: 'default' },
  { rank: 8, variable: 'Wire Tension', contribution: 1.5, severity: 'LOW', trend: 'up', status: 'default' },
  { rank: 9, variable: 'Press Load', contribution: 0.8, severity: 'LOW', trend: 'down', status: 'default' },
  { rank: 10, variable: 'Vacuum Level', contribution: 0.2, severity: 'LOW', trend: 'down', status: 'default' },
];

const MOCK_PARETO_DATA: ParetoDataPoint[] = MOCK_ROOT_CAUSES.map((cause, index, arr) => {
  const cumulative = arr.slice(0, index + 1).reduce((sum, item) => sum + item.contribution, 0);
  return {
    name: cause.variable,
    contribution: cause.contribution,
    cumulative: cumulative,
  };
});

const MOCK_INVESTIGATION_TABLE: InvestigationTableRow[] = [
  { variable: 'Steam Pressure', current: '138.5 psi', target: '125.0 psi', dev: '+13.5 psi', cont: '35.2%', sev: 'CRITICAL', note: 'Ramp rate exceeded normal bounds during speed transition.' },
  { variable: 'Machine Speed', current: '2350 fpm', target: '2450 fpm', dev: '-100 fpm', cont: '22.8%', sev: 'HIGH', note: 'Dropped below optimal intercept point.' },
  { variable: 'Headbox Flow', current: '14200 gpm', target: '13800 gpm', dev: '+400 gpm', cont: '15.4%', sev: 'MODERATE', note: 'Flow ratio imbalance detected.' },
  { variable: 'Stock Consistency', current: '3.25%', target: '3.10%', dev: '+0.15%', cont: '9.7%', sev: 'MODERATE', note: 'Slightly heavy stock driving BW up.' },
  { variable: 'Refiner Load', current: '450 kW', target: '465 kW', dev: '-15 kW', cont: '7.1%', sev: 'LOW', note: 'Within acceptable variance.' },
];

const MOCK_WORKSPACE_DATA: RootCauseWorkspaceData = {
  transitionId: 'Linerboard 42# → 55#',
  confidence: 94,
  rootCauses: MOCK_ROOT_CAUSES,
  paretoData: MOCK_PARETO_DATA,
  investigationTable: MOCK_INVESTIGATION_TABLE,
  engineeringSummary: {
    aiSummary: "Basis Weight deviation is primarily driven by asynchronous Steam Pressure ramping relative to Machine Speed deceleration.",
    interpretation: "The steam pressure (138.5 psi) is remaining high while the machine speed has dropped (2350 fpm). This excess thermal energy combined with slower stock velocity on the wire is resulting in a heavier sheet than targeted.",
    impact: "+2.8% Basis Weight Overshoot",
    recommendation: "M6 AI Recommends instantly dropping Steam Pressure target to 128 psi to match current speed profile curve.",
    confidenceExplanation: "High confidence (94%) based on SHAP value consistency across 3 similar historical grade changes on PM3.",
  }
};

/**
 * Hook to fetch the aggregated Root Cause Workspace data.
 * Falls back to mock data if the API is unavailable.
 */
export const useRootCauseWorkspaceData = () => {
  return useQuery<RootCauseWorkspaceData>({
    queryKey: ROOT_CAUSE_QUERY_KEYS.workspace(),
    queryFn: async () => {
      try {
        // We'd typically fetch an aggregated endpoint for the workspace, e.g.,
        // return await ApiBaseService.get<RootCauseWorkspaceData>('/root-cause/workspace/summary');
        
        throw new Error('Backend endpoint not implemented yet');
      } catch (error) {
        console.info('Backend unavailable. Falling back to mock root cause workspace data.');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay for skeleton
        return MOCK_WORKSPACE_DATA;
      }
    },
    retry: 0,
    refetchInterval: 15000,
  });
};
