import { type Database } from './supabase';

export type ExtendedProfile = Database['public']['Tables']['profiles']['Row'];

export interface AppearancePreferences {
  theme: "light" | "dark" | "system";
  density: "comfortable" | "compact";
  animations: boolean;
}

export interface PrivacyPreferences {
  allow_host_messages: boolean;
  show_profile_photo: boolean;
  show_reviews: boolean;
  allow_search_indexing: boolean;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface SecurityPreferences {
  two_factor_auth: boolean;
  allow_new_device_login: boolean;
  remember_device: boolean;
}

export interface HostingPreferences {
  accept_booking_requests: boolean;
  instant_booking: boolean;
  auto_approve_reservations: boolean;
}

export interface CommunicationPreferences {
  promotional_messages: boolean;
  support_contact: boolean;
  share_contact_after_booking: boolean;
}

export interface DataPreferences {
  share_analytics: boolean;
  personalized_recommendations: boolean;
  cookie_preferences: "essential" | "functional" | "all";
}

// We redefine UserPreferences to use these strict interfaces rather than raw JSON
export type UserPreferencesRow = Database['public']['Tables']['user_preferences']['Row'];

export interface StrictUserPreferences extends Omit<UserPreferencesRow, 'appearance' | 'privacy' | 'notifications' | 'security' | 'hosting' | 'communication' | 'data'> {
  appearance: AppearancePreferences;
  privacy: PrivacyPreferences;
  notifications: NotificationPreferences;
  security: SecurityPreferences;
  hosting: HostingPreferences;
  communication: CommunicationPreferences;
  data: DataPreferences;
}
