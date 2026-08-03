import { getClientIp } from './ip-utils';
import { SecurityEventType } from './security-events';
import { eventBus } from '../events/event-bus';
import { DomainEventType } from '../events/domain-events';

export class AbuseDetection {
  public async detectLoginAnomalies(
    userId: string,
    success: boolean
  ): Promise<void> {
    const _ip = await getClientIp();

    if (!success) {
      // In a real implementation, track consecutive failed logins in Redis
      // If threshold reached, fire event
      eventBus.publish(
        SecurityEventType.LOGIN_FAILED as unknown as DomainEventType,
        { userId, ip: _ip }
      );
    }
  }

  public detectSuspiciousActivity(): void {
    // Logic to analyze rapid interactions, anomalous geography jumps, etc. using ip
  }
}

export const abuseDetection = new AbuseDetection();
