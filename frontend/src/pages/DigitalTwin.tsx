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
  Cpu, 
  CheckCircle2, 
  ShieldCheck, 
  Activity, 
  Target, 
  Clock, 
  AlertTriangle, 
  Layers,
  Thermometer,
  Waves
} from 'lucide-react';

import { PageHeader } from '../components/ui/PageHeader';
import { MetricCard } from '../components/ui/MetricCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ChartContainer } from '../components/ui/ChartContainer';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

// Integrate live backend data via React Query
import { useDigitalTwinWorkspaceData } from '../api/hooks/useDigitalTwin';

export default function DigitalTwin() {
  const [activeTab, setActiveTab] = useState('basis-weight');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch live workspace data
  const { data, isLoading, isError } = useDigitalTwinWorkspaceData();

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
        <Card><CardContent className="p-6"><LoadingSkeleton className="h-24 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-destructive">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-lg font-bold">Failed to load Digital Twin Workspace</h2>
        <p className="text-sm">Please check your backend connection or refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* --- TOP SECTION --- */}
      <PageHeader 
        title="Digital Twin Simulation Workspace" 
        description="M9 - Physics-informed trajectory forecasting of recommended setpoints."
        action={
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium">{currentTime.toLocaleTimeString()} Local Time</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground">Transition:</span>
              <span className="text-sm font-semibold">{data.transitionId}</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <StatusBadge variant="success">SIMULATION COMPLETE</StatusBadge>
              <StatusBadge variant="outline" className="border-green-500 text-green-500">
                <ShieldCheck className="h-3 w-3 mr-1" />
                {data.confidence}% CONFIDENCE
              </StatusBadge>
              <StatusBadge variant="outline" className="border-muted-foreground text-muted-foreground">
                <Cpu className="h-3 w-3 mr-1" />
                {data.dtVersion}
              </StatusBadge>
            </div>
          </div>
        }
      />

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Simulation Summary */}
        <div className="lg:col-span-3 space-y-4">
          <MetricCard 
            title={data.metrics[0]?.title || "Current Operating State"}
            value={data.metrics[0]?.value || "-"} 
            description={data.metrics[0]?.description}
            icon={<AlertTriangle className={`h-4 w-4 ${data.metrics[0]?.isWarning ? 'text-gci-amber' : ''}`} />}
          />
          <MetricCard 
            title={data.metrics[1]?.title || "Simulated Operating State"}
            value={data.metrics[1]?.value || "-"} 
            description={data.metrics[1]?.description}
            icon={<CheckCircle2 className={`h-4 w-4 ${data.metrics[1]?.isSuccess ? 'text-green-500' : ''}`} />}
          />
          <MetricCard 
            title={data.metrics[2]?.title || "Expected Basis Weight"}
            value={data.metrics[2]?.value || "-"} 
            description={data.metrics[2]?.description}
            icon={<Target className="h-4 w-4" />}
          />
          <MetricCard 
            title={data.metrics[3]?.title || "Est. Stabilization Time"}
            value={data.metrics[3]?.value || "-"} 
            description={data.metrics[3]?.description}
            icon={<Clock className="h-4 w-4" />}
          />
          <MetricCard 
            title={data.metrics[4]?.title || "Predicted Quality"}
            value={data.metrics[4]?.value || "-"} 
            description={data.metrics[4]?.description}
            icon={<Layers className="h-4 w-4" />}
          />
          <MetricCard 
            title={data.metrics[5]?.title || "Simulation Confidence"}
            value={data.metrics[5]?.value || "-"} 
            description={data.metrics[5]?.description}
            icon={<ShieldCheck className={`h-4 w-4 ${data.metrics[5]?.isSuccess ? 'text-green-500' : ''}`} />}
          />
        </div>

        {/* CENTER PANEL: Interactive Charts */}
        <div className="lg:col-span-6 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-0 border-b border-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="shrink-0">Digital Twin Trajectory</CardTitle>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full overflow-x-auto">
                  <TabsList className="inline-flex flex-wrap">
                    <TabsTrigger value="basis-weight">Basis Weight</TabsTrigger>
                    <TabsTrigger value="speed">Speed</TabsTrigger>
                    <TabsTrigger value="steam">Steam</TabsTrigger>
                    <TabsTrigger value="moisture">Moisture</TabsTrigger>
                    <TabsTrigger value="headbox">Headbox</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 mt-4 min-h-[400px]">
              <ChartContainer className="h-full border-0  rounded-none">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.timeSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    
                    {/* Universal Markers */}
                    <ReferenceLine x="14:20" stroke="hsl(var(--primary))" strokeDasharray="3 3" label={{ position: 'top', value: 'Execute', fill: 'hsl(var(--primary))', fontSize: 12 }} />
                    <ReferenceLine x="14:32" stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'top', value: 'Stabilized', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <ReferenceLine x="14:34" stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'top', value: 'Complete', fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />

                    {activeTab === 'basis-weight' && (
                      <>
                        <ReferenceLine y={55.0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" label={{ position: 'left', value: 'Target 55#', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                        <Line type="monotone" dataKey="bwActual" name="Actual BW" stroke="#2D3748" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="bwSimulated" name="Simulated BW" stroke="#10B981" strokeWidth={3} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="bwUpper" name="Upper Bound" stroke="#10B981" strokeWidth={1} strokeOpacity={0.3} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="bwLower" name="Lower Bound" stroke="#10B981" strokeWidth={1} strokeOpacity={0.3} dot={false} isAnimationActive={false} />
                      </>
                    )}
                    
                    {activeTab === 'speed' && (
                      <>
                        <Line type="monotone" dataKey="speedActual" name="Actual Speed (fpm)" stroke="#2D3748" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="speedSimulated" name="Simulated Speed" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                      </>
                    )}

                    {activeTab === 'steam' && (
                      <>
                        <Line type="monotone" dataKey="steamActual" name="Actual Steam (psi)" stroke="#2D3748" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="steamSimulated" name="Simulated Steam" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                      </>
                    )}

                    {activeTab === 'moisture' && (
                      <>
                        <Line type="monotone" dataKey="moistActual" name="Actual Moisture (%)" stroke="#2D3748" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="moistSimulated" name="Simulated Moisture" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
                      </>
                    )}

                    {activeTab === 'headbox' && (
                      <>
                        <Line type="monotone" dataKey="headboxActual" name="Actual Headbox Flow (gpm)" stroke="#2D3748" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line type="monotone" dataKey="headboxSimulated" name="Simulated Headbox Flow" stroke="#F59E0B" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
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
          <Card className="h-full">
            <CardHeader className="pb-3 border-b border-transparent">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Simulation Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Cpu className="h-3 w-3" />
                  Physics Validation
                </span>
                <p className="text-sm font-medium mt-1 text-green-500">{data.insights.physicsValidation}</p>
                <p className="text-xs text-muted-foreground mt-1">{data.insights.physicsExplanation}</p>
              </div>

              <div className="pt-3 border-t border-transparent">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Safety Validation
                </span>
                <p className="text-sm font-medium mt-1 text-green-500">{data.insights.safetyValidation}</p>
                <p className="text-xs text-muted-foreground mt-1">{data.insights.safetyExplanation}</p>
              </div>

              <div className="pt-3 border-t border-transparent">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Waves className="h-3 w-3" />
                  Process Stability
                </span>
                <p className="text-sm font-medium mt-1">{data.insights.processStability}</p>
              </div>

              <div className="pt-3 border-t border-transparent grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Expected Oscillations</span>
                  <p className="text-sm font-bold mt-1 text-green-500">{data.insights.expectedOscillations}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Predicted Alarms</span>
                  <p className="text-sm font-bold mt-1 text-green-500">{data.insights.predictedAlarms}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-transparent bg-muted/50 p-3 rounded-md">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Engineering Notes</span>
                <p className="text-sm mt-1">{data.insights.engineeringNotes}</p>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* --- BOTTOM: Timeline --- */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation Event Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 overflow-x-auto pb-2">
            {data.timelineEvents.map((item, idx) => (
              <div 
                key={idx} 
                className={`relative flex-1 min-w-[180px] p-4 rounded-lg border ${
                  item.active ? 'border-primary bg-primary/5 ' : 
                  item.highlight ? 'border-green-500 bg-green-500/5 ring-1 ring-green-500/20 ' : 'border-transparent '
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">{item.time}</span>
                  {item.active && <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>}
                  {item.highlight && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
                <h4 className={`text-sm font-bold mb-1 ${item.highlight ? 'text-green-500' : 'text-foreground'}`}>
                  {item.event}
                </h4>
                <p className="text-xs text-muted-foreground">{item.details}</p>
                
                {/* Arrow connector for desktop */}
                {idx < data.timelineEvents.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-[2px] bg-border z-10" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
