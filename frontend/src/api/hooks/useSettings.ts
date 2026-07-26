import { useQuery } from '@tanstack/react-query';
import { SettingsService } from '../services/settingsService';

export const SETTINGS_QUERY_KEYS = {
  all: ['settings'] as const,
  workspace: () => [...SETTINGS_QUERY_KEYS.all, 'workspace'] as const,
};

// --- Settings Aggregated Data Types ---

export interface SystemServiceHealth {
  id: string;
  name: string;
  description: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  detail: string;
}

export interface SettingsWorkspaceData {
  application: {
    theme: string;
    language: string;
    timezone: string;
    notificationsEnabled: boolean;
  };
  plant: {
    name: string;
    activeLine: string;
    machineType: string;
  };
  ai: {
    defaultConfidenceThreshold: number;
    recommendationMode: string;
    autoRunDigitalTwin: boolean;
    uiRefreshInterval: string;
  };
  user: {
    initials: string;
    fullName: string;
    role: string;
    email: string;
    lastLogin: string;
  };
  system: {
    globalStatus: string; // e.g. "ALL SYSTEMS NOMINAL"
    services: SystemServiceHealth[];
    environment: string;
    buildVersion: string;
    frontendVersion: string;
    backendVersion: string;
  };
}

// --- Fallback Mock Data ---
const MOCK_WORKSPACE_DATA: SettingsWorkspaceData = {
  application: {
    theme: "dark",
    language: "en",
    timezone: "est",
    notificationsEnabled: true
  },
  plant: {
    name: "Augusta Mill",
    activeLine: "pm3",
    machineType: "Fourdrinier Board Machine"
  },
  ai: {
    defaultConfidenceThreshold: 90,
    recommendationMode: "balanced",
    autoRunDigitalTwin: true,
    uiRefreshInterval: "1000"
  },
  user: {
    initials: "AJ",
    fullName: "Alice Jones",
    role: "Lead Process Engineer",
    email: "alice.jones@gci.local",
    lastLogin: "2026-07-25 08:14:00"
  },
  system: {
    globalStatus: "ALL SYSTEMS NOMINAL",
    services: [
      { id: "backend", name: "FastAPI Backend (gRPC)", description: "Core integration layer", status: "ONLINE", detail: "Latency: 12ms" },
      { id: "kafka", name: "Kafka Message Broker", description: "Telemetry & Event Bus", status: "ONLINE", detail: "Topics: 14 active" },
      { id: "db", name: "TimescaleDB / PostgreSQL", description: "Time-series and persistent storage", status: "ONLINE", detail: "Pool: 24/50" },
      { id: "redis", name: "Redis Cache", description: "In-memory knowledge graph", status: "ONLINE", detail: "Hits: 99.4%" },
      { id: "mlflow", name: "Model Registry (MLflow)", description: "Model versioning and weights", status: "DEGRADED", detail: "Sync delayed" }
    ],
    environment: "PRODUCTION",
    buildVersion: "v2026.7.25-release",
    frontendVersion: "React 19 / Vite v5",
    backendVersion: "FastAPI / GCI-CORE v5.0"
  }
};

/**
 * Hook to fetch the aggregated Settings Workspace data.
 * Falls back to mock data if the API is unavailable.
 */
export const useSettingsWorkspaceData = () => {
  return useQuery<SettingsWorkspaceData>({
    queryKey: SETTINGS_QUERY_KEYS.workspace(),
    queryFn: async () => {
      try {
        throw new Error('Backend endpoint not implemented yet');
      } catch (error) {
        console.info('Backend unavailable. Falling back to mock settings workspace data.');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay for skeleton
        return MOCK_WORKSPACE_DATA;
      }
    },
    retry: 0,
    refetchInterval: 300000, // Infrequent updates for settings page
  });
};
