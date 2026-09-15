/**
 * Canonical Policy Versions and Constants for the Hosting Bounded Context.
 * Governs active mandatory legal SLAs required to achieve READY status.
 */

export const MANDATORY_HOST_POLICIES = {
  ANTI_DISCRIMINATION: {
    type: 'ANTI_DISCRIMINATION',
    version: '2026.1',
    title: 'Resident Anti-Discrimination & Fairness SLA',
    description:
      'Evaluates all long-term tenant applications without bias toward gender, caste, religion, or personal lifestyle preferences.',
  },
  MAINTENANCE_SLA: {
    type: 'MAINTENANCE_SLA',
    version: '2026.1',
    title: 'Operational Response Time & Maintenance SLA',
    description:
      'Maintain active communication during active tenancies, respond to maintenance requests within 24 hours, and honor confirmed check-in dates.',
  },
} as const;

export type MandatoryPolicyKey = keyof typeof MANDATORY_HOST_POLICIES;
