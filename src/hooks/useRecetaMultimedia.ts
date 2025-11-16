import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client-unsafe';

interface MultimediaData {
  imagen_url: string | null;
  video_id: string | null;
  video_url: string | null;
  embed_url: string | null;
  plataforma: string | null;
}

/**
 * Hook para cargar datos multimedia de una receta desde Lovable Cloud
 */
export function useRecetaMultimedia(recetaId: string | undefined) {
  const [multimedia, setMultimedia] = useState<MultimediaData>({
    imagen_url: null,
    video_id: null,
    video_url: null,
    embed_url: null,
    plataforma: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recetaId) {
      setLoading(false);
      return;
    }

    const loadMultimedia = async () => {
      try {
        // Cargar imagen
        const { data: imagenData } = await supabase
          .from('recetas_imagenes')
          .select('imagen_url')
          .eq('receta_id', recetaId)
          .eq('es_principal', true)
          .maybeSingle();

        // Cargar video
        const { data: videoData } = await supabase
          .from('recetas_videos')
          .select('video_id, video_url, embed_url, plataforma')
          .eq('receta_id', recetaId)
          .maybeSingle();

        setMultimedia({
          imagen_url: imagenData?.imagen_url || null,
          video_id: videoData?.video_id || null,
          video_url: videoData?.video_url || null,
          embed_url: videoData?.embed_url || null,
          plataforma: videoData?.plataforma || null,
        });
      } catch (error) {
        console.error('Error cargando multimedia:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMultimedia();
  }, [recetaId]);

  return { multimedia, loading };
}
