// Constantes para el sistema de reportes
export const MOTIVOS_REPORTE = {
  contenido_enganoso: 'Contenido engañoso o falso',
  contenido_obsceno: 'Contenido inapropiado u ofensivo',
  spam: 'Spam o publicidad',
  plagio: 'Plagio de otra receta',
  informacion_nutricional_incorrecta: 'Información nutricional incorrecta',
  otro: 'Otro motivo'
} as const;

export const ESTADOS_REPORTE = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  resuelto: 'Resuelto',
  rechazado: 'Rechazado'
} as const;

export type MotivoReporte = keyof typeof MOTIVOS_REPORTE;
export type EstadoReporte = keyof typeof ESTADOS_REPORTE;

export interface Reporte {
  id: string;
  receta_id: string;
  usuario_reportador_id: string;
  motivo: MotivoReporte;
  descripcion: string | null;
  estado: EstadoReporte;
  resuelto_por: string | null;
  resuelto_at: string | null;
  notas_moderacion: string | null;
  created_at: string;
  updated_at: string;
}
