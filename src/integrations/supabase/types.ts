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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      alimentos: {
        Row: {
          calcio_mg: number | null
          ceniza_g: number | null
          created_at: string | null
          energia_kcal: number | null
          estado_validacion: string | null
          fibracruda_g: number | null
          fosforo_mg: number | null
          grasas_g: number | null
          grupo_alimenticio: string | null
          hidratoscarbonototal_g: number | null
          hierro_mg: number | null
          humedad_g: number | null
          id: number
          id_alimento: string
          niacina_mg: number | null
          nombre_alimento: string
          proteinas_g: number | null
          riboflavina_mg: number | null
          tiamina_mg: number | null
          vita_mcg: number | null
          vitc_mg: number | null
        }
        Insert: {
          calcio_mg?: number | null
          ceniza_g?: number | null
          created_at?: string | null
          energia_kcal?: number | null
          estado_validacion?: string | null
          fibracruda_g?: number | null
          fosforo_mg?: number | null
          grasas_g?: number | null
          grupo_alimenticio?: string | null
          hidratoscarbonototal_g?: number | null
          hierro_mg?: number | null
          humedad_g?: number | null
          id?: number
          id_alimento: string
          niacina_mg?: number | null
          nombre_alimento: string
          proteinas_g?: number | null
          riboflavina_mg?: number | null
          tiamina_mg?: number | null
          vita_mcg?: number | null
          vitc_mg?: number | null
        }
        Update: {
          calcio_mg?: number | null
          ceniza_g?: number | null
          created_at?: string | null
          energia_kcal?: number | null
          estado_validacion?: string | null
          fibracruda_g?: number | null
          fosforo_mg?: number | null
          grasas_g?: number | null
          grupo_alimenticio?: string | null
          hidratoscarbonototal_g?: number | null
          hierro_mg?: number | null
          humedad_g?: number | null
          id?: number
          id_alimento?: string
          niacina_mg?: number | null
          nombre_alimento?: string
          proteinas_g?: number | null
          riboflavina_mg?: number | null
          tiamina_mg?: number | null
          vita_mcg?: number | null
          vitc_mg?: number | null
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          created_at: string | null
          id: string
          leida: boolean | null
          mensaje: string
          metadata: Json | null
          receta_id: string | null
          tipo: string
          usuario_actor_id: string | null
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          leida?: boolean | null
          mensaje: string
          metadata?: Json | null
          receta_id?: string | null
          tipo: string
          usuario_actor_id?: string | null
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          leida?: boolean | null
          mensaje?: string
          metadata?: Json | null
          receta_id?: string | null
          tipo?: string
          usuario_actor_id?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_receta_id_fkey"
            columns: ["receta_id"]
            isOneToOne: false
            referencedRelation: "recetas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_receta_id_fkey"
            columns: ["receta_id"]
            isOneToOne: false
            referencedRelation: "recetas_comunidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_usuario_actor_id_fkey"
            columns: ["usuario_actor_id"]
            isOneToOne: false
            referencedRelation: "usuario_dashboard"
            referencedColumns: ["usuario_id"]
          },
          {
            foreignKeyName: "notificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_dashboard"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      perfiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          nombre_completo: string | null
          preferencias_dieteticas: Json | null
          recetas_privadas_count: number | null
          recetas_publicas_count: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          nombre_completo?: string | null
          preferencias_dieteticas?: Json | null
          recetas_privadas_count?: number | null
          recetas_publicas_count?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          nombre_completo?: string | null
          preferencias_dieteticas?: Json | null
          recetas_privadas_count?: number | null
          recetas_publicas_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "usuario_dashboard"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      recetas: {
        Row: {
          contador_guardados: number | null
          contador_likes: number | null
          created_at: string | null
          descripcion: string | null
          dificultad: string | null
          distribucion_calificaciones: Json | null
          es_duplicada: boolean | null
          etiquetas: string[] | null
          id: string
          ingredientes: Json
          nombre: string
          nutrientes_totales: Json
          promedio_calificacion: number | null
          receta_original_id: string | null
          tiempo_preparacion: number | null
          total_calificaciones: number | null
          updated_at: string | null
          usuario_id: string
          visibilidad: string | null
        }
        Insert: {
          contador_guardados?: number | null
          contador_likes?: number | null
          created_at?: string | null
          descripcion?: string | null
          dificultad?: string | null
          distribucion_calificaciones?: Json | null
          es_duplicada?: boolean | null
          etiquetas?: string[] | null
          id?: string
          ingredientes: Json
          nombre: string
          nutrientes_totales: Json
          promedio_calificacion?: number | null
          receta_original_id?: string | null
          tiempo_preparacion?: number | null
          total_calificaciones?: number | null
          updated_at?: string | null
          usuario_id: string
          visibilidad?: string | null
        }
        Update: {
          contador_guardados?: number | null
          contador_likes?: number | null
          created_at?: string | null
          descripcion?: string | null
          dificultad?: string | null
          distribucion_calificaciones?: Json | null
          es_duplicada?: boolean | null
          etiquetas?: string[] | null
          id?: string
          ingredientes?: Json
          nombre?: string
          nutrientes_totales?: Json
          promedio_calificacion?: number | null
          receta_original_id?: string | null
          tiempo_preparacion?: number | null
          total_calificaciones?: number | null
          updated_at?: string | null
          usuario_id?: string
          visibilidad?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recetas_receta_original_id_fkey"
            columns: ["receta_original_id"]
            isOneToOne: false
            referencedRelation: "recetas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recetas_receta_original_id_fkey"
            columns: ["receta_original_id"]
            isOneToOne: false
            referencedRelation: "recetas_comunidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recetas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_dashboard"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      recetas_calificaciones: {
        Row: {
          active: boolean | null
          comentario: string | null
          created_at: string | null
          edited: boolean | null
          id: string
          puntuacion: number
          receta_id: string
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          active?: boolean | null
          comentario?: string | null
          created_at?: string | null
          edited?: boolean | null
          id?: string
          puntuacion: number
          receta_id: string
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          active?: boolean | null
          comentario?: string | null
          created_at?: string | null
          edited?: boolean | null
          id?: string
          puntuacion?: number
          receta_id?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recetas_calificaciones_receta_id_fkey"
            columns: ["receta_id"]
            isOneToOne: false
            referencedRelation: "recetas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recetas_calificaciones_receta_id_fkey"
            columns: ["receta_id"]
            isOneToOne: false
            referencedRelation: "recetas_comunidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recetas_calificaciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_dashboard"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      recetas_interacciones: {
        Row: {
          created_at: string | null
          id: string
          receta_id: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          receta_id: string
          tipo: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          receta_id?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recetas_interacciones_receta_id_fkey"
            columns: ["receta_id"]
            isOneToOne: false
            referencedRelation: "recetas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recetas_interacciones_receta_id_fkey"
            columns: ["receta_id"]
            isOneToOne: false
            referencedRelation: "recetas_comunidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recetas_interacciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_dashboard"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
    }
    Views: {
      recetas_comunidad: {
        Row: {
          autor_avatar: string | null
          autor_nombre: string | null
          contador_guardados: number | null
          contador_likes: number | null
          created_at: string | null
          descripcion: string | null
          dificultad: string | null
          distribucion_calificaciones: Json | null
          es_duplicada: boolean | null
          etiquetas: string[] | null
          id: string | null
          ingredientes: Json | null
          nombre: string | null
          nutrientes_totales: Json | null
          promedio_calificacion: number | null
          receta_original_id: string | null
          tiempo_preparacion: number | null
          total_calificaciones: number | null
          total_calificaciones_count: number | null
          total_interacciones: number | null
          updated_at: string | null
          usuario_id: string | null
          visibilidad: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recetas_receta_original_id_fkey"
            columns: ["receta_original_id"]
            isOneToOne: false
            referencedRelation: "recetas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recetas_receta_original_id_fkey"
            columns: ["receta_original_id"]
            isOneToOne: false
            referencedRelation: "recetas_comunidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recetas_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuario_dashboard"
            referencedColumns: ["usuario_id"]
          },
        ]
      }
      usuario_dashboard: {
        Row: {
          avatar_url: string | null
          nombre_completo: string | null
          promedio_calificaciones: number | null
          recetas_privadas: number | null
          recetas_publicas: number | null
          total_interacciones_recibidas: number | null
          total_recetas: number | null
          usuario_id: string | null
        }
        Relationships: []
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
