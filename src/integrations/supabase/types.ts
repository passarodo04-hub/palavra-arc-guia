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
      calendar_event_completions: {
        Row: {
          completed_at: string
          event_id: string
          id: string
          occurrence_date: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          event_id: string
          id?: string
          occurrence_date: string
          user_id: string
        }
        Update: {
          completed_at?: string
          event_id?: string
          id?: string
          occurrence_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_event_completions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          all_day: boolean
          category: string
          created_at: string
          description: string
          event_date: string
          event_time: string | null
          id: string
          notes: string
          recurrence: string
          reminder_minutes: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean
          category?: string
          created_at?: string
          description?: string
          event_date: string
          event_time?: string | null
          id?: string
          notes?: string
          recurrence?: string
          reminder_minutes?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          all_day?: boolean
          category?: string
          created_at?: string
          description?: string
          event_date?: string
          event_time?: string | null
          id?: string
          notes?: string
          recurrence?: string
          reminder_minutes?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          invite_active: boolean
          invite_code: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          invite_active?: boolean
          invite_code: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          invite_active?: boolean
          invite_code?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_activities: {
        Row: {
          community_id: string
          created_at: string
          created_by: string
          description: string
          id: string
          kind: string
          scheduled_date: string
          scheduled_time: string | null
          title: string
          updated_at: string
        }
        Insert: {
          community_id: string
          created_at?: string
          created_by: string
          description?: string
          id?: string
          kind?: string
          scheduled_date: string
          scheduled_time?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          community_id?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          kind?: string
          scheduled_date?: string
          scheduled_time?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_activities_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_activity_participants: {
        Row: {
          activity_id: string
          community_id: string
          completed_at: string | null
          created_at: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_id: string
          community_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_id?: string
          community_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_activity_participants_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "community_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_activity_participants_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          badges: number
          community_id: string
          display_name: string
          id: string
          joined_at: string
          journeys_completed: number
          level: number
          role: string
          streak: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          badges?: number
          community_id: string
          display_name?: string
          id?: string
          joined_at?: string
          journeys_completed?: number
          level?: number
          role?: string
          streak?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          badges?: number
          community_id?: string
          display_name?: string
          id?: string
          joined_at?: string
          journeys_completed?: number
          level?: number
          role?: string
          streak?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          author_name: string
          community_id: string
          content: string
          created_at: string
          id: string
          kind: string
          reference: string
          user_id: string
        }
        Insert: {
          author_name?: string
          community_id: string
          content: string
          created_at?: string
          id?: string
          kind?: string
          reference?: string
          user_id: string
        }
        Update: {
          author_name?: string
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          kind?: string
          reference?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
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
      mentor_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentor_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          refs: Json
          role: string
          user_id: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          refs?: Json
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          refs?: Json
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "mentor_conversations"
            referencedColumns: ["id"]
          },
        ]
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
          birth_date: string | null
          created_at: string
          display_name: string | null
          id: string
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bible_translation?: string
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bible_translation?: string
          birth_date?: string | null
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
