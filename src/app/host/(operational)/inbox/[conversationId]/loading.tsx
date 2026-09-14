import {
  ConversationHeaderSkeleton,
  MessageTimelineSkeleton,
  MessageComposerSkeleton,
} from '@/features/messaging/components/skeletons';

export default function HostConversationLoading() {
  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50">
      <ConversationHeaderSkeleton />
      <MessageTimelineSkeleton />
      <MessageComposerSkeleton />
    </div>
  );
}
