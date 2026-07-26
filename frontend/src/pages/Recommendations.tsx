import { useState, useEffect } from 'react';
import { ThumbsUp, ShieldCheck, Activity, Clock, Zap, Cpu, CheckCircle2, AlertTriangle, ArrowRight, Target, TrendingUp, Settings2, Loader2, LineChart, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

// Integrate live backend data via React Query
import { useRecommendationWorkspaceData } from '../api/hooks/useRecommendation';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Recommendations() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Map<number, string>>(new Map());

  const handleAction = (candidateRank: number, actionType: string) => {
    setActionStatus(`${actionType}_ING ${candidateRank}`);
    setTimeout(() => {
      setActionStatus(`${actionType}_ED ${candidateRank}`);
      setTimeout(() => setActionStatus(null), 2000);
    }, 1500);
  };

  // Fetch live workspace data
  const { data, isLoading, isError } = useRecommendationWorkspaceData();

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
        <div className="space-y-4 mt-6">
          <LoadingSkeleton className="h-8 w-64" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><LoadingSkeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-destructive">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-lg font-bold">Failed to load Recommendation Workspace</h2>
        <p className="text-sm">Please check your backend connection or refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* --- TOP SECTION --- */}
      <PageHeader 
        title="AI Recommendation Workspace" 
        description="M6 - Pareto optimal setpoints and safety constraints."
        action={
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium tracking-wide">{currentTime.toLocaleTimeString()} Local Time</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Transition</span>
              <span className="text-sm font-semibold text-foreground">{data.transitionId}</span>
            </div>
            <div className="mt-2 flex space-x-2">
              {data.statusOptimal ? (
                <StatusBadge variant="success" className="bg-green-500/20 text-green-500 border border-green-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">OPTIMAL SETPOINT FOUND</StatusBadge>
              ) : (
                <StatusBadge variant="warning">NO OPTIMAL SETPOINT</StatusBadge>
              )}
              {data.decisionSupport.safetyValidated && (
                <StatusBadge variant="outline" className="border-green-500 text-green-500 bg-green-500/5">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  SAFETY VALIDATED
                </StatusBadge>
              )}
            </div>
          </div>
        }
      />

      {/* --- MAIN EXECUTIVE GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Summary Telemetry (Replaced stacked cards with glassmorphic grid) */}
        <div className="lg:col-span-3">
          <Card className="h-full border-transparent   ">
            <CardHeader className="pb-3 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <Settings2 className="h-4 w-4 text-primary" />
                Telemetry Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {data.metrics.map((metric, idx) => {
                  const Icon = idx === 0 ? AlertTriangle :
                               idx === 1 ? Target :
                               idx === 2 ? Activity :
                               idx === 3 ? Clock :
                               idx === 4 ? TrendingUp : ShieldCheck;
                  return (
                    <div key={idx} className="p-4 hover:bg-muted/20 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md ${idx === 1 || idx === 5 ? 'bg-green-500/10 text-green-500' : idx === 4 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-sm uppercase text-muted-foreground font-semibold tracking-widest">{metric.title}</span>
                          <p className="text-xs text-muted-foreground/70 max-w-[120px] truncate">{metric.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold tracking-tight text-foreground">
                          {typeof metric.value === 'number' || !isNaN(Number(metric.value?.replace(/[^0-9.-]+/g,""))) ? (
                            <AnimatedNumber value={Number(metric.value.toString().replace(/[^0-9.-]+/g,""))} />
                          ) : (
                            metric.value
                          )}
                          {metric.value?.toString().replace(/[0-9.-]+/g,"")}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CENTER PANEL: Comparison Table */}
        <div className="lg:col-span-6 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden border-transparent   shadow-[0_4px_30px_-5px_rgba(229,34,34,0.1)]">
            <CardHeader className="bg-primary/5 pb-4 border-b border-transparent">
              <CardTitle className="flex items-center text-primary text-sm uppercase tracking-wide">
                <Zap className="h-4 w-4 mr-2" />
                Setpoint Comparison (Rank {data.decisionSupport.rank})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="overflow-x-auto w-full no-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-sm tracking-widest">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Variable</th>
                      <th className="px-6 py-4 font-semibold">Current</th>
                      <th className="px-6 py-4 font-semibold">Recommended</th>
                      <th className="px-6 py-4 font-semibold text-right">Difference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {data.comparisonData.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={`transition-colors hover:bg-muted/40 ${row.action !== 'none' ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-6 py-4 font-medium text-foreground tracking-tight">{row.variable}</td>
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground/80">{row.current}</td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-foreground">
                          <div className="flex items-center gap-2">
                            {row.action !== 'none' && <ArrowRight className="h-3 w-3 text-primary animate-pulse" />}
                            {row.recommended}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-mono text-sm font-bold px-2 py-1 rounded ${
                            row.action === 'decrease' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                            row.action === 'increase' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                            'bg-muted/50 text-muted-foreground'
                          }`}>
                            {row.diff}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Decision Support */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="h-full border-transparent   ">
            <CardHeader className="pb-3 border-b border-transparent">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Decision Support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              <div>
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Historical Similarity (M5)</span>
                <p className="text-xl font-bold text-green-500 tracking-tighter">
                  <AnimatedNumber value={Number(data.decisionSupport.similarityMatch.replace('%',''))} />% Match
                </p>
                <p className="text-sm text-muted-foreground/80 mt-1 uppercase tracking-widest">{data.decisionSupport.similarityExplanation}</p>
              </div>

              <div className="pt-3 border-t border-transparent">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1 mb-1">
                  <Cpu className="h-3 w-3" />
                  Digital Twin Validation (M9)
                </span>
                <p className={`text-xs font-bold flex items-center px-2 py-1 rounded w-fit ${data.decisionSupport.digitalTwinValidated ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-gci-amber/10 text-gci-amber border border-gci-amber/20'}`}>
                  {data.decisionSupport.digitalTwinValidated ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <AlertTriangle className="h-3 w-3 mr-1" />}
                  {data.decisionSupport.digitalTwinValidated ? 'Trajectory Validated' : 'Validation Warning'}
                </p>
                <p className="text-sm text-muted-foreground/80 mt-2">{data.decisionSupport.digitalTwinExplanation}</p>
              </div>

              <div className="pt-3 border-t border-transparent">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1 mb-1">
                  <ShieldCheck className="h-3 w-3" />
                  Safety Validation
                </span>
                <p className={`text-xs font-bold flex items-center px-2 py-1 rounded w-fit ${data.decisionSupport.safetyValidated ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                  {data.decisionSupport.safetyValidated ? '100% Constraints Met' : 'Constraint Violations'}
                </p>
                <p className="text-sm text-muted-foreground/80 mt-2">{data.decisionSupport.safetyExplanation}</p>
              </div>

              <div className="pt-3 border-t border-transparent">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold block mb-1">Engineering Rationale</span>
                <p className="text-xs text-foreground/90 leading-relaxed">{data.decisionSupport.engineeringRationale}</p>
              </div>

              <div className="pt-4 border-t border-transparent grid grid-cols-2 gap-4">
                <div className="bg-background/50 p-2 rounded border border-transparent text-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Rank</span>
                  <p className="text-lg font-bold text-primary"><AnimatedNumber value={data.decisionSupport.rank} /></p>
                </div>
                <div className="bg-background/50 p-2 rounded border border-transparent text-center">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Confidence</span>
                  <p className="text-lg font-bold text-green-500"><AnimatedNumber value={data.decisionSupport.confidence} />%</p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* --- BOTTOM SECTION: Recommendation Candidates --- */}
      <div className="space-y-6 pt-4">
        <h3 className="text-sm uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-2">
          <ThumbsUp className="h-4 w-4 text-primary" />
          Pareto Optimal Candidates
        </h3>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col space-y-4"
        >
          {data.candidates.map((candidate) => (
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} key={candidate.rank}>
              <Card 
                className={`transition-all duration-300 ${candidate.recommended ? 'border-transparent shadow-[0_4px_25px_-5px_rgba(229,34,34,0.15)] bg-primary/5 hover:bg-primary/10' : 'border-transparent  hover: '}`}
              >
                <div className="flex flex-col md:flex-row md:items-center p-5 gap-6">
                  <div className={`flex items-center justify-center shrink-0 w-12 h-12 rounded-full border-2 font-bold text-xl font-mono ${candidate.recommended ? 'bg-primary/20 text-primary border-transparent shadow-[0_0_15px_rgba(229,34,34,0.3)]' : 'bg-background text-muted-foreground border-transparent'}`}>
                    {candidate.rank}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-bold tracking-tight text-lg ${candidate.recommended ? 'text-primary' : 'text-foreground'}`}>
                        Option {candidate.rank} {candidate.recommended && <span className="text-xs font-semibold ml-2 bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-transparent tracking-widest uppercase">Recommended</span>}
                      </span>
                      <StatusBadge variant={candidate.safety === 'SAFE' ? 'success' : 'warning'} className="text-xs py-0 h-4 bg-background/50">
                        {candidate.safety}
                      </StatusBadge>
                    </div>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-3xl">{candidate.desc}</p>
                  </div>

                  <div className="flex items-center gap-6 md:border-l md:border-transparent md:pl-8">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Improvement</p>
                      <p className="font-mono text-sm font-bold text-primary">+{candidate.improvement}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Confidence</p>
                      <p className={`font-mono text-sm font-bold ${candidate.confidence > 90 ? 'text-green-500' : 'text-gci-amber'}`}>
                        <AnimatedNumber value={candidate.confidence} />%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Stabilization</p>
                      <p className="font-mono text-sm font-bold text-foreground">{candidate.time}</p>
                    </div>
                    <div className="shrink-0 ml-4 flex flex-col sm:flex-row gap-2">
                      <button 
                        onClick={() => handleAction(candidate.rank, 'APPROVE')}
                        disabled={actionStatus !== null}
                        className={`px-4 py-2 text-sm uppercase tracking-widest font-bold rounded transition-all duration-300 disabled:opacity-50 ${actionStatus === `APPROVE_ED ${candidate.rank}` ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border-green-500' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(229,34,34,0.3)] hover:shadow-[0_0_20px_rgba(229,34,34,0.5)] border border-primary'}`}
                      >
                        {actionStatus === `APPROVE_ING ${candidate.rank}` ? 'PROCESSING...' : actionStatus === `APPROVE_ED ${candidate.rank}` ? 'APPROVED' : 'APPROVE'}
                      </button>
                      <button 
                        onClick={() => handleAction(candidate.rank, 'SIMULATE')}
                        disabled={actionStatus !== null}
                        className={`px-4 py-2 text-sm uppercase tracking-widest font-bold rounded border disabled:opacity-50 transition-colors ${actionStatus === `SIMULATE_ED ${candidate.rank}` ? 'bg-green-500/20 text-green-500 border-green-500/50' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        {actionStatus === `SIMULATE_ING ${candidate.rank}` ? 'SIMULATING...' : actionStatus === `SIMULATE_ED ${candidate.rank}` ? 'SIMULATED' : 'SIMULATE FIRST'}
                      </button>
                      <button 
                        onClick={() => handleAction(candidate.rank, 'MODIFY')}
                        disabled={actionStatus !== null}
                        className={`px-4 py-2 text-sm uppercase tracking-widest font-bold rounded border disabled:opacity-50 transition-colors ${actionStatus === `MODIFY_ED ${candidate.rank}` ? 'bg-primary/20 text-primary border-transparent' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        {actionStatus === `MODIFY_ING ${candidate.rank}` ? 'MODIFYING...' : actionStatus === `MODIFY_ED ${candidate.rank}` ? 'MODIFIED' : 'MODIFY'}
                      </button>
                      <button 
                        onClick={() => handleAction(candidate.rank, 'REJECT')}
                        disabled={actionStatus !== null}
                        className={`px-4 py-2 text-sm uppercase tracking-widest font-bold rounded border disabled:opacity-50 transition-colors ${actionStatus === `REJECT_ED ${candidate.rank}` ? 'bg-destructive/20 text-destructive border-destructive/50' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                      >
                        {actionStatus === `REJECT_ING ${candidate.rank}` ? 'REJECTING...' : actionStatus === `REJECT_ED ${candidate.rank}` ? 'REJECTED' : 'REJECT'}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
