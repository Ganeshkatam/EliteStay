import React from 'react';
import { ListingCardData } from '@/features/listings/types';

export interface MapLayer {
  id: string;
  priority: number;
  visible: boolean;
  render(): React.ReactNode;
}

export type SearchEventPayload = Record<string, unknown>;

export type SearchEvent =
  | { type: 'SearchPerformed'; payload: SearchEventPayload }
  | { type: 'FilterApplied'; payload: SearchEventPayload }
  | { type: 'FilterCleared'; payload: SearchEventPayload }
  | { type: 'MapMoved'; payload: SearchEventPayload }
  | { type: 'SearchAreaClicked' }
  | { type: 'ListingHovered'; payload: { listingId: string } }
  | { type: 'ListingOpened'; payload: { listingId: string } }
  | { type: 'SaveSearchClicked' };

export interface SearchEventPublisher {
  publish(event: SearchEvent): void;
}

export class NoopSearchEventPublisher implements SearchEventPublisher {
  publish(_event: SearchEvent): void {
    void _event; // No-op for V1
  }
}

export interface ResultsListRendererProps {
  listings: ListingCardData[];
}

export interface ResultsListRenderer {
  (props: ResultsListRendererProps): React.ReactNode;
}
