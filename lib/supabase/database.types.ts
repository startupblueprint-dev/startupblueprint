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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      discovery_sessions: {
        Row: {
          conversation_history: Json
          created_at: string
          id: string
          intro_summary: string
          updated_at: string
        }
        Insert: {
          conversation_history?: Json
          created_at?: string
          id?: string
          intro_summary: string
          updated_at?: string
        }
        Update: {
          conversation_history?: Json
          created_at?: string
          id?: string
          intro_summary?: string
          updated_at?: string
        }
        Relationships: []
      }
      generated_documents: {
        Row: {
          content: string
          created_at: string
          doc_type: string
          id: string
          solution_id: string
        }
        Insert: {
          content: string
          created_at?: string
          doc_type: string
          id?: string
          solution_id: string
        }
        Update: {
          content?: string
          created_at?: string
          doc_type?: string
          id?: string
          solution_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_documents_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_tags: {
        Row: {
          session_id: string
          tag_id: string
        }
        Insert: {
          session_id: string
          tag_id: string
        }
        Update: {
          session_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_tags_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "discovery_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_tags: {
        Row: {
          solution_id: string
          tag_id: string
        }
        Insert: {
          solution_id: string
          tag_id: string
        }
        Update: {
          solution_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_tags_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          business_model_pricing: string | null
          created_at: string
          current_solutions: string | null
          features_base: Json | null
          features_core: Json | null
          go_to_market_plan: string | null
          id: string
          ideal_customer_profile: string | null
          is_selected: boolean
          pain: string | null
          position: number
          selected_at: string | null
          session_id: string
          solution_description: string | null
          summary: string | null
          ten_x_opportunity: string | null
          title: string
          updated_at: string
        }
        Insert: {
          business_model_pricing?: string | null
          created_at?: string
          current_solutions?: string | null
          features_base?: Json | null
          features_core?: Json | null
          go_to_market_plan?: string | null
          id?: string
          ideal_customer_profile?: string | null
          is_selected?: boolean
          pain?: string | null
          position: number
          selected_at?: string | null
          session_id: string
          solution_description?: string | null
          summary?: string | null
          ten_x_opportunity?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          business_model_pricing?: string | null
          created_at?: string
          current_solutions?: string | null
          features_base?: Json | null
          features_core?: Json | null
          go_to_market_plan?: string | null
          id?: string
          ideal_customer_profile?: string | null
          is_selected?: boolean
          pain?: string | null
          position?: number
          selected_at?: string | null
          session_id?: string
          solution_description?: string | null
          summary?: string | null
          ten_x_opportunity?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solutions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "discovery_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          tag_type: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tag_type: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tag_type?: string
          usage_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_sessions_by_tag: {
        Args: { search_tag: string }
        Returns: {
          created_at: string
          intro_summary: string
          matching_tags: string[]
          session_id: string
        }[]
      }
      search_solutions_by_tag: {
        Args: { search_tag: string }
        Returns: {
          created_at: string
          is_selected: boolean
          matching_tags: string[]
          session_id: string
          solution_id: string
          summary: string
          title: string
        }[]
      }
      upsert_tag: {
        Args: { tag_name: string; tag_type_param: string }
        Returns: string
      }
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
