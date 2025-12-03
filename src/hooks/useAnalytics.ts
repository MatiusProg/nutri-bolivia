// Hook para tracking de analytics - DESHABILITADO TEMPORALMENTE
// Se implementará correctamente en Fase 3 del roadmap con la BD externa
import { useCallback } from 'react';

// Funciones no-op que no hacen nada (evitan errores sin llamadas a BD)
export function useAnalytics() {
  const trackPageView = useCallback((_pageName: string, _metadata?: Record<string, any>) => {
    // No-op: analytics deshabilitado temporalmente
  }, []);

  const trackRecipeView = useCallback((_recetaId: string) => {
    // No-op: analytics deshabilitado temporalmente
  }, []);

  const trackRecipeCreate = useCallback((_recetaId: string, _metadata?: Record<string, any>) => {
    // No-op: analytics deshabilitado temporalmente
  }, []);

  const trackRecipeLike = useCallback((_recetaId: string) => {
    // No-op: analytics deshabilitado temporalmente
  }, []);

  const trackRecipeSave = useCallback((_recetaId: string) => {
    // No-op: analytics deshabilitado temporalmente
  }, []);

  const trackSearch = useCallback((_query: string, _resultCount: number) => {
    // No-op: analytics deshabilitado temporalmente
  }, []);

  const trackFilter = useCallback((_filters: Record<string, any>) => {
    // No-op: analytics deshabilitado temporalmente
  }, []);

  return {
    trackPageView,
    trackRecipeView,
    trackRecipeCreate,
    trackRecipeLike,
    trackRecipeSave,
    trackSearch,
    trackFilter,
  };
}
