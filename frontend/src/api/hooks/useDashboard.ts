import { useQuery } from '@tanstack/react-query';
import { ApiBaseService } from '../../services/apiBase';

export interface DashboardMetric {
  title: string;
  value: string;
  subtitle?: string;
  detail?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  status?: 'success' | 'warning' | 'destructive' | 'default';
}

export interface ChartDataPoint {
  time: string;
  basisWeight: number;
  machineSpeed: number;
  steamPressure: number;
  moisture: number;
}

export interface TimelineEvent {
  time: string;
  title: string;
  engine?: string;
  desc: string;
  status: 'completed' | 'current' | 'pending';
}

export interface DashboardData {
  plantName: string;
  activeTransition: {
    current: string;
    target: string;
  };
  sessionId: string;
  progress: number;
  timeRemaining: string;
  metrics: DashboardMetric[];
  chartData: ChartDataPoint[];
  recommendation: {
    action: string;
    currentSpeed?: number;
    recommendedSpeed?: number;
    adjustment?: number;
    expectedBasisWeight?: number;
    value?: string;
    engine: string;
    confidence: number;
    stats?: { label: string, value: string, desc: string }[];
    whatItDoes?: string[];
    whyItWorks?: string[];
  };
  timeline: TimelineEvent[];
  rootCause: { name: string, value: number, color: string }[];
  digitalTwin: {
    scenarios: { 
      name: string, 
      change: string, 
      loss: string, 
      risk: string, 
      recommended?: boolean,
      stabilizationTime?: string,
      energyConsumption?: string,
      expectedQuality?: string,
      trajectory?: string
    }[];
  };
  alerts: { id: string, title: string, desc: string, time: string, type: 'warning' | 'info' | 'destructive' }[];
}

// --- Fallback Mock Data ---
let MOCK_CHART_DATA: ChartDataPoint[] = Array.from({ length: 30 }, (_, i) => ({
  time: `15:${String(i + 30).padStart(2, '0')}`,
  basisWeight: 45 + (i > 10 ? (i - 10) * 0.3 : 0) + Math.random() * 0.5,
  machineSpeed: 2100 - (i > 5 ? (i - 5) * 5 : 0) + Math.random() * 10,
  steamPressure: 110 + (i > 15 ? (i - 15) * 1 : 0) + Math.random() * 2,
  moisture: 5.5 + Math.random() * 0.2,
}));

let currentProgress = 68;
let currentRemaining = 18;

const MOCK_DASHBOARD_DATA: DashboardData = {
  plantName: "Augusta Mill - PM3",
  activeTransition: { current: "Linerboard 42#", target: "55#" },
  sessionId: "GC-2026-07-24-0142",
  progress: currentProgress,
  timeRemaining: `${currentRemaining} min remaining`,
  metrics: [
    { title: "CURRENT BASIS WEIGHT", value: "48.2 lbs", subtitle: "Target: 55.0 lbs", detail: "+12.5% vs target", status: 'success' },
    { title: "PREDICTED BASIS WEIGHT", value: "54.8 lbs", subtitle: "At stabilization point", detail: "+94% drift", status: 'success' },
    { title: "AI CONFIDENCE", value: "94%", subtitle: "Overall System", detail: "High Reliability", status: 'success' },
    { title: "QUALITY RISK", value: "LOW", subtitle: "Within specification", detail: "No immediate action", status: 'success' },
    { title: "EST. COMPLETION", value: `${currentRemaining} min`, subtitle: "At current trajectory", detail: "14:38 completion", status: 'default' },
    { title: "FINANCIAL IMPACT", value: "-$1,840", subtitle: "Potential loss avoided", detail: "vs open-loop control", status: 'success' },
  ],
  chartData: MOCK_CHART_DATA,
  recommendation: {
    action: "Reduce Machine Speed",
    value: "by 150 FPM",
    engine: "M6 Optimization Engine",
    confidence: 94,
    stats: [
      { label: "EXPECTED IMPROVEMENT", value: "+12.3%", desc: "BW Stabilization" },
      { label: "RISK REDUCTION", value: "-32%", desc: "Off-Spec Risk" },
      { label: "EST. SAVINGS", value: "$1,820", desc: "Per Transition" },
      { label: "TIME TO IMPACT", value: "4-6 min", desc: "To Stabilization" },
    ],
    whatItDoes: [
      "Stabilize basis weight",
      "Reduce steam demand",
      "Maintain quality target",
      "Prevent off-spec production"
    ],
    whyItWorks: [
      "AI detected steam pressure ramp (35% contribution)",
      "Speed reduction counteracts BW increase trend",
      "Similar to 3 successful historical transitions",
      "Digital twin validation passed"
    ]
  },
  timeline: [
    { time: "15:45", title: "Transition Initiated", engine: "M6", desc: "Operator approved grade change", status: "completed" },
    { time: "15:52", title: "Speed Deceleration", engine: "DCS", desc: "Ramping down to 2280 FPM", status: "completed" },
    { time: "15:58", title: "Prediction Updated", engine: "M3", desc: "Deviation trend detected", status: "completed" },
    { time: "16:04", title: "Root Cause Identified", engine: "M4", desc: "Steam pressure ramp detected", status: "completed" },
    { time: "16:08", title: "Recommendation Ready", engine: "M6", desc: "AI optimization complete", status: "current" },
    { time: "16:12", title: "Operator Decision", engine: "", desc: "Pending", status: "pending" },
    { time: "16:18", title: "Implementation", engine: "", desc: "Pending", status: "pending" },
    { time: "16:25", title: "Stabilization Target", engine: "", desc: "Pending", status: "pending" },
  ],
  rootCause: [
    { name: "Steam Pressure Ramp", value: 35, color: "#E52222" },
    { name: "Machine Speed", value: 22, color: "#8B8FA3" },
    { name: "Headbox Flow", value: 15, color: "#10B981" },
    { name: "Stock Consistency", value: 10, color: "#F59E0B" },
    { name: "Other Factors", value: 18, color: "#6B7280" },
  ],
  digitalTwin: {
    scenarios: [
      { name: "Current Path", change: "Baseline", loss: "420 kg", risk: "HIGH" },
      { name: "Scenario A", change: "Speed -100 FPM", loss: "180 kg", risk: "MEDIUM" },
      { name: "Scenario B", change: "Speed -150 FPM", loss: "65 kg", risk: "LOW", recommended: true },
      { name: "Scenario C", change: "Speed -200 FPM", loss: "120 kg", risk: "LOW" },
    ]
  },
  alerts: [
    { id: "A1", type: "destructive", time: "2 min ago", title: "Basis weight trending high", desc: "Predicted to exceed tolerance in 6 min" },
    { id: "A2", type: "warning", time: "4 min ago", title: "Steam pressure ramp detected", desc: "Rate exceeding normal bounds" },
    { id: "A3", type: "info", time: "7 min ago", title: "Digital twin validation complete", desc: "3 scenarios evaluated successfully" },
  ]
};

