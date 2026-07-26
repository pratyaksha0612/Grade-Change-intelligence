import { cn } from '../../utils/cn';

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function ChartContainer({ title, description, children, className, ...props }: ChartContainerProps) {
  return (
    <div className={cn("flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm", className)} {...props}>
      {(title || description) && (
        <div className="mb-4 space-y-1.5">
          {title && <h3 className="font-semibold leading-none tracking-tight">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="flex-1 min-h-[300px] w-full relative">
        {children}
      </div>
    </div>
  );
}
