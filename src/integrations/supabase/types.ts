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
      eventos_analytics: {
        Row: {
          created_at: string | null
          evento_tipo: string
          id: string
          ip_address: string | null
          metadata: Json | null
          receta_id: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          created_at?: string | null
          evento_tipo: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          receta_id?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          created_at?: string | null
          evento_tipo?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          receta_id?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: []
      }
      metricas_diarias: {
        Row: {
          created_at: string | null
          fecha: string
          id: string
          metadata: Json | null
          total_guardados: number | null
          total_likes: number | null
          total_recetas_creadas: number | null
          total_recetas_vistas: number | null
          total_vistas_pagina: number | null
          usuarios_activos: number | null
        }
        Insert: {
          created_at?: string | null
          fecha: string
          id?: string
          metadata?: Json | null
          total_guardados?: number | null
          total_likes?: number | null
          total_recetas_creadas?: number | null
          total_recetas_vistas?: number | null
          total_vistas_pagina?: number | null
          usuarios_activos?: number | null
        }
        Update: {
          created_at?: string | null
          fecha?: string
          id?: string
          metadata?: Json | null
          total_guardados?: number | null
          total_likes?: number | null
          total_recetas_creadas?: number | null
          total_recetas_vistas?: number | null
          total_vistas_pagina?: number | null
          usuarios_activos?: number | null
        }
        Relationships: []
      }
      recetas_imagenes: {
        Row: {
          created_at: string | null
          es_principal: boolean | null
          id: string
          imagen_url: string
          orden: number | null
          receta_id: string
          storage_path: string
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          es_principal?: boolean | null
          id?: string
          imagen_url: string
          orden?: number | null
          receta_id: string
          storage_path: string
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          es_principal?: boolean | null
          id?: string
          imagen_url?: string
          orden?: number | null
          receta_id?: string
          storage_path?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      recetas_videos: {
        Row: {
          created_at: string | null
          embed_url: string
          id: string
          plataforma: string
          receta_id: string
          tipo_video: string | null
          updated_at: string | null
          usuario_id: string
          video_id: string
          video_url: string
          video_url_normalizada: string
        }
        Insert: {
          created_at?: string | null
          embed_url: string
          id?: string
          plataforma: string
          receta_id: string
          tipo_video?: string | null
          updated_at?: string | null
          usuario_id: string
          video_id: string
          video_url: string
          video_url_normalizada: string
        }
        Update: {
          created_at?: string | null
          embed_url?: string
          id?: string
          plataforma?: string
          receta_id?: string
          tipo_video?: string | null
          updated_at?: string | null
          usuario_id?: string
          video_id?: string
          video_url?: string
          video_url_normalizada?: string
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
