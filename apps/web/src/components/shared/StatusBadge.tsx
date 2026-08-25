'use client';

import { Badge } from '@/components/ui/badge';
import { capitalize, getStatusColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Status badge that automatically picks colors based on status value.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={getStatusColor(status)} variant="outline">
      {capitalize(status)}
    </Badge>
  );
}
