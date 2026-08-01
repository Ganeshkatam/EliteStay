import { cn } from '@/lib/utils';

type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1440px] px-6 lg:px-10 xl:px-20',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
