import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Activity, 
  Target, 
  ShieldCheck, 
  AlertTriangle,
  GitCommit,
  GitBranch,
  Timer
} from 'lucide-react';
import { motion } from 'framer-motion';

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, DataTableRow, DataTableCell } from '../components/ui/DataTable';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

// Integrate live backend data via React Query
import { useTimelineWorkspaceData } from '../api/hooks/useTimeline';
import type { TimelineMilestone } from '../api/hooks/useTimeline';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Timeline() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch live workspace data
  const { data, isLoading, isError } = useTimelineWorkspaceData();

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><LoadingSkeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Card className="h-full min-h-[500px]"><CardContent className="p-6"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
          <div className="lg:col-span-4">
            <Card className="h-full min-h-[500px]"><CardContent className="p-6"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-destructive">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-lg font-bold">Failed to load Timeline Workspace</h2>
        <p className="text-sm">Please check your backend connection or refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* --- TOP SECTION --- */}
      <PageHeader 
        title="Timeline Visualization Workspace" 
        description="M8 - Comprehensive Gantt-style tracking of transition milestones."
        action={
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium tracking-wide">{currentTime.toLocaleTimeString()} Local Time</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground uppercase tracking-widest">Transition</span>
              <span className="text-sm font-semibold text-foreground">{data.transitionId}</span>
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <StatusBadge variant="default" className="bg-primary/20 text-primary border border-transparent shadow-[0_0_15px_rgba(229,34,34,0.2)]">
                <Timer className="h-3 w-3 mr-1" />
                <AnimatedNumber value={data.overallProgress} />% COMPLETE
              </StatusBadge>
            </div>
          </div>
        }
      />

      {/* --- KPI SECTION (Glassmorphism Telemetry Bar) --- */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="rounded-xl border border-transparent    p-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6 md:gap-8 divide-x divide-border/50">
          {data.metrics.map((metric, idx) => {
            const Icon = idx === 0 ? Activity :
                         idx === 1 ? Target :
                         idx === 2 ? GitBranch :
                         idx === 3 ? GitCommit :
                         idx === 4 ? Clock : CheckCircle2;
            return (
              <div key={idx} className={`space-y-2 ${idx !== 0 && idx % 2 === 0 ? 'pl-6 md:pl-8' : idx !== 0 ? 'pl-6' : ''}`}>
                <span className="text-sm uppercase text-muted-foreground font-semibold tracking-widest flex items-center gap-1.5">
                  <Icon className={`h-3 w-3 ${metric.isSuccess ? 'text-green-500' : 'text-primary'}`} /> 
                  {metric.title}
                </span>
                <div className="text-2xl font-bold tracking-tighter text-foreground">
                  {typeof metric.value === 'number' || !isNaN(Number(metric.value)) ? (
                    <AnimatedNumber value={Number(metric.value)} />
                  ) : (
                    metric.value
                  )}
                </div>
                <p className="text-sm text-muted-foreground/80 leading-snug">{metric.description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* --- MAIN GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CENTER PANEL: Visual Timeline */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden border-transparent   ">
            <CardHeader className="border-b border-transparent pb-4">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <GitCommit className="h-4 w-4 text-primary" />
                Transition Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <div className="relative border-l-2 border-transparent ml-3 md:ml-5 space-y-8">
                {data.milestones.map((milestone: TimelineMilestone, idx: number) => {
                  const isCompleted = milestone.status === 'completed';
                  const isActive = milestone.status === 'active';
                  
                  return (
                    <motion.div 
                      key={milestone.id} 
                      initial={{ opacity: 0, x: -20, y: 10 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="relative pl-8 md:pl-10"
                    >
                      {/* Node Indicator */}
                      <span className={`absolute -left-[9px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background  ${
                        isCompleted ? 'bg-green-500' :
                        isActive ? 'bg-primary' : 'bg-muted-foreground/50 border border-background'
                      }`}>
                        {isActive && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>}
                      </span>
                      
                      <div className={`flex flex-col sm:flex-row sm:items-start sm:justify-between p-5 rounded-lg border  transition-all min-w-0 ${
                        isActive ? 'border-transparent bg-primary/10 shadow-[0_4px_20px_-5px_rgba(229,34,34,0.15)] scale-[1.01]' : 
                        isCompleted ? 'border-transparent  hover:bg-muted/30' : 'border-dashed border-transparent bg-muted/5 opacity-60 hover:opacity-100'
                      }`}>
                        <div className="space-y-1.5 min-w-0 flex-1 pr-4">
                          <div className="flex items-center gap-3">
                            <h4 className={`text-sm font-bold tracking-tight ${
                              isActive ? 'text-primary' : 
                              isCompleted ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {milestone.title}
                            </h4>
                            {milestone.subsystem && (
                              <StatusBadge variant="outline" className="text-xs py-0 h-4 bg-background/50">
                                {milestone.subsystem}
                              </StatusBadge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed">{milestone.description}</p>
                        </div>

                        <div className="mt-4 sm:mt-0 flex flex-row sm:flex-col items-center sm:items-end gap-4 sm:gap-2 text-sm shrink-0">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground bg-background/50 px-2 py-1 rounded border border-transparent">
                            <Clock className="h-3 w-3 text-primary" />
                            {milestone.time}
                          </div>
                          {milestone.duration && (
                            <span className="text-sm uppercase tracking-widest text-muted-foreground font-semibold">
                              Took {milestone.duration}
                            </span>
                          )}
                          {milestone.confidence && (
                            <div className="flex items-center gap-1 text-sm font-bold text-green-500 uppercase tracking-widest">
                              <ShieldCheck className="h-3 w-3" />
                              <AnimatedNumber value={milestone.confidence} />% Conf
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT PANEL: Details & Events */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="h-full flex flex-col border-transparent  ">
            <CardHeader className="border-b border-transparent pb-4">
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <Activity className="h-4 w-4 text-primary" />
                Recent System Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden flex flex-col">
              <div className="overflow-x-auto w-full no-scrollbar flex-1">
                <DataTable headers={['Time', 'Subsystem', 'Event']}>
                  {data.eventsTable.map((row, idx) => (
                    <DataTableRow key={idx} className="hover:bg-muted/30 transition-colors">
                      <DataTableCell className="font-mono text-sm text-muted-foreground whitespace-nowrap">{row.time}</DataTableCell>
                      <DataTableCell>
                        <StatusBadge variant="outline" className="text-xs py-0 h-4 bg-background/50 whitespace-nowrap">
                          {row.subsystem}
                        </StatusBadge>
                      </DataTableCell>
                      <DataTableCell>
                        <div className="flex flex-col min-w-0 space-y-0.5">
                          <span className={`text-xs font-bold truncate ${
                            row.status === 'SUCCESS' ? 'text-green-500' :
                            row.status === 'WARNING' ? 'text-gci-amber' : 'text-foreground'
                          }`}>
                            {row.event}
                          </span>
                          <span className="text-sm text-muted-foreground/80 truncate max-w-[200px]" title={row.details}>
                            {row.details}
                          </span>
                        </div>
                      </DataTableCell>
                    </DataTableRow>
                  ))}
                </DataTable>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
