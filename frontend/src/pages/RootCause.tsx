import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  Cell,
  Legend
} from 'recharts';
import { 
  AlertTriangle, 
  ShieldCheck,
  TrendingUp, 
  TrendingDown,
  Info,
  Activity,
  ListOrdered
} from 'lucide-react';
import { motion } from 'framer-motion';

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ChartContainer } from '../components/ui/ChartContainer';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { DataTable, DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

import { useRootCauseWorkspaceData } from '../api/hooks/useRootCause';

export default function RootCause() {
  const [activeTab, setActiveTab] = useState('contribution');
  const [currentTime, setCurrentTime] = useState(new Date());

  const { data, isLoading, isError } = useRootCauseWorkspaceData();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <LoadingSkeleton className="lg:col-span-3 h-[600px] rounded-xl" />
          <LoadingSkeleton className="lg:col-span-6 h-[600px] rounded-xl" />
          <LoadingSkeleton className="lg:col-span-3 h-[600px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Failed to load Root Cause</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="Root Cause Analysis" 
        description="M4 - Feature attribution and diagnostic explanations of detected process drift."
        action={
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium tracking-wide">{currentTime.toLocaleTimeString()} Local Time</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Transition</span>
              <span className="text-sm font-semibold text-foreground">{data.transitionId}</span>
            </div>
            <div className="mt-2 flex space-x-2">
              <StatusBadge variant="destructive" className="animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]">DEVIATION DETECTED</StatusBadge>
              <StatusBadge variant="success" className="bg-green-500/10 text-green-500 border border-green-500/30">
                <ShieldCheck className="h-3 w-3 mr-1" />
                <AnimatedNumber value={data.confidence} />% CONFIDENCE
              </StatusBadge>
            </div>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Ranked Root Causes */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 border-border shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <ListOrdered className="h-4 w-4" />
                Top Root Causes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 bg-background/50">
              <div className="overflow-y-auto max-h-[600px] no-scrollbar">
                {data.rootCauses.map((cause) => (
                  <div key={cause.rank} className="flex items-center justify-between p-4 border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <span className="text-xs font-bold text-muted-foreground/50 w-4 text-right uppercase">#{cause.rank}</span>
                      <div>
                        <p className="text-sm font-bold tracking-tight text-foreground">{cause.variable}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-mono font-bold text-primary">{cause.contribution}%</span>
                          <span className="text-sm text-muted-foreground/30">•</span>
                          {cause.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-destructive" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <StatusBadge variant={cause.status as any} className="text-[10px] py-0 h-4 uppercase tracking-widest font-bold">{cause.severity}</StatusBadge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER PANEL: Visualizations */}
        <div className="lg:col-span-6 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden border-border shadow-sm relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
            <CardHeader className="pb-0 border-b border-border/50 bg-muted/20 z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <Activity className="h-4 w-4" /> Feature Attribution
                </CardTitle>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-[250px]">
                  <TabsList className="w-full grid grid-cols-2 bg-background/50 border border-border/50">
                    <TabsTrigger value="contribution" className="text-xs uppercase tracking-widest">Bar</TabsTrigger>
                    <TabsTrigger value="pareto" className="text-xs uppercase tracking-widest">Pareto</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 min-h-[400px] z-10 bg-background/30">
              
              {activeTab === 'contribution' && (
                <ChartContainer className="h-full border-0 p-0">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart layout="vertical" data={data.rootCauses.slice(0, 7)} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} opacity={0.3} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                      <YAxis type="category" dataKey="variable" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 'bold' }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      />
                      <Bar dataKey="contribution" name="Contribution (%)" radius={[0, 4, 4, 0]} isAnimationActive={true}>
                        {data.rootCauses.slice(0, 7).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill='hsl(var(--primary))' opacity={1 - (index * 0.1)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {activeTab === 'pareto' && (
                <ChartContainer className="h-full border-0 p-0">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={data.paretoData.slice(0, 7)} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} angle={-30} textAnchor="end" />
                      <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                      <Bar yAxisId="left" dataKey="contribution" name="Individual %" fill="hsl(var(--primary))" opacity={0.8} radius={[4, 4, 0, 0]} isAnimationActive={true} />
                      <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative %" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={true} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Engineering Explanation */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="flex-1 border-border shadow-sm flex flex-col">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Info className="h-4 w-4" />
                AI Inference
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 pt-6">
              
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-1">AI Diagnostic</span>
                <p className="text-sm font-bold text-foreground leading-relaxed">
                  {data.engineeringSummary.aiSummary}
                </p>
              </div>

              <div className="pt-3 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold flex items-center gap-1 mb-1">
                  <Info className="h-3 w-3" />
                  Engineering Translation
                </span>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium italic">
                  {data.engineeringSummary.interpretation}
                </p>
              </div>

              <div className="pt-3 border-t border-border/50">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block mb-1">Impact Forecast</span>
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mt-2 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />
                    <p className="text-sm font-bold text-destructive tracking-tight">{data.engineeringSummary.impact}</p>
                  </div>
                  <p className="text-[10px] text-destructive/80 uppercase tracking-widest font-bold">Uncorrected within 4 min</p>
                </div>
              </div>

              <div className="pt-3 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">P-Value Confidence</span>
                  <p className="text-xs font-mono text-muted-foreground font-bold">
                    {data.engineeringSummary.confidenceExplanation}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* --- BOTTOM SECTION: Investigation Table --- */}
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <CardTitle className="text-xs uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" /> Variable Investigation Matrix
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto w-full no-scrollbar">
            <DataTable headers={['Variable', 'Current Value', 'Target', 'Deviation', 'Contribution', 'Severity', 'Engineering Note']}>
              {data.investigationTable.map((row, idx) => (
                <DataTableRow key={idx} className="hover:bg-muted/30 transition-colors border-border/50">
                  <DataTableCell className="font-bold text-foreground text-xs uppercase tracking-widest">{row.variable}</DataTableCell>
                  <DataTableCell className="font-mono text-xs">{row.current}</DataTableCell>
                  <DataTableCell className="font-mono text-xs text-muted-foreground">{row.target}</DataTableCell>
                  <DataTableCell>
                    <span className={`font-mono text-xs font-bold px-2 py-1 rounded bg-background border border-border/50 shadow-sm ${row.dev.startsWith('+') ? 'text-destructive' : 'text-yellow-500'}`}>
                      {row.dev}
                    </span>
                  </DataTableCell>
                  <DataTableCell className="font-mono font-bold text-primary text-xs">{row.cont}</DataTableCell>
                  <DataTableCell>
                    <StatusBadge variant={
                      row.sev === 'CRITICAL' || row.sev === 'HIGH' ? 'destructive' :
                      row.sev === 'MODERATE' ? 'warning' : 'default'
                    } className="text-[10px] py-0 h-4 bg-background uppercase tracking-widest font-bold">
                      {row.sev}
                    </StatusBadge>
                  </DataTableCell>
                  <DataTableCell className="text-xs text-muted-foreground/80 max-w-xs truncate" title={row.note}>
                    {row.note}
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
