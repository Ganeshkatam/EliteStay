export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.15';
  };
  public: {
    Tables: {
      accommodation_type_amenities: {
        Row: {
          accommodation_type_id: string;
          amenity_id: string;
          category: string;
          created_at: string;
          display_order: number;
          id: string;
          is_default: boolean;
          is_required: boolean;
          updated_at: string;
        };
        Insert: {
          accommodation_type_id: string;
          amenity_id: string;
          category?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_default?: boolean;
          is_required?: boolean;
          updated_at?: string;
        };
        Update: {
          accommodation_type_id?: string;
          amenity_id?: string;
          category?: string;
          created_at?: string;
          display_order?: number;
          id?: string;
          is_default?: boolean;
          is_required?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'accommodation_type_amenities_accommodation_type_id_fkey';
            columns: ['accommodation_type_id'];
            isOneToOne: false;
            referencedRelation: 'accommodation_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'accommodation_type_amenities_amenity_id_fkey';
            columns: ['amenity_id'];
            isOneToOne: false;
            referencedRelation: 'amenities';
            referencedColumns: ['id'];
          },
        ];
      };
      accommodation_types: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          icon: string | null;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      amenities: {
        Row: {
          category_id: number | null;
          created_at: string;
          description: string | null;
          display_order: number;
          icon: string | null;
          id: string;
          is_active: boolean;
          is_featured: boolean;
          is_filterable: boolean;
          name: string;
          search_weight: number;
          slug: string;
          updated_at: string;
        };
        Insert: {
          category_id?: number | null;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          is_filterable?: boolean;
          name: string;
          search_weight?: number;
          slug: string;
          updated_at?: string;
        };
        Update: {
          category_id?: number | null;
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: string;
          is_active?: boolean;
          is_featured?: boolean;
          is_filterable?: boolean;
          name?: string;
          search_weight?: number;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'amenities_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'amenity_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      amenity_categories: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          icon: string | null;
          id: number;
          is_active: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: number;
          is_active?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: number;
          is_active?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      booking_events: {
        Row: {
          action: string;
          actor_id: string;
          booking_id: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          new_status: Database['public']['Enums']['booking_status'] | null;
          previous_status: Database['public']['Enums']['booking_status'] | null;
        };
        Insert: {
          action: string;
          actor_id: string;
          booking_id: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          new_status?: Database['public']['Enums']['booking_status'] | null;
          previous_status?:
            Database['public']['Enums']['booking_status'] | null;
        };
        Update: {
          action?: string;
          actor_id?: string;
          booking_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          new_status?: Database['public']['Enums']['booking_status'] | null;
          previous_status?:
            Database['public']['Enums']['booking_status'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'booking_events_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'booking_events_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
        ];
      };
      bookings: {
        Row: {
          created_at: string;
          expires_at: string | null;
          guest_id: string;
          id: string;
          listing_id: string;
          message: string | null;
          requested_duration: number;
          requested_move_in: string;
          snapshot_billing_period: Database['public']['Enums']['billing_period'];
          snapshot_maintenance_fee: number;
          snapshot_minimum_stay: number;
          snapshot_monthly_rent: number;
          snapshot_security_deposit: number;
          status: Database['public']['Enums']['booking_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          expires_at?: string | null;
          guest_id: string;
          id?: string;
          listing_id: string;
          message?: string | null;
          requested_duration: number;
          requested_move_in: string;
          snapshot_billing_period: Database['public']['Enums']['billing_period'];
          snapshot_maintenance_fee: number;
          snapshot_minimum_stay: number;
          snapshot_monthly_rent: number;
          snapshot_security_deposit: number;
          status?: Database['public']['Enums']['booking_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          expires_at?: string | null;
          guest_id?: string;
          id?: string;
          listing_id?: string;
          message?: string | null;
          requested_duration?: number;
          requested_move_in?: string;
          snapshot_billing_period?: Database['public']['Enums']['billing_period'];
          snapshot_maintenance_fee?: number;
          snapshot_minimum_stay?: number;
          snapshot_monthly_rent?: number;
          snapshot_security_deposit?: number;
          status?: Database['public']['Enums']['booking_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookings_guest_id_fkey';
            columns: ['guest_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bookings_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      cities: {
        Row: {
          cover_image_storage_path: string | null;
          created_at: string;
          description: string | null;
          external_code: string;
          id: number;
          is_active: boolean;
          is_capital: boolean;
          is_featured: boolean;
          is_metro: boolean;
          latitude: number | null;
          listing_count: number;
          longitude: number | null;
          name: string;
          search_aliases: string[] | null;
          slug: string;
          sort_order: number;
          state_id: number;
          timezone: string | null;
          updated_at: string;
        };
        Insert: {
          cover_image_storage_path?: string | null;
          created_at?: string;
          description?: string | null;
          external_code: string;
          id?: never;
          is_active?: boolean;
          is_capital?: boolean;
          is_featured?: boolean;
          is_metro?: boolean;
          latitude?: number | null;
          listing_count?: number;
          longitude?: number | null;
          name: string;
          search_aliases?: string[] | null;
          slug: string;
          sort_order?: number;
          state_id: number;
          timezone?: string | null;
          updated_at?: string;
        };
        Update: {
          cover_image_storage_path?: string | null;
          created_at?: string;
          description?: string | null;
          external_code?: string;
          id?: never;
          is_active?: boolean;
          is_capital?: boolean;
          is_featured?: boolean;
          is_metro?: boolean;
          latitude?: number | null;
          listing_count?: number;
          longitude?: number | null;
          name?: string;
          search_aliases?: string[] | null;
          slug?: string;
          sort_order?: number;
          state_id?: number;
          timezone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cities_state_id_fkey';
            columns: ['state_id'];
            isOneToOne: false;
            referencedRelation: 'states';
            referencedColumns: ['id'];
          },
        ];
      };
      conversations: {
        Row: {
          booking_id: string | null;
          closed_at: string | null;
          created_at: string;
          guest_last_read_at: string | null;
          host_last_read_at: string | null;
          id: string;
          stay_id: string | null;
        };
        Insert: {
          booking_id?: string | null;
          closed_at?: string | null;
          created_at?: string;
          guest_last_read_at?: string | null;
          host_last_read_at?: string | null;
          id?: string;
          stay_id?: string | null;
        };
        Update: {
          booking_id?: string | null;
          closed_at?: string | null;
          created_at?: string;
          guest_last_read_at?: string | null;
          host_last_read_at?: string | null;
          id?: string;
          stay_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'conversations_booking_id_fkey';
            columns: ['booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_stay_id_fkey';
            columns: ['stay_id'];
            isOneToOne: false;
            referencedRelation: 'stays';
            referencedColumns: ['id'];
          },
        ];
      };
      countries: {
        Row: {
          created_at: string;
          currency_code: string | null;
          external_code: string;
          id: number;
          iso2: string;
          iso3: string;
          name: string;
          phone_code: string | null;
          timezone_default: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          currency_code?: string | null;
          external_code: string;
          id?: never;
          iso2: string;
          iso3: string;
          name: string;
          phone_code?: string | null;
          timezone_default?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          currency_code?: string | null;
          external_code?: string;
          id?: never;
          iso2?: string;
          iso3?: string;
          name?: string;
          phone_code?: string | null;
          timezone_default?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      external_calendar_events: {
        Row: {
          created_at: string;
          end_date: string;
          external_uid: string;
          feed_id: string;
          id: string;
          last_seen_at: string;
          listing_id: string;
          start_date: string;
          summary: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          end_date: string;
          external_uid: string;
          feed_id: string;
          id?: string;
          last_seen_at?: string;
          listing_id: string;
          start_date: string;
          summary?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          end_date?: string;
          external_uid?: string;
          feed_id?: string;
          id?: string;
          last_seen_at?: string;
          listing_id?: string;
          start_date?: string;
          summary?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'external_calendar_events_feed_id_fkey';
            columns: ['feed_id'];
            isOneToOne: false;
            referencedRelation: 'ical_feeds';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'external_calendar_events_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      geocoding_cache: {
        Row: {
          cache_key: string;
          confidence: number | null;
          expires_at: string | null;
          formatted_address: string;
          geocoded_at: string | null;
          latitude: number;
          longitude: number;
          provider: string;
          provider_place_id: string | null;
        };
        Insert: {
          cache_key: string;
          confidence?: number | null;
          expires_at?: string | null;
          formatted_address: string;
          geocoded_at?: string | null;
          latitude: number;
          longitude: number;
          provider: string;
          provider_place_id?: string | null;
        };
        Update: {
          cache_key?: string;
          confidence?: number | null;
          expires_at?: string | null;
          formatted_address?: string;
          geocoded_at?: string | null;
          latitude?: number;
          longitude?: number;
          provider?: string;
          provider_place_id?: string | null;
        };
        Relationships: [];
      };
      host_profiles: {
        Row: {
          agreed_to_policies_at: string | null;
          bank_account_id: string | null;
          bank_account_last4: string | null;
          bank_name: string | null;
          business_name: string | null;
          business_type: Database['public']['Enums']['host_business_type'];
          created_at: string;
          id: string;
          identity_verified_at: string | null;
          primary_accommodation_type_id: string | null;
          status: Database['public']['Enums']['host_status'];
          support_email: string | null;
          support_phone: string | null;
          tax_id_last4: string | null;
          tax_id_type: string | null;
          tax_profile_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          agreed_to_policies_at?: string | null;
          bank_account_id?: string | null;
          bank_account_last4?: string | null;
          bank_name?: string | null;
          business_name?: string | null;
          business_type?: Database['public']['Enums']['host_business_type'];
          created_at?: string;
          id?: string;
          identity_verified_at?: string | null;
          primary_accommodation_type_id?: string | null;
          status?: Database['public']['Enums']['host_status'];
          support_email?: string | null;
          support_phone?: string | null;
          tax_id_last4?: string | null;
          tax_id_type?: string | null;
          tax_profile_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          agreed_to_policies_at?: string | null;
          bank_account_id?: string | null;
          bank_account_last4?: string | null;
          bank_name?: string | null;
          business_name?: string | null;
          business_type?: Database['public']['Enums']['host_business_type'];
          created_at?: string;
          id?: string;
          identity_verified_at?: string | null;
          primary_accommodation_type_id?: string | null;
          status?: Database['public']['Enums']['host_status'];
          support_email?: string | null;
          support_phone?: string | null;
          tax_id_last4?: string | null;
          tax_id_type?: string | null;
          tax_profile_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'host_profiles_primary_accommodation_type_id_fkey';
            columns: ['primary_accommodation_type_id'];
            isOneToOne: false;
            referencedRelation: 'accommodation_types';
            referencedColumns: ['id'];
          },
        ];
      };
      host_settings: {
        Row: {
          allow_direct_messages: boolean;
          auto_accept_booking_requests: boolean;
          created_at: string;
          currency: string;
          host_profile_id: string;
          language: string;
          notify_email_bookings: boolean;
          notify_email_marketing: boolean;
          notify_email_messages: boolean;
          notify_email_system: boolean;
          notify_push_bookings: boolean;
          notify_push_marketing: boolean;
          notify_push_messages: boolean;
          notify_push_system: boolean;
          notify_sms_bookings: boolean;
          preferences: Json;
          show_profile_publicly: boolean;
          timezone: string;
          updated_at: string;
          week_start_day: number;
        };
        Insert: {
          allow_direct_messages?: boolean;
          auto_accept_booking_requests?: boolean;
          created_at?: string;
          currency?: string;
          host_profile_id: string;
          language?: string;
          notify_email_bookings?: boolean;
          notify_email_marketing?: boolean;
          notify_email_messages?: boolean;
          notify_email_system?: boolean;
          notify_push_bookings?: boolean;
          notify_push_marketing?: boolean;
          notify_push_messages?: boolean;
          notify_push_system?: boolean;
          notify_sms_bookings?: boolean;
          preferences?: Json;
          show_profile_publicly?: boolean;
          timezone?: string;
          updated_at?: string;
          week_start_day?: number;
        };
        Update: {
          allow_direct_messages?: boolean;
          auto_accept_booking_requests?: boolean;
          created_at?: string;
          currency?: string;
          host_profile_id?: string;
          language?: string;
          notify_email_bookings?: boolean;
          notify_email_marketing?: boolean;
          notify_email_messages?: boolean;
          notify_email_system?: boolean;
          notify_push_bookings?: boolean;
          notify_push_marketing?: boolean;
          notify_push_messages?: boolean;
          notify_push_system?: boolean;
          notify_sms_bookings?: boolean;
          preferences?: Json;
          show_profile_publicly?: boolean;
          timezone?: string;
          updated_at?: string;
          week_start_day?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'host_settings_host_profile_id_fkey';
            columns: ['host_profile_id'];
            isOneToOne: true;
            referencedRelation: 'host_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      ical_feeds: {
        Row: {
          created_at: string;
          enabled: boolean;
          feed_url: string;
          id: string;
          last_error: string | null;
          last_success_at: string | null;
          last_synced_at: string | null;
          listing_id: string;
          provider: string;
          sync_direction: Database['public']['Enums']['sync_direction'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          enabled?: boolean;
          feed_url: string;
          id?: string;
          last_error?: string | null;
          last_success_at?: string | null;
          last_synced_at?: string | null;
          listing_id: string;
          provider: string;
          sync_direction?: Database['public']['Enums']['sync_direction'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          enabled?: boolean;
          feed_url?: string;
          id?: string;
          last_error?: string | null;
          last_success_at?: string | null;
          last_synced_at?: string | null;
          listing_id?: string;
          provider?: string;
          sync_direction?: Database['public']['Enums']['sync_direction'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ical_feeds_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_amenities: {
        Row: {
          amenity_id: string;
          created_at: string;
          listing_id: string;
          updated_at: string;
        };
        Insert: {
          amenity_id: string;
          created_at?: string;
          listing_id: string;
          updated_at?: string;
        };
        Update: {
          amenity_id?: string;
          created_at?: string;
          listing_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_amenities_amenity_id_fkey';
            columns: ['amenity_id'];
            isOneToOne: false;
            referencedRelation: 'amenities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'listing_amenities_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_availability: {
        Row: {
          available_units: number;
          created_at: string;
          end_date: string;
          id: string;
          listing_id: string;
          source: Database['public']['Enums']['availability_source'];
          start_date: string;
          status: Database['public']['Enums']['availability_status'];
          updated_at: string;
        };
        Insert: {
          available_units?: number;
          created_at?: string;
          end_date: string;
          id?: string;
          listing_id: string;
          source?: Database['public']['Enums']['availability_source'];
          start_date: string;
          status?: Database['public']['Enums']['availability_status'];
          updated_at?: string;
        };
        Update: {
          available_units?: number;
          created_at?: string;
          end_date?: string;
          id?: string;
          listing_id?: string;
          source?: Database['public']['Enums']['availability_source'];
          start_date?: string;
          status?: Database['public']['Enums']['availability_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_availability_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_capacity: {
        Row: {
          bathrooms: number;
          beds: number;
          created_at: string;
          id: string;
          listing_id: string;
          max_guests: number;
          updated_at: string;
        };
        Insert: {
          bathrooms?: number;
          beds?: number;
          created_at?: string;
          id?: string;
          listing_id: string;
          max_guests?: number;
          updated_at?: string;
        };
        Update: {
          bathrooms?: number;
          beds?: number;
          created_at?: string;
          id?: string;
          listing_id?: string;
          max_guests?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_capacity_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: true;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_features: {
        Row: {
          created_at: string;
          has_air_conditioning: boolean;
          has_attached_balcony: boolean;
          has_attached_bathroom: boolean;
          has_lift: boolean;
          id: string;
          is_wheelchair_accessible: boolean;
          listing_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          has_air_conditioning?: boolean;
          has_attached_balcony?: boolean;
          has_attached_bathroom?: boolean;
          has_lift?: boolean;
          id?: string;
          is_wheelchair_accessible?: boolean;
          listing_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          has_air_conditioning?: boolean;
          has_attached_balcony?: boolean;
          has_attached_bathroom?: boolean;
          has_lift?: boolean;
          id?: string;
          is_wheelchair_accessible?: boolean;
          listing_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_features_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: true;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_images: {
        Row: {
          created_at: string;
          display_order: number;
          file_size: number | null;
          height: number | null;
          id: string;
          is_cover: boolean | null;
          listing_id: string;
          mime_type: string | null;
          storage_path: string;
          updated_at: string;
          width: number | null;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          file_size?: number | null;
          height?: number | null;
          id?: string;
          is_cover?: boolean | null;
          listing_id: string;
          mime_type?: string | null;
          storage_path: string;
          updated_at?: string;
          width?: number | null;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          file_size?: number | null;
          height?: number | null;
          id?: string;
          is_cover?: boolean | null;
          listing_id?: string;
          mime_type?: string | null;
          storage_path?: string;
          updated_at?: string;
          width?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_images_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_prices: {
        Row: {
          amount: number;
          billing_period: Database['public']['Enums']['billing_period'];
          created_at: string;
          currency: string;
          id: string;
          listing_id: string;
          maintenance_fee: number;
          maintenance_fee_period:
            Database['public']['Enums']['billing_period'] | null;
          maximum_duration: number | null;
          minimum_duration: number;
          security_deposit: number;
          updated_at: string;
        };
        Insert: {
          amount: number;
          billing_period: Database['public']['Enums']['billing_period'];
          created_at?: string;
          currency?: string;
          id?: string;
          listing_id: string;
          maintenance_fee?: number;
          maintenance_fee_period?:
            Database['public']['Enums']['billing_period'] | null;
          maximum_duration?: number | null;
          minimum_duration?: number;
          security_deposit?: number;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          billing_period?: Database['public']['Enums']['billing_period'];
          created_at?: string;
          currency?: string;
          id?: string;
          listing_id?: string;
          maintenance_fee?: number;
          maintenance_fee_period?:
            Database['public']['Enums']['billing_period'] | null;
          maximum_duration?: number | null;
          minimum_duration?: number;
          security_deposit?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_prices_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_rule_notes: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          listing_id: string;
          rule_text: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          listing_id: string;
          rule_text: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          listing_id?: string;
          rule_text?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_rule_notes_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listing_rules: {
        Row: {
          couples_allowed: boolean;
          created_at: string;
          gate_closing_time: string | null;
          id: string;
          listing_id: string;
          non_vegetarian_allowed: boolean;
          parties_allowed: boolean;
          pets_allowed: boolean;
          quiet_hours_end: string | null;
          quiet_hours_start: string | null;
          smoking_allowed: boolean;
          updated_at: string;
          visitors_allowed: boolean;
        };
        Insert: {
          couples_allowed?: boolean;
          created_at?: string;
          gate_closing_time?: string | null;
          id?: string;
          listing_id: string;
          non_vegetarian_allowed?: boolean;
          parties_allowed?: boolean;
          pets_allowed?: boolean;
          quiet_hours_end?: string | null;
          quiet_hours_start?: string | null;
          smoking_allowed?: boolean;
          updated_at?: string;
          visitors_allowed?: boolean;
        };
        Update: {
          couples_allowed?: boolean;
          created_at?: string;
          gate_closing_time?: string | null;
          id?: string;
          listing_id?: string;
          non_vegetarian_allowed?: boolean;
          parties_allowed?: boolean;
          pets_allowed?: boolean;
          quiet_hours_end?: string | null;
          quiet_hours_start?: string | null;
          smoking_allowed?: boolean;
          updated_at?: string;
          visitors_allowed?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'listing_rules_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: true;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      listings: {
        Row: {
          accommodation_type_id: string;
          available_date: string;
          city: string | null;
          city_id: number | null;
          created_at: string;
          description: string | null;
          formatted_address: string | null;
          furnishing: Database['public']['Enums']['furnishing'];
          gender_preference: Database['public']['Enums']['gender_preference'];
          host_id: string;
          id: string;
          latitude: number | null;
          locality: string | null;
          locality_id: number | null;
          longitude: number | null;
          max_occupants: number;
          occupancy_type: Database['public']['Enums']['occupancy_type'];
          postal_code: string | null;
          property_type: string;
          property_type_id: number | null;
          public_id: string;
          state: string | null;
          status: Database['public']['Enums']['listing_status'];
          title: string;
          updated_at: string;
        };
        Insert: {
          accommodation_type_id: string;
          available_date?: string;
          city?: string | null;
          city_id?: number | null;
          created_at?: string;
          description?: string | null;
          formatted_address?: string | null;
          furnishing?: Database['public']['Enums']['furnishing'];
          gender_preference?: Database['public']['Enums']['gender_preference'];
          host_id: string;
          id?: string;
          latitude?: number | null;
          locality?: string | null;
          locality_id?: number | null;
          longitude?: number | null;
          max_occupants?: number;
          occupancy_type?: Database['public']['Enums']['occupancy_type'];
          postal_code?: string | null;
          property_type?: string;
          property_type_id?: number | null;
          public_id: string;
          state?: string | null;
          status?: Database['public']['Enums']['listing_status'];
          title: string;
          updated_at?: string;
        };
        Update: {
          accommodation_type_id?: string;
          available_date?: string;
          city?: string | null;
          city_id?: number | null;
          created_at?: string;
          description?: string | null;
          formatted_address?: string | null;
          furnishing?: Database['public']['Enums']['furnishing'];
          gender_preference?: Database['public']['Enums']['gender_preference'];
          host_id?: string;
          id?: string;
          latitude?: number | null;
          locality?: string | null;
          locality_id?: number | null;
          longitude?: number | null;
          max_occupants?: number;
          occupancy_type?: Database['public']['Enums']['occupancy_type'];
          postal_code?: string | null;
          property_type?: string;
          property_type_id?: number | null;
          public_id?: string;
          state?: string | null;
          status?: Database['public']['Enums']['listing_status'];
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listings_city_id_fkey';
            columns: ['city_id'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'listings_host_id_fkey';
            columns: ['host_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'listings_locality_id_fkey';
            columns: ['locality_id'];
            isOneToOne: false;
            referencedRelation: 'localities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'listings_property_type_id_fkey';
            columns: ['property_type_id'];
            isOneToOne: false;
            referencedRelation: 'property_types';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'listings_type_id_fkey';
            columns: ['accommodation_type_id'];
            isOneToOne: false;
            referencedRelation: 'accommodation_types';
            referencedColumns: ['id'];
          },
        ];
      };
      localities: {
        Row: {
          aliases: string[] | null;
          city_id: number;
          created_at: string;
          display_name: string | null;
          id: number;
          is_active: boolean;
          latitude: number | null;
          longitude: number | null;
          name: string;
          search_rank: number;
          slug: string;
          updated_at: string;
        };
        Insert: {
          aliases?: string[] | null;
          city_id: number;
          created_at?: string;
          display_name?: string | null;
          id?: never;
          is_active?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name: string;
          search_rank?: number;
          slug: string;
          updated_at?: string;
        };
        Update: {
          aliases?: string[] | null;
          city_id?: number;
          created_at?: string;
          display_name?: string | null;
          id?: never;
          is_active?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          name?: string;
          search_rank?: number;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'localities_city_id_fkey';
            columns: ['city_id'];
            isOneToOne: false;
            referencedRelation: 'cities';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          content: string;
          conversation_id: string;
          created_at: string;
          id: string;
          sender_id: string | null;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          sender_id?: string | null;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          sender_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey';
            columns: ['conversation_id'];
            isOneToOne: false;
            referencedRelation: 'conversations';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string;
          id: string;
          link: string | null;
          message: string;
          read_at: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          link?: string | null;
          message: string;
          read_at?: string | null;
          title: string;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          link?: string | null;
          message?: string;
          read_at?: string | null;
          title?: string;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_storage_path: string | null;
          bio: string | null;
          created_at: string;
          date_of_birth: string | null;
          display_name: string | null;
          full_name: string | null;
          gender: Database['public']['Enums']['gender'] | null;
          id: string;
          occupation: Database['public']['Enums']['user_occupation'] | null;
          phone: string | null;
          role: Database['public']['Enums']['user_role'];
          timezone: string | null;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_storage_path?: string | null;
          bio?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          display_name?: string | null;
          full_name?: string | null;
          gender?: Database['public']['Enums']['gender'] | null;
          id: string;
          occupation?: Database['public']['Enums']['user_occupation'] | null;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
          timezone?: string | null;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_storage_path?: string | null;
          bio?: string | null;
          created_at?: string;
          date_of_birth?: string | null;
          display_name?: string | null;
          full_name?: string | null;
          gender?: Database['public']['Enums']['gender'] | null;
          id?: string;
          occupation?: Database['public']['Enums']['user_occupation'] | null;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
          timezone?: string | null;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      property_types: {
        Row: {
          created_at: string;
          description: string | null;
          display_order: number;
          icon: string | null;
          id: number;
          is_active: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: number;
          is_active?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          display_order?: number;
          icon?: string | null;
          id?: number;
          is_active?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          guest_id: string;
          id: string;
          listing_id: string;
          rating: number;
          stay_id: string;
          updated_at: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          guest_id: string;
          id?: string;
          listing_id: string;
          rating: number;
          stay_id: string;
          updated_at?: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          guest_id?: string;
          id?: string;
          listing_id?: string;
          rating?: number;
          stay_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_guest_id_fkey';
            columns: ['guest_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_stay_id_fkey';
            columns: ['stay_id'];
            isOneToOne: false;
            referencedRelation: 'stays';
            referencedColumns: ['id'];
          },
        ];
      };
      states: {
        Row: {
          code: string;
          country_id: number;
          created_at: string;
          external_code: string;
          id: number;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          country_id: number;
          created_at?: string;
          external_code: string;
          id?: never;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          country_id?: number;
          created_at?: string;
          external_code?: string;
          id?: never;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'states_country_id_fkey';
            columns: ['country_id'];
            isOneToOne: false;
            referencedRelation: 'countries';
            referencedColumns: ['id'];
          },
        ];
      };
      stay_events: {
        Row: {
          action: string;
          actor_id: string;
          created_at: string;
          id: string;
          metadata: Json | null;
          new_status: Database['public']['Enums']['stay_status'] | null;
          previous_status: Database['public']['Enums']['stay_status'] | null;
          stay_id: string;
        };
        Insert: {
          action: string;
          actor_id: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          new_status?: Database['public']['Enums']['stay_status'] | null;
          previous_status?: Database['public']['Enums']['stay_status'] | null;
          stay_id: string;
        };
        Update: {
          action?: string;
          actor_id?: string;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          new_status?: Database['public']['Enums']['stay_status'] | null;
          previous_status?: Database['public']['Enums']['stay_status'] | null;
          stay_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'stay_events_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stay_events_stay_id_fkey';
            columns: ['stay_id'];
            isOneToOne: false;
            referencedRelation: 'stays';
            referencedColumns: ['id'];
          },
        ];
      };
      stays: {
        Row: {
          actual_move_in_date: string | null;
          actual_move_out_date: string | null;
          agreed_amount: number;
          agreed_billing_period: Database['public']['Enums']['billing_period'];
          created_at: string;
          created_by: string | null;
          created_from_booking_id: string | null;
          expected_move_in_date: string;
          expected_move_out_date: string;
          guest_id: string;
          id: string;
          listing_id: string;
          security_deposit_paid: number;
          status: Database['public']['Enums']['stay_status'];
          updated_at: string;
        };
        Insert: {
          actual_move_in_date?: string | null;
          actual_move_out_date?: string | null;
          agreed_amount: number;
          agreed_billing_period: Database['public']['Enums']['billing_period'];
          created_at?: string;
          created_by?: string | null;
          created_from_booking_id?: string | null;
          expected_move_in_date: string;
          expected_move_out_date: string;
          guest_id: string;
          id?: string;
          listing_id: string;
          security_deposit_paid?: number;
          status?: Database['public']['Enums']['stay_status'];
          updated_at?: string;
        };
        Update: {
          actual_move_in_date?: string | null;
          actual_move_out_date?: string | null;
          agreed_amount?: number;
          agreed_billing_period?: Database['public']['Enums']['billing_period'];
          created_at?: string;
          created_by?: string | null;
          created_from_booking_id?: string | null;
          expected_move_in_date?: string;
          expected_move_out_date?: string;
          guest_id?: string;
          id?: string;
          listing_id?: string;
          security_deposit_paid?: number;
          status?: Database['public']['Enums']['stay_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'stays_created_from_booking_id_fkey';
            columns: ['created_from_booking_id'];
            isOneToOne: false;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stays_guest_id_fkey';
            columns: ['guest_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'stays_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      user_preferences: {
        Row: {
          appearance: Json;
          communication: Json;
          created_at: string | null;
          data: Json;
          hosting: Json;
          language: string;
          notifications: Json;
          preferences_version: number;
          privacy: Json;
          security: Json;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          appearance?: Json;
          communication?: Json;
          created_at?: string | null;
          data?: Json;
          hosting?: Json;
          language?: string;
          notifications?: Json;
          preferences_version?: number;
          privacy?: Json;
          security?: Json;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          appearance?: Json;
          communication?: Json;
          created_at?: string | null;
          data?: Json;
          hosting?: Json;
          language?: string;
          notifications?: Json;
          preferences_version?: number;
          privacy?: Json;
          security?: Json;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_user_account: { Args: never; Returns: undefined };
      get_listing_detail: { Args: { p_public_id: string }; Returns: Json };
      is_admin: { Args: never; Returns: boolean };
      is_host: { Args: never; Returns: boolean };
      is_listing_owner: { Args: { listing_id: string }; Returns: boolean };
      search_listings: {
        Args: {
          p_accommodation_type_id?: string;
          p_amenities?: string[];
          p_available_from?: string;
          p_billing_period?: Database['public']['Enums']['billing_period'];
          p_center_lat?: number;
          p_center_lng?: number;
          p_city?: string;
          p_furnishing?: Database['public']['Enums']['furnishing'];
          p_gender_preference?: Database['public']['Enums']['gender_preference'];
          p_locality?: string;
          p_max_lat?: number;
          p_max_lng?: number;
          p_max_price?: number;
          p_min_lat?: number;
          p_min_lng?: number;
          p_min_price?: number;
          p_occupancy_type?: Database['public']['Enums']['occupancy_type'];
          p_page?: number;
          p_page_size?: number;
          p_sort?: string;
        };
        Returns: {
          accommodation_type_name: string;
          city: string;
          formatted_address: string;
          furnishing: Database['public']['Enums']['furnishing'];
          gender_preference: Database['public']['Enums']['gender_preference'];
          image_url: string;
          latitude: number;
          listing_id: string;
          locality: string;
          longitude: number;
          occupancy_type: Database['public']['Enums']['occupancy_type'];
          price_amount: number;
          price_billing_period: Database['public']['Enums']['billing_period'];
          price_currency: string;
          price_minimum_duration: number;
          public_id: string;
          title: string;
          total_count: number;
        }[];
      };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { '': string }; Returns: string[] };
      transition_booking: {
        Args: {
          p_actor_id: string;
          p_booking_id: string;
          p_current_status: Database['public']['Enums']['booking_status'];
          p_metadata?: Json;
          p_new_status: Database['public']['Enums']['booking_status'];
        };
        Returns: Json;
      };
      transition_stay: {
        Args: {
          p_actor_id: string;
          p_current_status: Database['public']['Enums']['stay_status'];
          p_metadata?: Json;
          p_new_status: Database['public']['Enums']['stay_status'];
          p_stay_id: string;
          p_updates?: Json;
        };
        Returns: Json;
      };
      uuid_to_public_id: { Args: { input_uuid: string }; Returns: string };
    };
    Enums: {
      availability_source:
        'booking' | 'manual_block' | 'external_calendar' | 'maintenance';
      availability_status: 'available' | 'occupied' | 'unavailable';
      billing_period: 'day' | 'week' | 'month' | 'semester' | 'year';
      booking_status:
        'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
      furnishing: 'unfurnished' | 'semi_furnished' | 'fully_furnished';
      gender: 'male' | 'female';
      gender_preference: 'any' | 'male' | 'female';
      host_business_type: 'individual' | 'company' | 'property_manager';
      host_status:
        | 'NOT_STARTED'
        | 'ONBOARDING'
        | 'READY'
        | 'ACTIVE'
        | 'PAUSED'
        | 'SUSPENDED';
      listing_status:
        | 'draft'
        | 'ready'
        | 'pending_review'
        | 'published'
        | 'paused'
        | 'archived';
      occupancy_type: 'private' | 'shared' | 'mixed';
      stay_status:
        | 'upcoming'
        | 'active'
        | 'extended'
        | 'checked_out'
        | 'completed'
        | 'terminated';
      sync_direction: 'import' | 'export' | 'both';
      user_occupation:
        | 'student'
        | 'working_professional'
        | 'business_owner'
        | 'freelancer'
        | 'job_seeker'
        | 'retired'
        | 'other';
      user_role: 'guest' | 'host' | 'admin';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      availability_source: [
        'booking',
        'manual_block',
        'external_calendar',
        'maintenance',
      ],
      availability_status: ['available', 'occupied', 'unavailable'],
      billing_period: ['day', 'week', 'month', 'semester', 'year'],
      booking_status: [
        'pending',
        'approved',
        'rejected',
        'cancelled',
        'expired',
      ],
      furnishing: ['unfurnished', 'semi_furnished', 'fully_furnished'],
      gender: ['male', 'female'],
      gender_preference: ['any', 'male', 'female'],
      host_business_type: ['individual', 'company', 'property_manager'],
      host_status: [
        'NOT_STARTED',
        'ONBOARDING',
        'READY',
        'ACTIVE',
        'PAUSED',
        'SUSPENDED',
      ],
      listing_status: [
        'draft',
        'ready',
        'pending_review',
        'published',
        'paused',
        'archived',
      ],
      occupancy_type: ['private', 'shared', 'mixed'],
      stay_status: [
        'upcoming',
        'active',
        'extended',
        'checked_out',
        'completed',
        'terminated',
      ],
      sync_direction: ['import', 'export', 'both'],
      user_occupation: [
        'student',
        'working_professional',
        'business_owner',
        'freelancer',
        'job_seeker',
        'retired',
        'other',
      ],
      user_role: ['guest', 'host', 'admin'],
    },
  },
} as const;
