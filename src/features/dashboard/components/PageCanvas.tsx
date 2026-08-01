import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageCanvasProps {
  children: ReactNode;
  className?: string;
}

export function PageCanvas({ children, className }: PageCanvasProps) {
  return (
    <div className={cn(
      "bg-white rounded-t-3xl shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-slate-200/60 w-full",
      "h-[calc(100vh-96px)] sticky top-24 overflow-y-auto p-6 md:p-10",
      className
    )}>
      {children}
    </div>
  );
}
