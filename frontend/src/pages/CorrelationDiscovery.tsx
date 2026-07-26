import React, { useState } from 'react';
import { Network, BarChart2, Info, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { useCorrelations, Correlation } from '../api/hooks/useCorrelations';

export default function CorrelationDiscovery() {
  const { data, isLoading, isError } = useCorrelations();
  const [selectedCorr, setSelectedCorr] = useState<Correlation | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-12 gap-6">
          <LoadingSkeleton className="col-span-8 h-[500px] rounded-xl" />
          <LoadingSkeleton className="col-span-4 h-[500px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data || !data.correlations) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-destructive">
        <Activity className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Failed to load Correlations</h2>
      </div>
    );
  }

  const chartData = data.correlations.map(c => ({
    name: c.feature,
    value: c.correlation,
    strength: c.strength,
    fill: c.correlation > 0 ? '#10B981' : '#E52222' // Green for positive, Red for negative
  })).sort((a, b) => b.strength - a.strength); // Sort by absolute strength

  const handleSelect = (corr: any) => {
    const fullCorr = data.correlations.find(c => c.feature === corr.name);
    if (fullCorr) setSelectedCorr(fullCorr);
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader 
        title="Correlation Discovery" 
        description="Newly discovered process relationships by the AI engine based on historical and live telemetry."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Correlation Visualization */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="h-full border-transparent border">
            <CardHeader className="pb-4 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <BarChart2 className="h-4 w-4 text-primary" />
                Impact on Basis Weight
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                          onClick={(data) => { if(data && data.activePayload) handleSelect(data.activePayload[0].payload) }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} opacity={0.2} />
                  <XAxis type="number" domain={[-1, 1]} stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} width={90} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.2)'}}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} className="cursor-pointer hover:opacity-80 transition-opacity">
                    {
                      chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="text-center text-xs text-muted-foreground mt-2">Click on a bar to view detailed reasoning.</div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Detailed Reasoning */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="h-full border-transparent border flex flex-col">
            <CardHeader className="pb-4 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <Info className="h-4 w-4 text-primary" />
                Detailed Reasoning
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col">
              {!selectedCorr ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                  <Network className="h-10 w-10 mb-4 opacity-50" />
                  <p className="text-sm">Select a feature from the chart to view AI insights.</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-bold tracking-tight mb-1">{selectedCorr.feature}</h3>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded flex items-center ${selectedCorr.type === 'Positive' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                        {selectedCorr.type === 'Positive' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {selectedCorr.type}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">R: {selectedCorr.correlation}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-2">Confidence Score</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${selectedCorr.confidenceScore}%` }} />
                      </div>
                      <span className="font-mono text-sm font-bold">{selectedCorr.confidenceScore}%</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-2">Historical Evidence</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed bg-muted/20 p-4 rounded-md border border-transparent">
                      {selectedCorr.historicalEvidence}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-2">Statistical Reasoning</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary pl-4 py-1">
                      {selectedCorr.detailedReasoning}
                    </p>
                  </div>

                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
