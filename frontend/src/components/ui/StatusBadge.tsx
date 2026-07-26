import React from "react"
import { cn } from "../../utils/cn"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline"
}

export function StatusBadge({ className, variant = "default", ...props }: StatusBadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  
  const variants = {
    default: "border-primary/50 bg-primary/10 text-primary shadow-[0_0_10px_rgba(229,34,34,0.15)] hover:bg-primary/20",
    success: "border-green-500/50 bg-green-500/10 text-green-500 shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:bg-green-500/20",
    warning: "border-yellow-500/50 bg-yellow-500/10 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.15)] hover:bg-yellow-500/20",
    destructive: "border-destructive/50 bg-destructive/10 text-destructive shadow-[0_0_10px_rgba(239,68,68,0.15)] hover:bg-destructive/20",
    outline: "text-foreground border-border bg-transparent hover:bg-muted/50",
  }
  
  return (
    <div className={cn(baseStyles, variants[variant], className)} {...props} />
  )
}
