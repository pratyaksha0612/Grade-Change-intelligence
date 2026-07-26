
// Placeholder for a true dialog, this would typically use Radix UI Dialog or similar
export function ConfirmationDialog({ isOpen, title, description, onConfirm, onCancel }: { isOpen: boolean, title: string, description: string, onConfirm: () => void, onCancel: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card p-6 rounded-lg border shadow-lg max-w-md w-full">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 border rounded-md hover:bg-muted">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">Confirm</button>
        </div>
      </div>
    </div>
  );
}
