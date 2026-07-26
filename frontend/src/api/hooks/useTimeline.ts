import { useQuery } from '@tanstack/react-query';
import { TimelineService } from '../services/timelineService';

export const TIMELINE_QUERY_KEYS = {
  all: ['timeline'] as const,
  workspace: () => [...TIMELINE_QUERY_KEYS.all, 'workspace'] as const,
};

// --- M8 Workspace Aggregated Data Types ---

export interface TimelineMetric {
  title: string;
  value: string;
  description: string;
  isSuccess?: boolean;
}

export interface TimelineMilestone {
  id: string;
  time: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'upcoming';
  confidence?: number;
  subsystem?: string;
  duration?: string;
}

export interface TimelineEventRow {
  time: string;
  subsystem: string;
  event: string;
  status: string;
  details: string;
}

export interface TimelineWorkspaceData {
  transitionId: string;
  overallProgress: number;
  expectedCompletion: string;
  metrics: TimelineMetric[];
  milestones: TimelineMilestone[];
  eventsTable: TimelineEventRow[];
}

// --- Fallback Mock Data ---
const MOCK_WORKSPACE_DATA: TimelineWorkspaceData = {
  transitionId: "Linerboard 42# → 55#",
  overallProgress: 65,
  expectedCompletion: "14:45",
  metrics: [
    { title: "Transition Summary", value: "Active", description: "Executing Grade Change" },
    { title: "Overall Progress", value: "65%", description: "On Track" },
    { title: "Current Phase", value: "Steam Stabilization", description: "Thermal Equilibrium" },
    { title: "Next Milestone", value: "Basis Weight Lock", description: "±2.5% Tolerance" },
    { title: "Remaining Duration", value: "19 min", description: "Estimated" },
    { title: "Expected Completion", value: "14:45", description: "Local Time", isSuccess: true },
  ],
  milestones: [
    { id: '1', time: '14:00', title: 'Transition Initiated', description: 'Operator approved M6 setpoints.', status: 'completed', subsystem: 'M6', duration: '2m' },
    { id: '2', time: '14:02', title: 'Speed Deceleration', description: 'Ramping down to 2280 fpm.', status: 'completed', subsystem: 'DCS', duration: '10m' },
    { id: '3', time: '14:12', title: 'Speed Intercept Reached', description: 'Optimal trajectory maintained.', status: 'completed', subsystem: 'M3', duration: '0m' },
    { id: '4', time: '14:26', title: 'Steam Stabilization', description: 'Reaching thermal equilibrium at 128 psi.', status: 'active', subsystem: 'DT', confidence: 94, duration: '6m' },
    { id: '5', time: '14:32', title: 'Basis Weight Lock', description: 'Entering ±2.5% target tolerance.', status: 'upcoming', subsystem: 'M3', confidence: 91 },
    { id: '6', time: '14:45', title: 'Quality Achieved', description: 'Transition complete.', status: 'upcoming', subsystem: 'M8', confidence: 98 },
  ],
  eventsTable: [
    { time: '14:26:05', subsystem: 'M9 Digital Twin', event: 'Thermal Model Validated', status: 'SUCCESS', details: 'Steam transfer curve matches prediction.' },
    { time: '14:22:18', subsystem: 'M4 Root Cause', event: 'Deviation Averted', status: 'SUCCESS', details: 'Speed reduction prevented BW overshoot.' },
    { time: '14:12:00', subsystem: 'DCS', event: 'Speed Target Reached', status: 'INFO', details: '2280 fpm holding.' },
    { time: '14:00:15', subsystem: 'M6 Recommendations', event: 'Setpoints Applied', status: 'INFO', details: 'Pareto Set 1 transmitted to DCS.' },
  ]
};

/**
 * Hook to fetch the aggregated Timeline Workspace data.
 * Falls back to mock data if the API is unavailable.
 */
export const useTimelineWorkspaceData = () => {
  return useQuery<TimelineWorkspaceData>({
    queryKey: TIMELINE_QUERY_KEYS.workspace(),
    queryFn: async () => {
      try {
        throw new Error('Backend endpoint not implemented yet');
      } catch (error) {
        console.info('Backend unavailable. Falling back to mock timeline workspace data.');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay for skeleton
        return MOCK_WORKSPACE_DATA;
      }
    },
    retry: 0,
    refetchInterval: 15000,
  });
};
