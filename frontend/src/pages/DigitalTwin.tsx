import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';
import { 
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Target, 
  Clock, 
  AlertTriangle, 
  Layers,
  Thermometer,
  Waves,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ChartContainer } from '../components/ui/ChartContainer';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

import { useDigitalTwinWorkspaceData } from '../api/hooks/useDigitalTwin';

export default function DigitalTwin() {
  const [activeTab, setActiveTab] = useState('basis-weight');
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data, isLoading, isError } = useDigitalTwinWorkspaceData();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <LoadingSkeleton className="lg:col-span-3 h-[400px] rounded-xl" />
          <LoadingSkeleton className="lg:col-span-6 h-[400px] rounded-xl" />
          <LoadingSkeleton className="lg:col-span-3 h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Failed to load Digital Twin</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Digital Twin Simulation" 
        description="M9 - High-fidelity physics simulation forecasting future state trajectories."
        action={
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium tracking-wide">{currentTime.toLocaleTimeString()} Local Time</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Transition</span>
              <span className="text-sm font-semibold">{data.transitionId}</span>
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest font-bold px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20 flex items-center gap-1"><Play className="h-3 w-3" /> SIMULATION COMPLETE</span>
              <span className="text-xs uppercase tracking-widest font-bold px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> {data.confidence}% CONF.</span>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: The Comparison */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="p-4 border-b border-border/50 bg-muted/20">
              <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Baseline vs AI Strategy</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-6">
              <div className="p-4 rounded-lg bg-background border border-border/50 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive"></div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1 block">Current Path (No Action)</span>
                <div className="text-xl font-bold text-destructive mb-2">{data.metrics[0]?.value}</div>
                <p className="text-xs text-muted-foreground">{data.metrics[0]?.description}</p>
              </div>

              <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/30 relative overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-green-500 mb-1 block flex justify-between">
                  Simulated Path (AI Action)
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                <div className="text-xl font-bold text-green-500 mb-2">{data.metrics[1]?.value}</div>
                <p className="text-xs text-muted-foreground">{data.metrics[1]?.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-px bg-border/50">
               <div className="bg-card p-4 text-center">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1">Expected Quality</span>
                 <span className="text-sm font-bold text-foreground">{data.metrics[4]?.value}</span>
               </div>
               <div className="bg-card p-4 text-center">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-1">Time to Target</span>
                 <span className="text-sm font-bold font-mono text-foreground">{data.metrics[3]?.value}</span>
               </div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Interactive Charts */}
        <div className="lg:col-span-6 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden border-border shadow-sm relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <CardHeader className="pb-0 border-b border-border/50 bg-muted/20 z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Trajectory Simulation
                </CardTitle>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto overflow-x-auto">
                  <TabsList className="inline-flex flex-wrap bg-background/50 border border-border/50">
                    <TabsTrigger value="basis-weight" className="text-xs uppercase tracking-widest">BW</TabsTrigger>
                    <TabsTrigger value="speed" className="text-xs uppercase tracking-widest">Speed</TabsTrigger>
                    <TabsTrigger value="steam" className="text-xs uppercase tracking-widest">Steam</TabsTrigger>
                    <TabsTrigger value="moisture" className="text-xs uppercase tracking-widest">Moisture</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 min-h-[400px] z-10 bg-background/50">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.timeSeries} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.3} />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} dx={-10} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '20px' }} />
                  
                  {/* Execution Marker */}
                  <ReferenceLine x="14:20" stroke="hsl(var(--primary))" strokeDasharray="3 3" strokeWidth={2} label={{ position: 'insideTopLeft', value: 'EXECUTE AI', fill: 'hsl(var(--primary))', fontSize: 10, fontWeight: 'bold' }} />

                  {activeTab === 'basis-weight' && (
                    <>
                      <ReferenceLine y={55.0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'left', value: 'Target', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                      <Area type="monotone" dataKey="bwUpper" fill="none" stroke="none" />
                      <Area type="monotone" dataKey="bwLower" fill="none" stroke="none" />
                      <Line type="monotone" dataKey="bwActual" name="Actual Baseline" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="bwSimulated" name="AI Simulated Trajectory" stroke="#10B981" strokeWidth={3} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                    </>
                  )}
                  
                  {activeTab === 'speed' && (
                    <>
                      <Line type="monotone" dataKey="speedActual" name="Baseline Speed" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="speedSimulated" name="Simulated Speed" stroke="hsl(var(--primary))" strokeWidth={3} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                    </>
                  )}

                  {activeTab === 'steam' && (
                    <>
                      <Line type="monotone" dataKey="steamActual" name="Baseline Steam" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="steamSimulated" name="Simulated Steam" stroke="#EAB308" strokeWidth={3} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                    </>
                  )}

                  {activeTab === 'moisture' && (
                    <>
                      <Line type="monotone" dataKey="moistActual" name="Baseline Moisture" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="moistSimulated" name="Simulated Moisture" stroke="#3B82F6" strokeWidth={3} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                    </>
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Insights */}
        <div className="lg:col-span-3 flex flex-col space-y-6">
          <Card className="flex-1 border-border shadow-sm flex flex-col">
            <div className="p-4 border-b border-border/50 bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Cpu className="h-4 w-4" />
                Validation Constraints
              </CardTitle>
            </div>
            <CardContent className="p-6 flex-1 flex flex-col gap-6">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-1 mb-2">
                  <Cpu className="h-3 w-3" /> Physics Engine
                </span>
                <div className="bg-green-500/10 text-green-500 text-xs font-bold px-3 py-1.5 rounded w-fit border border-green-500/20">{data.insights.physicsValidation}</div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{data.insights.physicsExplanation}</p>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-1 mb-2">
                  <ShieldCheck className="h-3 w-3" /> Safety Engine
                </span>
                <div className="bg-green-500/10 text-green-500 text-xs font-bold px-3 py-1.5 rounded w-fit border border-green-500/20">{data.insights.safetyValidation}</div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{data.insights.safetyExplanation}</p>
              </div>
              
              <div className="mt-auto bg-muted/30 p-4 rounded-xl border border-border/50">
                 <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground block mb-2">Engineering Notes</span>
                 <p className="text-xs text-foreground/80 font-medium italic">{data.insights.engineeringNotes}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
