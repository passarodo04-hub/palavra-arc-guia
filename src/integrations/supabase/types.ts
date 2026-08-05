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
      bible_chapter_reads: {
        Row: {
          book: string
          chapter: number
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          book: string
          chapter: number
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          book?: string
          chapter?: number
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: []
      }
      favorite_hymns: {
        Row: {
          created_at: string
          hymn_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hymn_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hymn_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      favorite_verses: {
        Row: {
          book: string
          chapter: number
          created_at: string
          id: string
          text: string
          user_id: string
          verse: number
        }
        Insert: {
          book: string
          chapter: number
          created_at?: string
          id?: string
          text: string
          user_id: string
          verse: number
        }
        Update: {
          book?: string
          chapter?: number
          created_at?: string
          id?: string
          text?: string
          user_id?: string
          verse?: number
        }
        Relationships: []
      }
      notes: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bible_translation: string
          created_at: string
          display_name: string | null
          id: string
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bible_translation?: string
          created_at?: string
          display_name?: string | null
          id: string
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bible_translation?: string
          created_at?: string
          display_name?: string | null
          id?: string
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      quiz_answers: {
        Row: {
          answered_at: string
          attempt_id: string | null
          audience: string
          category: string
          chosen: number
          correct_index: number
          difficulty: string
          id: string
          is_correct: boolean
          question_id: string
          user_id: string
        }
        Insert: {
          answered_at?: string
          attempt_id?: string | null
          audience: string
          category: string
          chosen: number
          correct_index: number
          difficulty: string
          id?: string
          is_correct: boolean
          question_id: string
          user_id: string
        }
        Update: {
          answered_at?: string
          attempt_id?: string | null
          audience?: string
          category?: string
          chosen?: number
          correct_index?: number
          difficulty?: string
          id?: string
          is_correct?: boolean
          question_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          audience: string
          category: string
          correct: number
          created_at: string
          difficulty: string
          id: string
          percent: number
          points: number
          quiz_key: string
          total: number
          updated_at: string
          user_id: string
          xp_awarded: number
        }
        Insert: {
          audience: string
          category: string
          correct?: number
          created_at?: string
          difficulty: string
          id?: string
          percent?: number
          points?: number
          quiz_key: string
          total?: number
          updated_at?: string
          user_id: string
          xp_awarded?: number
        }
        Update: {
          audience?: string
          category?: string
          correct?: number
          created_at?: string
          difficulty?: string
          id?: string
          percent?: number
          points?: number
          quiz_key?: string
          total?: number
          updated_at?: string
          user_id?: string
          xp_awarded?: number
        }
        Relationships: []
      }
      quiz_daily_claims: {
        Row: {
          claim_date: string
          claim_key: string
          created_at: string
          id: string
          user_id: string
          xp: number
        }
        Insert: {
          claim_date?: string
          claim_key: string
          created_at?: string
          id?: string
          user_id: string
          xp?: number
        }
        Update: {
          claim_date?: string
          claim_key?: string
          created_at?: string
          id?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      reading_history: {
        Row: {
          book: string
          chapter: number
          id: string
          opened_at: string
          user_id: string
        }
        Insert: {
          book: string
          chapter: number
          id?: string
          opened_at?: string
          user_id: string
        }
        Update: {
          book?: string
          chapter?: number
          id?: string
          opened_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sermons: {
        Row: {
          audience: string | null
          content: Json
          created_at: string
          duration_min: number | null
          favorite: boolean
          id: string
          objective: string | null
          personal_notes: string
          subject: string | null
          theme: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string | null
          content: Json
          created_at?: string
          duration_min?: number | null
          favorite?: boolean
          id?: string
          objective?: string | null
          personal_notes?: string
          subject?: string | null
          theme?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string | null
          content?: Json
          created_at?: string
          duration_min?: number | null
          favorite?: boolean
          id?: string
          objective?: string | null
          personal_notes?: string
          subject?: string | null
          theme?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      walk_events: {
        Row: {
          category: string
          created_at: string
          dedupe_key: string
          detail: string
          event_date: string
          icon: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          dedupe_key: string
          detail?: string
          event_date?: string
          icon?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          dedupe_key?: string
          detail?: string
          event_date?: string
          icon?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      walk_unlocks: {
        Row: {
          created_at: string
          id: string
          kind: string
          unlock_id: string
          unlocked_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          unlock_id: string
          unlocked_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          unlock_id?: string
          unlocked_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
