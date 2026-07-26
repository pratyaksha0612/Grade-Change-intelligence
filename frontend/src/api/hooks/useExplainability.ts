import { useQuery } from '@tanstack/react-query';
import { ExplainabilityService } from '../services/explainabilityService';
import { 
  Activity,
  Search,
  BrainCircuit,
  ThumbsUp,
  Cpu,
  FastForward,
  Scale
} from 'lucide-react';

export const EXPLAINABILITY_QUERY_KEYS = {
  all: ['explainability'] as const,
  workspace: () => [...EXPLAINABILITY_QUERY_KEYS.all, 'workspace'] as const,
};

// --- M13 Workspace Aggregated Data Types ---

export interface DecisionTraceStep {
  id: string;
  name: string;
  iconName: string; // We'll map string names to lucide icons in the component
  desc: string;
  time: string;
  isFinal?: boolean;
}

export interface EvidenceSummary {
  title: string;
  desc: string;
}

export interface AuditTableRow {
  subsystem: string;
  version: string;
  time: string;
  confidence: string;
  evidence: string;
  status: string;
}

export interface ExplainabilityWorkspaceData {
  decisionId: string;
  coreVersion: string;
  decisionConfidence: number;
  engineeringRationale: string;
  safetyValidation: string;
  supportingEvidence: string[];
  auditHash: string;
  decisionTrace: DecisionTraceStep[];
  evidenceSummary: EvidenceSummary[];
  auditTable: AuditTableRow[];
}

// --- Fallback Mock Data ---
const MOCK_WORKSPACE_DATA: ExplainabilityWorkspaceData = {
  decisionId: "DEC-8894-L42-L55",
  coreVersion: "GCI-CORE v5.0",
  decisionConfidence: 93.2,
  engineeringRationale: "The M10 fusion algorithm successfully validated the M6 setpoint recommendation across all constraints, utilizing the M9 Digital Twin for final thermodynamic verification.",
  safetyValidation: "PASSED",
  supportingEvidence: [
    "shap_analysis_55.json",
    "sim_trajectory_v2.csv",
    "nsga2_pareto_front.bin"
  ],
  auditHash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
  decisionTrace: [
    { id: 'M3', name: 'Prediction', iconName: 'Activity', desc: 'Identified BW deviation (+2.8%)', time: '14:05:12' },
    { id: 'M4', name: 'Root Cause', iconName: 'Search', desc: 'Linked to Steam Pressure (35.2%)', time: '14:08:45' },
    { id: 'M5', name: 'Historical Similarity', iconName: 'BrainCircuit', desc: 'Found 3 successful matches (85%)', time: '14:10:20' },
    { id: 'M6', name: 'Recommendation', iconName: 'ThumbsUp', desc: 'Pareto optimal setpoints (18.5% imp)', time: '14:15:30' },
    { id: 'M9', name: 'Digital Twin', iconName: 'Cpu', desc: 'Simulated trajectory verified safe', time: '14:20:00' },
    { id: 'M8', name: 'Timeline', iconName: 'FastForward', desc: '14min stabilization forecast', time: '14:22:15' },
    { id: 'M10', name: 'Final Decision', iconName: 'Scale', desc: 'Auto-Approved (93.2%)', time: '14:24:00', isFinal: true },
  ],
  evidenceSummary: [
    { title: 'Prediction Summary (M3)', desc: 'Time-series forecasting detected a high probability of a +2.8% Basis Weight overshoot if the current transition trajectory was maintained.' },
    { title: 'Root Cause Summary (M4)', desc: 'SHAP value attribution isolated Steam Pressure as the primary driver (35.2% impact) due to an asynchronous ramp rate relative to Machine Speed.' },
    { title: 'Historical Evidence (M5)', desc: 'Vector search across 5 years of historian data identified 3 highly similar PM3 transitions where early steam reduction prevented overshoot.' },
    { title: 'Recommendation Summary (M6)', desc: 'NSGA-II multi-objective optimization generated a Pareto setpoint: -10.5 psi Steam Pressure and -70 fpm Machine Speed, maximizing transition speed while maintaining safe tension.' },
    { title: 'Digital Twin Validation (M9)', desc: 'Thermodynamic and kinematic physics simulation confirmed the recommended setpoints effectively flatten the transition curve with zero expected oscillations.' },
    { title: 'Timeline Summary (M8)', desc: 'End-to-end chronological forecast verified that all primary CTQs (Critical to Quality) will stabilize within a 14-minute window.' },
  ],
  auditTable: [
    { subsystem: 'M3 Prediction Engine', version: 'v4.2.1-prod', time: '14:05:12', confidence: '91.2%', evidence: 'Trajectory Forecast', status: 'VALID' },
    { subsystem: 'M4 Root Cause Analysis', version: 'v1.8.0-prod', time: '14:08:45', confidence: '94.0%', evidence: 'SHAP Attribution', status: 'VALID' },
    { subsystem: 'M5 Historical Similarity', version: 'v2.0.4-prod', time: '14:10:20', confidence: '85.0%', evidence: 'KNN Search (k=3)', status: 'VALID' },
    { subsystem: 'M6 AI Recommendation', version: 'v3.5.2-prod', time: '14:15:30', confidence: '94.2%', evidence: 'NSGA-II Pareto Set', status: 'VALID' },
    { subsystem: 'M9 Digital Twin', version: 'v2.1.0-prod', time: '14:20:00', confidence: '98.4%', evidence: 'Physics Simulation', status: 'VALID' },
    { subsystem: 'M8 Timeline Forecast', version: 'v1.2.5-prod', time: '14:22:15', confidence: '92.0%', evidence: 'Chronological Forecast', status: 'VALID' },
  ]
};

/**
 * Hook to fetch the aggregated Explainability Workspace data.
 * Falls back to mock data if the API is unavailable.
 */
export const useExplainabilityWorkspaceData = () => {
  return useQuery<ExplainabilityWorkspaceData>({
    queryKey: EXPLAINABILITY_QUERY_KEYS.workspace(),
    queryFn: async () => {
      try {
        throw new Error('Backend endpoint not implemented yet');
      } catch (error) {
        console.info('Backend unavailable. Falling back to mock explainability workspace data.');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay for skeleton
        return MOCK_WORKSPACE_DATA;
      }
    },
    retry: 0,
    refetchInterval: 15000,
  });
};

/**
 * Helper to map string icon names to Lucide icon components.
 */
export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Activity': return Activity;
    case 'Search': return Search;
    case 'BrainCircuit': return BrainCircuit;
    case 'ThumbsUp': return ThumbsUp;
    case 'Cpu': return Cpu;
    case 'FastForward': return FastForward;
    case 'Scale': return Scale;
    default: return Activity;
  }
};
