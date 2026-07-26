import { cn } from '../../utils/cn';

interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function FilterBar({ children, className, ...props }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-4 bg-muted/50 p-3 rounded-md border border-border", className)} {...props}>
      {children}
    </div>
  );
}
