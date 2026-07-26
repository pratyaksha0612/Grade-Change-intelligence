import { useState, useEffect } from 'react';
import { ThumbsUp, ShieldCheck, Activity, Clock, Zap, Cpu, CheckCircle2, AlertTriangle, ArrowRight, Target, TrendingUp, Settings2, Settings, ArrowDownRight, ArrowUpRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

import { useRecommendationWorkspaceData } from '../api/hooks/useRecommendation';

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function Recommendations() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [activeRank, setActiveRank] = useState<number | null>(null);

  const handleAction = (rank: number, actionType: string) => {
    setActiveRank(rank);
    setActionStatus(`${actionType}_ING`);
    
    setTimeout(() => {
      setActionStatus(`${actionType}_ED`);
      setTimeout(() => {
        setActionStatus(null);
        setActiveRank(null);
      }, 2000);
    }, 1500);
  };

  const { data, isLoading, isError } = useRecommendationWorkspaceData();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-24 w-full" />
        <LoadingSkeleton className="h-[200px] w-full" />
        <LoadingSkeleton className="h-[400px] w-full" />
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

  const primaryCandidate = data.candidates.find(c => c.recommended) || data.candidates[0];
  const alternativeCandidates = data.candidates.filter(c => !c.recommended);

  return (
    <div className="space-y-6 pb-10">
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
          </div>
        }
      />

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        
        {/* 1. CURRENT SITUATION */}
        <motion.div variants={itemVariants}>
          <h2 className="text-sm uppercase tracking-widest font-bold text-muted-foreground mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" /> 1. Current Situation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.metrics.map((metric, idx) => (
              <Card key={idx} className="border-border shadow-sm">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">{metric.title}</span>
                  <span className="text-xl font-bold font-mono text-foreground mb-1">
                    {typeof metric.value === 'number' || !isNaN(Number(metric.value?.toString().replace(/[^0-9.-]+/g,""))) ? (
                      <AnimatedNumber value={Number(metric.value.toString().replace(/[^0-9.-]+/g,""))} />
                    ) : (
                      metric.value
                    )}
                    {metric.value?.toString().replace(/[0-9.-]+/g,"")}
                  </span>
                  <span className="text-xs text-muted-foreground/70 truncate w-full">{metric.description}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* 2. RECOMMENDED ACTION & 3. PARAMETER CHANGES */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-12">
            <h2 className="text-sm uppercase tracking-widest font-bold text-muted-foreground mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" /> 2 & 3. Recommended Action & Parameter Changes
            </h2>
            <Card className="border-primary/30 shadow-[0_0_20px_rgba(229,34,34,0.05)] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 relative z-10">
                {/* Left: The Action */}
                <div className="md:w-1/3 flex flex-col justify-center">
                  <StatusBadge variant="success" className="w-fit mb-4">PRIMARY RECOMMENDATION</StatusBadge>
                  <h3 className="text-3xl font-bold tracking-tight text-foreground mb-4 leading-tight">
                    {primaryCandidate.desc}
                  </h3>
                  <div className="space-y-4 text-sm font-medium">
                     <div className="flex items-center justify-between border-b border-border/50 pb-2">
                       <span className="text-muted-foreground uppercase tracking-widest text-xs">AI Rank</span>
                       <span className="font-bold text-primary text-xl">#{primaryCandidate.rank}</span>
                     </div>
                     <div className="flex items-center justify-between border-b border-border/50 pb-2">
                       <span className="text-muted-foreground uppercase tracking-widest text-xs">Safety Constraint</span>
                       <StatusBadge variant={primaryCandidate.safety === 'SAFE' ? 'success' : 'warning'} className="py-0.5">
                         {primaryCandidate.safety}
                       </StatusBadge>
                     </div>
                  </div>
                </div>

                {/* Right: Parameter Changes (Table) */}
                <div className="md:w-2/3 bg-background/50 rounded-xl border border-border/50 p-6 flex flex-col justify-center">
                  <h4 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">Setpoint Adjustments</h4>
                  <div className="overflow-x-auto w-full no-scrollbar">
                    <table className="w-full text-sm text-left">
                      <thead className="text-muted-foreground text-xs uppercase tracking-widest border-b border-border/50">
                        <tr>
                          <th className="pb-3 font-semibold">Variable</th>
                          <th className="pb-3 font-semibold">Current</th>
                          <th className="pb-3 font-semibold">Target</th>
                          <th className="pb-3 font-semibold text-right">Delta</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {data.comparisonData.map((row, idx) => (
                          <tr key={idx} className="transition-colors hover:bg-muted/20">
                            <td className="py-3 font-medium text-foreground">{row.variable}</td>
                            <td className="py-3 font-mono text-muted-foreground">{row.current}</td>
                            <td className="py-3 font-mono font-bold text-foreground flex items-center gap-2">
                              {row.action !== 'none' && <ArrowRight className="h-3 w-3 text-primary animate-pulse" />}
                              {row.recommended}
                            </td>
                            <td className="py-3 text-right">
                              <span className={`inline-flex items-center gap-1 font-mono text-xs font-bold px-2 py-1 rounded ${
                                row.action === 'decrease' ? 'bg-destructive/10 text-destructive' :
                                row.action === 'increase' ? 'bg-green-500/10 text-green-500' :
                                'text-muted-foreground'
                              }`}>
                                {row.action === 'decrease' ? <ArrowDownRight className="h-3 w-3" /> : row.action === 'increase' ? <ArrowUpRight className="h-3 w-3" /> : null}
                                {row.diff}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* 4. EXPECTED BENEFITS & 5. CONFIDENCE */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-3">
            <h2 className="text-sm uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> 4. Expected Benefits
            </h2>
            <Card className="h-full border-border">
              <CardContent className="p-6 grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center text-center justify-center border-r border-border/50">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Improvement</span>
                  <span className="text-4xl font-bold font-mono text-green-500">+{primaryCandidate.improvement}%</span>
                  <span className="text-xs text-muted-foreground mt-2">vs open-loop control</span>
                </div>
                <div className="flex flex-col items-center text-center justify-center">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2">Stabilization</span>
                  <span className="text-4xl font-bold font-mono text-foreground">{primaryCandidate.time}</span>
                  <span className="text-xs text-muted-foreground mt-2">Time to target specs</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm uppercase tracking-widest font-bold text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> 5. AI Confidence & Validation
            </h2>
            <Card className="h-full border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-24 h-24 flex shrink-0 items-center justify-center rounded-full border-[6px] border-muted">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="0" fill="transparent" />
                      <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray="282" strokeDashoffset={282 - (282 * primaryCandidate.confidence) / 100} className="text-green-500 transition-all duration-1000" />
                    </svg>
                    <span className="text-2xl font-bold text-green-500 font-mono">{primaryCandidate.confidence}%</span>
                  </div>
                  <div className="flex-1 space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Digital Twin Check</span>
                       {data.decisionSupport.digitalTwinValidated ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Safety Constraints</span>
                       {data.decisionSupport.safetyValidated ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Historical Match</span>
                       <span className="text-sm font-bold font-mono text-foreground">{data.decisionSupport.similarityMatch}</span>
                     </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-relaxed border-t border-border/50 pt-3">
                  {data.decisionSupport.engineeringRationale}
                </p>
              </CardContent>
            </Card>
          </div>

        </motion.div>

        {/* 6. APPROVE / REJECT / MODIFY */}
        <motion.div variants={itemVariants} className="pt-4 pb-8">
          <h2 className="text-sm uppercase tracking-widest font-bold text-muted-foreground mb-4 flex items-center gap-2">
            <Zap className="h-4 w-4" /> 6. Decision Execution
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
             <button 
               onClick={() => handleAction(primaryCandidate.rank, 'APPROVE')}
               disabled={actionStatus !== null}
               className={`flex-1 w-full sm:w-auto py-5 text-lg uppercase tracking-widest font-bold rounded-lg transition-all duration-300 disabled:opacity-50 flex justify-center items-center gap-2 ${activeRank === primaryCandidate.rank && actionStatus === 'APPROVE_ED' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border-green-500' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(229,34,34,0.3)] hover:shadow-[0_0_30px_rgba(229,34,34,0.5)] border border-primary'}`}
             >
               {activeRank === primaryCandidate.rank && actionStatus === 'APPROVE_ING' ? <><Loader2 className="h-5 w-5 animate-spin" /> EXECUTING...</> : activeRank === primaryCandidate.rank && actionStatus === 'APPROVE_ED' ? <><CheckCircle2 className="h-5 w-5" /> SENT TO DCS</> : 'APPROVE & EXECUTE'}
             </button>
             
             <div className="flex w-full sm:w-auto gap-4">
               <button 
                 onClick={() => handleAction(primaryCandidate.rank, 'MODIFY')}
                 disabled={actionStatus !== null}
                 className="flex-1 sm:flex-none px-8 py-5 text-sm uppercase tracking-widest font-bold rounded-lg border border-border/50 bg-card hover:bg-muted text-foreground transition-colors"
               >
                 {activeRank === primaryCandidate.rank && actionStatus === 'MODIFY_ING' ? 'LOADING...' : 'MODIFY'}
               </button>
               <button 
                 onClick={() => handleAction(primaryCandidate.rank, 'REJECT')}
                 disabled={actionStatus !== null}
                 className="flex-1 sm:flex-none px-8 py-5 text-sm uppercase tracking-widest font-bold rounded-lg border border-destructive/30 bg-card hover:bg-destructive/10 text-destructive transition-colors"
               >
                 {activeRank === primaryCandidate.rank && actionStatus === 'REJECT_ING' ? 'REJECTING...' : 'REJECT'}
               </button>
             </div>
          </div>
        </motion.div>
        
        {/* ALTERNATIVE CANDIDATES */}
        {alternativeCandidates.length > 0 && (
          <motion.div variants={itemVariants} className="pt-8 border-t border-border/50">
            <h3 className="text-sm uppercase tracking-wide font-semibold text-muted-foreground flex items-center gap-2 mb-4">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              Alternative Pareto Candidates
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {alternativeCandidates.map(candidate => (
                <Card key={candidate.rank} className="border-border/50 bg-card/50 hover:bg-card transition-colors">
                  <div className="p-5 flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col justify-center text-center">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Rank</span>
                      <span className="text-2xl font-bold font-mono">#{candidate.rank}</span>
                    </div>
                    <div className="flex-1 border-l border-border/50 pl-6">
                      <h4 className="font-bold text-foreground mb-1">{candidate.desc}</h4>
                      <div className="flex gap-4 mt-3 text-xs font-mono text-muted-foreground">
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +{candidate.improvement}% Improv.</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {candidate.time}</span>
                        <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> {candidate.confidence}% Conf.</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
