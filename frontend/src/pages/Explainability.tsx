import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Database, 
  Server, 
  Info, 
  Search, 
  GitPullRequest,
  Activity,
  Cpu,
  ArrowDown,
  BrainCircuit,
  ThumbsUp,
  Scale,
  AlertTriangle,
  BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

// Integrate live backend data via React Query
import { useExplainabilityWorkspaceData, getIconComponent } from '../api/hooks/useExplainability';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Explainability() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch live workspace data
  const { data, isLoading, isError } = useExplainabilityWorkspaceData();

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
            <Card className="h-full min-h-[500px]"><CardContent className="p-6 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
          <div className="lg:col-span-6 flex flex-col">
            <Card className="flex-1 min-h-[500px]"><CardContent className="p-6 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <Card className="h-full min-h-[500px]"><CardContent className="p-6 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
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
        <h2 className="text-lg font-bold">Failed to load Explainability Workspace</h2>
        <p className="text-sm">Please check your backend connection or refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* --- TOP SECTION --- */}
      <PageHeader 
        title="Explainability & Decision Audit Workspace" 
        description="M13 - Complete cryptographic audit trail and reasoning chain for AI decisions."
        action={
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium tracking-wide">{currentTime.toLocaleTimeString()} Local Time</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">ID</span>
              <span className="text-sm font-mono font-semibold text-foreground">{data.decisionId}</span>
            </div>
            <div className="mt-2 flex space-x-2 items-center">
              <StatusBadge variant="success" className="bg-green-500/20 text-green-500 border border-green-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">AUDIT TRAIL VERIFIED</StatusBadge>
              <StatusBadge variant="outline" className="border-transparent bg-background/50">
                <Server className="h-3 w-3 mr-1 text-muted-foreground" />
                {data.coreVersion}
              </StatusBadge>
            </div>
          </div>
        }
      />

      {/* --- MAIN EXECUTIVE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Decision Trace */}
        <div className="lg:col-span-3">
          <Card className="h-full border-transparent   ">
            <CardHeader className="pb-4 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <GitPullRequest className="h-4 w-4 text-primary" />
                Decision Trace
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative pl-4 before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-border/50">
                {data.decisionTrace.map((step, idx) => {
                  const Icon = getIconComponent(step.iconName);
                  return (
                    <motion.div 
                      key={step.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      className="relative flex items-start mb-6 last:mb-0 group"
                    >
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 z-10 mr-4 transition-colors
                        ${step.isFinal ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(229,34,34,0.4)]' : 'bg-background border-transparent text-primary group-hover:border-primary'}
                      `}>
                        <Icon className={step.isFinal ? "h-4 w-4" : "h-3.5 w-3.5"} />
                      </div>
                      <div className={`pt-1 w-full ${step.isFinal ? 'bg-primary/10 p-4 -mt-3 rounded-lg border border-transparent shadow-[0_4px_20px_-5px_rgba(229,34,34,0.15)]' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-bold tracking-tight ${step.isFinal ? 'text-primary' : 'text-foreground'}`}>
                            {step.name}
                          </p>
                          <span className="text-xs text-muted-foreground font-mono tracking-wider bg-background/50 border border-transparent px-1.5 py-0.5 rounded">{step.time}</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${step.isFinal ? 'text-foreground/90 font-medium' : 'text-muted-foreground/80'}`}>{step.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER PANEL: Feature Importance & Evidence */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card className="flex flex-col border-transparent border">
            <CardHeader className="pb-3 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <BarChart2 className="h-4 w-4 text-primary" />
                SHAP Feature Attribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.shapValues} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} opacity={0.2} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="feature" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.2)'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <ReferenceLine x={0} stroke="hsl(var(--muted-foreground))" />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={16}>
                    {
                      data.shapValues?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.impact > 0 ? '#10B981' : '#E52222'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="flex-1 flex flex-col border-transparent border">
            <CardHeader className="pb-3 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <FileText className="h-4 w-4 text-primary" />
                Evidence Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                {data.evidenceSummary.map((evidence, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-xl border border-transparent bg-background/50 hover:bg-primary/5 transition-all duration-300 flex flex-col group"
                  >
                    <h4 className="text-sm font-bold text-foreground mb-2 border-b border-transparent pb-1 group-hover:text-primary transition-colors tracking-tight">{evidence.title}</h4>
                    <p className="text-xs text-muted-foreground/80 leading-relaxed flex-1">{evidence.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Audit Information */}
        <div className="lg:col-span-3 space-y-8">
          <Card className="h-full border-transparent   ">
            <CardHeader className="pb-3 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <Database className="h-4 w-4 text-primary" />
                Audit Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Decision Confidence</span>
                <p className="text-2xl font-bold text-green-500 tracking-tighter">
                  <AnimatedNumber value={data.decisionConfidence} />%
                </p>
              </div>

              <div className="pt-3 border-t border-transparent">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Engineering Rationale</span>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  {data.engineeringRationale}
                </p>
              </div>

              <div className="pt-3 border-t border-transparent flex justify-between items-center">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Safety Validation</span>
                <span className={`text-xs font-bold flex items-center px-2 py-1 rounded ${data.safetyValidation === 'PASSED' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gci-amber/10 text-gci-amber border border-gci-amber/20'}`}>
                  <ShieldCheck className="h-3 w-3 mr-1" /> {data.safetyValidation}
                </span>
              </div>

              <div className="pt-3 border-t border-transparent">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-2">Supporting Evidence</span>
                <div className="flex flex-col gap-1.5">
                  {data.supportingEvidence.map((doc, idx) => (
                    <span key={idx} className="text-sm font-mono bg-background/50 border border-transparent p-1.5 rounded inline-block w-full text-foreground/80">{doc}</span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-transparent">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-2">Audit Hash (SHA-256)</span>
                <p className="text-xs font-mono break-all bg-background/50 border border-transparent p-2.5 rounded text-muted-foreground/70">
                  {data.auditHash}
                </p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- BOTTOM SECTION: Decision Audit Table --- */}
      <Card className="border-transparent  ">
        <CardHeader className="border-b border-transparent">
          <CardTitle className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Decision Audit Table</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto w-full no-scrollbar">
            <DataTable headers={['Subsystem', 'Model Version', 'Timestamp', 'Confidence', 'Primary Evidence', 'Status']}>
              {data.auditTable.map((row, idx) => (
                <DataTableRow key={idx} className="hover:bg-muted/30 transition-colors">
                  <DataTableCell className="font-semibold text-foreground tracking-tight">{row.subsystem}</DataTableCell>
                  <DataTableCell className="font-mono text-sm text-muted-foreground/80">{row.version}</DataTableCell>
                  <DataTableCell className="font-mono text-sm text-muted-foreground">{row.time}</DataTableCell>
                  <DataTableCell>
                    <span className={`font-mono text-xs font-bold ${parseFloat(row.confidence) > 90 ? 'text-green-500' : 'text-gci-amber'}`}>
                      {row.confidence}
                    </span>
                  </DataTableCell>
                  <DataTableCell className="text-xs text-primary font-medium">{row.evidence}</DataTableCell>
                  <DataTableCell>
                    <StatusBadge variant="success" className="bg-green-500/10 text-green-500 border border-green-500/20 text-xs py-0 h-4">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
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
