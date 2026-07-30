import { cn } from '@/lib/utils';
import { DESIGN } from '@/config/design';

type SectionProps = React.HTMLAttributes<HTMLElement>;

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <section
      className={cn(DESIGN.spacing.sectionPaddingY, className)}
      {...props}
    >
      {children}
    </section>
  );
}
