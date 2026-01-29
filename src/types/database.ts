export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      schema_requests: {
        Row: {
          id: string
          builder_name: string
          house_type: string
          development_name: string | null
          postcode: string | null
          user_email: string | null
          additional_info: string | null
          status: 'pending' | 'in_progress' | 'completed' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          builder_name: string
          house_type: string
          development_name?: string | null
          postcode?: string | null
          user_email?: string | null
          additional_info?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          builder_name?: string
          house_type?: string
          development_name?: string | null
          postcode?: string | null
          user_email?: string | null
          additional_info?: string | null
          status?: 'pending' | 'in_progress' | 'completed' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      schema_problem_reports: {
        Row: {
          id: string
          schema_id: string | null
          builder_name: string
          house_type: string
          problem_description: string
          user_email: string | null
          status: 'open' | 'investigating' | 'resolved' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          schema_id?: string | null
          builder_name: string
          house_type: string
          problem_description: string
          user_email?: string | null
          status?: 'open' | 'investigating' | 'resolved' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          schema_id?: string | null
          builder_name?: string
          house_type?: string
          problem_description?: string
          user_email?: string | null
          status?: 'open' | 'investigating' | 'resolved' | 'closed'
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          event_type: string
          event_data: Json
          user_id: string | null
          session_id: string | null
          page_url: string | null
          referrer: string | null
          user_agent: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_type: string
          event_data?: Json
          user_id?: string | null
          session_id?: string | null
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_type?: string
          event_data?: Json
          user_id?: string | null
          session_id?: string | null
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
        }
      }
      mailing_list: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          postcode: string | null
          builder_name: string | null
          house_type: string | null
          development_name: string | null
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          postcode?: string | null
          builder_name?: string | null
          house_type?: string | null
          development_name?: string | null
          source?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          postcode?: string | null
          builder_name?: string | null
          house_type?: string | null
          development_name?: string | null
          source?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type SchemaRequest = Database['public']['Tables']['schema_requests']['Row']
export type SchemaRequestInsert = Database['public']['Tables']['schema_requests']['Insert']
export type SchemaRequestUpdate = Database['public']['Tables']['schema_requests']['Update']

export type SchemaProblemReport = Database['public']['Tables']['schema_problem_reports']['Row']
export type SchemaProblemReportInsert = Database['public']['Tables']['schema_problem_reports']['Insert']
export type SchemaProblemReportUpdate = Database['public']['Tables']['schema_problem_reports']['Update']

export type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row']
export type AnalyticsEventInsert = Database['public']['Tables']['analytics_events']['Insert']
export type AnalyticsEventUpdate = Database['public']['Tables']['analytics_events']['Update']

export type MailingListEntry = Database['public']['Tables']['mailing_list']['Row']
export type MailingListInsert = Database['public']['Tables']['mailing_list']['Insert']
export type MailingListUpdate = Database['public']['Tables']['mailing_list']['Update']
