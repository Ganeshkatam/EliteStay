import { ReactNode } from 'react';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function DashboardHeader({ title, description, actions }: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {actions && (
        <div className="shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
