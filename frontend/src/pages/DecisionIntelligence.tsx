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
  FastForward,
  Lock
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

  const { data, isLoading, isError } = useDecisionWorkspaceData();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <LoadingSkeleton className="lg:col-span-8 h-[500px] rounded-xl" />
          <LoadingSkeleton className="lg:col-span-4 h-[500px] rounded-xl" />
        </div>
        <LoadingSkeleton className="h-[300px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Failed to load Decision Intelligence</h2>
      </div>
    );
  }

  // Derive gauge data from backend overall confidence
  const gaugeData = [
    { name: 'Confidence', value: data.overallConfidence },
    { name: 'Uncertainty', value: 100 - data.overallConfidence },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Decision Fusion Engine" 
        description="M10 - Aggregation of all subsystem inferences into a finalized probabilistic consensus."
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Decision Fusion Visualizer */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden border-border shadow-sm">
            <CardHeader className="pb-0 border-b border-border/50 bg-muted/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <CardTitle className="shrink-0 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Scale className="h-4 w-4" />
                  Neural Fusion Weights
                </CardTitle>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-[400px]">
                  <TabsList className="bg-background/50 grid grid-cols-3 border border-border/50">
                    <TabsTrigger value="radar" className="text-xs uppercase tracking-widest">Radar</TabsTrigger>
                    <TabsTrigger value="bar" className="text-xs uppercase tracking-widest">Weights</TabsTrigger>
                    <TabsTrigger value="gauge" className="text-xs uppercase tracking-widest">Gauge</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 mt-4 min-h-[400px] flex items-center justify-center bg-background/30 relative">
              
              {activeTab === 'radar' && (
                <ChartContainer className="h-full w-full border-0 p-0">
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
                <ChartContainer className="h-full w-full border-0 p-0">
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
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
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
                    <span className="text-[10px] font-bold uppercase text-muted-foreground mt-2 tracking-widest">Final Probabilistic Score</span>
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
          className="lg:col-span-4 flex flex-col space-y-6"
        >
          <div className="rounded-xl border border-border bg-card shadow-sm p-5 space-y-5">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2 flex items-center gap-2">
              <Cpu className="h-4 w-4" /> Agentic Subsystems
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 p-3 rounded-xl bg-background border border-border/50">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5"><Activity className="h-3 w-3 text-primary" /> Prediction</span>
                <div className="text-lg font-bold text-foreground font-mono"><AnimatedNumber value={data.metrics[0]?.value || "-"} /></div>
              </div>
              <div className="space-y-1 p-3 rounded-xl bg-background border border-border/50">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5"><Search className="h-3 w-3 text-primary" /> Root Cause</span>
                <div className="text-lg font-bold text-foreground font-mono"><AnimatedNumber value={data.metrics[1]?.value || "-"} /></div>
              </div>
              <div className="space-y-1 p-3 rounded-xl bg-background border border-border/50">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5"><BrainCircuit className="h-3 w-3 text-primary" /> Similarity</span>
                <div className="text-lg font-bold text-foreground font-mono"><AnimatedNumber value={data.metrics[2]?.value || "-"} /></div>
              </div>
              <div className="space-y-1 p-3 rounded-xl bg-background border border-border/50">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5"><ThumbsUp className="h-3 w-3 text-primary" /> Rec Engine</span>
                <div className="text-lg font-bold text-foreground font-mono"><AnimatedNumber value={data.metrics[3]?.value || "-"} /></div>
              </div>
              <div className="space-y-1 p-3 rounded-xl bg-background border border-border/50">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5"><Cpu className="h-3 w-3 text-primary" /> Dig Twin</span>
                <div className="text-lg font-bold text-foreground font-mono"><AnimatedNumber value={data.metrics[4]?.value || "-"} /></div>
              </div>
              <div className="space-y-1 p-3 rounded-xl bg-background border border-border/50">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1.5"><FastForward className="h-3 w-3 text-primary" /> Timeline</span>
                <div className="text-lg font-bold text-foreground font-mono"><AnimatedNumber value={data.metrics[5]?.value || "-"} /></div>
              </div>
            </div>
          </div>
          
          <Card className={`flex-1 border shadow-sm ${data.finalDecision === 'APPROVE' ? 'border-green-500/20 bg-green-500/5' : data.finalDecision === 'REVIEW' ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-destructive/20 bg-destructive/5'}`}>
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className={`flex items-center gap-2 text-sm uppercase tracking-widest font-bold ${data.finalDecision === 'APPROVE' ? 'text-green-500' : data.finalDecision === 'REVIEW' ? 'text-yellow-500' : 'text-destructive'}`}>
                {data.finalDecision === 'APPROVE' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                Decision Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              
              <div className="flex justify-between items-end border-b border-border/50 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-1">Risk Assessment</span>
                  <div className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded w-fit ${data.riskAssessment === 'MINIMAL' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : data.riskAssessment === 'MODERATE' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                    <ShieldCheck className="h-3 w-3 inline mr-1" /> {data.riskAssessment}
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-1">Reliability</span>
                  <div className="text-sm font-bold text-foreground">{data.overallReliability}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-2">Engineering Summary</span>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium italic">{data.engineeringSummary}</p>
              </div>

              <div className="pt-4 border-t border-border/50">
                <button 
                  disabled
                  className="w-full py-3 font-bold tracking-widest uppercase text-xs rounded-lg transition-all border border-muted-foreground/30 bg-muted/20 text-muted-foreground/50 flex justify-center items-center gap-2 cursor-not-allowed"
                >
                  <Lock className="h-4 w-4" />
                  Coming Soon: Direct DCS Execution
                </button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* --- BOTTOM SECTION: Decision Assessment Table --- */}
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-xs uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" /> Subsystem Audit Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable headers={['Subsystem', 'Confidence', 'Fusion Weight', 'Net Contribution', 'Status', 'Notes']}>
            {data.assessmentTable.map((row, idx) => (
              <DataTableRow key={idx} className="hover:bg-muted/30 transition-colors border-border/50">
                <DataTableCell className="font-bold text-foreground text-xs uppercase tracking-widest">{row.subsystem}</DataTableCell>
                <DataTableCell className="font-mono text-muted-foreground">
                  <AnimatedNumber value={row.confidence} />
                </DataTableCell>
                <DataTableCell className="font-mono text-muted-foreground">{row.weight}</DataTableCell>
                <DataTableCell>
                  <span className="font-mono font-bold text-primary">
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
