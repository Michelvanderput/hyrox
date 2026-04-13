export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          avatar_url: string | null;
          gender: "male" | "female" | "other" | null;
          fitness_level: "beginner" | "intermediate" | "advanced" | null;
          run_level: number | null;
          strength_level: number | null;
          onboarding_completed: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          name?: string;
          email?: string | null;
          avatar_url?: string | null;
          gender?: "male" | "female" | "other" | null;
          fitness_level?: "beginner" | "intermediate" | "advanced" | null;
          run_level?: number | null;
          strength_level?: number | null;
          onboarding_completed?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string | null;
          race_date: string;
          race_location: string | null;
          division: string | null;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          race_date?: string;
          race_location?: string | null;
          division?: string | null;
          invite_code?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
        Relationships: [];
      };
      team_members: {
        Row: {
          team_id: string;
          user_id: string;
          color: string | null;
          motivation_note: string | null;
        };
        Insert: {
          team_id: string;
          user_id: string;
          color?: string | null;
          motivation_note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["team_members"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      completions: {
        Row: {
          id: string;
          user_id: string;
          team_id: string;
          week_number: number;
          day_index: number;
          completed: boolean | null;
          completed_at: string | null;
          notes: string | null;
          rating: number | null;
          actual_duration_min: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id: string;
          week_number: number;
          day_index: number;
          completed?: boolean | null;
          completed_at?: string | null;
          notes?: string | null;
          rating?: number | null;
          actual_duration_min?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["completions"]["Insert"]>;
        Relationships: [];
      };
      personal_records: {
        Row: {
          id: string;
          user_id: string;
          station_id: string;
          value: string;
          recorded_at: string | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          station_id: string;
          value: string;
          recorded_at?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["personal_records"]["Insert"]>;
        Relationships: [];
      };
      metrics: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: string | null;
          resting_hr: number | null;
          sleep_hours: string | null;
          energy_level: number | null;
          recorded_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight_kg?: string | null;
          resting_hr?: number | null;
          sleep_hours?: string | null;
          energy_level?: number | null;
          recorded_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["metrics"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      team_preview_by_code: {
        Args: { p_code: string };
        Returns: {
          team_id: string;
          team_name: string;
          race_date: string;
          race_location: string;
          division: string;
        }[];
      };
      join_team_by_code: {
        Args: { p_code: string };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
