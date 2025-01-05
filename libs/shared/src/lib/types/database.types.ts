// generated by supabase

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Problem = Tables<'problems'>;
export type Solution = Tables<'solutions'>;
export type Submission = Tables<'submissions'>;
export type Testcase = Tables<'testcases'>;
export type Profile = Tables<'profiles'>;

export type Database = {
  public: {
    Tables: {
      problems: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          launch_date: string;
          slug: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          launch_date: string;
          slug: string;
          title: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          launch_date?: string;
          slug?: string;
          title?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          id: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          username?: string;
        };
        Relationships: [];
      };
      submissions: {
        Row: {
          code: string;
          created_at: string;
          id: string;
          language: string;
          memory_used: number | null;
          problem_id: string;
          status: string;
          time_used_ms: number | null;
          user_id: string;
          submitted_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: string;
          language: string;
          memory_used?: number | null;
          problem_id: string;
          status?: string;
          time_used_ms?: number | null;
          user_id: string;
          submitted_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: string;
          language?: string;
          memory_used?: number | null;
          problem_id?: string;
          status?: string;
          time_used_ms?: number | null;
          user_id?: string;
          submitted_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'submissions_problem_id_fkey';
            columns: ['problem_id'];
            isOneToOne: false;
            referencedRelation: 'problems';
            referencedColumns: ['id'];
          },
        ];
      };
      testcases: {
        Row: {
          created_at: string;
          expected: string | null;
          id: string;
          input: string | null;
          problem_id: string;
        };
        Insert: {
          created_at?: string;
          expected?: string | null;
          id?: string;
          input?: string | null;
          problem_id: string;
        };
        Update: {
          created_at?: string;
          expected?: string | null;
          id?: string;
          input?: string | null;
          problem_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'testcases_problem_id_fkey';
            columns: ['problem_id'];
            isOneToOne: false;
            referencedRelation: 'problems';
            referencedColumns: ['id'];
          },
        ];
      };
      solutions: {
        Row: {
          created_at: string;
          id: string;
          problem_id: string;
          solution: string;
          explanation: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          problem_id: string;
          solution: string;
          explanation: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          problem_id?: string;
          solution?: string;
          explanation?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'solutions_problem_id_fkey';
            columns: ['problem_id'];
            isOneToOne: true;
            referencedRelation: 'problems';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
  ? PublicSchema['Enums'][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
  ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;
