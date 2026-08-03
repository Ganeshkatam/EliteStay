import { randomUUID } from 'crypto';
import { logger } from '../logging/logger';
import { RequestContext } from '../context/request-context';

export interface BusinessEvent {
  eventId: string;
  name: string;
  timestamp: string;
  tags: Record<string, string>;
  data: Record<string, unknown>;
  traceId?: string;
}

/**
 * Domain-specific Event Registry for actionable business observability (e.g., Booking Requested, Listing Published).
 */
export class BusinessEventRegistry {
  private buffer: BusinessEvent[] = [];

  public record(
    name: string,
    tags: Record<string, string>,
    data: Record<string, unknown> = {}
  ): void {
    const traceId = RequestContext.getTraceId();

    const event: BusinessEvent = {
      eventId: randomUUID(),
      name,
      timestamp: new Date().toISOString(),
      tags,
      data,
      traceId,
    };

    // Store in ring buffer (cap at 5000 events)
    if (this.buffer.length >= 5000) {
      this.buffer.shift();
    }
    this.buffer.push(event);

    // Emit via the Observability Logger engine under the BUSINESS category
    logger
      .category('BUSINESS')
      .info(`Domain Event: ${name}`, { tags, data, traceId });
  }

  public getRecentEvents(limit = 100): BusinessEvent[] {
    return [...this.buffer].reverse().slice(0, limit);
  }

  public clear(): void {
    this.buffer = [];
  }
}

export const businessEvents = new BusinessEventRegistry();

/**
 * Helper to quickly emit actionable business events during operations.
 */
export function recordBusinessEvent(
  name: string,
  tags: Record<string, string>,
  data?: Record<string, unknown>
): void {
  businessEvents.record(name, tags, data);
}
