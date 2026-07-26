import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

export function Drawer({ isOpen, onClose, title, children, position = 'right' }: DrawerProps) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "fixed top-0 bottom-0 z-50 w-full max-w-md bg-card border-border shadow-2xl transition-transform duration-300 ease-in-out",
        position === 'right' ? "right-0 border-l" : "left-0 border-r",
        isOpen ? "translate-x-0" : position === 'right' ? "translate-x-full" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground rounded-full p-1 hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto h-full pb-20">
          {children}
        </div>
      </div>
    </>
  );
}
