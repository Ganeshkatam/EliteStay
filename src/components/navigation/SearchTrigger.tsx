import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SearchTrigger() {
  return (
    <Button
      variant="outline"
      className="hidden h-12 w-full max-w-sm justify-between gap-4 rounded-full px-4 shadow-sm hover:shadow-md md:flex lg:max-w-md"
    >
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="font-semibold text-foreground">Anywhere</span>
        <span className="h-4 w-[1px] bg-border" />
        <span className="font-semibold text-foreground">Any week</span>
        <span className="h-4 w-[1px] bg-border" />
        <span className="font-normal">Add guests</span>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Search className="h-4 w-4" />
      </div>
    </Button>
  );
}
