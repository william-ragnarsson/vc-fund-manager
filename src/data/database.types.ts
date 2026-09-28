export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          answers: Json
          company_id: string
          contact_email: string | null
          contact_name: string | null
          created_at: string
          decided_at: string | null
          deck_url: string | null
          fund_id: string
          id: string
          origin: string
          received_at: string
          referrer: string | null
          round_stage: string | null
          round_usd: number | null
          source: string
          status: string
          team: string | null
          traction: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          answers?: Json
          company_id: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          decided_at?: string | null
          deck_url?: string | null
          fund_id: string
          id?: string
          origin?: string
          received_at?: string
          referrer?: string | null
          round_stage?: string | null
          round_usd?: number | null
          source?: string
          status?: string
          team?: string | null
          traction?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          answers?: Json
          company_id?: string
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          decided_at?: string | null
          deck_url?: string | null
          fund_id?: string
          id?: string
          origin?: string
          received_at?: string
          referrer?: string | null
          round_stage?: string | null
          round_usd?: number | null
          source?: string
          status?: string
          team?: string | null
          traction?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_fund_id_company_id_fkey"
            columns: ["fund_id", "company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["fund_id", "id"]
          },
          {
            foreignKeyName: "applications_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          created_at: string
          fund_id: string
          key: string
          mode: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          fund_id: string
          key: string
          mode: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          fund_id?: string
          key?: string
          mode?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          about: string | null
          city: string | null
          country: string | null
          created_at: string
          fund_id: string
          id: string
          locked_fields: string[]
          logo_url: string | null
          name: string
          one_liner: string | null
          origin: string
          sector: string | null
          slug: string
          stage: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          about?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          fund_id: string
          id?: string
          locked_fields?: string[]
          logo_url?: string | null
          name: string
          one_liner?: string | null
          origin?: string
          sector?: string | null
          slug: string
          stage?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          about?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          fund_id?: string
          id?: string
          locked_fields?: string[]
          logo_url?: string | null
          name?: string
          one_liner?: string | null
          origin?: string
          sector?: string | null
          slug?: string
          stage?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_members: {
        Row: {
          created_at: string
          fund_id: string
          id: string
          role: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fund_id: string
          id?: string
          role?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fund_id?: string
          id?: string
          role?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fund_members_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      funds: {
        Row: {
          created_at: string
          focus: string | null
          id: string
          is_demo: boolean
          linkedin_followers: number | null
          name: string
          size_usd: number | null
          slug: string
          stats: Json
          tagline: string | null
          timezone: string
          updated_at: string
          vehicle: string | null
          website: string | null
        }
        Insert: {
          created_at?: string
          focus?: string | null
          id?: string
          is_demo?: boolean
          linkedin_followers?: number | null
          name: string
          size_usd?: number | null
          slug: string
          stats?: Json
          tagline?: string | null
          timezone?: string
          updated_at?: string
          vehicle?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string
          focus?: string | null
          id?: string
          is_demo?: boolean
          linkedin_followers?: number | null
          name?: string
          size_usd?: number | null
          slug?: string
          stats?: Json
          tagline?: string | null
          timezone?: string
          updated_at?: string
          vehicle?: string | null
          website?: string | null
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount_usd: number | null
          application_id: string | null
          company_id: string
          created_at: string
          exit_note: string | null
          exit_outcome: string | null
          exited_on: string | null
          fund_id: string
          id: string
          invested_on: string
          round: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_usd?: number | null
          application_id?: string | null
          company_id: string
          created_at?: string
          exit_note?: string | null
          exit_outcome?: string | null
          exited_on?: string | null
          fund_id: string
          id?: string
          invested_on: string
          round: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_usd?: number | null
          application_id?: string | null
          company_id?: string
          created_at?: string
          exit_note?: string | null
          exit_outcome?: string | null
          exited_on?: string | null
          fund_id?: string
          id?: string
          invested_on?: string
          round?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_fund_id_application_id_fkey"
            columns: ["fund_id", "application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["fund_id", "id"]
          },
          {
            foreignKeyName: "investments_fund_id_company_id_fkey"
            columns: ["fund_id", "company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["fund_id", "id"]
          },
          {
            foreignKeyName: "investments_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          application_id: string | null
          company_id: string
          created_at: string
          format: string
          fund_id: string
          id: string
          origin: string
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          company_id: string
          created_at?: string
          format?: string
          fund_id: string
          id?: string
          origin?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          company_id?: string
          created_at?: string
          format?: string
          fund_id?: string
          id?: string
          origin?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meetings_fund_id_application_id_fkey"
            columns: ["fund_id", "application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["fund_id", "id"]
          },
          {
            foreignKeyName: "meetings_fund_id_company_id_fkey"
            columns: ["fund_id", "company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["fund_id", "id"]
          },
          {
            foreignKeyName: "meetings_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          application_id: string | null
          body: string
          company_id: string | null
          created_at: string
          fund_id: string
          id: string
          kind: string
          origin: string
          sent_at: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          application_id?: string | null
          body: string
          company_id?: string | null
          created_at?: string
          fund_id: string
          id?: string
          kind: string
          origin?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string | null
          body?: string
          company_id?: string | null
          created_at?: string
          fund_id?: string
          id?: string
          kind?: string
          origin?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_fund_id_application_id_fkey"
            columns: ["fund_id", "application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["fund_id", "id"]
          },
          {
            foreignKeyName: "messages_fund_id_company_id_fkey"
            columns: ["fund_id", "company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["fund_id", "id"]
          },
          {
            foreignKeyName: "messages_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string
          channels: string[]
          company_id: string | null
          created_at: string
          edited_at: string | null
          fund_id: string
          id: string
          image: Json | null
          origin: string
          published_at: string | null
          published_by: string | null
          signal_id: string | null
          site_entry: Json | null
          site_note: string | null
          stats: Json
          status: string
          tags: string[]
          type: string
          updated_at: string
        }
        Insert: {
          body: string
          channels?: string[]
          company_id?: string | null
          created_at?: string
          edited_at?: string | null
          fund_id: string
          id?: string
          image?: Json | null
          origin?: string
          published_at?: string | null
          published_by?: string | null
          signal_id?: string | null
          site_entry?: Json | null
          site_note?: string | null
          stats?: Json
          status?: string
          tags?: string[]
          type: string
          updated_at?: string
        }
        Update: {
          body?: string
          channels?: string[]
          company_id?: string | null
          created_at?: string
          edited_at?: string | null
          fund_id?: string
          id?: string
          image?: Json | null
          origin?: string
          published_at?: string | null
          published_by?: string | null
          signal_id?: string | null
          site_entry?: Json | null
          site_note?: string | null
          stats?: Json
          status?: string
          tags?: string[]
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_fund_id_company_id_fkey"
            columns: ["fund_id", "company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["fund_id", "id"]
          },
          {
            foreignKeyName: "posts_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_fund_id_signal_id_fkey"
            columns: ["fund_id", "signal_id"]
            isOneToOne: false
            referencedRelation: "signals"
            referencedColumns: ["fund_id", "id"]
          },
        ]
      }
      rubrics: {
        Row: {
          cheque_max_usd: number | null
          cheque_min_usd: number | null
          created_at: string
          criteria: Json
          decline_note: string | null
          focus: Json
          fund_id: string
          id: string
          threshold: number
          version: number
        }
        Insert: {
          cheque_max_usd?: number | null
          cheque_min_usd?: number | null
          created_at?: string
          criteria: Json
          decline_note?: string | null
          focus?: Json
          fund_id: string
          id?: string
          threshold?: number
          version: number
        }
        Update: {
          cheque_max_usd?: number | null
          cheque_min_usd?: number | null
          created_at?: string
          criteria?: Json
          decline_note?: string | null
          focus?: Json
          fund_id?: string
          id?: string
          threshold?: number
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "rubrics_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
      screenings: {
        Row: {
          application_id: string
          created_at: string
          fund_id: string
          id: string
          model: string | null
          origin: string
          risks: string[]
          rubric_id: string | null
          score: number
          scores: Json
          why: string[]
        }
        Insert: {
          application_id: string
          created_at?: string
          fund_id: string
          id?: string
          model?: string | null
          origin?: string
          risks?: string[]
          rubric_id?: string | null
          score: number
          scores?: Json
          why?: string[]
        }
        Update: {
          application_id?: string
          created_at?: string
          fund_id?: string
          id?: string
          model?: string | null
          origin?: string
          risks?: string[]
          rubric_id?: string | null
          score?: number
          scores?: Json
          why?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "screenings_fund_id_application_id_fkey"
            columns: ["fund_id", "application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["fund_id", "id"]
          },
          {
            foreignKeyName: "screenings_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "screenings_fund_id_rubric_id_fkey"
            columns: ["fund_id", "rubric_id"]
            isOneToOne: false
            referencedRelation: "rubrics"
            referencedColumns: ["fund_id", "id"]
          },
        ]
      }
      signals: {
        Row: {
          company_id: string
          created_at: string
          detected_at: string
          dismissed_at: string | null
          external_key: string | null
          fund_id: string
          headline: string | null
          id: string
          note: string | null
          occurred_on: string
          origin: string
          source: string
          text: string
          updated_at: string
          url: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          detected_at?: string
          dismissed_at?: string | null
          external_key?: string | null
          fund_id: string
          headline?: string | null
          id?: string
          note?: string | null
          occurred_on: string
          origin?: string
          source: string
          text: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          detected_at?: string
          dismissed_at?: string | null
          external_key?: string | null
          fund_id?: string
          headline?: string | null
          id?: string
          note?: string | null
          occurred_on?: string
          origin?: string
          source?: string
          text?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signals_fund_id_company_id_fkey"
            columns: ["fund_id", "company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["fund_id", "id"]
          },
          {
            foreignKeyName: "signals_fund_id_fkey"
            columns: ["fund_id"]
            isOneToOne: false
            referencedRelation: "funds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      invest: {
        Args: { p_amount_usd?: number; p_application: string; p_on?: string }
        Returns: string
      }
      invite_to_meeting: {
        Args: { p_application: string; p_format?: string }
        Returns: string
      }
      pass_application: { Args: { p_application: string }; Returns: string }
      reset_demo: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
