import React from 'react';
import { useTimeline } from './TimelineProvider';
import { formatDistanceToNow } from 'date-fns';

export const TimelineWidget: React.FC = () => {
  const { events, isLoading } = useTimeline();

  if (isLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading timeline...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">No events recorded yet.</div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {events.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== events.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {event.type.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={event.timestamp}>
                      {formatDistanceToNow(new Date(event.timestamp), {
                        addSuffix: true,
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
