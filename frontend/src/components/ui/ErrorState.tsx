import { AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry, className, ...props }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center text-destructive", className)} {...props}>
      <div className="rounded-full bg-destructive/10 p-3 mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {message && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-4 py-2 border border-destructive rounded-md hover:bg-destructive/10 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
