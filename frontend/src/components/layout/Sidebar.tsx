import React from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../utils/cn"
import { 
  LayoutDashboard, 
  LineChart, 
  Search, 
  ThumbsUp, 
  Cpu, 
  Clock, 
  ShieldCheck, 
  FileSearch, 
  Database,
  Settings,
  Hexagon,
  Network
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Prediction Engine', href: '/prediction', icon: LineChart },
  { name: 'Root Cause', href: '/root-cause', icon: Search },
  { name: 'Recommendations', href: '/recommendations', icon: ThumbsUp },
  { name: 'Digital Twin', href: '/digital-twin', icon: Cpu },
  { name: 'Timeline', href: '/timeline', icon: Clock },
  { name: 'Decision Intel', href: '/decision', icon: ShieldCheck },
  { name: 'Correlations', href: '/correlations', icon: Network },
  { name: 'Explainability', href: '/explainability', icon: FileSearch },
  { name: 'Knowledge Base', href: '/knowledge-base', icon: Database },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      <div className="px-6 py-5 border-b border-border/50 flex items-center gap-3">
        <span className="text-3xl font-black tracking-tighter text-primary">GCI</span>
        <div className="flex flex-col justify-center mt-0.5">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-tight">Grade Change</span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-tight">Intelligence</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors'
              )}
            >
              <Icon
                className={cn(
                  isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                  'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-border bg-muted/20">
        <div className="text-[10px] text-muted-foreground text-center font-mono uppercase tracking-widest">
          GCI Platform v2.4.1
        </div>
      </div>
    </div>
  )
}
