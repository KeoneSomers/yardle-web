export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          body: string | null;
          created_at: string;
          id: number;
          yard_id: number;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: number;
          yard_id: number;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: number;
          yard_id?: number;
        };
        Relationships: [];
      };
      calendar_event_types: {
        Row: {
          id: number;
          type: string;
        };
        Insert: {
          id?: number;
          type: string;
        };
        Update: {
          id?: number;
          type?: string;
        };
        Relationships: [];
      };
      calendar_events: {
        Row: {
          all_day: boolean;
          created_at: string | null;
          created_by: string | null;
          date_time: string | null;
          id: number;
          notes: string | null;
          title: string;
          type: number;
          yard_id: number;
        };
        Insert: {
          all_day?: boolean;
          created_at?: string | null;
          created_by?: string | null;
          date_time?: string | null;
          id?: number;
          notes?: string | null;
          title: string;
          type: number;
          yard_id: number;
        };
        Update: {
          all_day?: boolean;
          created_at?: string | null;
          created_by?: string | null;
          date_time?: string | null;
          id?: number;
          notes?: string | null;
          title?: string;
          type?: number;
          yard_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_events_type_fkey";
            columns: ["type"];
            isOneToOne: false;
            referencedRelation: "calendar_event_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_events_yard_id_fkey";
            columns: ["yard_id"];
            isOneToOne: false;
            referencedRelation: "yards";
            referencedColumns: ["id"];
          },
        ];
      };
      calendar_events_horses: {
        Row: {
          calendar_event_id: number;
          horse_id: number;
        };
        Insert: {
          calendar_event_id?: number;
          horse_id: number;
        };
        Update: {
          calendar_event_id?: number;
          horse_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "calendar_events_horses_calendar_event_id_fkey";
            columns: ["calendar_event_id"];
            isOneToOne: false;
            referencedRelation: "calendar_events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "calendar_events_horses_horse_id_fkey";
            columns: ["horse_id"];
            isOneToOne: false;
            referencedRelation: "horses";
            referencedColumns: ["id"];
          },
        ];
      };
      feedback: {
        Row: {
          created_at: string | null;
          id: number;
          message: string | null;
          route: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          message?: string | null;
          route?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          message?: string | null;
          route?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      feeds: {
        Row: {
          condition: string | null;
          created_at: string | null;
          created_by: string;
          horse_id: number;
          id: number;
          instructions: string | null;
          yard_id: number | null;
        };
        Insert: {
          condition?: string | null;
          created_at?: string | null;
          created_by: string;
          horse_id: number;
          id?: number;
          instructions?: string | null;
          yard_id?: number | null;
        };
        Update: {
          condition?: string | null;
          created_at?: string | null;
          created_by?: string;
          horse_id?: number;
          id?: number;
          instructions?: string | null;
          yard_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "feeds_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feeds_horse_id_fkey";
            columns: ["horse_id"];
            isOneToOne: false;
            referencedRelation: "horses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feeds_yard_id_fkey";
            columns: ["yard_id"];
            isOneToOne: false;
            referencedRelation: "yards";
            referencedColumns: ["id"];
          },
        ];
      };
      field_rotation_horses: {
        Row: {
          field_id: number | null;
          horse_id: number;
          rotation_id: number;
        };
        Insert: {
          field_id?: number | null;
          horse_id: number;
          rotation_id: number;
        };
        Update: {
          field_id?: number | null;
          horse_id?: number;
          rotation_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "field_rotation_horses_field_id_fkey";
            columns: ["field_id"];
            isOneToOne: false;
            referencedRelation: "fields";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "field_rotation_horses_horse_id_fkey";
            columns: ["horse_id"];
            isOneToOne: false;
            referencedRelation: "horses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "field_rotation_horses_rotation_id_fkey";
            columns: ["rotation_id"];
            isOneToOne: false;
            referencedRelation: "field_rotations";
            referencedColumns: ["id"];
          },
        ];
      };
      field_rotations: {
        Row: {
          created_at: string | null;
          id: number;
          name: string | null;
          yard_id: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          name?: string | null;
          yard_id?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          name?: string | null;
          yard_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "field_rotations_yard_id_fkey";
            columns: ["yard_id"];
            isOneToOne: false;
            referencedRelation: "yards";
            referencedColumns: ["id"];
          },
        ];
      };
      fields: {
        Row: {
          created_at: string | null;
          id: number;
          name: string;
          yard_id: number | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          name: string;
          yard_id?: number | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          name?: string;
          yard_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "fields_yard_id_fkey";
            columns: ["yard_id"];
            isOneToOne: false;
            referencedRelation: "yards";
            referencedColumns: ["id"];
          },
        ];
      };
      horses: {
        Row: {
          about: string | null;
          avatar_background: string | null;
          avatar_url: string | null;
          breed: string | null;
          color_markings: string | null;
          created_at: string | null;
          created_by: string;
          dob: string | null;
          id: number;
          name: string | null;
          owner: string | null;
          updated_at: string | null;
          updated_by: string | null;
          yard_id: number;
        };
        Insert: {
          about?: string | null;
          avatar_background?: string | null;
          avatar_url?: string | null;
          breed?: string | null;
          color_markings?: string | null;
          created_at?: string | null;
          created_by: string;
          dob?: string | null;
          id?: number;
          name?: string | null;
          owner?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          yard_id: number;
        };
        Update: {
          about?: string | null;
          avatar_background?: string | null;
          avatar_url?: string | null;
          breed?: string | null;
          color_markings?: string | null;
          created_at?: string | null;
          created_by?: string;
          dob?: string | null;
          id?: number;
          name?: string | null;
          owner?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          yard_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "horses_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "horses_owner_fkey";
            columns: ["owner"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "horses_updated_by_fkey";
            columns: ["updated_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "horses_yard_id_fkey";
            columns: ["yard_id"];
            isOneToOne: false;
            referencedRelation: "yards";
            referencedColumns: ["id"];
          },
        ];
      };
      ingredients: {
        Row: {
          created_at: string | null;
          feed_id: number | null;
          horse_id: number | null;
          id: number;
          metric: string | null;
          name: string | null;
          quantity: number | null;
          type: number | null;
        };
        Insert: {
          created_at?: string | null;
          feed_id?: number | null;
          horse_id?: number | null;
          id?: number;
          metric?: string | null;
          name?: string | null;
          quantity?: number | null;
          type?: number | null;
        };
        Update: {
          created_at?: string | null;
          feed_id?: number | null;
          horse_id?: number | null;
          id?: number;
          metric?: string | null;
          name?: string | null;
          quantity?: number | null;
          type?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "ingredients_feed_id_fkey";
            columns: ["feed_id"];
            isOneToOne: false;
            referencedRelation: "feeds";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ingredients_horse_id_fkey";
            columns: ["horse_id"];
            isOneToOne: false;
            referencedRelation: "horses";
            referencedColumns: ["id"];
          },
        ];
      };
      invoice_items: {
        Row: {
          accepted: boolean;
          booked_late: boolean;
          canceled_at: string | null;
          canceled_by: string | null;
          created_at: string | null;
          created_by: string | null;
          date: string | null;
          horse_id: number | null;
          horse_name: string | null;
          id: number;
          invoice_id: number | null;
          service_id: number | null;
          service_name: string | null;
          service_price: number | null;
          status: string;
          status_note: string | null;
        };
        Insert: {
          accepted?: boolean;
          booked_late?: boolean;
          canceled_at?: string | null;
          canceled_by?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date?: string | null;
          horse_id?: number | null;
          horse_name?: string | null;
          id?: number;
          invoice_id?: number | null;
          service_id?: number | null;
          service_name?: string | null;
          service_price?: number | null;
          status?: string;
          status_note?: string | null;
        };
        Update: {
          accepted?: boolean;
          booked_late?: boolean;
          canceled_at?: string | null;
          canceled_by?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date?: string | null;
          horse_id?: number | null;
          horse_name?: string | null;
          id?: number;
          invoice_id?: number | null;
          service_id?: number | null;
          service_name?: string | null;
          service_price?: number | null;
          status?: string;
          status_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "invoice_items_canceled_by_fkey";
            columns: ["canceled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoice_items_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
        ];
      };
      invoices: {
        Row: {
          base_rate: number;
          client_email: string | null;
          client_first_name: string | null;
          client_id: string | null;
          client_last_name: string | null;
          created_at: string | null;
          discount: number | null;
          discount_note: string | null;
          end_date: string | null;
          id: number;
          number_of_days_due: number | null;
          paid: boolean;
          published: boolean;
          start_date: string | null;
          vat: number;
          vat_number: string | null;
          yard_id: number | null;
        };
        Insert: {
          base_rate?: number;
          client_email?: string | null;
          client_first_name?: string | null;
          client_id?: string | null;
          client_last_name?: string | null;
          created_at?: string | null;
          discount?: number | null;
          discount_note?: string | null;
          end_date?: string | null;
          id?: number;
          number_of_days_due?: number | null;
          paid?: boolean;
          published?: boolean;
          start_date?: string | null;
          vat?: number;
          vat_number?: string | null;
          yard_id?: number | null;
        };
        Update: {
          base_rate?: number;
          client_email?: string | null;
          client_first_name?: string | null;
          client_id?: string | null;
          client_last_name?: string | null;
          created_at?: string | null;
          discount?: number | null;
          discount_note?: string | null;
          end_date?: string | null;
          id?: number;
          number_of_days_due?: number | null;
          paid?: boolean;
          published?: boolean;
          start_date?: string | null;
          vat?: number;
          vat_number?: string | null;
          yard_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_yard_id_fkey";
            columns: ["yard_id"];
            isOneToOne: false;
            referencedRelation: "yards";
            referencedColumns: ["id"];
          },
        ];
      };
      livery_services: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: number;
          name: string | null;
          price: number | null;
          yard_id: number | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: number;
          name?: string | null;
          price?: number | null;
          yard_id?: number | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: number;
          name?: string | null;
          price?: number | null;
          yard_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "livery_services_yard_id_fkey";
            columns: ["yard_id"];
            isOneToOne: false;
            referencedRelation: "yards";
            referencedColumns: ["id"];
          },
        ];
      };
      medications: {
        Row: {
          created_at: string | null;
          created_by: string;
          horse_id: number;
          id: number;
          instructions: string | null;
          name: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by: string;
          horse_id: number;
          id?: number;
          instructions?: string | null;
          name?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          horse_id?: number;
          id?: number;
          instructions?: string | null;
          name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "medications_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "medications_horse_id_fkey";
            columns: ["horse_id"];
            isOneToOne: false;
            referencedRelation: "horses";
            referencedColumns: ["id"];
          },
        ];
      };
      member_roles: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          active_role: number | null;
          allow_emails: boolean;
          avatar_url: string | null;
          calendar_event_reminder_emails: boolean;
          created_at: string;
          email: string | null;
          first_name: string | null;
          id: string;
          is_early_adopter: boolean;
          last_name: string | null;
          selected_yard: number | null;
          service_request_emails: boolean;
          service_request_response_emails: boolean;
          updated_at: string | null;
        };
        Insert: {
          active_role?: number | null;
          allow_emails?: boolean;
          avatar_url?: string | null;
          calendar_event_reminder_emails?: boolean;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id: string;
          is_early_adopter?: boolean;
          last_name?: string | null;
          selected_yard?: number | null;
          service_request_emails?: boolean;
          service_request_response_emails?: boolean;
          updated_at?: string | null;
        };
        Update: {
          active_role?: number | null;
          allow_emails?: boolean;
          avatar_url?: string | null;
          calendar_event_reminder_emails?: boolean;
          created_at?: string;
          email?: string | null;
          first_name?: string | null;
          id?: string;
          is_early_adopter?: boolean;
          last_name?: string | null;
          selected_yard?: number | null;
          service_request_emails?: boolean;
          service_request_response_emails?: boolean;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_selected_yard_fkey";
            columns: ["selected_yard"];
            isOneToOne: false;
            referencedRelation: "yards";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles_yards: {
        Row: {
          is_banned: boolean;
          profile_id: string;
          role: number;
          yard_id: number;
        };
        Insert: {
          is_banned?: boolean;
          profile_id: string;
          role?: number;
          yard_id: number;
        };
        Update: {
          is_banned?: boolean;
          profile_id?: string;
          role?: number;
          yard_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_yards_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_yards_role_fkey";
            columns: ["role"];
            isOneToOne: false;
            referencedRelation: "member_roles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_yards_yard_id_fkey";
            columns: ["yard_id"];
            isOneToOne: false;
            referencedRelation: "yards";
            referencedColumns: ["id"];
          },
        ];
      };
      regions: {
        Row: {
          currency_iso_code: string;
          flag_icon: string | null;
          id: number;
          locale_code: string;
          name: string;
        };
        Insert: {
          currency_iso_code: string;
          flag_icon?: string | null;
          id?: number;
          locale_code: string;
          name: string;
        };
        Update: {
          currency_iso_code?: string;
          flag_icon?: string | null;
          id?: number;
          locale_code?: string;
          name?: string;
        };
        Relationships: [];
      };
      rugs: {
        Row: {
          created_at: string | null;
          created_by: string;
          description: string | null;
          horse_id: number;
          id: number;
          type: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by: string;
          description?: string | null;
          horse_id: number;
          id?: number;
          type?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string;
          description?: string | null;
          horse_id?: number;
          id?: number;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "rugs_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "rugs_horse_id_fkey";
            columns: ["horse_id"];
            isOneToOne: false;
            referencedRelation: "horses";
            referencedColumns: ["id"];
          },
        ];
      };
      service_requests: {
        Row: {
          accepted: boolean;
          booked_late: boolean;
          canceled_at: string | null;
          canceled_by: string | null;
          created_at: string | null;
          created_by: string | null;
          date: string | null;
          horse_id: number | null;
          id: number;
          invoice_id: number | null;
          notes: string | null;
          service_id: number | null;
          service_name: string | null;
          service_price: number | null;
          status: string;
          status_note: string | null;
        };
        Insert: {
          accepted?: boolean;
          booked_late?: boolean;
          canceled_at?: string | null;
          canceled_by?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date?: string | null;
          horse_id?: number | null;
          id?: number;
          invoice_id?: number | null;
          notes?: string | null;
          service_id?: number | null;
          service_name?: string | null;
          service_price?: number | null;
          status?: string;
          status_note?: string | null;
        };
        Update: {
          accepted?: boolean;
          booked_late?: boolean;
          canceled_at?: string | null;
          canceled_by?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          date?: string | null;
          horse_id?: number | null;
          id?: number;
          invoice_id?: number | null;
          notes?: string | null;
          service_id?: number | null;
          service_name?: string | null;
          service_price?: number | null;
          status?: string;
          status_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "service_requests_canceled_by_fkey";
            columns: ["canceled_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_horse_id_fkey";
            columns: ["horse_id"];
            isOneToOne: false;
            referencedRelation: "horses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "service_requests_service_id_fkey";
            columns: ["service_id"];
            isOneToOne: false;
            referencedRelation: "livery_services";
            referencedColumns: ["id"];
          },
        ];
      };
      yard_billing_cycles: {
        Row: {
          created_at: string | null;
          day: number | null;
          every: number | null;
          id: number;
          on_the: number | null;
          period: number | null;
          starting_from: string | null;
          yard_id: number | null;
        };
        Insert: {
          created_at?: string | null;
          day?: number | null;
          every?: number | null;
          id?: number;
          on_the?: number | null;
          period?: number | null;
          starting_from?: string | null;
          yard_id?: number | null;
        };
        Update: {
          created_at?: string | null;
          day?: number | null;
          every?: number | null;
          id?: number;
          on_the?: number | null;
          period?: number | null;
          starting_from?: string | null;
          yard_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "yard_billing_cycles_yard_id_fkey";
            columns: ["yard_id"];
            isOneToOne: false;
            referencedRelation: "yards";
            referencedColumns: ["id"];
          },
        ];
      };
      yards: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          enabled_billing_late_booking_fee: boolean;
          id: number;
          invite_code: string;
          name: string;
          region_id: number;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          enabled_billing_late_booking_fee?: boolean;
          id?: number;
          invite_code?: string;
          name: string;
          region_id?: number;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          enabled_billing_late_booking_fee?: boolean;
          id?: number;
          invite_code?: string;
          name?: string;
          region_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "yards_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "yards_region_id_fkey";
            columns: ["region_id"];
            isOneToOne: false;
            referencedRelation: "regions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      install_available_extensions_and_test: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
