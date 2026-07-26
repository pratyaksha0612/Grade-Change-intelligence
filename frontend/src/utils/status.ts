export const getStatusVariant = (status: string): "default" | "success" | "warning" | "destructive" | "outline" => {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'COMPLETED':
    case 'ACTIVE':
    case 'APPROVE':
    case 'SAFE':
      return 'success';
    case 'IN_PROGRESS':
    case 'REVIEW':
    case 'WARNING':
      return 'warning';
    case 'FAILED':
    case 'ERROR':
    case 'REJECT':
    case 'BREACH':
    case 'CRITICAL':
      return 'destructive';
    case 'PENDING':
    case 'INACTIVE':
      return 'outline';
    default:
      return 'default';
  }
};
