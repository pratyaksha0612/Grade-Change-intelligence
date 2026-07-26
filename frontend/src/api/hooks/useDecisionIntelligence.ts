import { useQuery } from '@tanstack/react-query';
import { DecisionIntelligenceService } from '../services/decisionIntelligenceService';

export const DECISION_QUERY_KEYS = {
  all: ['decision'] as const,
  workspace: () => [...DECISION_QUERY_KEYS.all, 'workspace'] as const,
};

// --- M10 Workspace Aggregated Data Types ---

export interface FusionDataPoint {
  subject: string;
  confidence: number;
  weight: number;
  contribution: number;
  fullMark: number;
  status: string;
}

export interface AssessmentTableRow {
  subsystem: string;
  confidence: string;
  weight: string;
  contribution: string;
  status: string;
  note: string;
}

export interface DecisionMetric {
  title: string;
  value: string;
  description?: string;
  isWarning?: boolean;
}

export interface DecisionWorkspaceData {
  transitionId: string;
  finalDecision: 'APPROVE' | 'REVIEW' | 'REJECT';
  overallConfidence: number;
  overallReliability: string;
  riskAssessment: string;
  engineeringSummary: string;
  metrics: DecisionMetric[];
  fusionData: FusionDataPoint[];
  assessmentTable: AssessmentTableRow[];
}

// --- Fallback Mock Data ---
const MOCK_FUSION_DATA: FusionDataPoint[] = [
  { subject: 'Prediction (M3)', confidence: 91, weight: 15, contribution: 13.65, fullMark: 100, status: 'success' },
  { subject: 'Root Cause (M4)', confidence: 94, weight: 10, contribution: 9.4, fullMark: 100, status: 'success' },
  { subject: 'Similarity (M5)', confidence: 85, weight: 10, contribution: 8.5, fullMark: 100, status: 'warning' },
  { subject: 'Recommendation (M6)', confidence: 94, weight: 35, contribution: 32.9, fullMark: 100, status: 'success' },
  { subject: 'Digital Twin (M9)', confidence: 98, weight: 20, contribution: 19.6, fullMark: 100, status: 'success' },
  { subject: 'Timeline (M8)', confidence: 92, weight: 10, contribution: 9.2, fullMark: 100, status: 'success' },
];

const OVERALL_CONFIDENCE = MOCK_FUSION_DATA.reduce((acc, curr) => acc + curr.contribution, 0); // 93.25

const MOCK_WORKSPACE_DATA: DecisionWorkspaceData = {
  transitionId: "Linerboard 42# → 55#",
  finalDecision: "APPROVE",
  overallConfidence: OVERALL_CONFIDENCE,
  overallReliability: "CLASS A",
  riskAssessment: "MINIMAL",
  engineeringSummary: "High confidence across all major subsystems (Prediction, Digital Twin, Recommendation) overwhelmingly offsets the moderate Historical Similarity score.",
  metrics: [
    { title: "Prediction Confidence", value: "91.2%" },
    { title: "Root Cause Confidence", value: "94.0%" },
    { title: "Similarity Confidence", value: "85.0%", description: "3 historical matches", isWarning: true },
    { title: "Recommendation Conf.", value: "94.2%", description: "Heaviest weight (35%)" },
    { title: "Digital Twin Confidence", value: "98.4%", description: "Physics validated" },
    { title: "Timeline Confidence", value: "92.0%" },
  ],
  fusionData: MOCK_FUSION_DATA,
  assessmentTable: [
    { subsystem: 'M3 Prediction Engine', confidence: '91.2%', weight: '15%', contribution: '13.68%', status: 'HIGH', note: 'Strong correlation with short-term sensor telemetry.' },
    { subsystem: 'M4 Root Cause Analysis', confidence: '94.0%', weight: '10%', contribution: '9.40%', status: 'HIGH', note: 'SHAP values explicitly identify steam pressure.' },
    { subsystem: 'M5 Historical Similarity', confidence: '85.0%', weight: '10%', contribution: '8.50%', status: 'MODERATE', note: 'Only 3 historical transitions match current state perfectly.' },
    { subsystem: 'M6 AI Recommendation', confidence: '94.2%', weight: '35%', contribution: '32.97%', status: 'HIGH', note: 'Pareto optimal setpoints discovered and validated.' },
    { subsystem: 'M9 Digital Twin', confidence: '98.4%', weight: '20%', contribution: '19.68%', status: 'CRITICAL', note: 'Thermodynamic trajectory mathematically verified.' },
    { subsystem: 'M8 Timeline Forecast', confidence: '92.0%', weight: '10%', contribution: '9.20%', status: 'HIGH', note: 'Stabilization times fall within standard deviation.' },
  ]
};

/**
 * Hook to fetch the aggregated Decision Intelligence Workspace data.
 * Falls back to mock data if the API is unavailable.
 */
export const useDecisionWorkspaceData = () => {
  return useQuery<DecisionWorkspaceData>({
    queryKey: DECISION_QUERY_KEYS.workspace(),
    queryFn: async () => {
      try {
        throw new Error('Backend endpoint not implemented yet');
      } catch (error) {
        console.info('Backend unavailable. Falling back to mock decision intelligence workspace data.');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay for skeleton
        return MOCK_WORKSPACE_DATA;
      }
    },
    retry: 0,
    refetchInterval: 15000,
  });
};
