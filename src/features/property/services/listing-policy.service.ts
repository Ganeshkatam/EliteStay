export type ListingBookingPolicy =
  | 'INSTANT_RESERVATION'
  | 'RENTAL_APPLICATION'
  | 'VIEWING_REQUEST'
  | 'CONTACT_HOST';

export type AllowedAction =
  'APPLY' | 'RESERVE' | 'REQUEST_VIEWING' | 'CONTACT_HOST';

export interface ListingPolicyState {
  primaryAction: AllowedAction;
  secondaryActions: AllowedAction[];
}

/**
 * Encapsulates the business rules for property listing policies,
 * determining what actions are allowed based on the host's configuration.
 */
export class ListingPolicyService {
  static resolvePolicy(policy: ListingBookingPolicy): ListingPolicyState {
    switch (policy) {
      case 'INSTANT_RESERVATION':
        return {
          primaryAction: 'RESERVE',
          secondaryActions: ['REQUEST_VIEWING', 'CONTACT_HOST'],
        };
      case 'RENTAL_APPLICATION':
        return {
          primaryAction: 'APPLY',
          secondaryActions: ['REQUEST_VIEWING', 'CONTACT_HOST'],
        };
      case 'VIEWING_REQUEST':
        return {
          primaryAction: 'REQUEST_VIEWING',
          secondaryActions: ['CONTACT_HOST'],
        };
      case 'CONTACT_HOST':
        return {
          primaryAction: 'CONTACT_HOST',
          secondaryActions: [],
        };
      default:
        return {
          primaryAction: 'CONTACT_HOST',
          secondaryActions: [],
        };
    }
  }

  static getActionLabel(action: AllowedAction): string {
    switch (action) {
      case 'RESERVE':
        return 'Reserve Now';
      case 'APPLY':
        return 'Apply to Rent';
      case 'REQUEST_VIEWING':
        return 'Request Viewing';
      case 'CONTACT_HOST':
        return 'Contact Host';
    }
  }
}
