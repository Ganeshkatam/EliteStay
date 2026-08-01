import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DashboardShellProps {
  children: ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn("flex flex-1 w-full bg-[#F8F9FB]", className)}>
      {children}
    </div>
  );
}
