import { ReactNode } from 'react';

interface ProfileSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ProfileSection({ title, description, children }: ProfileSectionProps) {
  return (
    <section className="scroll-mt-32">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">{title}</h2>
        {description && (
          <p className="text-slate-500 mt-1">{description}</p>
        )}
      </div>
      <div className="flex flex-col">
        {children}
      </div>
    </section>
  );
}
