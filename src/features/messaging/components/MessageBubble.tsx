import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageBubbleProps {
  content: string;
  createdAt: string;
  isOwn: boolean;
  showTimestamp?: boolean;
  isConsecutive?: boolean;
}

export function MessageBubble({ content, createdAt, isOwn, showTimestamp = true, isConsecutive = false }: MessageBubbleProps) {
  const timeString = format(new Date(createdAt), 'h:mm a');

  return (
    <div className={cn("flex w-full", isConsecutive ? "mt-1" : "mt-4", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm text-sm whitespace-pre-wrap break-words",
          isOwn ? "bg-slate-900 text-white" : "bg-white text-slate-900 border border-slate-100",
          !isConsecutive && isOwn && "rounded-br-sm",
          !isConsecutive && !isOwn && "rounded-bl-sm"
        )}>
        <p className="leading-relaxed">{content}</p>
        {showTimestamp && (
          <span className={cn(
            "text-[10px] mt-1 block font-medium",
            isOwn ? "text-slate-400" : "text-slate-400"
          )}>
            {timeString}
          </span>
        )}
      </div>
    </div>
  );
}
