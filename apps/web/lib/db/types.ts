import type { ArtifactMode, PlanState } from '@zili/shared-types';

/**
 * Typed schema for the public Postgres schema. Hand-maintained to match the
 * migrations in supabase/migrations/. When the schema grows, regenerate with
 * `supabase gen types typescript` and reconcile against this file.
 *
 * Timestamps are ISO strings (PostgREST serializes timestamptz as text).
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          plan_state: PlanState;
          signup_at: string;
          grandfather_eligible_until: string | null;
          suspended_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          plan_state?: PlanState;
          signup_at?: string;
          grandfather_eligible_until?: string | null;
          suspended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          plan_state?: PlanState;
          signup_at?: string;
          grandfather_eligible_until?: string | null;
          suspended_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      artifacts: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          r2_key: string;
          slide_count: number | null;
          mode: ArtifactMode | null;
          mode_override: ArtifactMode | null;
          size_bytes: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          r2_key: string;
          slide_count?: number | null;
          mode?: ArtifactMode | null;
          mode_override?: ArtifactMode | null;
          size_bytes?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          r2_key?: string;
          slide_count?: number | null;
          mode?: ArtifactMode | null;
          mode_override?: ArtifactMode | null;
          size_bytes?: number | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'artifacts_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      plan_state: PlanState;
      artifact_mode: ArtifactMode;
    };
    CompositeTypes: Record<string, never>;
  };
};
