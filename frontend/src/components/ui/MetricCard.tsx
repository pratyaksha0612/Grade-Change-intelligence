import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';
import { AnimatedNumber } from './AnimatedNumber';

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
}

export function MetricCard({ title, value, description, icon, trend, className, ...props }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden group flex flex-col", className)} {...(props as any)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/80">{title}</CardTitle>
        {icon && <div className="text-muted-foreground/50 transition-colors group-hover:text-primary">{icon}</div>}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <motion.div 
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          <AnimatedNumber value={value} />
        </motion.div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            {trend && (
              <span className={cn(
                "mr-2 font-medium",
                trend.isPositive ? "text-green-500" : "text-destructive"
              )}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
