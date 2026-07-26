import { useQuery } from '@tanstack/react-query';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';
import { 
  FileText, 
  Settings2, 
  Database, 
  Archive, 
  Activity, 
  User, 
  Clock, 
  ShieldCheck, 
  CheckCircle2,
  FileSignature,
  FileKey,
  BookOpen
} from 'lucide-react';

export const KNOWLEDGE_BASE_QUERY_KEYS = {
  all: ['knowledgeBase'] as const,
  workspace: () => [...KNOWLEDGE_BASE_QUERY_KEYS.all, 'workspace'] as const,
};

// --- M7 Workspace Aggregated Data Types ---

export interface NavItem {
  name: string;
  count: number;
  iconName: string; // Mapped to Lucide icon in component
  active?: boolean;
}

export interface RecipeData {
  recipe: string;
  version: string;
  date: string;
  status: string;
}

export interface LimitData {
  variable: string;
  min: string;
  max: string;
  warn: string;
  crit: string;
}

export interface RuleData {
  name: string;
  severity: string;
  enabled: string;
  updated: string;
}

export interface ChangeLogData {
  time: string;
  user: string;
  object: string;
  action: string;
  version: string;
  status: string;
}

export interface EquipmentData {
  id: string;
  name: string;
  type: string;
  status: string;
  lastSync: string;
}

export interface ConstraintData {
  variable: string;
  condition: string;
  limitValue: string;
  source: string;
}

export interface NoteData {
  date: string;
  author: string;
  shift: string;
  content: string;
}

export interface KnowledgeBaseWorkspaceData {
  activeRecipeName: string;
  activeRecipeVersion: string;
  lastUpdated: string;
  navItems: NavItem[];
  recipes: RecipeData[];
  limits: LimitData[];
  rules: RuleData[];
  equipment: EquipmentData[];
  constraints: ConstraintData[];
  notes: NoteData[];
  recentChanges: ChangeLogData[];
  activeKnowledgeState: {
    validationStatus: string;
    rulesVerified: string;
    lastEditor: string;
    lastEditTime: string;
    pendingDrafts: number;
    cacheStatus: string;
  };
}

