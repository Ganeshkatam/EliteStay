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
      accounts: {
        Row: {
          created_at: string | null;
          id: string;
          lease_id: string;
          tenant_id: string;
          type: Database['public']['Enums']['account_type'];
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          lease_id: string;
          tenant_id: string;
          type?: Database['public']['Enums']['account_type'];
        };
        Update: {
          created_at?: string | null;
          id?: string;
          lease_id?: string;
          tenant_id?: string;
          type?: Database['public']['Enums']['account_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'accounts_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: false;
            referencedRelation: 'leases';
            referencedColumns: ['id'];
          },
        ];
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
      applicant_profiles: {
        Row: {
          created_at: string;
          employment_status: string | null;
          guarantor_information: string | null;
          guest_id: string;
          id: string;
          income_range: string | null;
          pet_information: string | null;
          smoking_preference: string | null;
          student_status: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          employment_status?: string | null;
          guarantor_information?: string | null;
          guest_id: string;
          id?: string;
          income_range?: string | null;
          pet_information?: string | null;
          smoking_preference?: string | null;
          student_status?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          employment_status?: string | null;
          guarantor_information?: string | null;
          guest_id?: string;
          id?: string;
          income_range?: string | null;
          pet_information?: string | null;
          smoking_preference?: string | null;
          student_status?: string | null;
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
      charge_schedules: {
        Row: {
          active: boolean | null;
          amount: number;
          charge_type: string;
          created_at: string | null;
          frequency: string;
          id: string;
          lease_id: string;
          next_charge_date: string;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          amount: number;
          charge_type: string;
          created_at?: string | null;
          frequency?: string;
          id?: string;
          lease_id: string;
          next_charge_date: string;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          amount?: number;
          charge_type?: string;
          created_at?: string | null;
          frequency?: string;
          id?: string;
          lease_id?: string;
          next_charge_date?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'charge_schedules_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: false;
            referencedRelation: 'leases';
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
          created_at: string;
          guest_id: string;
          host_profile_id: string;
          id: string;
          listing_id: string | null;
          status: Database['public']['Enums']['conversation_status'];
          stay_id: string | null;
          type: Database['public']['Enums']['conversation_type'];
          updated_at: string;
        };
        Insert: {
          booking_id?: string | null;
          created_at?: string;
          guest_id: string;
          host_profile_id: string;
          id?: string;
          listing_id?: string | null;
          status?: Database['public']['Enums']['conversation_status'];
          stay_id?: string | null;
          type?: Database['public']['Enums']['conversation_type'];
          updated_at?: string;
        };
        Update: {
          booking_id?: string | null;
          created_at?: string;
          guest_id?: string;
          host_profile_id?: string;
          id?: string;
          listing_id?: string | null;
          status?: Database['public']['Enums']['conversation_status'];
          stay_id?: string | null;
          type?: Database['public']['Enums']['conversation_type'];
          updated_at?: string;
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
            foreignKeyName: 'conversations_guest_id_fkey';
            columns: ['guest_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_host_profile_id_fkey';
            columns: ['host_profile_id'];
            isOneToOne: false;
            referencedRelation: 'host_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'conversations_listing_id_fkey';
            columns: ['listing_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
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
      documents: {
        Row: {
          bucket: string;
          checksum: string | null;
          created_at: string | null;
          id: string;
          mime_type: string | null;
          owner_id: string;
          owner_type: string;
          size_bytes: number | null;
          storage_path: string;
          type: Database['public']['Enums']['document_type'];
          uploaded_by: string;
          version: number | null;
        };
        Insert: {
          bucket: string;
          checksum?: string | null;
          created_at?: string | null;
          id?: string;
          mime_type?: string | null;
          owner_id: string;
          owner_type: string;
          size_bytes?: number | null;
          storage_path: string;
          type: Database['public']['Enums']['document_type'];
          uploaded_by: string;
          version?: number | null;
        };
        Update: {
          bucket?: string;
          checksum?: string | null;
          created_at?: string | null;
          id?: string;
          mime_type?: string | null;
          owner_id?: string;
          owner_type?: string;
          size_bytes?: number | null;
          storage_path?: string;
          type?: Database['public']['Enums']['document_type'];
          uploaded_by?: string;
          version?: number | null;
        };
        Relationships: [];
      };
      domain_timeline: {
        Row: {
          actor_id: string | null;
          causation_id: string | null;
          correlation_id: string | null;
          created_at: string;
          entity_id: string;
          entity_type: string;
          event_type: string;
          id: string;
          metadata: Json | null;
        };
        Insert: {
          actor_id?: string | null;
          causation_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          event_type: string;
          id?: string;
          metadata?: Json | null;
        };
        Update: {
          actor_id?: string | null;
          causation_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          event_type?: string;
          id?: string;
          metadata?: Json | null;
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
      invoices: {
        Row: {
          amount_due: number;
          created_at: string | null;
          due_date: string;
          id: string;
          lease_id: string;
          status: Database['public']['Enums']['invoice_status'] | null;
          updated_at: string | null;
        };
        Insert: {
          amount_due: number;
          created_at?: string | null;
          due_date: string;
          id?: string;
          lease_id: string;
          status?: Database['public']['Enums']['invoice_status'] | null;
          updated_at?: string | null;
        };
        Update: {
          amount_due?: number;
          created_at?: string | null;
          due_date?: string;
          id?: string;
          lease_id?: string;
          status?: Database['public']['Enums']['invoice_status'] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: false;
            referencedRelation: 'leases';
            referencedColumns: ['id'];
          },
        ];
      };
      lease_versions: {
        Row: {
          change_reason: string | null;
          created_at: string;
          created_by: string | null;
          end_date: string;
          id: string;
          lease_id: string;
          monthly_rent_amount: number;
          security_deposit_amount: number;
          start_date: string;
          structured_data: Json;
          version_number: number;
        };
        Insert: {
          change_reason?: string | null;
          created_at?: string;
          created_by?: string | null;
          end_date: string;
          id?: string;
          lease_id: string;
          monthly_rent_amount: number;
          security_deposit_amount: number;
          start_date: string;
          structured_data?: Json;
          version_number?: number;
        };
        Update: {
          change_reason?: string | null;
          created_at?: string;
          created_by?: string | null;
          end_date?: string;
          id?: string;
          lease_id?: string;
          monthly_rent_amount?: number;
          security_deposit_amount?: number;
          start_date?: string;
          structured_data?: Json;
          version_number?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'lease_versions_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: false;
            referencedRelation: 'leases';
            referencedColumns: ['id'];
          },
        ];
      };
      leases: {
        Row: {
          created_at: string;
          current_version_id: string | null;
          document_url: string | null;
          end_date: string;
          id: string;
          monthly_rent_amount: number;
          occupancy_status: Database['public']['Enums']['tenancy_occupancy_status'];
          reservation_id: string;
          security_deposit_amount: number;
          start_date: string;
          status: Database['public']['Enums']['lease_status'];
          structured_data: Json;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_version_id?: string | null;
          document_url?: string | null;
          end_date: string;
          id?: string;
          monthly_rent_amount: number;
          occupancy_status?: Database['public']['Enums']['tenancy_occupancy_status'];
          reservation_id: string;
          security_deposit_amount: number;
          start_date: string;
          status?: Database['public']['Enums']['lease_status'];
          structured_data?: Json;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_version_id?: string | null;
          document_url?: string | null;
          end_date?: string;
          id?: string;
          monthly_rent_amount?: number;
          occupancy_status?: Database['public']['Enums']['tenancy_occupancy_status'];
          reservation_id?: string;
          security_deposit_amount?: number;
          start_date?: string;
          status?: Database['public']['Enums']['lease_status'];
          structured_data?: Json;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'leases_current_version_id_fkey';
            columns: ['current_version_id'];
            isOneToOne: false;
            referencedRelation: 'lease_versions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leases_reservation_id_fkey';
            columns: ['reservation_id'];
            isOneToOne: true;
            referencedRelation: 'bookings';
            referencedColumns: ['id'];
          },
        ];
      };
      ledger_entries: {
        Row: {
          account_id: string;
          amount: number;
          created_at: string | null;
          description: string;
          id: string;
          source_id: string;
          source_type: string;
          type: Database['public']['Enums']['ledger_entry_type'];
        };
        Insert: {
          account_id: string;
          amount: number;
          created_at?: string | null;
          description: string;
          id?: string;
          source_id: string;
          source_type: string;
          type: Database['public']['Enums']['ledger_entry_type'];
        };
        Update: {
          account_id?: string;
          amount?: number;
          created_at?: string | null;
          description?: string;
          id?: string;
          source_id?: string;
          source_type?: string;
          type?: Database['public']['Enums']['ledger_entry_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'ledger_entries_account_id_fkey';
            columns: ['account_id'];
            isOneToOne: false;
            referencedRelation: 'accounts';
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
          available_from: string;
          booking_policy:
            Database['public']['Enums']['listing_booking_policy'] | null;
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
          maximum_lease_months: number | null;
          minimum_lease_months: number | null;
          notice_period_days: number | null;
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
          available_from?: string;
          booking_policy?:
            Database['public']['Enums']['listing_booking_policy'] | null;
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
          maximum_lease_months?: number | null;
          minimum_lease_months?: number | null;
          notice_period_days?: number | null;
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
          available_from?: string;
          booking_policy?:
            Database['public']['Enums']['listing_booking_policy'] | null;
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
          maximum_lease_months?: number | null;
          minimum_lease_months?: number | null;
          notice_period_days?: number | null;
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
      maintenance_assignments: {
        Row: {
          assignee_id: string;
          assignee_type: Database['public']['Enums']['maintenance_assignee_type'];
          created_at: string | null;
          id: string;
          request_id: string;
          scheduled_date: string | null;
        };
        Insert: {
          assignee_id: string;
          assignee_type: Database['public']['Enums']['maintenance_assignee_type'];
          created_at?: string | null;
          id?: string;
          request_id: string;
          scheduled_date?: string | null;
        };
        Update: {
          assignee_id?: string;
          assignee_type?: Database['public']['Enums']['maintenance_assignee_type'];
          created_at?: string | null;
          id?: string;
          request_id?: string;
          scheduled_date?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'maintenance_assignments_request_id_fkey';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'maintenance_requests';
            referencedColumns: ['id'];
          },
        ];
      };
      maintenance_attachments: {
        Row: {
          created_at: string | null;
          document_id: string;
          id: string;
          request_id: string;
        };
        Insert: {
          created_at?: string | null;
          document_id: string;
          id?: string;
          request_id: string;
        };
        Update: {
          created_at?: string | null;
          document_id?: string;
          id?: string;
          request_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'maintenance_attachments_request_id_fkey';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'maintenance_requests';
            referencedColumns: ['id'];
          },
        ];
      };
      maintenance_comments: {
        Row: {
          author_id: string;
          comment_text: string;
          created_at: string | null;
          id: string;
          request_id: string;
        };
        Insert: {
          author_id: string;
          comment_text: string;
          created_at?: string | null;
          id?: string;
          request_id: string;
        };
        Update: {
          author_id?: string;
          comment_text?: string;
          created_at?: string | null;
          id?: string;
          request_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'maintenance_comments_request_id_fkey';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'maintenance_requests';
            referencedColumns: ['id'];
          },
        ];
      };
      maintenance_requests: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          lease_id: string;
          priority: string | null;
          resident_id: string;
          resolved_at: string | null;
          status:
            Database['public']['Enums']['maintenance_request_status'] | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          lease_id: string;
          priority?: string | null;
          resident_id: string;
          resolved_at?: string | null;
          status?:
            Database['public']['Enums']['maintenance_request_status'] | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          lease_id?: string;
          priority?: string | null;
          resident_id?: string;
          resolved_at?: string | null;
          status?:
            Database['public']['Enums']['maintenance_request_status'] | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'maintenance_requests_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: false;
            referencedRelation: 'leases';
            referencedColumns: ['id'];
          },
        ];
      };
      maintenance_status_history: {
        Row: {
          changed_by: string;
          created_at: string | null;
          id: string;
          request_id: string;
          status: Database['public']['Enums']['maintenance_request_status'];
        };
        Insert: {
          changed_by: string;
          created_at?: string | null;
          id?: string;
          request_id: string;
          status: Database['public']['Enums']['maintenance_request_status'];
        };
        Update: {
          changed_by?: string;
          created_at?: string | null;
          id?: string;
          request_id?: string;
          status?: Database['public']['Enums']['maintenance_request_status'];
        };
        Relationships: [
          {
            foreignKeyName: 'maintenance_status_history_request_id_fkey';
            columns: ['request_id'];
            isOneToOne: false;
            referencedRelation: 'maintenance_requests';
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
          read_at: string | null;
          sender_id: string | null;
        };
        Insert: {
          content: string;
          conversation_id: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
          sender_id?: string | null;
        };
        Update: {
          content?: string;
          conversation_id?: string;
          created_at?: string;
          id?: string;
          read_at?: string | null;
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
      move_ins: {
        Row: {
          completed_at: string | null;
          condition_report_signed: boolean;
          created_at: string;
          deposit_verified: boolean;
          emergency_contacts_confirmed: boolean;
          id: string;
          identity_verified: boolean;
          inventory_completed: boolean;
          keys_issued: boolean;
          lease_id: string;
          scheduled_date: string | null;
          status: Database['public']['Enums']['move_in_status'];
          updated_at: string;
          utility_information_shared: boolean;
        };
        Insert: {
          completed_at?: string | null;
          condition_report_signed?: boolean;
          created_at?: string;
          deposit_verified?: boolean;
          emergency_contacts_confirmed?: boolean;
          id?: string;
          identity_verified?: boolean;
          inventory_completed?: boolean;
          keys_issued?: boolean;
          lease_id: string;
          scheduled_date?: string | null;
          status?: Database['public']['Enums']['move_in_status'];
          updated_at?: string;
          utility_information_shared?: boolean;
        };
        Update: {
          completed_at?: string | null;
          condition_report_signed?: boolean;
          created_at?: string;
          deposit_verified?: boolean;
          emergency_contacts_confirmed?: boolean;
          id?: string;
          identity_verified?: boolean;
          inventory_completed?: boolean;
          keys_issued?: boolean;
          lease_id?: string;
          scheduled_date?: string | null;
          status?: Database['public']['Enums']['move_in_status'];
          updated_at?: string;
          utility_information_shared?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'move_ins_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: true;
            referencedRelation: 'leases';
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
      outbox_events: {
        Row: {
          aggregate_id: string;
          aggregate_type: string;
          causation_id: string | null;
          correlation_id: string | null;
          created_at: string;
          error: string | null;
          id: string;
          payload: Json;
          processed_at: string | null;
          status: Database['public']['Enums']['outbox_status'];
          type: string;
        };
        Insert: {
          aggregate_id: string;
          aggregate_type: string;
          causation_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          error?: string | null;
          id?: string;
          payload: Json;
          processed_at?: string | null;
          status?: Database['public']['Enums']['outbox_status'];
          type: string;
        };
        Update: {
          aggregate_id?: string;
          aggregate_type?: string;
          causation_id?: string | null;
          correlation_id?: string | null;
          created_at?: string;
          error?: string | null;
          id?: string;
          payload?: Json;
          processed_at?: string | null;
          status?: Database['public']['Enums']['outbox_status'];
          type?: string;
        };
        Relationships: [];
      };
      payment_allocations: {
        Row: {
          amount_allocated: number;
          created_at: string | null;
          id: string;
          invoice_id: string;
          payment_entry_id: string;
        };
        Insert: {
          amount_allocated: number;
          created_at?: string | null;
          id?: string;
          invoice_id: string;
          payment_entry_id: string;
        };
        Update: {
          amount_allocated?: number;
          created_at?: string | null;
          id?: string;
          invoice_id?: string;
          payment_entry_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payment_allocations_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payment_allocations_payment_entry_id_fkey';
            columns: ['payment_entry_id'];
            isOneToOne: false;
            referencedRelation: 'ledger_entries';
            referencedColumns: ['id'];
          },
        ];
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
          updated_at: string;
          username: string;
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
          updated_at?: string;
          username: string;
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
          updated_at?: string;
          username?: string;
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
      rental_applications: {
        Row: {
          applicant_profile_id: string | null;
          created_at: string;
          guest_id: string;
          id: string;
          lease_duration_months: number;
          monthly_budget: number | null;
          move_in_date: string;
          property_id: string;
          status: Database['public']['Enums']['rental_application_status'];
          updated_at: string;
        };
        Insert: {
          applicant_profile_id?: string | null;
          created_at?: string;
          guest_id: string;
          id?: string;
          lease_duration_months: number;
          monthly_budget?: number | null;
          move_in_date: string;
          property_id: string;
          status?: Database['public']['Enums']['rental_application_status'];
          updated_at?: string;
        };
        Update: {
          applicant_profile_id?: string | null;
          created_at?: string;
          guest_id?: string;
          id?: string;
          lease_duration_months?: number;
          monthly_budget?: number | null;
          move_in_date?: string;
          property_id?: string;
          status?: Database['public']['Enums']['rental_application_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rental_applications_applicant_profile_id_fkey';
            columns: ['applicant_profile_id'];
            isOneToOne: false;
            referencedRelation: 'applicant_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'rental_applications_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      reservations: {
        Row: {
          base_price: number;
          brokerage_fee_amount: number | null;
          check_in: string;
          check_out: string;
          cleaning_fee: number;
          created_at: string;
          currency: string;
          guest_id: string;
          guests_count: number;
          id: string;
          idempotency_key: string | null;
          lease_duration_months: number | null;
          maintenance_fee_amount: number | null;
          move_in_date: string | null;
          payment_intent_id: string | null;
          property_id: string;
          security_deposit_amount: number | null;
          service_fee: number;
          snapshot_json: Json;
          status: Database['public']['Enums']['reservation_status'];
          tax_amount: number;
          total_amount: number;
          updated_at: string;
          utilities_amount: number | null;
          version: number;
        };
        Insert: {
          base_price: number;
          brokerage_fee_amount?: number | null;
          check_in: string;
          check_out: string;
          cleaning_fee?: number;
          created_at?: string;
          currency: string;
          guest_id: string;
          guests_count: number;
          id?: string;
          idempotency_key?: string | null;
          lease_duration_months?: number | null;
          maintenance_fee_amount?: number | null;
          move_in_date?: string | null;
          payment_intent_id?: string | null;
          property_id: string;
          security_deposit_amount?: number | null;
          service_fee?: number;
          snapshot_json: Json;
          status?: Database['public']['Enums']['reservation_status'];
          tax_amount?: number;
          total_amount: number;
          updated_at?: string;
          utilities_amount?: number | null;
          version?: number;
        };
        Update: {
          base_price?: number;
          brokerage_fee_amount?: number | null;
          check_in?: string;
          check_out?: string;
          cleaning_fee?: number;
          created_at?: string;
          currency?: string;
          guest_id?: string;
          guests_count?: number;
          id?: string;
          idempotency_key?: string | null;
          lease_duration_months?: number | null;
          maintenance_fee_amount?: number | null;
          move_in_date?: string | null;
          payment_intent_id?: string | null;
          property_id?: string;
          security_deposit_amount?: number | null;
          service_fee?: number;
          snapshot_json?: Json;
          status?: Database['public']['Enums']['reservation_status'];
          tax_amount?: number;
          total_amount?: number;
          updated_at?: string;
          utilities_amount?: number | null;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'reservations_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['id'];
          },
        ];
      };
      resident_notices: {
        Row: {
          content: string;
          created_at: string | null;
          delivered_at: string | null;
          id: string;
          is_read: boolean | null;
          lease_id: string | null;
          read_at: string | null;
          resident_id: string;
          type: Database['public']['Enums']['resident_notice_type'];
        };
        Insert: {
          content: string;
          created_at?: string | null;
          delivered_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          lease_id?: string | null;
          read_at?: string | null;
          resident_id: string;
          type: Database['public']['Enums']['resident_notice_type'];
        };
        Update: {
          content?: string;
          created_at?: string | null;
          delivered_at?: string | null;
          id?: string;
          is_read?: boolean | null;
          lease_id?: string | null;
          read_at?: string | null;
          resident_id?: string;
          type?: Database['public']['Enums']['resident_notice_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'resident_notices_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: false;
            referencedRelation: 'leases';
            referencedColumns: ['id'];
          },
        ];
      };
      resident_profiles: {
        Row: {
          created_at: string | null;
          emergency_contacts: Json | null;
          employment_status: string | null;
          id: string;
          preferred_communication: string | null;
          updated_at: string | null;
          vehicle_registration: Json | null;
        };
        Insert: {
          created_at?: string | null;
          emergency_contacts?: Json | null;
          employment_status?: string | null;
          id: string;
          preferred_communication?: string | null;
          updated_at?: string | null;
          vehicle_registration?: Json | null;
        };
        Update: {
          created_at?: string | null;
          emergency_contacts?: Json | null;
          employment_status?: string | null;
          id?: string;
          preferred_communication?: string | null;
          updated_at?: string | null;
          vehicle_registration?: Json | null;
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
      security_deposits: {
        Row: {
          amount: number;
          collected_at: string | null;
          created_at: string;
          id: string;
          lease_id: string;
          release_reason: string | null;
          released_at: string | null;
          status: Database['public']['Enums']['security_deposit_status'];
          updated_at: string;
        };
        Insert: {
          amount: number;
          collected_at?: string | null;
          created_at?: string;
          id?: string;
          lease_id: string;
          release_reason?: string | null;
          released_at?: string | null;
          status?: Database['public']['Enums']['security_deposit_status'];
          updated_at?: string;
        };
        Update: {
          amount?: number;
          collected_at?: string | null;
          created_at?: string;
          id?: string;
          lease_id?: string;
          release_reason?: string | null;
          released_at?: string | null;
          status?: Database['public']['Enums']['security_deposit_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'security_deposits_lease_id_fkey';
            columns: ['lease_id'];
            isOneToOne: true;
            referencedRelation: 'leases';
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
      viewing_requests: {
        Row: {
          created_at: string;
          guest_id: string;
          id: string;
          message: string | null;
          property_id: string;
          requested_date: string;
          requested_time: string;
          status: Database['public']['Enums']['viewing_request_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          guest_id: string;
          id?: string;
          message?: string | null;
          property_id: string;
          requested_date: string;
          requested_time: string;
          status?: Database['public']['Enums']['viewing_request_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          guest_id?: string;
          id?: string;
          message?: string | null;
          property_id?: string;
          requested_date?: string;
          requested_time?: string;
          status?: Database['public']['Enums']['viewing_request_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'viewing_requests_property_id_fkey';
            columns: ['property_id'];
            isOneToOne: false;
            referencedRelation: 'listings';
            referencedColumns: ['public_id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      check_availability: {
        Args: {
          p_check_in: string;
          p_check_out: string;
          p_property_id: string;
        };
        Returns: boolean;
      };
      create_reservation_safe:
        | {
            Args: {
              p_base_price: number;
              p_check_in: string;
              p_check_out: string;
              p_cleaning_fee: number;
              p_currency: string;
              p_guest_id: string;
              p_guests_count: number;
              p_idempotency_key: string;
              p_property_id: string;
              p_service_fee: number;
              p_snapshot_json: Json;
              p_tax_amount: number;
              p_total_amount: number;
            };
            Returns: {
              base_price: number;
              brokerage_fee_amount: number | null;
              check_in: string;
              check_out: string;
              cleaning_fee: number;
              created_at: string;
              currency: string;
              guest_id: string;
              guests_count: number;
              id: string;
              idempotency_key: string | null;
              lease_duration_months: number | null;
              maintenance_fee_amount: number | null;
              move_in_date: string | null;
              payment_intent_id: string | null;
              property_id: string;
              security_deposit_amount: number | null;
              service_fee: number;
              snapshot_json: Json;
              status: Database['public']['Enums']['reservation_status'];
              tax_amount: number;
              total_amount: number;
              updated_at: string;
              utilities_amount: number | null;
              version: number;
            };
            SetofOptions: {
              from: '*';
              to: 'reservations';
              isOneToOne: true;
              isSetofReturn: false;
            };
          }
        | {
            Args: {
              p_base_price: number;
              p_brokerage_fee_amount?: number;
              p_check_in: string;
              p_check_out: string;
              p_cleaning_fee: number;
              p_currency: string;
              p_guest_id: string;
              p_guests_count: number;
              p_idempotency_key: string;
              p_lease_duration_months?: number;
              p_maintenance_fee_amount?: number;
              p_move_in_date?: string;
              p_property_id: string;
              p_security_deposit_amount?: number;
              p_service_fee: number;
              p_snapshot_json: Json;
              p_tax_amount: number;
              p_total_amount: number;
              p_utilities_amount?: number;
            };
            Returns: {
              base_price: number;
              brokerage_fee_amount: number | null;
              check_in: string;
              check_out: string;
              cleaning_fee: number;
              created_at: string;
              currency: string;
              guest_id: string;
              guests_count: number;
              id: string;
              idempotency_key: string | null;
              lease_duration_months: number | null;
              maintenance_fee_amount: number | null;
              move_in_date: string | null;
              payment_intent_id: string | null;
              property_id: string;
              security_deposit_amount: number | null;
              service_fee: number;
              snapshot_json: Json;
              status: Database['public']['Enums']['reservation_status'];
              tax_amount: number;
              total_amount: number;
              updated_at: string;
              utilities_amount: number | null;
              version: number;
            };
            SetofOptions: {
              from: '*';
              to: 'reservations';
              isOneToOne: true;
              isSetofReturn: false;
            };
          };
      delete_user_account: { Args: never; Returns: undefined };
      generate_unique_username: {
        Args: { raw_meta_data: Json; user_email: string };
        Returns: string;
      };
      get_listing_detail: { Args: { p_public_id: string }; Returns: Json };
      get_pending_outbox_events: {
        Args: { batch_size?: number };
        Returns: {
          aggregate_id: string;
          aggregate_type: string;
          causation_id: string | null;
          correlation_id: string | null;
          created_at: string;
          error: string | null;
          id: string;
          payload: Json;
          processed_at: string | null;
          status: Database['public']['Enums']['outbox_status'];
          type: string;
        }[];
        SetofOptions: {
          from: '*';
          to: 'outbox_events';
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      is_admin: { Args: never; Returns: boolean };
      is_host: { Args: never; Returns: boolean };
      is_listing_owner: { Args: { listing_id: string }; Returns: boolean };
      mark_outbox_event_failed: {
        Args: { error_msg: string; event_id: string };
        Returns: undefined;
      };
      mark_outbox_event_processed: {
        Args: { event_id: string };
        Returns: undefined;
      };
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
      account_type: 'RECEIVABLE' | 'LIABILITY';
      availability_source:
        'booking' | 'manual_block' | 'external_calendar' | 'maintenance';
      availability_status: 'available' | 'reserved' | 'unavailable';
      billing_period: 'day' | 'week' | 'month' | 'semester' | 'year';
      booking_status:
        'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
      conversation_status: 'OPEN' | 'CLOSED' | 'ARCHIVED' | 'BLOCKED';
      conversation_type: 'INQUIRY' | 'BOOKING' | 'STAY' | 'SUPPORT' | 'SYSTEM';
      document_type:
        'LEASE' | 'ID' | 'INVOICE' | 'MOVE_IN_REPORT' | 'MAINTENANCE_PHOTO';
      furnishing: 'unfurnished' | 'semi_furnished' | 'fully_furnished';
      gender: 'male' | 'female';
      gender_preference: 'any' | 'male' | 'female';
      host_status:
        | 'NOT_STARTED'
        | 'ONBOARDING'
        | 'READY'
        | 'ACTIVE'
        | 'PAUSED'
        | 'SUSPENDED';
      invoice_status:
        'DRAFT' | 'ISSUED' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';
      lease_status:
        | 'DRAFT'
        | 'GENERATED'
        | 'ISSUED'
        | 'SIGNED'
        | 'ACTIVE'
        | 'RENEWED'
        | 'EXPIRED'
        | 'TERMINATED';
      ledger_entry_type: 'CHARGE' | 'PAYMENT' | 'ADJUSTMENT' | 'REFUND';
      listing_booking_policy:
        | 'INSTANT_RESERVATION'
        | 'RENTAL_APPLICATION'
        | 'VIEWING_REQUEST'
        | 'CONTACT_HOST';
      listing_status:
        | 'draft'
        | 'ready'
        | 'pending_review'
        | 'published'
        | 'paused'
        | 'archived';
      maintenance_assignee_type: 'HOST' | 'VENDOR' | 'STAFF';
      maintenance_request_status:
        | 'OPEN'
        | 'ASSIGNED'
        | 'IN_PROGRESS'
        | 'WAITING_ON_RESIDENT'
        | 'RESOLVED'
        | 'CLOSED';
      move_in_status:
        'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      occupancy_type: 'private' | 'shared' | 'mixed';
      outbox_status: 'PENDING' | 'PROCESSED' | 'FAILED';
      rental_application_status:
        | 'DRAFT'
        | 'SUBMITTED'
        | 'UNDER_REVIEW'
        | 'APPROVED'
        | 'REJECTED'
        | 'WITHDRAWN'
        | 'EXPIRED';
      reservation_status:
        | 'DRAFT'
        | 'VALIDATING'
        | 'VALIDATED'
        | 'LOCKED'
        | 'PENDING_PAYMENT'
        | 'PAYMENT_AUTHORIZED'
        | 'CONFIRMED'
        | 'FAILED'
        | 'VALIDATION_FAILED'
        | 'PAYMENT_FAILED'
        | 'LOCK_EXPIRED'
        | 'BOOKING_EXPIRED'
        | 'SYSTEM_ERROR'
        | 'CANCELLED'
        | 'REFUNDED';
      resident_notice_type:
        'RENT_REMINDER' | 'MAINTENANCE' | 'INSPECTION' | 'RENEWAL';
      security_deposit_status:
        | 'PENDING'
        | 'COLLECTED'
        | 'HELD'
        | 'REFUNDED'
        | 'PARTIALLY_REFUNDED'
        | 'FORFEITED';
      stay_status:
        | 'upcoming'
        | 'active'
        | 'extended'
        | 'checked_out'
        | 'completed'
        | 'terminated';
      sync_direction: 'import' | 'export' | 'both';
      tenancy_occupancy_status:
        'PENDING_MOVE_IN' | 'OCCUPIED' | 'NOTICE_GIVEN' | 'VACATED';
      user_occupation:
        | 'student'
        | 'working_professional'
        | 'business_owner'
        | 'freelancer'
        | 'job_seeker'
        | 'retired'
        | 'other';
      user_role: 'guest' | 'host' | 'admin';
      viewing_request_status:
        'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
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
      account_type: ['RECEIVABLE', 'LIABILITY'],
      availability_source: [
        'booking',
        'manual_block',
        'external_calendar',
        'maintenance',
      ],
      availability_status: ['available', 'reserved', 'unavailable'],
      billing_period: ['day', 'week', 'month', 'semester', 'year'],
      booking_status: [
        'pending',
        'approved',
        'rejected',
        'cancelled',
        'expired',
      ],
      conversation_status: ['OPEN', 'CLOSED', 'ARCHIVED', 'BLOCKED'],
      conversation_type: ['INQUIRY', 'BOOKING', 'STAY', 'SUPPORT', 'SYSTEM'],
      document_type: [
        'LEASE',
        'ID',
        'INVOICE',
        'MOVE_IN_REPORT',
        'MAINTENANCE_PHOTO',
      ],
      furnishing: ['unfurnished', 'semi_furnished', 'fully_furnished'],
      gender: ['male', 'female'],
      gender_preference: ['any', 'male', 'female'],
      host_status: [
        'NOT_STARTED',
        'ONBOARDING',
        'READY',
        'ACTIVE',
        'PAUSED',
        'SUSPENDED',
      ],
      invoice_status: [
        'DRAFT',
        'ISSUED',
        'PARTIAL',
        'PAID',
        'OVERDUE',
        'CANCELLED',
      ],
      lease_status: [
        'DRAFT',
        'GENERATED',
        'ISSUED',
        'SIGNED',
        'ACTIVE',
        'RENEWED',
        'EXPIRED',
        'TERMINATED',
      ],
      ledger_entry_type: ['CHARGE', 'PAYMENT', 'ADJUSTMENT', 'REFUND'],
      listing_booking_policy: [
        'INSTANT_RESERVATION',
        'RENTAL_APPLICATION',
        'VIEWING_REQUEST',
        'CONTACT_HOST',
      ],
      listing_status: [
        'draft',
        'ready',
        'pending_review',
        'published',
        'paused',
        'archived',
      ],
      maintenance_assignee_type: ['HOST', 'VENDOR', 'STAFF'],
      maintenance_request_status: [
        'OPEN',
        'ASSIGNED',
        'IN_PROGRESS',
        'WAITING_ON_RESIDENT',
        'RESOLVED',
        'CLOSED',
      ],
      move_in_status: [
        'PENDING',
        'SCHEDULED',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED',
      ],
      occupancy_type: ['private', 'shared', 'mixed'],
      outbox_status: ['PENDING', 'PROCESSED', 'FAILED'],
      rental_application_status: [
        'DRAFT',
        'SUBMITTED',
        'UNDER_REVIEW',
        'APPROVED',
        'REJECTED',
        'WITHDRAWN',
        'EXPIRED',
      ],
      reservation_status: [
        'DRAFT',
        'VALIDATING',
        'VALIDATED',
        'LOCKED',
        'PENDING_PAYMENT',
        'PAYMENT_AUTHORIZED',
        'CONFIRMED',
        'FAILED',
        'VALIDATION_FAILED',
        'PAYMENT_FAILED',
        'LOCK_EXPIRED',
        'BOOKING_EXPIRED',
        'SYSTEM_ERROR',
        'CANCELLED',
        'REFUNDED',
      ],
      resident_notice_type: [
        'RENT_REMINDER',
        'MAINTENANCE',
        'INSPECTION',
        'RENEWAL',
      ],
      security_deposit_status: [
        'PENDING',
        'COLLECTED',
        'HELD',
        'REFUNDED',
        'PARTIALLY_REFUNDED',
        'FORFEITED',
      ],
      stay_status: [
        'upcoming',
        'active',
        'extended',
        'checked_out',
        'completed',
        'terminated',
      ],
      sync_direction: ['import', 'export', 'both'],
      tenancy_occupancy_status: [
        'PENDING_MOVE_IN',
        'OCCUPIED',
        'NOTICE_GIVEN',
        'VACATED',
      ],
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
      viewing_request_status: [
        'REQUESTED',
        'CONFIRMED',
        'COMPLETED',
        'CANCELLED',
      ],
    },
  },
} as const;
