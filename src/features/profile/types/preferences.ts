import { z } from 'zod';

// Base Type for keys
export type PreferenceCategory =
  | 'privacy'
  | 'notifications'
  | 'security'
  | 'hosting'
  | 'communication'
  | 'data';

// Privacy
export const PrivacySchema = z.object({
  allow_host_messages: z.boolean(),
  show_profile_photo: z.boolean(),
  show_reviews: z.boolean(),
  allow_search_indexing: z.boolean(),
});
export type PrivacyPreferences = z.infer<typeof PrivacySchema>;

// Notifications
export const NotificationsSchema = z.object({
  email: z.boolean(),
  push: z.boolean(),
  sms: z.boolean(),
  marketing: z.boolean(),
});
export type NotificationsPreferences = z.infer<typeof NotificationsSchema>;

// Security
export const SecuritySchema = z.object({
  two_factor_auth: z.boolean(),
  allow_new_device_login: z.boolean(),
  remember_device: z.boolean(),
});
export type SecurityPreferences = z.infer<typeof SecuritySchema>;

// Hosting
export const HostingSchema = z.object({
  accept_booking_requests: z.boolean(),
  instant_booking: z.boolean(),
  auto_approve_reservations: z.boolean(),
});
export type HostingPreferences = z.infer<typeof HostingSchema>;

// Communication
export const CommunicationSchema = z.object({
  promotional_messages: z.boolean(),
  support_contact: z.boolean(),
  share_contact_after_booking: z.boolean(),
});
export type CommunicationPreferences = z.infer<typeof CommunicationSchema>;

// Data
export const DataSchema = z.object({
  share_analytics: z.boolean(),
  personalized_recommendations: z.boolean(),
  cookie_preferences: z.enum(['essential', 'all']),
});
export type DataPreferences = z.infer<typeof DataSchema>;

// Main Object
export interface UserPreferences {
  user_id: string;
  privacy: PrivacyPreferences;
  notifications: NotificationsPreferences;
  security: SecurityPreferences;
  hosting: HostingPreferences;
  communication: CommunicationPreferences;
  data: DataPreferences;
  updated_at: string;
}

export type PreferenceFormMap = {
  privacy: PrivacyPreferences;
  notifications: NotificationsPreferences;
  security: SecurityPreferences;
  hosting: HostingPreferences;
  communication: CommunicationPreferences;
  data: DataPreferences;
};

export const PreferenceSchemas = {
  privacy: PrivacySchema,
  notifications: NotificationsSchema,
  security: SecuritySchema,
  hosting: HostingSchema,
  communication: CommunicationSchema,
  data: DataSchema,
} as const;

export type PreferenceSchemaMap = typeof PreferenceSchemas;
