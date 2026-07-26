import { useState, useEffect } from 'react';
import { 
  BookOpen, 
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
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { DataTable, DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

// Integrate live backend data via React Query
import { useKnowledgeBaseWorkspaceData, getIconComponent } from '../api/hooks/useKnowledgeBase';

export default function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch live workspace data
  const { data, isLoading, isError } = useKnowledgeBaseWorkspaceData();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <LoadingSkeleton className="h-8 w-64" />
            <LoadingSkeleton className="h-4 w-96" />
          </div>
          <LoadingSkeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <Card className="h-full min-h-[400px]"><CardContent className="p-6 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
          <div className="lg:col-span-6 flex flex-col">
            <Card className="flex-1 min-h-[400px]"><CardContent className="p-6 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <Card className="h-full min-h-[400px]"><CardContent className="p-6 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
        </div>
        <Card><CardContent className="p-6"><LoadingSkeleton className="h-48 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-destructive">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-lg font-bold">Failed to load Knowledge Base Workspace</h2>
        <p className="text-sm">Please check your backend connection or refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* --- TOP SECTION --- */}
      <PageHeader 
        title="Process Knowledge Base" 
        description="M7 - Centralized engineering truth for AI engines and physical models."
        action={
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium tracking-wide">{currentTime.toLocaleTimeString()} Local Time</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Active Recipe</span>
              <span className="text-sm font-mono font-semibold text-foreground">{data.activeRecipeName} ({data.activeRecipeVersion})</span>
            </div>
            <div className="mt-2 flex space-x-2 items-center">
              <StatusBadge variant="success" className="bg-green-500/20 text-green-500 border border-green-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">KB SYNCHRONIZED</StatusBadge>
              <StatusBadge variant="outline" className="border-transparent bg-background/50">
                Last Updated: {data.lastUpdated}
              </StatusBadge>
            </div>
          </div>
        }
      />

      {/* --- MAIN EXECUTIVE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Knowledge Navigation */}
        <div className="lg:col-span-3">
          <Card className="h-full border-transparent   ">
            <CardHeader className="pb-3 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <Database className="h-4 w-4 text-primary" />
                Knowledge Graph
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {data.navItems.map((item, idx) => {
                  const Icon = getIconComponent(item.iconName);
                  
                  // Map item name to tab ID
                  const tabMap: Record<string, string> = {
                    'Grade Recipes': 'recipes',
                    'Machine Limits': 'limits',
                    'Engineering Rules': 'rules',
                    'Equipment Metadata': 'equipment',
                    'Process Constraints': 'constraints',
                    'Operator Notes': 'notes'
                  };
                  const tabId = tabMap[item.name] || 'recipes';
                  const isActive = activeTab === tabId;

                  return (
                    <motion.div 
                      key={idx} 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tabId)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                        isActive 
                          ? 'border-transparent bg-primary/10 text-primary shadow-[0_0_15px_rgba(229,34,34,0.15)]' 
                          : 'border-transparent hover:border-transparent hover:bg-primary/5 text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-sm font-semibold tracking-tight">{item.name}</span>
                      </div>
                      <span className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
                        isActive ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground'
                      }`}>
                        <AnimatedNumber value={item.count} />
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER PANEL: Knowledge Management */}
        <div className="lg:col-span-6 flex flex-col">
          <Card className="flex-1 flex flex-col h-full border-transparent   ">
            <CardHeader className="pb-0 border-b border-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="shrink-0 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Settings2 className="h-4 w-4 text-primary" />
                  Engineering Schema
                </CardTitle>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-x-auto no-scrollbar pb-2 sm:pb-0">
                  <TabsList className="inline-flex flex-wrap bg-background/50 border border-transparent">
                    <TabsTrigger value="recipes">Recipes</TabsTrigger>
                    <TabsTrigger value="limits">Limits</TabsTrigger>
                    <TabsTrigger value="rules">Rules</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                    <TabsTrigger value="constraints">Constraints</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              
              {activeTab === 'recipes' && (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground uppercase text-sm tracking-widest border-b border-transparent">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Grade Recipe</th>
                        <th className="px-6 py-4 font-semibold">Version</th>
                        <th className="px-6 py-4 font-semibold">Effective Date</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {data.recipes.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground tracking-tight">{row.recipe}</td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{row.version}</td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground/80">{row.date}</td>
                          <td className="px-6 py-4">
                            <StatusBadge variant={
                              row.status === 'ACTIVE' ? 'success' :
                              row.status === 'DRAFT' ? 'warning' : 'default'
                            } className="text-xs py-0 h-4 bg-background/50">
                              {row.status}
                            </StatusBadge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'limits' && (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground uppercase text-sm tracking-widest border-b border-transparent">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Variable</th>
                        <th className="px-6 py-4 font-semibold">Min</th>
                        <th className="px-6 py-4 font-semibold">Max</th>
                        <th className="px-6 py-4 font-semibold text-gci-amber">Warning</th>
                        <th className="px-6 py-4 font-semibold text-destructive">Critical</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {data.limits.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground tracking-tight">{row.variable}</td>
                          <td className="px-6 py-4 font-mono text-xs">{row.min}</td>
                          <td className="px-6 py-4 font-mono text-xs">{row.max}</td>
                          <td className="px-6 py-4 font-mono text-xs font-bold text-gci-amber">{row.warn}</td>
                          <td className="px-6 py-4 font-mono text-xs font-bold text-destructive">{row.crit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'rules' && (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground uppercase text-sm tracking-widest border-b border-transparent">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Rule Name</th>
                        <th className="px-6 py-4 font-semibold">Severity</th>
                        <th className="px-6 py-4 font-semibold">Enabled</th>
                        <th className="px-6 py-4 font-semibold">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {data.rules.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground tracking-tight">{row.name}</td>
                          <td className="px-6 py-4">
                            <StatusBadge variant={
                              row.severity === 'CRITICAL' ? 'destructive' :
                              row.severity === 'HIGH' ? 'warning' : 'default'
                            } className="text-xs py-0 h-4 bg-background/50">
                              {row.severity}
                            </StatusBadge>
                          </td>
                          <td className="px-6 py-4 font-bold text-sm uppercase tracking-widest">
                            <span className={row.enabled === 'YES' ? 'text-green-500' : 'text-muted-foreground/50'}>
                              {row.enabled}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground/80">{row.updated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'equipment' && (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground uppercase text-sm tracking-widest border-b border-transparent">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Equipment ID</th>
                        <th className="px-6 py-4 font-semibold">Name</th>
                        <th className="px-6 py-4 font-semibold">Type</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Last Sync</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {data.equipment.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground/70">{row.id}</td>
                          <td className="px-6 py-4 font-bold text-foreground tracking-tight">{row.name}</td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">{row.type}</td>
                          <td className="px-6 py-4">
                            <StatusBadge variant={row.status === 'ONLINE' ? 'success' : 'warning'} className="text-xs py-0 h-4 bg-background/50">
                              {row.status}
                            </StatusBadge>
                          </td>
                          <td className="px-6 py-4 font-mono text-sm text-muted-foreground/50">{row.lastSync}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'constraints' && (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground uppercase text-sm tracking-widest border-b border-transparent">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Variable</th>
                        <th className="px-6 py-4 font-semibold">Condition</th>
                        <th className="px-6 py-4 font-semibold">Limit Value</th>
                        <th className="px-6 py-4 font-semibold">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {data.constraints.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-bold text-foreground tracking-tight">{row.variable}</td>
                          <td className="px-6 py-4 text-xs font-mono text-muted-foreground/80">{row.condition}</td>
                          <td className="px-6 py-4 font-mono text-xs font-bold text-foreground">{row.limitValue}</td>
                          <td className="px-6 py-4 text-primary text-sm uppercase font-bold tracking-widest">{row.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/30 text-muted-foreground uppercase text-sm tracking-widest border-b border-transparent">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold">Author</th>
                        <th className="px-6 py-4 font-semibold">Shift</th>
                        <th className="px-6 py-4 font-semibold">Content</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {data.notes.map((row, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm text-muted-foreground/70 whitespace-nowrap">{row.date}</td>
                          <td className="px-6 py-4 font-bold text-foreground text-xs">{row.author}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 border border-transparent bg-background/50 rounded text-xs uppercase tracking-widest font-bold">{row.shift}</span>
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground/90 min-w-[300px] leading-relaxed">{row.content}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Knowledge Summary */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="h-full border-transparent   ">
            <CardHeader className="pb-3 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <Archive className="h-4 w-4 text-primary" />
                Active Knowledge State
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Current Grade</span>
                <p className="text-xl font-bold tracking-tight text-foreground">{data.activeRecipeName}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm font-mono bg-background/50 border border-transparent px-2 py-0.5 rounded text-muted-foreground">{data.activeRecipeVersion}</span>
                  <StatusBadge variant="success" className="h-5 py-0 px-1.5 text-xs bg-green-500/10 text-green-500 border border-green-500/20">ACTIVE</StatusBadge>
                </div>
              </div>

              <div className="pt-4 border-t border-transparent">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1 mb-1">
                  <ShieldCheck className="h-3 w-3" />
                  Validation Status
                </span>
                <p className="text-sm font-bold mt-1 text-green-500 flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> {data.activeKnowledgeState.validationStatus}
                </p>
                <p className="text-sm text-muted-foreground/80 mt-1 uppercase tracking-widest">{data.activeKnowledgeState.rulesVerified}</p>
              </div>

              <div className="pt-4 border-t border-transparent">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1 mb-1">
                  <User className="h-3 w-3" />
                  Last Editor
                </span>
                <p className="text-sm font-bold text-foreground">{data.activeKnowledgeState.lastEditor}</p>
                <p className="text-sm text-muted-foreground/70 font-mono mt-1">{data.activeKnowledgeState.lastEditTime}</p>
              </div>

              <div className="pt-4 border-t border-transparent flex justify-between items-center">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Pending Changes</span>
                <span className="text-xs font-bold bg-gci-amber/10 text-gci-amber border border-gci-amber/20 px-2 py-1 rounded flex items-center gap-1">
                  <AnimatedNumber value={data.activeKnowledgeState.pendingDrafts} /> Drafts
                </span>
              </div>

              <div className="pt-4 border-t border-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Cache Status</span>
                  <p className="text-sm font-mono text-muted-foreground flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse inline-block"></span>
                    {data.activeKnowledgeState.cacheStatus}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- BOTTOM SECTION: Recent Knowledge Changes Table --- */}
      <Card className="border-transparent  ">
        <CardHeader className="border-b border-transparent">
          <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-wide font-semibold text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            Recent Engineering Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full no-scrollbar">
            <DataTable headers={['Timestamp', 'User', 'Knowledge Object', 'Action Taken', 'Version', 'Approval Status']}>
              {data.recentChanges.map((row, idx) => (
                <DataTableRow key={idx} className="hover:bg-muted/30 transition-colors">
                  <DataTableCell className="font-mono text-muted-foreground/70 text-sm">{row.time}</DataTableCell>
                  <DataTableCell className="font-bold text-xs">{row.user}</DataTableCell>
                  <DataTableCell className="font-semibold text-foreground tracking-tight">{row.object}</DataTableCell>
                  <DataTableCell className="text-xs text-primary font-bold uppercase tracking-widest">{row.action}</DataTableCell>
                  <DataTableCell className="font-mono text-sm text-muted-foreground/80">{row.version}</DataTableCell>
                  <DataTableCell>
                    <StatusBadge variant={
                      row.status === 'ACTIVE' || row.status === 'APPROVED' || row.status === 'VERIFIED' ? 'success' : 'warning'
                    } className="text-xs py-0 h-4 bg-background/50">
                      {row.status}
                    </StatusBadge>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTable>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
