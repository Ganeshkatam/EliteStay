import React from 'react';
import { ListingCardData } from '@/features/listings/types';

export interface MapLayer {
  id: string;
  priority: number;
  visible: boolean;
  render(): React.ReactNode;
}

export type SearchEvent = 
  | { type: 'SearchPerformed', payload: any }
  | { type: 'FilterApplied', payload: any }
  | { type: 'FilterCleared', payload: any }
  | { type: 'MapMoved', payload: any }
  | { type: 'SearchAreaClicked' }
  | { type: 'ListingHovered', payload: { listingId: string } }
  | { type: 'ListingOpened', payload: { listingId: string } }
  | { type: 'SaveSearchClicked' };

export interface SearchEventPublisher {
  publish(event: SearchEvent): void;
}

export class NoopSearchEventPublisher implements SearchEventPublisher {
  publish(event: SearchEvent): void {
    // No-op for V1
  }
}

export interface ResultsListRendererProps {
  listings: ListingCardData[];
}

export interface ResultsListRenderer {
  (props: ResultsListRendererProps): React.ReactNode;
}
