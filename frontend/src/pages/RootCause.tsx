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
  Cell
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

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ChartContainer } from '../components/ui/ChartContainer';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { DataTable, DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

// Integrate live backend data via React Query
import { useRootCauseWorkspaceData } from '../api/hooks/useRootCause';

export default function RootCause() {
  const [activeTab, setActiveTab] = useState('contribution');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch live workspace data
  const { data, isLoading, isError } = useRootCauseWorkspaceData();

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
          <div className="lg:col-span-3">
            <Card className="h-[600px]"><CardContent className="p-6"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
          <div className="lg:col-span-6 flex flex-col">
            <Card className="flex-1 min-h-[400px]"><CardContent className="p-6 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
          <div className="lg:col-span-3">
            <Card className="h-[400px]"><CardContent className="p-6 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
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
        <h2 className="text-lg font-bold">Failed to load Root Cause Workspace</h2>
        <p className="text-sm">Please check your backend connection or refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* --- TOP SECTION --- */}
      <PageHeader 
        title="Root Cause Analysis Workspace" 
        description="M4 - Feature attribution and diagnostic explanations."
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

      {/* --- MAIN EXECUTIVE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Ranked Root Causes */}
        <div className="lg:col-span-3">
          <Card className="h-full border-transparent   ">
            <CardHeader className="pb-3 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <ListOrdered className="h-4 w-4 text-primary" />
                Top 10 Root Causes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto max-h-[600px] no-scrollbar">
                {data.rootCauses.map((cause) => (
                  <div key={cause.rank} className="flex items-center justify-between p-4 border-b border-transparent hover:bg-muted/30 transition-colors">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-bold text-muted-foreground/50 w-4 text-right uppercase">#{cause.rank}</span>
                      <div>
                        <p className="text-sm font-semibold tracking-tight">{cause.variable}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-bold text-primary">{cause.contribution}%</span>
                          <span className="text-sm text-muted-foreground/30">•</span>
                          {cause.trend === 'up' ? (
                            <TrendingUp className="h-3 w-3 text-destructive" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <StatusBadge variant={cause.status as any} className="text-xs py-0 h-4">{cause.severity}</StatusBadge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER PANEL: Visualizations */}
        <div className="lg:col-span-6 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden border-transparent   ">
            <CardHeader className="pb-0 border-b border-transparent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Activity className="h-4 w-4 text-primary" /> Contribution Visualization
                </CardTitle>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-[300px]">
                  <TabsList className="w-full grid grid-cols-2 bg-background/50">
                    <TabsTrigger value="contribution">Contribution</TabsTrigger>
                    <TabsTrigger value="pareto">Pareto View</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 min-h-[400px]">
              
              {activeTab === 'contribution' && (
                <ChartContainer className="h-full border-0  p-0">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart layout="vertical" data={data.rootCauses.slice(0, 7)} margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} opacity={0.4} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                      <YAxis type="category" dataKey="variable" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 500 }}
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                      />
                      <Bar dataKey="contribution" name="Contribution (%)" radius={[0, 4, 4, 0]} isAnimationActive={true}>
                        {data.rootCauses.slice(0, 7).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill='hsl(var(--primary))' />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

              {activeTab === 'pareto' && (
                <ChartContainer className="h-full border-0  p-0">
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={data.paretoData.slice(0, 7)} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.4} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" />
                      <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: 'hsl(var(--foreground))', fontSize: '12px', fontWeight: 500 }}
                      />
                      <Bar yAxisId="left" dataKey="contribution" name="Individual %" fill="hsl(var(--primary))" opacity={0.8} radius={[4, 4, 0, 0]} isAnimationActive={true} />
                      <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative %" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} isAnimationActive={true} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}

            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Engineering Explanation */}
        <div className="lg:col-span-3">
          <Card className="h-full border-transparent   ">
            <CardHeader className="pb-3 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <Info className="h-4 w-4 text-primary" />
                Engineering Explanation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">AI Summary</span>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {data.engineeringSummary.aiSummary}
                </p>
              </div>

              <div className="pt-3 border-t border-transparent">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1 mb-1">
                  <Info className="h-3 w-3" />
                  Engineering Interpretation
                </span>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  {data.engineeringSummary.interpretation}
                </p>
              </div>

              <div className="pt-3 border-t border-transparent">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Expected Impact</span>
                <div className="p-3 rounded bg-destructive/10 border border-destructive/20 mt-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-bold text-destructive tracking-tight">{data.engineeringSummary.impact}</p>
                  </div>
                  <p className="text-sm text-destructive/80 mt-1 uppercase tracking-widest">If uncorrected within 4 minutes.</p>
                </div>
              </div>

              <div className="pt-3 border-t border-transparent">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Process Recommendation</span>
                <p className="text-sm font-medium text-foreground">
                  {data.engineeringSummary.recommendation}
                </p>
              </div>

              <div className="pt-4 border-t border-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Confidence Explanation</span>
                  <p className="text-sm font-mono text-muted-foreground">
                    {data.engineeringSummary.confidenceExplanation}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* --- BOTTOM SECTION: Investigation Table --- */}
      <Card className="border-transparent  ">
        <CardHeader className="border-b border-transparent">
          <CardTitle className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Variable Investigation Summary</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto w-full no-scrollbar">
            <DataTable headers={['Variable', 'Current Value', 'Target', 'Deviation', 'Contribution', 'Severity', 'Engineering Note']}>
              {data.investigationTable.map((row, idx) => (
                <DataTableRow key={idx} className="hover:bg-muted/30 transition-colors">
                  <DataTableCell className="font-semibold text-foreground tracking-tight">{row.variable}</DataTableCell>
                  <DataTableCell className="font-mono text-xs">{row.current}</DataTableCell>
                  <DataTableCell className="font-mono text-xs text-muted-foreground">{row.target}</DataTableCell>
                  <DataTableCell>
                    <span className={`font-mono text-xs font-bold ${row.dev.startsWith('+') ? 'text-destructive' : 'text-gci-amber'}`}>
                      {row.dev}
                    </span>
                  </DataTableCell>
                  <DataTableCell className="font-medium text-primary text-xs">{row.cont}</DataTableCell>
                  <DataTableCell>
                    <StatusBadge variant={
                      row.sev === 'CRITICAL' || row.sev === 'HIGH' ? 'destructive' :
                      row.sev === 'MODERATE' ? 'warning' : 'default'
                    } className="text-xs py-0 h-4 bg-background/50">
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
