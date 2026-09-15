import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SubPanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function SubPanel({ title, children, className }: SubPanelProps) {
  return (
    <div
      className={cn(
        'w-full md:w-[240px] shrink-0 bg-[#F8F9FB] py-8 px-4 sm:px-6 overflow-y-auto sticky top-[120px] md:top-[76px] h-[calc(100vh-120px)] md:h-[calc(100vh-76px)]',
        className
      )}
    >
      {title && (
        <h2 className="text-base font-extrabold text-slate-900 mb-6 px-2 sm:px-4">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
