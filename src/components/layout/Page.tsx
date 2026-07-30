import { cn } from '@/lib/utils';

type PageProps = React.HTMLAttributes<HTMLDivElement>;

export function Page({ className, children, ...props }: PageProps) {
  return (
    <div className={cn('flex min-h-screen flex-col', className)} {...props}>
      <main className="flex-1">{children}</main>
    </div>
  );
}
