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
  ReferenceLine
} from 'recharts';
import { 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck,
  Clock,
  Info,
  Server,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

import { PageHeader } from '../components/ui/PageHeader';
import { MetricCard } from '../components/ui/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ChartContainer } from '../components/ui/ChartContainer';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

// Integrate live backend data via React Query
import { usePredictionWorkspaceData } from '../api/hooks/usePrediction';

export default function Prediction() {
  const [activeTab, setActiveTab] = useState('basis-weight');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch live workspace data
  const { data, isLoading, isError } = usePredictionWorkspaceData();

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
          <LoadingSkeleton className="h-10 w-32" />
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
        <Card><CardContent className="p-6"><LoadingSkeleton className="h-24 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-destructive">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-lg font-bold">Failed to load Prediction Workspace</h2>
        <p className="text-sm">Please check your backend connection or refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* --- TOP SECTION --- */}
      <PageHeader 
        title="Prediction Workspace" 
        description="M3 - Forecasts potential quality deviations during transition."
        action={
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium tracking-wide">{currentTime.toLocaleTimeString()}</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground">Current Grade:</span>
              <span className="text-sm font-semibold text-foreground">{data.currentGrade}</span>
              <span className="text-xs text-muted-foreground mx-1">→</span>
              <span className="text-sm font-semibold text-primary">{data.targetGrade}</span>
            </div>
            <div className="mt-2">
              {data.statusWarning ? (
                <StatusBadge variant="warning">DEVIATION PREDICTED</StatusBadge>
              ) : (
                <StatusBadge variant="success">TRAJECTORY SAFE</StatusBadge>
              )}
            </div>
          </div>
        }
      />

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Floating Telemetry Sidebar */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="lg:col-span-3 flex flex-col space-y-6"
        >
          <div className="rounded-xl border border-transparent    p-5 space-y-6">
            <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">Core Telemetry</h3>
            
            <div className="space-y-1">
              <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground/80 flex items-center gap-2">
                <Target className="h-3 w-3 text-primary" /> {data.metrics[0]?.title || "Current Basis Weight"}
              </span>
              <div className="text-3xl font-bold tracking-tighter text-foreground">
                <AnimatedNumber value={data.metrics[0]?.value || "-"} />
              </div>
            </div>

            <div className="border-t border-transparent pt-4 space-y-1">
              <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground/80 flex items-center gap-2">
                <TrendingUp className={`h-3 w-3 ${data.metrics[1]?.isWarning ? 'text-gci-amber' : 'text-accent'}`} /> {data.metrics[1]?.title || "Predicted Basis Weight"}
              </span>
              <div className="text-3xl font-bold tracking-tighter text-foreground">
                <AnimatedNumber value={data.metrics[1]?.value || "-"} />
              </div>
            </div>

            <div className="border-t border-transparent pt-4 space-y-1">
              <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground/80 flex items-center gap-2">
                <AlertTriangle className={`h-3 w-3 ${data.metrics[2]?.isDestructive ? 'text-destructive' : 'text-muted-foreground'}`} /> {data.metrics[2]?.title || "Expected Deviation"}
              </span>
              <div className="text-xl font-bold tracking-tighter text-foreground">
                <AnimatedNumber value={data.metrics[2]?.value || "-"} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-transparent    p-5 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground/80 block">Confidence</span>
              <div className="text-lg font-bold text-green-500">
                <AnimatedNumber value={data.metrics[3]?.value || "-"} />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground/80 block">Risk Level</span>
              <div className={`text-lg font-bold ${data.metrics[4]?.isDestructive ? 'text-destructive' : 'text-green-500'}`}>
                {data.metrics[4]?.value || "-"}
              </div>
            </div>
            <div className="space-y-1 col-span-2 pt-2 border-t border-transparent">
              <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground/80 block">Stabilization Time</span>
              <div className="text-lg font-bold text-foreground">
                {data.metrics[5]?.value || "-"}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CENTER PANEL: Interactive Charts */}
        <div className="lg:col-span-6 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden border-transparent   ">
            <CardHeader className="pb-0 border-b border-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Forecast Trajectory
                </CardTitle>
                <Tabs value={activeTab} className="w-[400px]">
                  <TabsList className="bg-background/50">
                    <TabsTrigger value="basis-weight">BW</TabsTrigger>
                    <TabsTrigger value="speed">Speed</TabsTrigger>
                    <TabsTrigger value="steam">Steam</TabsTrigger>
                    <TabsTrigger value="moisture">Moisture</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 mt-4 min-h-[400px]">
              <ChartContainer className="h-full border-0  rounded-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timeSeries} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.4} />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)', padding: '12px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 500 }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                      cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <ReferenceLine x="14:20" stroke="hsl(var(--destructive))" strokeDasharray="3 3" label={{ position: 'top', value: 'Now', fill: 'hsl(var(--destructive))', fontSize: 12 }} />
                    
                    {activeTab === 'basis-weight' && (
                      <>
                        <ReferenceLine y={55.0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'left', value: 'Target 55#', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <ReferenceLine y={56.375} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                        <ReferenceLine y={53.625} stroke="hsl(var(--destructive))" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="bwActual" name="Actual BW" stroke="hsl(var(--foreground))" strokeWidth={2.5} dot={false} isAnimationActive={true} animationDuration={1000} />
                        <Line type="monotone" dataKey="bwPredicted" name="Predicted BW" stroke="hsl(var(--accent))" strokeWidth={2.5} strokeDasharray="5 5" dot={false} isAnimationActive={true} animationDuration={1500} />
                        <Line type="monotone" dataKey="bwUpper" name="Upper Confidence" stroke="hsl(var(--accent))" strokeWidth={1} strokeOpacity={0.3} dot={false} isAnimationActive={true} />
                        <Line type="monotone" dataKey="bwLower" name="Lower Confidence" stroke="hsl(var(--accent))" strokeWidth={1} strokeOpacity={0.3} dot={false} isAnimationActive={true} />
                      </>
                    )}
                    
                    {activeTab === 'speed' && (
                      <>
                        <Line type="monotone" dataKey="speedActual" name="Actual Speed (fpm)" stroke="hsl(var(--foreground))" strokeWidth={2.5} dot={false} isAnimationActive={true} animationDuration={1000} />
                        <Line type="monotone" dataKey="speedPredicted" name="Predicted Speed" stroke="hsl(var(--accent))" strokeWidth={2.5} strokeDasharray="5 5" dot={false} isAnimationActive={true} animationDuration={1500} />
                      </>
                    )}

                    {activeTab === 'steam' && (
                      <>
                        <Line type="monotone" dataKey="steamActual" name="Actual Steam (psi)" stroke="hsl(var(--foreground))" strokeWidth={2.5} dot={false} isAnimationActive={true} animationDuration={1000} />
                        <Line type="monotone" dataKey="steamPredicted" name="Predicted Steam" stroke="hsl(var(--accent))" strokeWidth={2.5} strokeDasharray="5 5" dot={false} isAnimationActive={true} animationDuration={1500} />
                      </>
                    )}

                    {activeTab === 'moisture' && (
                      <>
                        <Line type="monotone" dataKey="moistActual" name="Actual Moisture (%)" stroke="hsl(var(--foreground))" strokeWidth={2.5} dot={false} isAnimationActive={true} animationDuration={1000} />
                        <Line type="monotone" dataKey="moistPredicted" name="Predicted Moisture" stroke="hsl(var(--accent))" strokeWidth={2.5} strokeDasharray="5 5" dot={false} isAnimationActive={true} animationDuration={1500} />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Insights */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="h-full border-transparent  ">
            <CardHeader className="border-b border-transparent pb-4">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <Info className="h-4 w-4 text-primary" />
                Prediction Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Top Predicted Issue</span>
                <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                  {data.insights.topIssue}
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Highest Contributing Variable</span>
                <p className="text-sm font-medium text-foreground">{data.insights.highestContributor}</p>
              </div>

              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Confidence Explanation</span>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">{data.insights.confidenceExplanation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded bg-muted/30 border border-transparent">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Horizon</span>
                  <p className="text-sm font-medium">{data.insights.forecastHorizon}</p>
                </div>
                <div className="p-3 rounded bg-muted/30 border border-transparent">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Latency</span>
                  <p className="text-sm font-medium text-green-500">{data.insights.predictionLatency}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Model Version</span>
                  <div className="flex items-center space-x-2">
                    <Server className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-mono text-muted-foreground">{data.insights.modelVersion}</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- BOTTOM: Timeline --- */}
      <Card className="border-transparent  ">
        <CardHeader className="border-b border-transparent">
          <CardTitle className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Prediction Event Timeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4 no-scrollbar">
            {data.timelineEvents.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative flex-1 min-w-[220px] p-4 rounded-lg border  ${
                  item.active ? 'border-transparent bg-primary/10 shadow-[0_4px_20px_-5px_rgba(229,34,34,0.2)]' : 
                  item.warning ? 'border-destructive/50 bg-destructive/10' : 'border-transparent '
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-mono tracking-wider text-muted-foreground">{item.time}</span>
                  {item.active && <span className="flex h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(229,34,34,1)] animate-pulse"></span>}
                </div>
                <h4 className={`text-sm font-bold mb-1 tracking-tight ${item.warning ? 'text-destructive' : item.active ? 'text-primary' : 'text-foreground'}`}>
                  {item.event}
                </h4>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">{item.details}</p>
                
                {/* Arrow connector for desktop */}
                {idx < data.timelineEvents.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-border/50 z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
