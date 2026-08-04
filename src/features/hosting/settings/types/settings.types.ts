export interface HostSettingsRow {
  host_profile_id: string;

  // Localization Preferences
  language: string;
  timezone: string;
  currency: string;
  week_start_day: number;

  // Visibility & Communication
  show_profile_publicly: boolean;
  allow_direct_messages: boolean;

  // Automation
  auto_accept_booking_requests: boolean;

  // Notification Preferences
  notify_email_bookings: boolean;
  notify_push_bookings: boolean;
  notify_sms_bookings: boolean;

  notify_email_messages: boolean;
  notify_push_messages: boolean;

  notify_email_system: boolean;
  notify_push_system: boolean;

  notify_email_marketing: boolean;
  notify_push_marketing: boolean;

  // Future UI Preferences
  preferences: Record<string, unknown>;

  created_at: string;
  updated_at: string;
}

export interface UpdateLocalizationCommand {
  hostProfileId: string;
  language?: string;
  timezone?: string;
  currency?: string;
  weekStartDay?: number;
}

export interface UpdateCommunicationCommand {
  hostProfileId: string;
  showProfilePublicly?: boolean;
  allowDirectMessages?: boolean;
}

export interface UpdateAutomationCommand {
  hostProfileId: string;
  autoAcceptBookingRequests?: boolean;
}

export interface UpdateNotificationsCommand {
  hostProfileId: string;
  notifyEmailBookings?: boolean;
  notifyPushBookings?: boolean;
  notifySmsBookings?: boolean;
  notifyEmailMessages?: boolean;
  notifyPushMessages?: boolean;
  notifyEmailSystem?: boolean;
  notifyPushSystem?: boolean;
  notifyEmailMarketing?: boolean;
  notifyPushMarketing?: boolean;
}
