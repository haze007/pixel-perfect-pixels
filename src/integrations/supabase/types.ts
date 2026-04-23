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
      calibrations: {
        Row: {
          chemical_id: string
          concentration: number | null
          created_at: string
          id: string
          measured_lab_a: number
          measured_lab_b: number
          measured_lab_l: number
          notes: string | null
          substrate_id: string | null
          tannery_id: string
        }
        Insert: {
          chemical_id: string
          concentration?: number | null
          created_at?: string
          id?: string
          measured_lab_a: number
          measured_lab_b: number
          measured_lab_l: number
          notes?: string | null
          substrate_id?: string | null
          tannery_id: string
        }
        Update: {
          chemical_id?: string
          concentration?: number | null
          created_at?: string
          id?: string
          measured_lab_a?: number
          measured_lab_b?: number
          measured_lab_l?: number
          notes?: string | null
          substrate_id?: string | null
          tannery_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calibrations_chemical_id_fkey"
            columns: ["chemical_id"]
            isOneToOne: false
            referencedRelation: "chemicals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calibrations_substrate_id_fkey"
            columns: ["substrate_id"]
            isOneToOne: false
            referencedRelation: "substrates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calibrations_tannery_id_fkey"
            columns: ["tannery_id"]
            isOneToOne: false
            referencedRelation: "tanneries"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogue_imports: {
        Row: {
          created_at: string
          errors: Json | null
          file_name: string
          id: string
          row_count: number | null
          status: string | null
          tannery_id: string
        }
        Insert: {
          created_at?: string
          errors?: Json | null
          file_name: string
          id?: string
          row_count?: number | null
          status?: string | null
          tannery_id: string
        }
        Update: {
          created_at?: string
          errors?: Json | null
          file_name?: string
          id?: string
          row_count?: number | null
          status?: string | null
          tannery_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_imports_tannery_id_fkey"
            columns: ["tannery_id"]
            isOneToOne: false
            referencedRelation: "tanneries"
            referencedColumns: ["id"]
          },
        ]
      }
      chemicals: {
        Row: {
          category: Database["public"]["Enums"]["chemical_category"]
          colour_index: string | null
          created_at: string
          id: string
          is_community: boolean | null
          lab_a: number | null
          lab_b: number | null
          lab_l: number | null
          name: string
          properties: Json | null
          supplier: string | null
          tannery_id: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["chemical_category"]
          colour_index?: string | null
          created_at?: string
          id?: string
          is_community?: boolean | null
          lab_a?: number | null
          lab_b?: number | null
          lab_l?: number | null
          name: string
          properties?: Json | null
          supplier?: string | null
          tannery_id: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["chemical_category"]
          colour_index?: string | null
          created_at?: string
          id?: string
          is_community?: boolean | null
          lab_a?: number | null
          lab_b?: number | null
          lab_l?: number | null
          name?: string
          properties?: Json | null
          supplier?: string | null
          tannery_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chemicals_tannery_id_fkey"
            columns: ["tannery_id"]
            isOneToOne: false
            referencedRelation: "tanneries"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_recipes: {
        Row: {
          collection_id: string
          id: string
          recipe_id: string
          sort_order: number | null
        }
        Insert: {
          collection_id: string
          id?: string
          recipe_id: string
          sort_order?: number | null
        }
        Update: {
          collection_id?: string
          id?: string
          recipe_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_recipes_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          tannery_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          tannery_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          tannery_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_tannery_id_fkey"
            columns: ["tannery_id"]
            isOneToOne: false
            referencedRelation: "tanneries"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_logs: {
        Row: {
          created_at: string
          id: string
          model: string | null
          prompt: string
          response: string | null
          tannery_id: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          model?: string | null
          prompt: string
          response?: string | null
          tannery_id: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          model?: string | null
          prompt?: string
          response?: string | null
          tannery_id?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "llm_logs_tannery_id_fkey"
            columns: ["tannery_id"]
            isOneToOne: false
            referencedRelation: "tanneries"
            referencedColumns: ["id"]
          },
        ]
      }
      models_3d: {
        Row: {
          created_at: string
          file_url: string
          id: string
          is_default: boolean | null
          name: string
          tannery_id: string | null
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          is_default?: boolean | null
          name: string
          tannery_id?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          is_default?: boolean | null
          name?: string
          tannery_id?: string | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "models_3d_tannery_id_fkey"
            columns: ["tannery_id"]
            isOneToOne: false
            referencedRelation: "tanneries"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          created_at: string
          delta_e: number | null
          id: string
          name: string
          parent_id: string | null
          predicted_lab_a: number | null
          predicted_lab_b: number | null
          predicted_lab_l: number | null
          status: string | null
          steps: Json | null
          substrate_id: string | null
          tannery_id: string
          target_lab_a: number | null
          target_lab_b: number | null
          target_lab_l: number | null
          updated_at: string
          version: number | null
        }
        Insert: {
          created_at?: string
          delta_e?: number | null
          id?: string
          name: string
          parent_id?: string | null
          predicted_lab_a?: number | null
          predicted_lab_b?: number | null
          predicted_lab_l?: number | null
          status?: string | null
          steps?: Json | null
          substrate_id?: string | null
          tannery_id: string
          target_lab_a?: number | null
          target_lab_b?: number | null
          target_lab_l?: number | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          created_at?: string
          delta_e?: number | null
          id?: string
          name?: string
          parent_id?: string | null
          predicted_lab_a?: number | null
          predicted_lab_b?: number | null
          predicted_lab_l?: number | null
          status?: string | null
          steps?: Json | null
          substrate_id?: string | null
          tannery_id?: string
          target_lab_a?: number | null
          target_lab_b?: number | null
          target_lab_l?: number | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_substrate_id_fkey"
            columns: ["substrate_id"]
            isOneToOne: false
            referencedRelation: "substrates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_tannery_id_fkey"
            columns: ["tannery_id"]
            isOneToOne: false
            referencedRelation: "tanneries"
            referencedColumns: ["id"]
          },
        ]
      }
      substrates: {
        Row: {
          base_lab_a: number
          base_lab_b: number
          base_lab_l: number
          created_at: string
          id: string
          is_default: boolean | null
          name: string
          roughness: number
          tannery_id: string | null
          thickness_mm: number
          type: Database["public"]["Enums"]["substrate_type"]
        }
        Insert: {
          base_lab_a?: number
          base_lab_b?: number
          base_lab_l?: number
          created_at?: string
          id?: string
          is_default?: boolean | null
          name: string
          roughness?: number
          tannery_id?: string | null
          thickness_mm?: number
          type: Database["public"]["Enums"]["substrate_type"]
        }
        Update: {
          base_lab_a?: number
          base_lab_b?: number
          base_lab_l?: number
          created_at?: string
          id?: string
          is_default?: boolean | null
          name?: string
          roughness?: number
          tannery_id?: string | null
          thickness_mm?: number
          type?: Database["public"]["Enums"]["substrate_type"]
        }
        Relationships: [
          {
            foreignKeyName: "substrates_tannery_id_fkey"
            columns: ["tannery_id"]
            isOneToOne: false
            referencedRelation: "tanneries"
            referencedColumns: ["id"]
          },
        ]
      }
      tanneries: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          tannery_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          tannery_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          tannery_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_tannery_id_fkey"
            columns: ["tannery_id"]
            isOneToOne: false
            referencedRelation: "tanneries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          tannery_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tannery_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          tannery_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tannery_id_fkey"
            columns: ["tannery_id"]
            isOneToOne: false
            referencedRelation: "tanneries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_tannery_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _tannery_id: string
          _user_id: string
        }
        Returns: boolean
      }
      provision_tannery: {
        Args: { p_name: string; p_slug: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "operator" | "viewer"
      chemical_category:
        | "dye"
        | "fatliquor"
        | "retanning_agent"
        | "surfactant"
        | "acid"
        | "base"
        | "fixing_agent"
        | "other"
      substrate_type: "bovine" | "ovine" | "caprine" | "exotic" | "synthetic"
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
    Enums: {
      app_role: ["admin", "operator", "viewer"],
      chemical_category: [
        "dye",
        "fatliquor",
        "retanning_agent",
        "surfactant",
        "acid",
        "base",
        "fixing_agent",
        "other",
      ],
      substrate_type: ["bovine", "ovine", "caprine", "exotic", "synthetic"],
    },
  },
} as const
