import React, { useState } from 'react';
import { Network, BarChart2, Info, ArrowUpRight, ArrowDownRight, Activity, TrendingDown, Target, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { useCorrelations, type Correlation } from '../api/hooks/useCorrelations';

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

  // Sort by absolute strength
  const rankedCorrelations = [...data.correlations].sort((a, b) => b.strength - a.strength);

  // Helper for heatmap colors
  const getHeatmapColor = (correlation: number) => {
    // correlation ranges from -1 to 1
    // -1: Deep Red, 0: Neutral Dark, 1: Deep Green
    if (correlation > 0) {
      // 0 to 1 -> opacity of green
      const opacity = 0.2 + (correlation * 0.8);
      return `rgba(16, 185, 129, ${opacity})`;
    } else {
      // 0 to -1 -> opacity of red
      const opacity = 0.2 + (Math.abs(correlation) * 0.8);
      return `rgba(229, 34, 34, ${opacity})`;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader 
        title="AI Correlation Discovery" 
        description="M4 - Uncover hidden telemetry relationships and root causes driving process drift."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: 1D Heatmap / Ranked Correlations */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <Card className="h-full border-border shadow-sm flex flex-col">
            <div className="p-5 border-b border-border/50 bg-muted/20 flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                <Network className="h-4 w-4" />
                Ranked Feature Impact on Basis Weight
              </CardTitle>
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">Target: Basis Wt</span>
            </div>
            <CardContent className="p-6 flex-1 bg-background/50">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-4 mb-2">
                  <span className="w-12 text-center">Rank</span>
                  <span className="flex-1">Variable</span>
                  <span className="w-24 text-center">Correlation</span>
                  <span className="w-24 text-center hidden sm:block">Impact</span>
                </div>
                
                {rankedCorrelations.map((corr, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={corr.feature}
                    onClick={() => setSelectedCorr(corr)}
                    className={`group cursor-pointer relative overflow-hidden flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                      selectedCorr?.feature === corr.feature 
                        ? 'border-primary shadow-[0_0_15px_rgba(229,34,34,0.15)] ring-1 ring-primary' 
                        : 'border-border/50 hover:border-foreground/30'
                    }`}
                  >
                    {/* Heatmap Background */}
                    <div 
                      className="absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30" 
                      style={{ backgroundColor: getHeatmapColor(corr.correlation) }}
                    />
                    
                    <div className="w-12 text-center relative z-10">
                      <span className="text-xl font-black font-mono text-muted-foreground group-hover:text-foreground transition-colors">#{idx + 1}</span>
                    </div>
                    
                    <div className="flex-1 relative z-10 px-4">
                      <h3 className="text-lg font-bold tracking-tight">{corr.feature}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${corr.correlation > 0 ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive'}`}>
                          {corr.correlation > 0 ? 'Positive Drive' : 'Inverse Drive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="w-24 text-center relative z-10">
                      <span className="text-2xl font-mono font-bold">{corr.correlation > 0 ? '+' : ''}{corr.correlation.toFixed(2)}</span>
                    </div>

                    <div className="w-24 text-center hidden sm:block relative z-10">
                      <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{corr.impactOnBasisWeight}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: AI Deep Dive (Reasoning, Confidence, Impact) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Card className="h-full border-border shadow-sm flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
            
            <div className="p-5 border-b border-border/50 bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest text-muted-foreground">
                <Cpu className="h-4 w-4" />
                AI Inference Deep Dive
              </CardTitle>
            </div>
            
            <CardContent className="p-6 flex-1 flex flex-col relative z-10">
              <AnimatePresence mode="wait">
                {!selectedCorr ? (
                  <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground"
                  >
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Activity className="h-8 w-8 opacity-50" />
                    </div>
                    <p className="text-sm">Select a process variable from the ranked heatmap to view AI root-cause analysis.</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    key={selectedCorr.feature}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-primary mb-1 block">Selected Variable</span>
                      <h3 className="text-3xl font-bold tracking-tight text-foreground">{selectedCorr.feature}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 border border-border/50 p-4 rounded-xl text-center">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 block">AI Confidence</span>
                        <span className="text-2xl font-mono font-bold text-green-500">{selectedCorr.confidenceScore}%</span>
                      </div>
                      <div className="bg-background/50 border border-border/50 p-4 rounded-xl text-center">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1 block">Business Impact</span>
                        <span className={`text-xl font-black uppercase tracking-widest ${selectedCorr.impactOnBasisWeight === 'High' ? 'text-destructive' : 'text-yellow-500'}`}>{selectedCorr.impactOnBasisWeight}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2 mb-3">
                        <Target className="h-3 w-3" /> Process Dynamics
                      </h4>
                      <p className="text-sm text-foreground/80 leading-relaxed bg-muted/20 p-4 rounded-xl border border-border/50">
                        {selectedCorr.detailedReasoning}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-2 mb-3">
                        <ShieldAlert className="h-3 w-3" /> Historical Evidence
                      </h4>
                      <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary pl-4 py-1">
                        {selectedCorr.historicalEvidence}
                      </p>
                    </div>

                    {/* Affected Sub-variables (Mocked addition for "affected variables" requirement) */}
                    <div>
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">Downstream Affected Variables</h4>
                      <div className="flex flex-wrap gap-2">
                         <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground border border-border/50">Moisture Profile</span>
                         <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground border border-border/50">Caliper</span>
                         {selectedCorr.feature === 'Steam Pressure' && <span className="text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground border border-border/50">Dryer Energy Consump.</span>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
