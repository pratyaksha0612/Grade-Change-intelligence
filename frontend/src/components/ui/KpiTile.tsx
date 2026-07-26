import { cn } from '../../utils/cn';

interface KpiTileProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'success' | 'warning' | 'destructive' | 'default';
  className?: string;
}

export function KpiTile({ label, value, unit, status = 'default', className }: KpiTileProps) {
  const statusColors = {
    default: 'text-foreground',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    destructive: 'text-destructive',
  };

  return (
    <div className={cn("flex flex-col p-4 rounded-lg bg-card border border-border shadow-sm", className)}>
      <span className="text-sm text-muted-foreground mb-1 font-medium">{label}</span>
      <div className="flex items-baseline space-x-1">
        <span className={cn("text-xl font-bold", statusColors[status])}>{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
}
