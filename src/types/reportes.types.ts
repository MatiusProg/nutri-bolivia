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

// ============= ACCIONES DE MODERACIÓN =============

export const ACCIONES_MODERACION = {
  eliminar: {
    label: 'Eliminar receta',
    descripcion: 'La receta será eliminada permanentemente',
    requiereAdmin: true,
  },
  hacer_privada: {
    label: 'Hacer privada',
    descripcion: 'La receta volverá a ser privada para el usuario',
    requiereAdmin: false,
  },
  solicitar_cambios: {
    label: 'Solicitar cambios',
    descripcion: 'Se notificará al usuario para que modifique su receta',
    requiereAdmin: false,
  },
} as const;

export type AccionModeracion = keyof typeof ACCIONES_MODERACION;

export const TEMPLATES_MENSAJE: Record<AccionModeracion, string[]> = {
  eliminar: [
    'Tu receta "{nombre}" fue eliminada por violar nuestras políticas de contenido.',
    'Tu receta "{nombre}" fue removida debido a contenido inapropiado reportado por la comunidad.',
    'Tu receta "{nombre}" fue eliminada por contener información falsa o engañosa.',
  ],
  hacer_privada: [
    'Tu receta "{nombre}" fue restringida temporalmente. Por favor revisa y corrige el contenido antes de volver a publicarla.',
    'Tu receta "{nombre}" fue puesta en modo privado debido a información nutricional incorrecta reportada por usuarios.',
    'Tu receta "{nombre}" fue restringida. Revisa las políticas de la comunidad antes de republicarla.',
  ],
  solicitar_cambios: [
    'Por favor revisa tu receta "{nombre}". Hemos recibido reportes sobre la información nutricional.',
    'Tu receta "{nombre}" necesita modificaciones. Por favor actualiza el contenido según nuestras políticas.',
    'Se han reportado problemas con tu receta "{nombre}". Te pedimos que revises y actualices la información.',
  ],
};

export const TITULOS_NOTIFICACION: Record<AccionModeracion, string> = {
  eliminar: '⚠️ Tu receta fue eliminada',
  hacer_privada: '🔒 Tu receta fue restringida',
  solicitar_cambios: '✏️ Se requieren cambios en tu receta',
};
