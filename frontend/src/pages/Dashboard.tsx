import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Clock, CheckCircle2, AlertTriangle, BarChart3, Zap, Target, ShieldCheck, TrendingUp, Cpu, Check, Settings, AlertCircle, Info, Circle, PlayCircle} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { StatusBadge } from '../components/ui/StatusBadge';
import { useDashboardData } from '../api/hooks/useDashboard';

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [actionState, setActionState] = useState<string | null>(null);
  const { data, isLoading, isError } = useDashboardData();

  const handleAction = (type: string) => {
    setActionStatus(`${type}ING`);
    setTimeout(() => {
      setActionStatus(`${type}ED`);
      setTimeout(() => {
        setActionStatus(null);
        setActionState(type);
      }, 1000);
    }, 1500);
  };
  
  const handleApprove = () => handleAction('APPROV');
  const handleSimulate = () => handleAction('SIMULAT');
  const handleModify = () => handleAction('MODIFY');
  const handleReject = () => handleAction('REJECT');
  const handleRevert = () => setActionState(null);

  
  
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-12 gap-6">
          <LoadingSkeleton className="col-span-4 h-[500px] rounded-xl" />
          <LoadingSkeleton className="col-span-5 h-[500px] rounded-xl" />
          <LoadingSkeleton className="col-span-3 h-[500px] rounded-xl" />
        </div>
        <div className="grid grid-cols-12 gap-6">
          <LoadingSkeleton className="col-span-3 h-[300px] rounded-xl" />
          <LoadingSkeleton className="col-span-6 h-[300px] rounded-xl" />
          <LoadingSkeleton className="col-span-3 h-[300px] rounded-xl" />
        </div>
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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4 pb-10"
    >
      {/* 1. EXECUTIVE HEADER */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Executive Command Center</h1>
          <p className="text-muted-foreground text-sm tracking-wide mt-1">Real-time AI intelligence for grade transition success</p>
        </div>
        
        <div className="flex flex-wrap gap-10">
          <div className="flex flex-col">
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-1">ACTIVE TRANSITION</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">
                {typeof data.activeTransition === 'string' ? data.activeTransition : (
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">Current: {data.activeTransition.current}</span>
                    <span className="text-primary mx-1">→</span>
                    <span className="text-foreground">Target: {data.activeTransition.target}</span>
                  </span>
                )}
              </span>
            </div>
            <span className="text-xs text-muted-foreground mt-1">Session ID: {data.sessionId}</span>
          </div>

          <div className="flex flex-col min-w-[200px]">
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-1">PROGRESS</span>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl font-bold text-primary">{data.progress}%</span>
            </div>
            <div className="w-full bg-muted/50 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${data.progress}%` }} 
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-primary h-full rounded-full"
              />
            </div>
            <span className="text-sm text-muted-foreground mt-1.5">{data.timeRemaining}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-1">ACTIVE TRANSITION</span>
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Current Grade</span>
                <span className="text-xl font-bold">{typeof data.activeTransition === 'object' ? data.activeTransition.current : (data.activeTransition as string).split('→')[0].trim()}</span>
              </div>
              <span className="text-muted-foreground/50 text-xl font-light">→</span>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Target Grade</span>
                <span className="text-xl font-bold text-primary">{typeof data.activeTransition === 'object' ? data.activeTransition.target : (data.activeTransition as string).split('→')[1].trim()}</span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground mt-2">Session ID: {data.sessionId}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold mb-1">AI SYSTEM</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-500 tracking-wide">ENGAGED</span>
            </div>
            <span className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
              All models operational
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. KPI BAR */}
      <motion.div variants={itemVariants} className="flex flex-wrap xl:flex-nowrap gap-4">
        {data.metrics.map((metric, idx) => (
          <div key={idx} className={`flex-1 min-w-[140px] border-t lg:border-t-0 lg:border-l border-transparent p-5 flex flex-col relative overflow-hidden group transition-colors ${metric.status === 'destructive' ? 'bg-destructive/5' : ''}`}>
            {/* Top accent line based on status */}
            {metric.status === 'success' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-green-500/50"></div>}
            {metric.status === 'warning' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-yellow-500/50"></div>}
            {metric.status === 'destructive' && <div className="absolute top-0 left-0 right-0 h-[2px] bg-destructive/50"></div>}
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground/80 flex items-center gap-2">
                {metric.title}
              </span>
            </div>
            
            <span className={`text-2xl font-bold tracking-tighter mb-1 font-mono ${metric.status === 'destructive' ? 'text-destructive' : metric.status === 'warning' ? 'text-yellow-500' : metric.status === 'success' ? 'text-green-500' : 'text-foreground'}`}>
              {metric.value}
            </span>
            <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{metric.subtitle}</span>
            {metric.detail && (
              <span className="text-xs font-medium text-muted-foreground/70 mt-1">
                {metric.detail}
              </span>
            )}
          </div>
        ))}
      </motion.div>

      {/* 3. MAIN GRID */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left: Telemetry */}
        <div className="xl:col-span-4 border-t lg:border-t-0 lg:border-l border-transparent p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-3 w-3 text-primary" /> LIVE PROCESS TELEMETRY
            </h3>
            <span className="flex items-center gap-1.5 text-sm uppercase tracking-widest text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(229,34,34,0.8)] animate-pulse"></span>
              Live
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-widest text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span> Basis Weight (lbs)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-foreground/60"></span> Machine Speed (fpm)</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Steam Pressure (psi)</span>
          </div>

          <div className="flex-1 min-h-[300px] w-full mt-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.chartData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.2} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis yAxisId="bw" stroke="hsl(var(--primary))" fontSize={9} tickLine={false} axisLine={false} dx={-10} domain={['dataMin - 2', 'dataMax + 2']} />
                <YAxis yAxisId="speed" orientation="right" stroke="#8B8FA3" fontSize={9} tickLine={false} axisLine={false} dx={10} domain={['dataMin - 100', 'dataMax + 100']} />
                <YAxis yAxisId="steam" orientation="right" stroke="#EAB308" fontSize={9} tickLine={false} axisLine={false} dx={30} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))', fontSize: '10px', marginBottom: '4px' }}
                />
                
                <Line yAxisId="bw" type="monotone" dataKey="basisWeight" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={true} />
                <Line yAxisId="speed" type="monotone" dataKey="machineSpeed" stroke="#8B8FA3" strokeWidth={2} dot={false} isAnimationActive={true} />
                <Line yAxisId="steam" type="monotone" dataKey="steamPressure" stroke="#EAB308" strokeWidth={2} dot={false} isAnimationActive={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          
        </div>

        {/* Center: AI Recommendation */}
        <div className="xl:col-span-5 border-t lg:border-t-0 lg:border-l border-transparent p-6 flex flex-col relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <Target className="h-3 w-3 text-primary" /> AI RECOMMENDATION
            </h3>
            <span className="text-sm uppercase tracking-widest text-muted-foreground">{actionState ? 'ACTION REGISTERED' : data.recommendation.engine}</span>
          </div>

          {actionState ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-6 space-y-6">
              {actionState === 'APPROV' && (
                <>
                  <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.2)] border border-green-500/20">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">Setpoints Applied Successfully</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      The recommended setpoints have been transmitted to the DCS. Digital twin is actively monitoring stabilization.
                    </p>
                  </div>
                </>
              )}
              {actionState === 'SIMULAT' && (
                <>
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(229,34,34,0.2)] border border-transparent">
                    <Activity className="h-10 w-10 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">Simulation Complete</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      Digital Twin simulated a 94% success rate with an estimated $2,450 savings. No instability predicted.
                    </p>
                  </div>
                </>
              )}
              {actionState === 'MODIFY' && (
                <>
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-2 border border-transparent">
                    <Settings className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">Modify Setpoints</h3>
                    <div className="flex flex-col gap-4 mt-4 w-64 mx-auto text-left">
                      <label className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">Target Basis Weight (lbs)</label>
                      <input type="number" defaultValue="55.0" className="bg-background border border-transparent rounded px-4 py-2 text-foreground font-mono" />
                    </div>
                  </div>
                </>
              )}
              {actionState === 'REJECT' && (
                <>
                  <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(220,38,38,0.2)] border border-destructive/20">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">Recommendation Rejected</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      The AI recommendation was discarded. Telemetry will continue monitoring for new optimal trajectories.
                    </p>
                  </div>
                </>
              )}
              
              <button 
                onClick={handleRevert}
                className="mt-8 px-6 py-2 text-sm uppercase tracking-widest font-bold rounded border border-transparent hover:bg-muted text-muted-foreground transition-all"
              >
                GO BACK / UNDO
              </button>
            </div>
          ) : (
            <>


          <div className="flex justify-between items-start mb-6 border-b border-border/40 pb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-1">{data.recommendation.action}</h2>
              <div className="mt-4 space-y-3 font-mono text-sm">
                <div className="flex justify-between items-center gap-12 border-b border-border/30 pb-2">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs">Current Speed</span>
                  <span className="font-semibold">{data.recommendation.currentSpeed !== undefined ? `${data.recommendation.currentSpeed} FPM` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center gap-12 border-b border-border/30 pb-2">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs">Recommended Speed</span>
                  <span className="font-bold text-primary">{data.recommendation.recommendedSpeed !== undefined ? `${data.recommendation.recommendedSpeed} FPM` : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center gap-12 border-b border-border/30 pb-2">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs">Adjustment</span>
                  <span className={`font-semibold ${data.recommendation.adjustment && data.recommendation.adjustment < 0 ? 'text-green-500' : 'text-yellow-500'}`}>
                    {data.recommendation.adjustment !== undefined ? `${data.recommendation.adjustment > 0 ? '+' : ''}${data.recommendation.adjustment} FPM` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-12">
                  <span className="text-muted-foreground uppercase tracking-widest text-xs">Expected Basis Weight</span>
                  <span className="font-semibold text-foreground">{data.recommendation.expectedBasisWeight !== undefined ? `${data.recommendation.expectedBasisWeight}#` : 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center ml-4">
              <div className="relative w-20 h-20 flex items-center justify-center rounded-full border-[3px] border-transparent mb-2 shadow-[0_0_20px_rgba(229,34,34,0.15)] bg-background/50">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="36" cy="36" r="33" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-border/50" />
                  <circle cx="36" cy="36" r="33" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="207" strokeDashoffset={207 - (207 * data.recommendation.confidence) / 100} className="text-primary transition-all duration-1000" />
                </svg>
                <span className="text-xl font-bold">{data.recommendation.confidence}%</span>
              </div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Confidence</span>
            </div>
          </div>

          {/* Fallback for stats if provided by mock data */}
          {data.recommendation.stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 mb-4">
              {data.recommendation.stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center lg:items-start text-center lg:text-left bg-muted/20 p-3 rounded-md">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1">{stat.label}</span>
                  <span className="text-lg font-bold tracking-tight mb-0.5">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.desc}</span>
                </div>
              ))}
            </div>
          )}

          {/* Explanations (only if provided) */}
          {(data.recommendation.whatItDoes || data.recommendation.whyItWorks) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 flex-1">
            {data.recommendation.whatItDoes && (
            <div>
              <h4 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-4">WHAT THIS WILL DO</h4>
              <ul className="space-y-3">
                {data.recommendation.whatItDoes.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-foreground/90">
                    <div className="mt-0.5 flex shrink-0 h-4 w-4 items-center justify-center rounded-full bg-green-500/20 text-green-500"><Check className="h-3 w-3" /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            )}
            {data.recommendation.whyItWorks && (
            <div>
              <h4 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-4">WHY THIS WORKS</h4>
              <ul className="space-y-3">
                {data.recommendation.whyItWorks.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-foreground/90">
                    <div className="mt-0.5 flex shrink-0 h-4 w-4 items-center justify-center rounded bg-muted text-muted-foreground"><Settings className="h-3 w-3" /></div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            )}
          </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-auto">
            <button 
              onClick={handleApprove}
              disabled={actionStatus !== null}
              className={`flex-1 min-w-[120px] px-6 py-3 text-sm uppercase tracking-widest font-bold rounded transition-all duration-300 disabled:opacity-50 ${actionStatus === 'APPROVED' ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border-green-500' : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(229,34,34,0.3)] hover:shadow-[0_0_30px_rgba(229,34,34,0.5)] border border-primary'}`}
            >
              {actionStatus === 'APPROVING' ? 'PROCESSING...' : actionStatus === 'APPROVED' ? 'APPROVED' : 'APPROVE'}
            </button>
            <button 
              onClick={handleSimulate}
              disabled={actionStatus !== null}
              className={`px-6 py-3 text-sm uppercase tracking-widest font-bold rounded border disabled:opacity-50 transition-colors ${actionStatus === 'SIMULATED' ? 'bg-green-500/20 text-green-500 border-green-500/50' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {actionStatus === 'SIMULATING' ? 'SIMULATING...' : actionStatus === 'SIMULATED' ? 'SIMULATED' : 'SIMULATE FIRST'}
            </button>
            <button 
              onClick={handleModify}
              disabled={actionStatus !== null}
              className={`px-6 py-3 text-sm uppercase tracking-widest font-bold rounded border disabled:opacity-50 transition-colors ${actionStatus === 'MODIFIED' ? 'bg-primary/20 text-primary border-transparent' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {actionStatus === 'MODIFYING' ? 'MODIFYING...' : actionStatus === 'MODIFIED' ? 'MODIFIED' : 'MODIFY'}
            </button>
            <button 
              onClick={handleReject}
              disabled={actionStatus !== null}
              className={`px-6 py-3 text-sm uppercase tracking-widest font-bold rounded border disabled:opacity-50 transition-colors ${actionStatus === 'REJECTED' ? 'bg-destructive/20 text-destructive border-destructive/50' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {actionStatus === 'REJECTING' ? 'REJECTING...' : actionStatus === 'REJECTED' ? 'REJECTED' : 'REJECT'}
            </button>
          </div>
          </>
          )}
        </div>

        {/* Right: Transition Timeline */}
        <div className="xl:col-span-3 border-t lg:border-t-0 lg:border-l border-transparent p-5 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <Clock className="h-3 w-3 text-primary" /> TRANSITION TIMELINE
            </h3>
            <span className="flex items-center gap-1.5 text-sm uppercase tracking-widest text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(229,34,34,0.8)] animate-pulse"></span>
              Live
            </span>
          </div>

          <div className="flex-1 relative pl-2">
            {/* Connecting vertical line */}
            <div className="absolute left-6 top-2 bottom-6 w-[1px] bg-border/50"></div>
            
            <div className="space-y-6">
              {data.timeline.map((event, i) => (
                <div key={i} className="flex gap-4 relative z-10">
                  <div className="w-12 pt-1 text-right shrink-0">
                    <span className={`text-sm font-mono tracking-wider ${event.status === 'current' ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{event.time}</span>
                  </div>
                  
                  <div className="relative shrink-0 w-6 flex justify-center pt-1">
                    {event.status === 'completed' && <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-500"><Check className="h-3 w-3" /></div>}
                    {event.status === 'current' && <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary shadow-[0_0_10px_rgba(229,34,34,0.3)] flex items-center justify-center text-primary animate-pulse"><Circle className="h-2 w-2 fill-current" /></div>}
                    {event.status === 'pending' && <div className="w-5 h-5 rounded-full bg-muted/30 border border-muted flex items-center justify-center"><Circle className="h-1.5 w-1.5 fill-muted-foreground/50 text-muted-foreground/50" /></div>}
                  </div>
                  
                  <div className="flex-1 pb-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`text-sm font-bold tracking-tight uppercase ${event.status === 'current' ? 'text-primary' : event.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}`}>
                        {event.title}
                      </span>
                      {event.engine && (
                        <span className="text-[9px] uppercase tracking-widest font-bold px-1.5 py-0.5 rounded bg-muted text-foreground/70 border border-transparent">
                          {event.engine}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{event.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-transparent">
            <Link to="/timeline" className="text-sm uppercase tracking-widest font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View Full Timeline <TrendingUp className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>

      </motion.div>

      {/* 4. BOTTOM GRID */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Left: Root Cause Analysis */}
        <div className="xl:col-span-3 border-t lg:border-t-0 lg:border-l border-transparent p-5 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <Cpu className="h-3 w-3 text-primary" /> ROOT CAUSE ANALYSIS
            </h3>
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold bg-muted/50 px-2 py-0.5 rounded">M4 Engine</span>
          </div>

          <div className="flex-1 flex flex-col justify-center py-4 space-y-5">
            {data.rootCause.map((cause, i) => (
              <div key={i} className="flex flex-col gap-1.5 w-full">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium tracking-wide text-foreground/90">{cause.name}</span>
                  <span className="font-mono text-muted-foreground font-semibold">{cause.value}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden border border-transparent">
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
          </div>
          
          <div className="mt-auto pt-4 border-t border-transparent">
            <Link to="/root-cause" className="text-sm uppercase tracking-widest font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
              View Full Analysis <TrendingUp className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>

        {/* Center: Digital Twin Validation */}
        <div className="xl:col-span-6 border-t lg:border-t-0 lg:border-l border-transparent p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-primary" /> DIGITAL TWIN VALIDATION
            </h3>
            <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold bg-muted/50 px-2 py-0.5 rounded">M9 Simulator</span>
          </div>

          <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-4">SCENARIO COMPARISON</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {data.digitalTwin.scenarios.map((scen, i) => (
              <div key={i} className={`p-5 rounded-lg border flex flex-col relative transition-all ${scen.recommended ? 'bg-green-500/5 border-green-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-background/50 border-transparent'}`}>
                {scen.recommended && (
                  <div className="absolute top-3 right-3 text-green-500 bg-green-500/20 rounded-full p-0.5">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <span className={`text-sm font-bold tracking-widest uppercase mb-1 ${scen.recommended ? 'text-green-500' : 'text-muted-foreground'}`}>{scen.name}</span>
                <span className={`text-base font-semibold tracking-tight mb-5 ${scen.recommended ? 'text-foreground' : 'text-foreground'}`}>{scen.change}</span>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center justify-between text-xs border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">Stabilization Time:</span>
                    <span className="font-mono font-semibold">{scen.stabilizationTime || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">Waste Generated:</span>
                    <span className="font-mono font-semibold">{scen.loss}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">Energy Consumption:</span>
                    <span className="font-mono font-semibold">{scen.energyConsumption || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs border-b border-border/50 pb-1">
                    <span className="text-muted-foreground">Trajectory:</span>
                    <span className="font-mono font-semibold">{scen.trajectory || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Expected Quality:</span>
                    <span className={`font-bold ${scen.risk === 'HIGH' ? 'text-destructive' : scen.risk === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'}`}>{scen.expectedQuality || scen.risk}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-transparent pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm uppercase tracking-widest font-bold text-muted-foreground">BEST SCENARIO:</span>
              <span className="text-sm uppercase tracking-widest font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/30">B (Recommended)</span>
            </div>
            <button className="text-sm uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 border border-transparent hover:bg-muted px-3 py-1.5 rounded">
              Run New Simulation <PlayCircle className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>

        {/* Right: Alerts & Notifications */}
        <div className="xl:col-span-3 border-t lg:border-t-0 lg:border-l border-transparent p-5 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-3 w-3 text-primary" /> ALERTS & NOTIFICATIONS
            </h3>
            <Link to="/timeline" className="text-sm uppercase tracking-widest text-primary font-bold hover:underline">View All (3)</Link>
          </div>

          <div className="space-y-3 flex-1 overflow-hidden">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="flex gap-3 p-3 rounded-lg border border-transparent bg-background/30 hover:bg-muted/50 transition-colors">
                <div className={`mt-0.5 shrink-0 ${alert.type === 'destructive' ? 'text-destructive' : alert.type === 'warning' ? 'text-yellow-500' : 'text-foreground/60'}`}>
                  {alert.type === 'destructive' ? <AlertTriangle className="h-4 w-4" /> : alert.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold text-foreground truncate">{alert.title}</span>
                    <span className="text-xs whitespace-nowrap text-muted-foreground font-mono">{alert.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground/80 leading-relaxed truncate">{alert.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
