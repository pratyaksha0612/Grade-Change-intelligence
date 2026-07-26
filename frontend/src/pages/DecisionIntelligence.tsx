import { useState, useEffect } from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Zap, 
  Cpu, 
  Clock, 
  Scale,
  BrainCircuit,
  Search,
  ThumbsUp,
  FastForward
} from 'lucide-react';

import { motion } from 'framer-motion';

import { PageHeader } from '../components/ui/PageHeader';
import { MetricCard } from '../components/ui/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ChartContainer } from '../components/ui/ChartContainer';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { DataTable, DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

// Integrate live backend data via React Query
import { useDecisionWorkspaceData } from '../api/hooks/useDecisionIntelligence';

const GAUGE_COLORS = ['#10B981', '#E2E8F0'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

export default function DecisionIntelligence() {
  const [activeTab, setActiveTab] = useState('radar');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);

  const handleExecute = () => {
    setExecutionStatus('Executing...');
    setTimeout(() => setExecutionStatus('Execution Complete'), 2000);
  };

  // Fetch live workspace data
  const { data, isLoading, isError } = useDecisionWorkspaceData();

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
          <div className="lg:col-span-3 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}><CardContent className="p-4"><LoadingSkeleton className="h-12 w-full" /></CardContent></Card>
            ))}
          </div>
          <div className="lg:col-span-6 flex flex-col">
            <Card className="flex-1 min-h-[400px]"><CardContent className="p-6 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <Card className="h-full min-h-[300px]"><CardContent className="p-6 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
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
        <h2 className="text-lg font-bold">Failed to load Decision Intelligence Workspace</h2>
        <p className="text-sm">Please check your backend connection or refresh the page.</p>
      </div>
    );
  }

  // Derive gauge data from backend overall confidence
  const gaugeData = [
    { name: 'Confidence', value: data.overallConfidence },
    { name: 'Uncertainty', value: 100 - data.overallConfidence },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* --- TOP SECTION --- */}
      <PageHeader 
        title="Decision Intelligence Workspace" 
        description="M10 - Fusion of all AI subsystems into a final, reliable decision."
        action={
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium tracking-wide">{currentTime.toLocaleTimeString()} Local Time</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Transition</span>
              <span className="text-sm font-semibold text-foreground">{data.transitionId}</span>
            </div>
            <div className="mt-2 flex space-x-2 items-center">
              <StatusBadge variant={
                data.finalDecision === 'APPROVE' ? 'success' :
                data.finalDecision === 'REVIEW' ? 'warning' : 'destructive'
              }>
                {data.finalDecision}
              </StatusBadge>
              <StatusBadge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <AnimatedNumber value={data.overallConfidence} />% CONFIDENCE
              </StatusBadge>
            </div>
          </div>
        }
      />

      {/* --- MAIN EXECUTIVE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Decision Fusion Visualizer */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden border-transparent   ">
            <CardHeader className="pb-0 border-b border-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="shrink-0 flex items-center gap-2">
                  <Scale className="h-5 w-5 text-primary" />
                  Decision Fusion Visualizer
                </CardTitle>
                <Tabs value={activeTab} className="w-full sm:w-[450px]">
                  <TabsList className="bg-background/50 grid grid-cols-3">
                    <TabsTrigger value="radar">Radar</TabsTrigger>
                    <TabsTrigger value="bar">Weights</TabsTrigger>
                    <TabsTrigger value="gauge">Gauge</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 mt-4 min-h-[400px] flex items-center justify-center">
              
              {activeTab === 'radar' && (
                <ChartContainer className="h-full w-full border-0  p-0">
                  <ResponsiveContainer width="100%" height={380}>
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data.fusionData}>
                      <PolarGrid stroke="hsl(var(--border))" opacity={0.5} />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <Radar name="Confidence %" dataKey="confidence" stroke="hsl(var(--primary))" strokeWidth={2} fill="hsl(var(--primary))" fillOpacity={0.2} isAnimationActive={true} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 500 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {activeTab === 'bar' && (
                <ChartContainer className="h-full w-full border-0  p-0">
                  <ResponsiveContainer width="100%" height={380}>
                    <BarChart layout="vertical" data={data.fusionData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.4} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" domain={[0, 100]} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis dataKey="subject" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="weight" name="Model Weight (%)" stackId="a" fill="hsl(var(--muted))" radius={[0, 0, 0, 0]} isAnimationActive={true} />
                      <Bar dataKey="contribution" name="Active Contribution (%)" stackId="a" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} isAnimationActive={true} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {activeTab === 'gauge' && (
                <div className="flex flex-col items-center justify-center w-full h-full relative">
                  <ResponsiveContainer width="100%" height={380}>
                    <PieChart>
                      <Pie
                        data={gaugeData}
                        cx="50%"
                        cy="65%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius="65%"
                        outerRadius="85%"
                        paddingAngle={0}
                        dataKey="value"
                        stroke="none"
                        isAnimationActive={true}
                      >
                        {gaugeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-[55%] flex flex-col items-center">
                    <span className="text-5xl font-bold text-foreground">
                      <AnimatedNumber value={data.overallConfidence} />%
                    </span>
                    <span className="text-xs font-semibold uppercase text-muted-foreground mt-2 tracking-widest">Final Fusion Score</span>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Subsystem Confidence (Floating Sidebar) */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="lg:col-span-4 flex flex-col space-y-4"
        >
          <div className="rounded-xl border border-transparent    p-5 space-y-5">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">Subsystem Confidence Levels</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 p-3 rounded bg-background/50 border border-transparent">
                <span className="text-sm uppercase text-muted-foreground font-semibold flex items-center gap-1.5"><Activity className="h-3 w-3 text-primary" /> Prediction</span>
                <div className="text-xl font-bold text-foreground"><AnimatedNumber value={data.metrics[0]?.value || "-"} /></div>
              </div>
              <div className="space-y-1 p-3 rounded bg-background/50 border border-transparent">
                <span className="text-sm uppercase text-muted-foreground font-semibold flex items-center gap-1.5"><Search className="h-3 w-3 text-accent" /> Root Cause</span>
                <div className="text-xl font-bold text-foreground"><AnimatedNumber value={data.metrics[1]?.value || "-"} /></div>
              </div>
              <div className="space-y-1 p-3 rounded bg-background/50 border border-transparent">
                <span className="text-sm uppercase text-muted-foreground font-semibold flex items-center gap-1.5"><BrainCircuit className="h-3 w-3 text-primary" /> Similarity</span>
                <div className="text-xl font-bold text-foreground"><AnimatedNumber value={data.metrics[2]?.value || "-"} /></div>
              </div>
              <div className="space-y-1 p-3 rounded bg-background/50 border border-transparent">
                <span className="text-sm uppercase text-muted-foreground font-semibold flex items-center gap-1.5"><ThumbsUp className="h-3 w-3 text-accent" /> Rec. Engine</span>
                <div className="text-xl font-bold text-foreground"><AnimatedNumber value={data.metrics[3]?.value || "-"} /></div>
              </div>
              <div className="space-y-1 p-3 rounded bg-background/50 border border-transparent">
                <span className="text-sm uppercase text-muted-foreground font-semibold flex items-center gap-1.5"><Cpu className="h-3 w-3 text-primary" /> Digital Twin</span>
                <div className="text-xl font-bold text-foreground"><AnimatedNumber value={data.metrics[4]?.value || "-"} /></div>
              </div>
              <div className="space-y-1 p-3 rounded bg-background/50 border border-transparent">
                <span className="text-sm uppercase text-muted-foreground font-semibold flex items-center gap-1.5"><FastForward className="h-3 w-3 text-accent" /> Timeline</span>
                <div className="text-xl font-bold text-foreground"><AnimatedNumber value={data.metrics[5]?.value || "-"} /></div>
              </div>
            </div>
          </div>
          
          <Card className={`flex-1  border ${data.finalDecision === 'APPROVE' ? 'border-transparent' : data.finalDecision === 'REVIEW' ? 'border-gci-amber/50' : 'border-destructive/50'}`}>
            <CardHeader className={`pb-3 border-b border-transparent ${data.finalDecision === 'APPROVE' ? 'bg-primary/5' : data.finalDecision === 'REVIEW' ? 'bg-gci-amber/5' : 'bg-destructive/5'}`}>
              <CardTitle className={`flex items-center gap-2 text-sm uppercase tracking-widest font-bold ${data.finalDecision === 'APPROVE' ? 'text-primary' : data.finalDecision === 'REVIEW' ? 'text-gci-amber' : 'text-destructive'}`}>
                {data.finalDecision === 'APPROVE' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                Decision Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              
              <div className="flex justify-between items-end border-b border-transparent pb-3">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Risk Assessment</span>
                  <p className={`text-sm font-bold flex items-center ${data.riskAssessment === 'MINIMAL' ? 'text-green-500' : data.riskAssessment === 'MODERATE' ? 'text-gci-amber' : 'text-destructive'}`}>
                    <ShieldCheck className="h-4 w-4 mr-1" /> {data.riskAssessment}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Reliability</span>
                  <p className="text-sm font-bold text-foreground">{data.overallReliability}</p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Engineering Summary</span>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">{data.engineeringSummary}</p>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleExecute}
                  disabled={executionStatus !== null}
                  className={`w-full py-2.5 font-bold tracking-wide uppercase text-xs rounded transition-all shadow-[0_0_15px_rgba(229,34,34,0.15)] disabled: ${
                    executionStatus === 'Execution Complete' 
                    ? 'bg-green-500/20 text-green-500 border border-green-500/50' 
                    : 'bg-primary/10 border border-transparent text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_25px_rgba(229,34,34,0.4)] disabled:opacity-50 disabled:bg-primary/10 disabled:text-primary'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {executionStatus === 'Executing...' ? <Zap className="h-3 w-3 animate-pulse" /> : 
                     executionStatus === 'Execution Complete' ? <CheckCircle2 className="h-3 w-3" /> :
                     <Zap className="h-3 w-3" />}
                    {executionStatus || (data.finalDecision === 'APPROVE' ? 'Execute Transition' : 'Force Manual Review')}
                  </span>
                </button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* --- BOTTOM SECTION: Decision Assessment Table --- */}
      <Card className="border-transparent  ">
        <CardHeader className="border-b border-transparent">
          <CardTitle className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Subsystem Assessment Audit Log</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <DataTable headers={['Subsystem', 'Confidence', 'Fusion Weight', 'Net Contribution', 'Status', 'Notes']}>
            {data.assessmentTable.map((row, idx) => (
              <DataTableRow key={idx}>
                <DataTableCell className="font-semibold text-foreground">{row.subsystem}</DataTableCell>
                <DataTableCell className="font-mono text-muted-foreground">
                  <AnimatedNumber value={row.confidence} />
                </DataTableCell>
                <DataTableCell className="font-mono text-muted-foreground">{row.weight}</DataTableCell>
                <DataTableCell>
                  <span className="font-mono font-medium text-primary">
                    +<AnimatedNumber value={row.contribution} />
                  </span>
                </DataTableCell>
                <DataTableCell>
                  <StatusBadge variant={
                    row.status === 'CRITICAL' ? 'success' :
                    row.status === 'HIGH' ? 'success' : 
                    row.status === 'MODERATE' ? 'warning' : 'destructive'
                  }>
                    {row.status}
                  </StatusBadge>
                </DataTableCell>
                <DataTableCell className="text-xs text-muted-foreground max-w-sm truncate" title={row.note}>
                  {row.note}
                </DataTableCell>
              </DataTableRow>
            ))}
          </DataTable>
        </CardContent>
      </Card>

    </div>
  );
}
