import { createClient } from '@/lib/supabase/server';
import { UserPreferences } from '../types/preferences';

const DEFAULT_PREFERENCES = {
  privacy: {
    allow_host_messages: true,
    show_profile_photo: true,
    show_reviews: true,
  },
  notifications: {
    email: true,
    push: true,
    sms: false,
    marketing: false,
  },
  security: {
    two_factor_auth: false,
    allow_new_device_login: true,
    remember_device: true,
  },
  hosting: {
    accept_booking_requests: true,
    instant_booking: false,
    auto_approve_reservations: false,
  },
  communication: {
    promotional_messages: false,
    support_contact: true,
    share_contact_after_booking: true,
  },
  data: {
    share_analytics: true,
    personalized_recommendations: true,
    cookie_preferences: 'essential' as const,
  },
};

/**
 * Retrieves the user's preferences from the database
 * MUST be called from a Server Component.
 */
export async function getUserPreferences(): Promise<UserPreferences | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      return {
        user_id: user.id,
        ...DEFAULT_PREFERENCES,
        updated_at: new Date().toISOString(),
      };
    }

    return {
      user_id: user.id,
      privacy: {
        ...DEFAULT_PREFERENCES.privacy,
        ...((data.privacy as object) || {}),
      },
      notifications: {
        ...DEFAULT_PREFERENCES.notifications,
        ...((data.notifications as object) || {}),
      },
      security: {
        ...DEFAULT_PREFERENCES.security,
        ...((data.security as object) || {}),
      },
      hosting: {
        ...DEFAULT_PREFERENCES.hosting,
        ...((data.hosting as object) || {}),
      },
      communication: {
        ...DEFAULT_PREFERENCES.communication,
        ...((data.communication as object) || {}),
      },
      data: { ...DEFAULT_PREFERENCES.data, ...((data.data as object) || {}) },
      updated_at: data.updated_at || new Date().toISOString(),
    };
  } catch {
    return {
      user_id: user.id,
      ...DEFAULT_PREFERENCES,
      updated_at: new Date().toISOString(),
    };
  }
}
