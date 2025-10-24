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
          id: string
          nombre_alimento: string
          grupo_alimento: string | null
          energia_kcal: number | null
          proteina_g: number | null
          grasa_total_g: number | null
          carbohidratos_totales_g: number | null
          fibra_dietetica_g: number | null
          azucares_totales_g: number | null
          calcio_mg: number | null
          hierro_mg: number | null
          magnesio_mg: number | null
          fosforo_mg: number | null
          potasio_mg: number | null
          sodio_mg: number | null
          zinc_mg: number | null
          vitamina_c_mg: number | null
          tiamina_mg: number | null
          riboflavina_mg: number | null
          niacina_mg: number | null
          vitamina_b6_mg: number | null
          folato_ug: number | null
          vitamina_b12_ug: number | null
          vitamina_a_ug: number | null
          vitamina_e_mg: number | null
          vitamina_d_ug: number | null
          created_at?: string
        }
        Insert: Omit<Database['public']['Tables']['alimentos']['Row'], 'id' | 'created_at'>
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
    }
  }
}

export type Alimento = Database['public']['Tables']['alimentos']['Row'];
export type Perfil = Database['public']['Tables']['perfiles']['Row'];
export type Receta = Database['public']['Tables']['recetas']['Row'];
export type Interaccion = Database['public']['Tables']['recetas_interacciones']['Row'];
