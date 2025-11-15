// Tipos para el sistema de Analytics
export type EventoTipo = 
  | 'page_view'
  | 'recipe_view'
  | 'recipe_create'
  | 'recipe_like'
  | 'recipe_save'
  | 'recipe_share'
  | 'search'
  | 'filter';

export interface IEvento {
  evento_tipo: EventoTipo;
  usuario_id?: string;
  receta_id?: string;
  metadata?: Record<string, any>;
}

export interface IMetricasDiarias {
  fecha: string;
  total_vistas_pagina: number;
  total_recetas_vistas: number;
  total_recetas_creadas: number;
  total_likes: number;
  total_guardados: number;
  usuarios_activos: number;
}
