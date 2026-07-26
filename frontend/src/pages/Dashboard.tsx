import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, CheckCircle2, AlertTriangle, BarChart3, Zap, Target, ShieldCheck, TrendingUp, Cpu, Check, Settings, AlertCircle, Info, Circle, PlayCircle, ArrowRight} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDashboardData, DashboardService } from '../api/hooks/useDashboard';

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [actionState, setActionState] = useState<string | null>(null);
  const { data, isLoading, isError } = useDashboardData();

  const handleAction = async (type: string) => {
    setActionStatus(`${type}ING`);
    try {
      if (type === 'APPROV' || type === 'REJECT') {
         await DashboardService.postAction(type);
      }
      setTimeout(() => {
        setActionStatus(`${type}ED`);
        setTimeout(() => {
          setActionStatus(null);
          setActionState(type);
        }, 1500);
      }, 800);
    } catch (e) {
      setActionStatus(null);
    }
  };
  
  const handleApprove = () => handleAction('APPROV');
  const handleReject = () => handleAction('REJECT');
  const handleModify = () => handleAction('MODIFY');
  const handleRevert = () => setActionState(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-12 gap-6">
          <LoadingSkeleton className="col-span-12 lg:col-span-6 h-[400px] rounded-xl" />
          <LoadingSkeleton className="col-span-12 lg:col-span-6 h-[400px] rounded-xl" />
        </div>
        <LoadingSkeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold">Failed to load Executive Command Center</h2>
        <p className="text-muted-foreground mt-2">Check backend connection or refresh.</p>
      </div>
    );
  }

  const currentGrade = typeof data.activeTransition === 'object' ? data.activeTransition.current : (data.activeTransition as string).split('→')[0].trim();
  const targetGrade = typeof data.activeTransition === 'object' ? data.activeTransition.target : (data.activeTransition as string).split('→')[1].trim();

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 pb-10"
    >
      {/* 1. EXECUTIVE HEADER: Current Grade -> Target Grade */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Grade Transition Active <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(229,34,34,0.8)] animate-pulse"></span>
          </h1>
          <p className="text-muted-foreground text-sm tracking-wide mt-1">Session: {data.sessionId}</p>
        </div>
        
        <div className="flex items-center gap-6 xl:gap-12 bg-background p-4 rounded-lg border border-border/50">
          <div className="flex flex-col text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Current Grade</span>
            <span className="text-3xl font-bold font-mono tracking-tight">{currentGrade}</span>
          </div>
          
          <div className="flex flex-col items-center px-4">
            <span className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Transitioning</span>
            <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
            <div className="w-24 bg-muted/50 h-1.5 rounded-full overflow-hidden mt-2">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${data.progress}%` }} 
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-primary h-full rounded-full"
              />
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">{data.timeRemaining}</span>
          </div>

          <div className="flex flex-col text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">Target Grade</span>
            <span className="text-3xl font-bold font-mono tracking-tight text-primary">{targetGrade}</span>
          </div>
        </div>
      </motion.div>

      {/* 2. PREDICTION & RECOMMENDATION (The Core Decision) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* PREDICTION */}
        <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="p-5 border-b border-border/50 bg-muted/20">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" /> FORECASTED TRAJECTORY
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2 block">Predicted Basis Weight</span>
                <span className="text-4xl font-bold tracking-tighter text-destructive font-mono">
                  {data.metrics.find(m => m.title.includes("PREDICTED"))?.value || "N/A"}
                </span>
                <p className="text-sm text-muted-foreground mt-2 font-medium">If no action is taken, transition will fail target specification.</p>
              </div>
              <div className="flex flex-col justify-center border-l border-border/50 pl-8">
                <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2 block">Expected Deviation</span>
                <span className="text-3xl font-bold tracking-tighter text-destructive font-mono">
                  {data.metrics.find(m => m.title.includes("DEVIATION"))?.value || "N/A"}
                </span>
                <div className="mt-3 inline-flex items-center gap-1.5 bg-destructive/10 text-destructive text-xs font-bold px-2 py-1 rounded border border-destructive/20 w-fit">
                  <AlertTriangle className="h-3 w-3" /> HIGH RISK OF REJECT
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECOMMENDATION */}
        <div className="bg-card rounded-xl border border-primary/30 shadow-[0_0_20px_rgba(229,34,34,0.05)] flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="p-5 border-b border-border/50 bg-primary/5 flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-widest uppercase text-primary flex items-center gap-2">
              <Target className="h-4 w-4" /> AI RECOMMENDATION
            </h3>
            <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded border border-primary/20">{data.recommendation.confidence}% CONFIDENCE</span>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4">{data.recommendation.action}</h2>
              <div className="grid grid-cols-3 gap-4 font-mono text-sm mb-4">
                <div className="bg-background p-3 rounded border border-border/50 text-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Current Speed</span>
                  <span className="font-semibold text-lg">{data.recommendation.currentSpeed} FPM</span>
                </div>
                <div className="bg-primary/10 p-3 rounded border border-primary/20 text-center relative">
                  <ArrowRight className="absolute -left-3 top-1/2 -translate-y-1/2 text-primary" />
                  <span className="text-[10px] text-primary uppercase tracking-widest font-bold block mb-1">Recommended</span>
                  <span className="font-bold text-lg text-primary">{data.recommendation.recommendedSpeed} FPM</span>
                  <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 text-primary" />
                </div>
                <div className="bg-background p-3 rounded border border-border/50 text-center">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Adjustment</span>
                  <span className="font-semibold text-lg text-green-500">{(data.recommendation.adjustment ?? 0) > 0 ? `+${data.recommendation.adjustment}` : (data.recommendation.adjustment ?? 0)} FPM</span>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Based on historical similarities, adjusting speed will compensate for basis weight drift without inducing moisture instability.
            </p>
          </div>
        </div>

      </motion.div>

      {/* 3. EXPECTED OUTCOME & ACTION */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Expected Outcome */}
        <div className="xl:col-span-7 bg-card rounded-xl border border-border shadow-sm flex flex-col">
          <div className="p-5 border-b border-border/50 bg-muted/20 flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" /> DIGITAL TWIN EXPECTED OUTCOME
            </h3>
            <span className="text-xs uppercase tracking-widest font-semibold text-green-500 flex items-center gap-1">
               <CheckCircle2 className="h-3 w-3" /> Scenarios Validated
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {data.digitalTwin.scenarios.slice(0, 2).map((scen, i) => (
                <div key={i} className={`p-4 rounded-lg border flex flex-col relative transition-all ${scen.recommended ? 'bg-green-500/5 border-green-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-background border-border/50'}`}>
                  {scen.recommended && <div className="absolute top-2 right-2 text-green-500"><CheckCircle2 className="h-5 w-5" /></div>}
                  <span className={`text-xs font-bold tracking-widest uppercase mb-1 ${scen.recommended ? 'text-green-500' : 'text-muted-foreground'}`}>{scen.name}</span>
                  <span className={`text-lg font-bold tracking-tight mb-4`}>{scen.change}</span>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center justify-between text-sm border-b border-border/30 pb-1">
                      <span className="text-muted-foreground">Est. Waste</span>
                      <span className="font-mono font-bold">{scen.loss}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-1">
                      <span className="text-muted-foreground">Quality Risk</span>
                      <span className={`font-bold uppercase ${scen.risk === 'HIGH' ? 'text-destructive' : 'text-green-500'}`}>{scen.risk}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Quick Metrics */}
            <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border/50 pt-4">
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Time Saved</span>
                <span className="text-lg font-bold font-mono text-foreground">{data.metrics.find(m => m.title.includes("TIME SAVED"))?.value || "N/A"}</span>
              </div>
              <div className="text-center border-l border-border/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Waste Saved</span>
                <span className="text-lg font-bold font-mono text-green-500">{data.metrics.find(m => m.title.includes("WASTE SAVED"))?.value || "N/A"}</span>
              </div>
              <div className="text-center border-l border-border/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Energy Saved</span>
                <span className="text-lg font-bold font-mono text-foreground">{data.metrics.find(m => m.title.includes("ENERGY SAVED"))?.value || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DECISION ACTION */}
        <div className="xl:col-span-5 bg-card rounded-xl border border-border shadow-sm flex flex-col">
          <div className="p-5 border-b border-border/50 bg-muted/20">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <Cpu className="h-4 w-4" /> DECISION EXECUTION
            </h3>
          </div>
          
          <div className="p-6 flex flex-col flex-1 items-center justify-center text-center">
            {actionState ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
                {actionState === 'APPROV' && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-2 shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-green-500/20">
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-green-500">Setpoints Approved</h3>
                    <p className="text-sm text-muted-foreground">Transmitting to DCS...</p>
                  </>
                )}
                {actionState === 'REJECT' && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-2 border border-destructive/20">
                      <AlertTriangle className="h-8 w-8 text-destructive" />
                    </div>
                    <h3 className="text-xl font-bold text-destructive">Recommendation Rejected</h3>
                    <p className="text-sm text-muted-foreground">Logging operator feedback.</p>
                  </>
                )}
                {actionState === 'MODIFY' && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 border border-border">
                      <Settings className="h-8 w-8 text-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Modifiers Requested</h3>
                    <p className="text-sm text-muted-foreground">Waiting for new manual input parameters.</p>
                  </>
                )}
                <button onClick={handleRevert} className="mt-4 px-4 py-1.5 text-xs uppercase tracking-widest border border-border/50 rounded hover:bg-muted text-muted-foreground transition-colors">Reset Status</button>
              </motion.div>
            ) : (
              <div className="w-full space-y-4">
                <button 
                  onClick={handleApprove}
                  disabled={actionStatus !== null}
                  className={`w-full py-4 text-base uppercase tracking-widest font-bold rounded-lg transition-all duration-300 disabled:opacity-50 ${actionStatus === 'APPROVING' ? 'bg-primary/50 text-primary-foreground border-primary' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(229,34,34,0.3)] hover:shadow-[0_0_30px_rgba(229,34,34,0.5)] border border-primary'}`}
                >
                  {actionStatus === 'APPROVING' ? 'PROCESSING...' : 'APPROVE & EXECUTE'}
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={handleModify}
                    disabled={actionStatus !== null}
                    className="py-3 text-sm uppercase tracking-widest font-bold rounded-lg border border-border/50 bg-background hover:bg-muted text-foreground transition-colors"
                  >
                    Modify
                  </button>
                  <button 
                    onClick={handleReject}
                    disabled={actionStatus !== null}
                    className="py-3 text-sm uppercase tracking-widest font-bold rounded-lg border border-destructive/30 bg-background hover:bg-destructive/10 text-destructive transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </motion.div>

      {/* 4. SUPPORTING EVIDENCE (Telemetry & Root Cause) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Telemetry Chart */}
        <div className="xl:col-span-8 bg-card rounded-xl border border-border shadow-sm flex flex-col">
          <div className="p-5 border-b border-border/50 bg-muted/20 flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> LIVE TELEMETRY EVIDENCE
            </h3>
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(229,34,34,0.8)] animate-pulse"></span>
              Live Feed
            </span>
          </div>
          
          <div className="p-6 flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.3} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis yAxisId="bw" stroke="hsl(var(--primary))" fontSize={10} tickLine={false} axisLine={false} dx={-10} domain={['dataMin - 1', 'dataMax + 1']} />
                <YAxis yAxisId="speed" orientation="right" stroke="#8B8FA3" fontSize={10} tickLine={false} axisLine={false} dx={10} domain={['dataMin - 50', 'dataMax + 50']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', marginBottom: '4px' }}
                />
                
                <Line yAxisId="bw" type="monotone" dataKey="basisWeight" name="Basis Wt" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="speed" type="monotone" dataKey="machineSpeed" name="Speed" stroke="#8B8FA3" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line yAxisId="speed" type="monotone" dataKey="steamPressure" name="Steam" stroke="#EAB308" strokeWidth={1.5} dot={false} isAnimationActive={false} strokeOpacity={0.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Root Cause */}
        <div className="xl:col-span-4 bg-card rounded-xl border border-border shadow-sm flex flex-col">
          <div className="p-5 border-b border-border/50 bg-muted/20">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" /> DRIFT ROOT CAUSES
            </h3>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center space-y-6">
            {data.rootCause.slice(0,4).map((cause, i) => (
              <div key={i} className="flex flex-col gap-2 w-full">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-foreground/90">{cause.name}</span>
                  <span className="font-mono text-muted-foreground font-bold">{cause.value}%</span>
                </div>
                <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cause.value}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: i * 0.1 }}
                    className="h-full rounded-full" 
                    style={{ backgroundColor: cause.color }}
                  />
                </div>
              </div>
            ))}
            
            <div className="mt-4 pt-4 border-t border-border/50 text-center">
               <Link to="/root-cause" className="text-xs uppercase tracking-widest font-bold text-primary hover:underline transition-colors">Full Analysis &rarr;</Link>
            </div>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
