import { useState } from 'react';
import { 
  Settings, 
  User, 
  Server, 
  Cpu, 
  Factory, 
  Globe, 
  Bell, 
  Palette, 
  Activity, 
  ShieldCheck, 
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Database,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

import { PageHeader } from '../components/ui/PageHeader';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

// Integrate live backend data via React Query
import { useSettingsWorkspaceData } from '../api/hooks/useSettings';

const getServiceIcon = (id: string) => {
  switch (id) {
    case 'backend': return Server;
    case 'kafka': return Activity;
    case 'db': return HardDrive;
    case 'redis': return Database;
    case 'mlflow': return ShieldCheck;
    default: return Server;
  }
};

const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('application');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSave = () => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      setSaveStatus('Saved Successfully');
      setTimeout(() => setSaveStatus(null), 2000);
    }, 1000);
  };

  // Fetch live workspace data
  const { data, isLoading, isError } = useSettingsWorkspaceData();

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
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 shrink-0">
            <Card className="h-[250px]"><CardContent className="p-4 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
          <div className="flex-1">
            <Card className="min-h-[500px]"><CardContent className="p-6 h-full"><LoadingSkeleton className="h-full w-full" /></CardContent></Card>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-center text-destructive">
        <AlertTriangle className="h-10 w-10 mx-auto mb-4" />
        <h2 className="text-lg font-bold">Failed to load Settings Workspace</h2>
        <p className="text-sm">Please check your backend connection or refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* --- TOP SECTION --- */}
      <PageHeader 
        title="Global Settings Workspace" 
        description="Manage application preferences, AI tuning, and system configurations."
        action={
          <div className="flex space-x-2 items-center">
            <StatusBadge variant="success" className="bg-green-500/20 text-green-500 border border-green-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              {data.system.globalStatus}
            </StatusBadge>
          </div>
        }
      />

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* --- LEFT SIDEBAR (Navigation) --- */}
        <div className="w-full md:w-64 shrink-0">
          <Card className="border-transparent    overflow-hidden">
            <CardContent className="p-3">
              <Tabs value={activeTab} orientation="vertical" className="w-full">
                <TabsList className="flex-col items-stretch w-full h-auto bg-transparent space-y-2">
                  <TabsTrigger 
                    value="application" 
                    onClick={() => setActiveTab('application')}
                    className={`justify-start px-4 py-3 rounded-md transition-all duration-300 ${activeTab === 'application' ? 'bg-primary/10 text-primary border border-transparent shadow-[0_0_10px_rgba(229,34,34,0.1)]' : 'hover:bg-muted/50 text-foreground border border-transparent hover:border-transparent'}`}
                  >
                    <Settings className={`h-4 w-4 mr-3 ${activeTab === 'application' ? 'text-primary' : 'text-muted-foreground'}`} /> Application
                  </TabsTrigger>
                  <TabsTrigger 
                    value="plant" 
                    onClick={() => setActiveTab('plant')}
                    className={`justify-start px-4 py-3 rounded-md transition-all duration-300 ${activeTab === 'plant' ? 'bg-primary/10 text-primary border border-transparent shadow-[0_0_10px_rgba(229,34,34,0.1)]' : 'hover:bg-muted/50 text-foreground border border-transparent hover:border-transparent'}`}
                  >
                    <Factory className={`h-4 w-4 mr-3 ${activeTab === 'plant' ? 'text-primary' : 'text-muted-foreground'}`} /> Plant
                  </TabsTrigger>
                  <TabsTrigger 
                    value="ai" 
                    onClick={() => setActiveTab('ai')}
                    className={`justify-start px-4 py-3 rounded-md transition-all duration-300 ${activeTab === 'ai' ? 'bg-primary/10 text-primary border border-transparent shadow-[0_0_10px_rgba(229,34,34,0.1)]' : 'hover:bg-muted/50 text-foreground border border-transparent hover:border-transparent'}`}
                  >
                    <Cpu className={`h-4 w-4 mr-3 ${activeTab === 'ai' ? 'text-primary' : 'text-muted-foreground'}`} /> AI Configuration
                  </TabsTrigger>
                  <TabsTrigger 
                    value="user" 
                    onClick={() => setActiveTab('user')}
                    className={`justify-start px-4 py-3 rounded-md transition-all duration-300 ${activeTab === 'user' ? 'bg-primary/10 text-primary border border-transparent shadow-[0_0_10px_rgba(229,34,34,0.1)]' : 'hover:bg-muted/50 text-foreground border border-transparent hover:border-transparent'}`}
                  >
                    <User className={`h-4 w-4 mr-3 ${activeTab === 'user' ? 'text-primary' : 'text-muted-foreground'}`} /> User Profile
                  </TabsTrigger>
                  <TabsTrigger 
                    value="system" 
                    onClick={() => setActiveTab('system')}
                    className={`justify-start px-4 py-3 rounded-md transition-all duration-300 ${activeTab === 'system' ? 'bg-primary/10 text-primary border border-transparent shadow-[0_0_10px_rgba(229,34,34,0.1)]' : 'hover:bg-muted/50 text-foreground border border-transparent hover:border-transparent'}`}
                  >
                    <Server className={`h-4 w-4 mr-3 ${activeTab === 'system' ? 'text-primary' : 'text-muted-foreground'}`} /> System Status
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1">
            
            {/* APPLICATION SETTINGS */}
            {activeTab === 'application' && (
              <motion.div key="application" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <Card className="border-transparent    overflow-hidden">
                  <CardHeader className="border-b border-transparent bg-muted/10 pb-5">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" /> Application Settings
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-widest mt-1">Manage your display and notification preferences.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-transparent pb-5 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 tracking-wide"><Palette className="h-4 w-4 text-primary" /> Theme</h4>
                        <p className="text-xs text-muted-foreground/80 mt-1">Select your preferred color scheme.</p>
                      </div>
                      <select className="bg-background/50 border border-transparent rounded p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" defaultValue={data.application.theme}>
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-transparent pb-5 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 tracking-wide"><Globe className="h-4 w-4 text-primary" /> Language</h4>
                        <p className="text-xs text-muted-foreground/80 mt-1">Set the primary application language.</p>
                      </div>
                      <select className="bg-background/50 border border-transparent rounded p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" defaultValue={data.application.language}>
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-transparent pb-5 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 tracking-wide"><Clock className="h-4 w-4 text-primary" /> Timezone</h4>
                        <p className="text-xs text-muted-foreground/80 mt-1">Timezone for all timestamps and logs.</p>
                      </div>
                      <select className="bg-background/50 border border-transparent rounded p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" defaultValue={data.application.timezone}>
                        <option value="est">America/New_York (EST)</option>
                        <option value="cst">America/Chicago (CST)</option>
                        <option value="pst">America/Los_Angeles (PST)</option>
                        <option value="utc">UTC</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold flex items-center gap-2 tracking-wide"><Bell className="h-4 w-4 text-primary" /> Notifications</h4>
                        <p className="text-xs text-muted-foreground/80 mt-1">Enable or disable system-wide toast notifications.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={data.application.notificationsEnabled} />
                        <div className="w-11 h-6 bg-muted/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary "></div>
                      </label>
                    </div>

                  </CardContent>
                  <CardFooter className="border-t border-transparent pt-5 pb-5 justify-end flex items-center gap-4 bg-muted/5">
                    {saveStatus && <span className="text-xs font-bold uppercase tracking-widest text-green-500">{saveStatus}</span>}
                    <button 
                      onClick={handleSave}
                      disabled={saveStatus !== null}
                      className="px-6 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-bold rounded hover:bg-primary/80 transition-all duration-300 disabled:opacity-50 shadow-[0_0_15px_rgba(229,34,34,0.2)] hover:shadow-[0_0_20px_rgba(229,34,34,0.4)]"
                    >
                      Save Changes
                    </button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* PLANT SETTINGS */}
            {activeTab === 'plant' && (
              <motion.div key="plant" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <Card className="border-transparent    overflow-hidden">
                  <CardHeader className="border-b border-transparent bg-muted/10 pb-5">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Factory className="h-5 w-5 text-primary" /> Plant Configuration
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-widest mt-1">Configure physical asset routing and identification.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    
                    <div className="space-y-2 border-b border-transparent pb-5">
                      <h4 className="text-sm font-semibold tracking-wide">Plant Name</h4>
                      <input type="text" className="w-full bg-background/50 border border-transparent rounded p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" defaultValue={data.plant.name} readOnly />
                      <p className="text-sm text-muted-foreground/80 uppercase tracking-widest">Global facility identifier.</p>
                    </div>

                    <div className="space-y-2 border-b border-transparent pb-5">
                      <h4 className="text-sm font-semibold tracking-wide">Active Production Line</h4>
                      <select className="w-full bg-background/50 border border-transparent rounded p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" defaultValue={data.plant.activeLine}>
                        <option value="pm1">Paper Machine 1 (PM1)</option>
                        <option value="pm2">Paper Machine 2 (PM2)</option>
                        <option value="pm3">Paper Machine 3 (PM3)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold tracking-wide">Machine Type</h4>
                      <input type="text" className="w-full bg-background/30 border border-transparent rounded p-2 text-sm text-muted-foreground/60 cursor-not-allowed" defaultValue={data.plant.machineType} disabled />
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* AI SETTINGS */}
            {activeTab === 'ai' && (
              <motion.div key="ai" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <Card className="border-transparent    overflow-hidden border-transparent">
                  <CardHeader className="border-b border-transparent bg-primary/5 pb-5">
                    <CardTitle className="text-lg flex items-center gap-2 text-primary">
                      <Cpu className="h-5 w-5" /> AI & Control Settings
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-widest mt-1 text-muted-foreground">Tune the underlying AI engines and approval thresholds.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    
                    <div className="space-y-3 border-b border-transparent pb-5">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-semibold tracking-wide">Default Confidence Threshold</h4>
                        <span className="text-sm font-bold text-primary font-mono">{data.ai.defaultConfidenceThreshold}%</span>
                      </div>
                      <input type="range" min="50" max="99" defaultValue={data.ai.defaultConfidenceThreshold} className="w-full accent-primary" />
                      <p className="text-sm text-muted-foreground/80 uppercase tracking-widest">Minimum M10 fusion score required to auto-approve recommendations.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-transparent pb-5 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold tracking-wide">Recommendation Mode</h4>
                        <p className="text-sm text-muted-foreground/80 mt-1 uppercase tracking-widest">Set the optimization priority for M6.</p>
                      </div>
                      <select className="bg-background/50 border border-transparent rounded p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" defaultValue={data.ai.recommendationMode}>
                        <option value="speed">Aggressive (Speed Priority)</option>
                        <option value="balanced">Balanced (Pareto Optimal)</option>
                        <option value="safety">Conservative (Safety Priority)</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-transparent pb-5 gap-4">
                      <div>
                        <h4 className="text-sm font-semibold tracking-wide">Auto-Run Digital Twin</h4>
                        <p className="text-sm text-muted-foreground/80 mt-1 uppercase tracking-widest">Automatically simulate recommendations before presentation.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={data.ai.autoRunDigitalTwin} />
                        <div className="w-11 h-6 bg-muted/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary "></div>
                      </label>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-semibold tracking-wide">UI Refresh Interval</h4>
                        <p className="text-sm text-muted-foreground/80 mt-1 uppercase tracking-widest">How often the dashboards poll for new telemetry.</p>
                      </div>
                      <select className="bg-background/50 border border-transparent rounded p-2 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" defaultValue={data.ai.uiRefreshInterval}>
                        <option value="500">500 ms (Aggressive)</option>
                        <option value="1000">1 Second (Real-time)</option>
                        <option value="5000">5 Seconds (Economy)</option>
                      </select>
                    </div>

                  </CardContent>
                  <CardFooter className="border-t border-transparent pt-5 pb-5 justify-end flex items-center gap-4 bg-muted/5">
                    {saveStatus && <span className="text-xs font-bold uppercase tracking-widest text-green-500">{saveStatus}</span>}
                    <button 
                      onClick={handleSave}
                      disabled={saveStatus !== null}
                      className="px-6 py-2 bg-primary text-primary-foreground text-xs uppercase tracking-widest font-bold rounded hover:bg-primary/80 transition-all duration-300 disabled:opacity-50 shadow-[0_0_15px_rgba(229,34,34,0.2)] hover:shadow-[0_0_20px_rgba(229,34,34,0.4)]"
                    >
                      Apply AI Config
                    </button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* USER SETTINGS */}
            {activeTab === 'user' && (
              <motion.div key="user" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <Card className="border-transparent    overflow-hidden">
                  <CardHeader className="border-b border-transparent bg-muted/10 pb-5">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" /> User Profile
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-widest mt-1">Your personal account details.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    
                    <div className="flex items-center space-x-5 mb-8 bg-background/30 p-4 rounded-xl border border-transparent">
                      <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-transparent shadow-[0_0_20px_rgba(229,34,34,0.2)] flex items-center justify-center text-primary font-bold text-3xl">
                        {data.user.initials}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight text-foreground">{data.user.fullName}</h3>
                        <p className="text-sm font-semibold text-primary tracking-wide uppercase mt-1">{data.user.role}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</h4>
                        <input type="text" className="w-full bg-background/30 border border-transparent rounded p-2 text-sm text-foreground/80 cursor-not-allowed" defaultValue={data.user.fullName} disabled />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</h4>
                        <input type="text" className="w-full bg-background/30 border border-transparent rounded p-2 text-sm text-foreground/80 cursor-not-allowed" defaultValue={data.user.email} disabled />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">System Role</h4>
                        <input type="text" className="w-full bg-background/30 border border-transparent rounded p-2 text-sm text-foreground/80 cursor-not-allowed" defaultValue={data.user.role} disabled />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Login</h4>
                        <input type="text" className="w-full bg-background/30 border border-transparent rounded p-2 text-sm text-foreground/80 cursor-not-allowed font-mono" defaultValue={data.user.lastLogin} disabled />
                      </div>
                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* SYSTEM SETTINGS */}
            {activeTab === 'system' && (
              <motion.div key="system" variants={tabVariants} initial="initial" animate="animate" exit="exit">
                <Card className="border-transparent    overflow-hidden">
                  <CardHeader className="border-b border-transparent bg-muted/10 pb-5">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Server className="h-5 w-5 text-primary" /> System Connectivity Status
                    </CardTitle>
                    <CardDescription className="text-xs uppercase tracking-widest mt-1">Real-time health of backend microservices and databases.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    
                    {data.system.services.map((service, idx) => {
                      const Icon = getServiceIcon(service.id);
                      const isDegraded = service.status === 'DEGRADED';
                      const isOffline = service.status === 'OFFLINE';

                      return (
                        <motion.div 
                          key={service.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                          isOffline ? 'border-destructive/30 bg-destructive/10' :
                          isDegraded ? 'border-warning/30 bg-warning/10' : 
                          'border-transparent  hover:bg-muted/30'
                        }`}>
                          <div className="flex items-center gap-4 mb-3 sm:mb-0">
                            <div className={`p-2 rounded-lg ${
                              isOffline ? 'bg-destructive/20 text-destructive' :
                              isDegraded ? 'bg-warning/20 text-warning' : 
                              'bg-primary/20 text-primary shadow-[0_0_10px_rgba(229,34,34,0.2)]'
                            }`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className={`text-sm font-bold tracking-tight ${
                                isOffline ? 'text-destructive' :
                                isDegraded ? 'text-warning' : 
                                'text-foreground'
                              }`}>{service.name}</h4>
                              <p className="text-sm uppercase tracking-widest text-muted-foreground mt-0.5">{service.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 sm:border-l sm:border-transparent sm:pl-4">
                            <span className="text-xs font-mono text-muted-foreground/80">{service.detail}</span>
                            <StatusBadge variant={
                              isOffline ? 'destructive' :
                              isDegraded ? 'warning' : 'success'
                            } className={`text-sm py-1 px-3 ${
                              isOffline ? 'bg-destructive/20 text-destructive border-destructive/50' :
                              isDegraded ? 'bg-gci-amber/20 text-gci-amber border-gci-amber/50' : 
                              'bg-green-500/20 text-green-500 border-green-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                            }`}>
                              {isOffline ? <AlertTriangle className="h-3 w-3 mr-1"/> :
                               isDegraded ? <AlertTriangle className="h-3 w-3 mr-1"/> : 
                               <CheckCircle2 className="h-3 w-3 mr-1"/>}
                              {service.status}
                            </StatusBadge>
                          </div>
                        </motion.div>
                      );
                    })}

                  </CardContent>
                </Card>
              </motion.div>
            )}
        </div>
      </div>

      {/* --- BOTTOM SECTION: System Information --- */}
      <div className="pt-8 pb-4">
        <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> System Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="  border-transparent  hover: transition-colors duration-300">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Environment</p>
              <p className="text-sm font-bold text-foreground">{data.system.environment}</p>
            </CardContent>
          </Card>
          <Card className="  border-transparent  hover: transition-colors duration-300">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Build Version</p>
              <p className="text-sm font-mono font-bold text-primary">{data.system.buildVersion}</p>
            </CardContent>
          </Card>
          <Card className="  border-transparent  hover: transition-colors duration-300">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Frontend Version</p>
              <p className="text-sm font-mono font-bold text-foreground">{data.system.frontendVersion}</p>
            </CardContent>
          </Card>
          <Card className="  border-transparent  hover: transition-colors duration-300">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2 font-semibold">Backend Version</p>
              <p className="text-sm font-mono font-bold text-foreground">{data.system.backendVersion}</p>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
