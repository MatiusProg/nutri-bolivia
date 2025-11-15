// Hook para tracking de analytics
import { useCallback } from 'react';
import { lovableCloud } from '@/integrations/lovable-cloud/client';
import { useAuth } from './useAuth';
import type { EventoTipo } from '@/types/analytics.types';

export function useAnalytics() {
  const { user } = useAuth();

  const trackEvent = useCallback(async (
    evento_tipo: EventoTipo,
    receta_id?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      await lovableCloud
        .from('eventos_analytics')
        .insert({
          evento_tipo,
          usuario_id: user?.id || null,
          receta_id: receta_id || null,
          metadata: metadata || {},
          user_agent: navigator.userAgent,
        });
    } catch (error) {
      // Silently fail - no queremos que analytics rompa la app
      console.debug('Error tracking analytics:', error);
    }
  }, [user]);

  const trackPageView = useCallback((pageName: string, metadata?: Record<string, any>) => {
    return trackEvent('page_view', undefined, { pageName, ...metadata });
  }, [trackEvent]);

  const trackRecipeView = useCallback((recetaId: string) => {
    return trackEvent('recipe_view', recetaId);
  }, [trackEvent]);

  const trackRecipeCreate = useCallback((recetaId: string, metadata?: Record<string, any>) => {
    return trackEvent('recipe_create', recetaId, metadata);
  }, [trackEvent]);

  const trackRecipeLike = useCallback((recetaId: string) => {
    return trackEvent('recipe_like', recetaId);
  }, [trackEvent]);

  const trackRecipeSave = useCallback((recetaId: string) => {
    return trackEvent('recipe_save', recetaId);
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultCount: number) => {
    return trackEvent('search', undefined, { query, resultCount });
  }, [trackEvent]);

  const trackFilter = useCallback((filters: Record<string, any>) => {
    return trackEvent('filter', undefined, { filters });
  }, [trackEvent]);

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
