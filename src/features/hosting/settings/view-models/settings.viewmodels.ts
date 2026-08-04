export interface HostLocalizationViewModel {
  language: string;
  timezone: string;
  currency: string;
  weekStartDay: number;
}

export interface HostCommunicationViewModel {
  showProfilePublicly: boolean;
  allowDirectMessages: boolean;
}

export interface HostAutomationViewModel {
  autoAcceptBookingRequests: boolean;
}

export interface HostNotificationsViewModel {
  bookings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  messages: {
    email: boolean;
    push: boolean;
  };
  system: {
    email: boolean;
    push: boolean;
  };
  marketing: {
    email: boolean;
    push: boolean;
  };
}

export interface HostSettingsViewModel {
  hostProfileId: string;
  localization: HostLocalizationViewModel;
  communication: HostCommunicationViewModel;
  automation: HostAutomationViewModel;
  notifications: HostNotificationsViewModel;
  preferences: Record<string, unknown>;
}
