import React from "react";
import { Link } from "react-router-dom";
import { Activity, BookOpen, ShieldAlert } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-border/50 bg-background pt-10 pb-6 px-8 text-sm text-muted-foreground w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10 max-w-7xl mx-auto">
        <div className="col-span-1 md:col-span-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-bold text-foreground tracking-tight text-base uppercase">Grade Change Intelligence</span>
          </div>
          <p className="text-xs mb-6 max-w-xs leading-relaxed opacity-80">
            Industrial decision intelligence for continuous process manufacturing. Predictive optimization and autonomous control limits.
          </p>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SYSTEM ONLINE
          </div>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <h4 className="font-bold text-foreground mb-4 tracking-wider uppercase text-[10px] opacity-60">Modules</h4>
          <ul className="space-y-3 text-xs">
            <li><Link to="/prediction" className="hover:text-primary transition-colors flex items-center gap-2">Prediction</Link></li>
            <li><Link to="/decision" className="hover:text-primary transition-colors flex items-center gap-2">Decision Intelligence</Link></li>
            <li><Link to="/recommendations" className="hover:text-primary transition-colors flex items-center gap-2">Recommendations</Link></li>
          </ul>
        </div>

        <div className="col-span-1 md:col-span-2">
          <h4 className="font-bold text-foreground mb-4 tracking-wider uppercase text-[10px] opacity-60">Analytics</h4>
          <ul className="space-y-3 text-xs">
            <li><Link to="/timeline" className="hover:text-primary transition-colors flex items-center gap-2">Timeline</Link></li>
            <li><Link to="/root-cause" className="hover:text-primary transition-colors flex items-center gap-2">Root Cause</Link></li>
            <li><Link to="/explainability" className="hover:text-primary transition-colors flex items-center gap-2">Explainability</Link></li>
          </ul>
        </div>
        
        <div className="col-span-1 md:col-span-4 flex flex-col md:items-end">
          <h4 className="font-bold text-foreground mb-4 tracking-wider uppercase text-[10px] opacity-60">Diagnostics</h4>
          <ul className="space-y-3 text-xs flex flex-col md:items-end">
            <li><Link to="/knowledge-base" className="hover:text-primary transition-colors flex items-center gap-2"><BookOpen className="h-3 w-3" /> Knowledge Base</Link></li>
            <li><Link to="/settings" className="hover:text-primary transition-colors flex items-center gap-2"><Activity className="h-3 w-3" /> System Settings</Link></li>
            <li><Link to="/settings" className="hover:text-destructive transition-colors flex items-center gap-2 text-destructive/80"><ShieldAlert className="h-3 w-3" /> Emergency Halt</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-border/30 text-[10px] uppercase tracking-wider max-w-7xl mx-auto">
        <p className="opacity-60">&copy; {new Date().getFullYear()} GCI Process Solutions. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0 opacity-80">
          <span className="font-mono">CORE v1.9.0</span>
          <span className="font-mono">UI v3.0.0</span>
        </div>
      </div>
    </footer>
  );
}
