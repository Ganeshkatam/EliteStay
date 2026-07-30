import { cn } from '@/lib/utils';
import { DESIGN } from '@/config/design';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Grid({
  className,
  as: Component = 'div',
  children,
  ...props
}: GridProps) {
  return (
    <Component
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        DESIGN.spacing.gridGap,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