const updateMockData = () => {
  const lastPoint = MOCK_CHART_DATA[MOCK_CHART_DATA.length - 1];
  const [hours, minutes] = lastPoint.time.split(':').map(Number);
  let newMins = minutes + 1;
  let newHours = hours;
  if (newMins >= 60) {
      newMins = 0;
      newHours++;
  }
  const newTime = `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  
  MOCK_CHART_DATA.shift();
  MOCK_CHART_DATA.push({
      time: newTime,
      basisWeight: lastPoint.basisWeight + (Math.random() - 0.5) * 0.4,
      machineSpeed: lastPoint.machineSpeed + (Math.random() - 0.5) * 5,
      steamPressure: lastPoint.steamPressure + (Math.random() - 0.5) * 1.5,
      moisture: lastPoint.moisture + (Math.random() - 0.5) * 0.1,
  });

  currentProgress = Math.min(100, currentProgress + 0.1);
  currentRemaining = Math.max(0, currentRemaining - 0.1);

  const lastBw = MOCK_CHART_DATA[MOCK_CHART_DATA.length - 1].basisWeight;
  const targetDiff = (lastBw - 55).toFixed(1);

  MOCK_DASHBOARD_DATA.progress = Math.round(currentProgress);
  MOCK_DASHBOARD_DATA.timeRemaining = `${Math.round(currentRemaining)} min remaining`;
  MOCK_DASHBOARD_DATA.chartData = [...MOCK_CHART_DATA];
  
  MOCK_DASHBOARD_DATA.metrics[0].value = `${lastBw.toFixed(1)} lbs`;
  MOCK_DASHBOARD_DATA.metrics[0].detail = `${targetDiff}% vs target`;
  MOCK_DASHBOARD_DATA.metrics[4].value = `${Math.round(currentRemaining)} min`;

  return { ...MOCK_DASHBOARD_DATA, chartData: [...MOCK_CHART_DATA] };
};

export class DashboardService extends ApiBaseService {
  static async getSummary(): Promise<DashboardData> {
    return this.get<DashboardData>('/dashboard/summary');
  }
  static async postAction(action_type: string): Promise<any> {
    return this.post<any>('/dashboard/action', { action_type });
  }
}

export const useDashboardData = () => {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      // Attempt to fetch live data from the real backend endpoint.
      // We explicitly removed the mock fallback to guarantee end-to-end ML validation.
      return await DashboardService.getSummary();
    },
    retry: 1,
    refetchInterval: 3000, // Poll every 3s to get real live data stream
  });
};
