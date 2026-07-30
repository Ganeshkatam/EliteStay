import { cn } from '@/lib/utils';
import { DESIGN } from '@/config/design';

type ContainerProps = React.HTMLAttributes<HTMLDivElement>;

export function Container({ className, children, ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-7xl',
        DESIGN.spacing.pagePaddingX,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
