import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentPanelProps {
  children: ReactNode;
  className?: string;
}

export function ContentPanel({ children, className }: ContentPanelProps) {
  return (
    <div className={cn("flex-1 px-6 md:px-8 flex items-start justify-start", className)}>
      {children}
    </div>
  );
}
