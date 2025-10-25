export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      alimentos: {
        Row: {
          id_alimento: string
          nombre_alimento: string
          grupo_alimenticio: string | null
          energia_kcal: number | null
          humedad_g: number | null
          proteinas_g: number | null
          grasas_g: number | null
          hidratoscarbonototal_g: number | null
          fibracruda_g: number | null
          ceniza_g: number | null
          calcio_mg: number | null
          fosforo_mg: number | null
          hierro_mg: number | null
          vita_mcg: number | null
          tiamina_mg: number | null
          riboflavina_mg: number | null
          niacina_mg: number | null
          vitc_mg: number | null
          estado_validacion: string | null
          created_at?: string
        }
        Insert: Omit<Database['public']['Tables']['alimentos']['Row'], 'id_alimento' | 'created_at'>
        Update: Partial<Database['public']['Tables']['alimentos']['Insert']>
      }
      perfiles: {
        Row: {
          id: string
          email: string
          nombre_completo: string | null
          avatar_url: string | null
          preferencias_dieteticas: Json
          recetas_privadas_count: number
          recetas_publicas_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nombre_completo?: string | null
          avatar_url?: string | null
          preferencias_dieteticas?: Json
          recetas_privadas_count?: number
          recetas_publicas_count?: number
        }
        Update: Partial<Database['public']['Tables']['perfiles']['Insert']>
      }
      recetas: {
        Row: {
          id: string
          usuario_id: string
          nombre: string
          descripcion: string | null
          ingredientes: Json
          nutrientes_totales: Json
          visibilidad: 'privada' | 'publica' | 'enlace'
          es_duplicada: boolean
          receta_original_id: string | null
          contador_guardados: number
          contador_likes: number
          tiempo_preparacion: number | null
          dificultad: 'facil' | 'medio' | 'dificil' | null
          etiquetas: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          usuario_id: string
          nombre: string
          descripcion?: string | null
          ingredientes: Json
          nutrientes_totales: Json
          visibilidad?: 'privada' | 'publica' | 'enlace'
          es_duplicada?: boolean
          receta_original_id?: string | null
          tiempo_preparacion?: number | null
          dificultad?: 'facil' | 'medio' | 'dificil' | null
          etiquetas?: string[] | null
        }
        Update: Partial<Database['public']['Tables']['recetas']['Insert']>
      }
      recetas_interacciones: {
        Row: {
          id: string
          usuario_id: string
          receta_id: string
          tipo: 'like' | 'guardar'
          created_at: string
        }
        Insert: {
          usuario_id: string
          receta_id: string
          tipo: 'like' | 'guardar'
        }
        Update: Partial<Database['public']['Tables']['recetas_interacciones']['Insert']>
      }
      recetas_calificaciones: {
        Row: {
          id: string
          usuario_id: string
          receta_id: string
          calificacion: number
          created_at: string
        }
        Insert: {
          usuario_id: string
          receta_id: string
          calificacion: number
        }
        Update: Partial<Database['public']['Tables']['recetas_calificaciones']['Insert']>
      }
      notificaciones: {
        Row: {
          id: string
          usuario_id: string
          tipo: 'like' | 'guardado' | 'calificacion' | 'comentario'
          titulo: string
          mensaje: string
          leida: boolean
          metadata: Json | null
          created_at: string
        }
        Insert: {
          usuario_id: string
          tipo: 'like' | 'guardado' | 'calificacion' | 'comentario'
          titulo: string
          mensaje: string
          leida?: boolean
          metadata?: Json | null
        }
        Update: Partial<Database['public']['Tables']['notificaciones']['Insert']>
      }
    }
  }
}

export type Alimento = Database['public']['Tables']['alimentos']['Row'];
export type Perfil = Database['public']['Tables']['perfiles']['Row'];
export type Receta = Database['public']['Tables']['recetas']['Row'];
export type Interaccion = Database['public']['Tables']['recetas_interacciones']['Row'];
export type Calificacion = Database['public']['Tables']['recetas_calificaciones']['Row'];
export type Notificacion = Database['public']['Tables']['notificaciones']['Row'];
