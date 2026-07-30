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
      amenities: {
        Row: {
          created_at: string;
          icon: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
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
          available_from: string;
          available_units: number;
          created_at: string;
          id: string;
          listing_id: string;
          status: Database['public']['Enums']['availability_status'];
          updated_at: string;
        };
        Insert: {
          available_from: string;
          available_units?: number;
          created_at?: string;
          id?: string;
          listing_id: string;
          status?: Database['public']['Enums']['availability_status'];
          updated_at?: string;
        };
        Update: {
          available_from?: string;
          available_units?: number;
          created_at?: string;
          id?: string;
          listing_id?: string;
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
      listing_images: {
        Row: {
          created_at: string;
          display_order: number;
          id: string;
          listing_id: string;
          storage_path: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_order?: number;
          id?: string;
          listing_id: string;
          storage_path: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_order?: number;
          id?: string;
          listing_id?: string;
          storage_path?: string;
          updated_at?: string;
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
      listing_types: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      listings: {
        Row: {
          city: string | null;
          country: string | null;
          country_code: string | null;
          created_at: string;
          description: string | null;
          formatted_address: string | null;
          host_id: string;
          id: string;
          latitude: number | null;
          locality: string | null;
          longitude: number | null;
          max_occupants: number;
          postal_code: string | null;
          property_type: string;
          public_id: string;
          state: string | null;
          status: Database['public']['Enums']['listing_status'];
          title: string;
          type_id: string;
          updated_at: string;
        };
        Insert: {
          city?: string | null;
          country?: string | null;
          country_code?: string | null;
          created_at?: string;
          description?: string | null;
          formatted_address?: string | null;
          host_id: string;
          id?: string;
          latitude?: number | null;
          locality?: string | null;
          longitude?: number | null;
          max_occupants?: number;
          postal_code?: string | null;
          property_type?: string;
          public_id?: string;
          state?: string | null;
          status?: Database['public']['Enums']['listing_status'];
          title: string;
          type_id: string;
          updated_at?: string;
        };
        Update: {
          city?: string | null;
          country?: string | null;
          country_code?: string | null;
          created_at?: string;
          description?: string | null;
          formatted_address?: string | null;
          host_id?: string;
          id?: string;
          latitude?: number | null;
          locality?: string | null;
          longitude?: number | null;
          max_occupants?: number;
          postal_code?: string | null;
          property_type?: string;
          public_id?: string;
          state?: string | null;
          status?: Database['public']['Enums']['listing_status'];
          title?: string;
          type_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'listings_host_id_fkey';
            columns: ['host_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'listings_type_id_fkey';
            columns: ['type_id'];
            isOneToOne: false;
            referencedRelation: 'listing_types';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          role: Database['public']['Enums']['user_role'];
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          role?: Database['public']['Enums']['user_role'];
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
            isOneToOne: true;
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_public_id: { Args: never; Returns: string };
      get_listing_detail: { Args: { p_public_id: string }; Returns: Json };
      is_admin: { Args: never; Returns: boolean };
      is_host: { Args: never; Returns: boolean };
      is_listing_owner: { Args: { listing_id: string }; Returns: boolean };
    };
    Enums: {
      availability_status: 'available' | 'occupied' | 'unavailable';
      billing_period: 'day' | 'week' | 'month' | 'semester' | 'year';
      booking_status:
        'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired';
      listing_status:
        'draft' | 'pending_review' | 'published' | 'paused' | 'archived';
      stay_status:
        'upcoming' | 'active' | 'extended' | 'completed' | 'terminated';
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
      availability_status: ['available', 'occupied', 'unavailable'],
      billing_period: ['day', 'week', 'month', 'semester', 'year'],
      booking_status: [
        'pending',
        'approved',
        'rejected',
        'cancelled',
        'expired',
      ],
      listing_status: [
        'draft',
        'pending_review',
        'published',
        'paused',
        'archived',
      ],
      stay_status: [
        'upcoming',
        'active',
        'extended',
        'completed',
        'terminated',
      ],
      user_role: ['guest', 'host', 'admin'],
    },
  },
} as const;
