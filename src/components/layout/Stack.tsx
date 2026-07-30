import { cn } from '@/lib/utils';
import { DESIGN } from '@/config/design';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Stack({
  className,
  as: Component = 'div',
  children,
  ...props
}: StackProps) {
  return (
    <Component
      className={cn('flex flex-col', DESIGN.spacing.stackGap, className)}
      {...props}
    >
      {children}
    </Component>
  );
}
