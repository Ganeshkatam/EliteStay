import React, { createContext, useContext } from 'react';
import { DomainEvent } from '@/lib/events/domain-events';

interface TimelineContextType {
  events: DomainEvent[];
  isLoading: boolean;
  refresh: () => void;
}

const TimelineContext = createContext<TimelineContextType | undefined>(
  undefined
);

export const TimelineProvider: React.FC<{
  events: DomainEvent[];
  isLoading?: boolean;
  refresh?: () => void;
  children: React.ReactNode;
}> = ({ events, isLoading = false, refresh = () => {}, children }) => {
  return (
    <TimelineContext.Provider value={{ events, isLoading, refresh }}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => {
  const context = useContext(TimelineContext);
  if (context === undefined) {
    throw new Error('useTimeline must be used within a TimelineProvider');
  }
  return context;
};