// --- Fallback Mock Data ---
const MOCK_WORKSPACE_DATA: KnowledgeBaseWorkspaceData = {
  activeRecipeName: "Linerboard 42#",
  activeRecipeVersion: "v2.4",
  lastUpdated: "2h ago",
  navItems: [
    { name: 'Grade Recipes', count: 124, iconName: 'FileText', active: true },
    { name: 'Machine Limits', count: 48, iconName: 'Activity' },
    { name: 'Engineering Rules', count: 86, iconName: 'FileSignature' },
    { name: 'Equipment Metadata', count: 215, iconName: 'Database' },
    { name: 'Process Constraints', count: 32, iconName: 'FileKey' },
    { name: 'Operator Notes', count: 450, iconName: 'BookOpen' },
  ],
  recipes: [
    { recipe: 'Linerboard 42#', version: 'v2.4', date: '2026-05-12', status: 'ACTIVE' },
    { recipe: 'Linerboard 55#', version: 'v3.1', date: '2026-06-01', status: 'ACTIVE' },
    { recipe: 'Corrugating Medium 26#', version: 'v1.8', date: '2025-11-20', status: 'ACTIVE' },
    { recipe: 'Kraft Bag 50#', version: 'v2.0', date: '2026-07-10', status: 'DRAFT' },
    { recipe: 'Linerboard 42# (Winter)', version: 'v2.3', date: '2026-03-15', status: 'ARCHIVED' },
  ],
  limits: [
    { variable: 'Machine Speed (fpm)', min: '2000', max: '2800', warn: '±5%', crit: '±10%' },
    { variable: 'Steam Pressure (psi)', min: '110', max: '150', warn: '±2 psi', crit: '±5 psi' },
    { variable: 'Headbox Flow (gpm)', min: '12000', max: '16000', warn: '±1%', crit: '±2%' },
    { variable: 'Refiner Load (kW)', min: '350', max: '550', warn: '±10 kW', crit: '±25 kW' },
    { variable: 'Slice Opening (mm)', min: '15.0', max: '22.0', warn: '±0.5 mm', crit: '±1.0 mm' },
  ],
  rules: [
    { name: 'Steam-Speed Ratio Interlock', severity: 'CRITICAL', enabled: 'YES', updated: '2026-01-15' },
    { name: 'Headbox Ratio Smoothing', severity: 'HIGH', enabled: 'YES', updated: '2026-04-22' },
    { name: 'Refiner Energy Constraint', severity: 'MODERATE', enabled: 'YES', updated: '2025-08-30' },
    { name: 'Moisture Target Override', severity: 'LOW', enabled: 'NO', updated: '2026-07-05' },
  ],
  equipment: [
    { id: 'PM-101', name: 'Primary Headbox', type: 'Flow Control', status: 'ONLINE', lastSync: '10 mins ago' },
    { id: 'PM-102', name: 'Refiner A', type: 'Mechanical', status: 'MAINTENANCE', lastSync: '1 hr ago' },
    { id: 'PM-103', name: 'Dryer Section 1', type: 'Thermal', status: 'ONLINE', lastSync: '5 mins ago' },
    { id: 'PM-104', name: 'Calender Stack', type: 'Finishing', status: 'ONLINE', lastSync: '12 mins ago' },
  ],
  constraints: [
    { variable: 'Steam Pressure', condition: 'Must not exceed', limitValue: '150 psi', source: 'Safety Interlock' },
    { variable: 'Machine Speed', condition: 'Ramp rate <', limitValue: '50 fpm/min', source: 'Quality Control' },
    { variable: 'Moisture Content', condition: 'Minimum', limitValue: '4.5%', source: 'Product Spec' },
  ],
  notes: [
    { date: '2026-07-25 06:00', author: 's.miller', shift: 'Night', content: 'Felt tension adjusted on 3rd press due to slight edge flutter.' },
    { date: '2026-07-24 14:00', author: 'a.jones', shift: 'Day', content: 'Steam pressure bumped up by 2 psi to counteract wet edges.' },
    { date: '2026-07-23 22:00', author: 't.baker', shift: 'Evening', content: 'Cleaned scanner window, moisture readings stabilized.' },
  ],
  recentChanges: [
    { time: '2026-07-25 10:15:22', user: 'j.smith (Process Eng)', object: 'Kraft Bag 50# Recipe', action: 'Draft Created', version: 'v2.0', status: 'PENDING' },
    { time: '2026-07-24 14:30:00', user: 'a.jones (Lead Eng)', object: 'Machine Speed Limit', action: 'Limit Updated', version: 'v1.4', status: 'APPROVED' },
    { time: '2026-07-22 09:45:12', user: 'system_auto', object: 'Linerboard 42# Recipe', action: 'Version Activated', version: 'v2.4', status: 'ACTIVE' },
    { time: '2026-07-20 16:20:05', user: 'm.davis (Safety)', object: 'Steam-Speed Ratio Interlock', action: 'Rule Verified', version: 'v3.1', status: 'VERIFIED' },
  ],
  activeKnowledgeState: {
    validationStatus: 'ALL RULES PASSED',
    rulesVerified: '86/86 Engineering Rules verified.',
    lastEditor: 'a.jones (Lead Process Eng)',
    lastEditTime: '2026-07-24 14:30:00',
    pendingDrafts: 2,
    cacheStatus: 'Redis Sync Active (24ms)'
  }
};

/**
 * Hook to fetch the aggregated Process Knowledge Base Workspace data.
 * Falls back to mock data if the API is unavailable.
 */
export const useKnowledgeBaseWorkspaceData = () => {
  return useQuery<KnowledgeBaseWorkspaceData>({
    queryKey: KNOWLEDGE_BASE_QUERY_KEYS.workspace(),
    queryFn: async () => {
      try {
        throw new Error('Backend endpoint not implemented yet');
      } catch (error) {
        console.info('Backend unavailable. Falling back to mock knowledge base workspace data.');
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulating network delay for skeleton
        return MOCK_WORKSPACE_DATA;
      }
    },
    retry: 0,
    refetchInterval: 60000,
  });
};

/**
 * Helper to map string icon names to Lucide icon components.
 */
export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'FileText': return FileText;
    case 'Activity': return Activity;
    case 'FileSignature': return FileSignature;
    case 'Database': return Database;
    case 'FileKey': return FileKey;
    case 'BookOpen': return BookOpen;
    default: return FileText;
  }
};
