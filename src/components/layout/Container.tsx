import { cn } from '@/lib/utils';

type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
