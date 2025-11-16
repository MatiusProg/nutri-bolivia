// Utilidad para normalizar URLs de videos de TikTok y YouTube
export interface VideoData {
  plataforma: 'tiktok' | 'youtube';
  videoId: string;
  embedUrl: string;
  videoUrlNormalizada: string;
  tipo?: 'short' | 'long';
}

export interface VideoNormalizationResult {
  success: boolean;
  data?: VideoData;
  error?: string;
}

/**
 * Normaliza URLs de TikTok (incluyendo vm.tiktok.com)
 */
async function normalizeTikTokUrl(url: string): Promise<VideoNormalizationResult> {
  try {
    // Detectar enlaces cortos: vm.tiktok.com, vt.tiktok.com o tiktok.com/t/
    const isShort = /(?:vm|vt)\.tiktok\.com|tiktok\.com\/t\//.test(url);

    if (isShort) {
      const base = import.meta.env.VITE_SUPABASE_URL;
      const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      try {
        const resp = await fetch(`${base}/functions/v1/resolve-tiktok`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anon}`,
            'apikey': anon,
          },
          body: JSON.stringify({ url }),
        });
        const json = await resp.json();

        if (!resp.ok || !json.success || !json.data) {
          return {
            success: false,
            error: 'No se pudo resolver el enlace corto de TikTok. Abre el enlace y copia la URL completa.'
          };
        }

        const { videoId, embedUrl, videoUrlNormalizada } = json.data as { videoId: string; embedUrl: string; videoUrlNormalizada: string };
        return {
          success: true,
          data: {
            plataforma: 'tiktok',
            videoId,
            embedUrl,
            videoUrlNormalizada,
          }
        };
      } catch {
        return {
          success: false,
          error: 'No se pudo resolver el enlace corto de TikTok. Intenta con la URL larga.'
        };
      }
    }

    // Enlaces largos: https://www.tiktok.com/@usuario/video/1234567890
    const videoMatch = url.match(/\/video\/(\d+)/);
    if (!videoMatch) {
      return {
        success: false,
        error: 'No se pudo extraer el ID del video de TikTok. Verifica la URL.'
      };
    }

    const videoId = videoMatch[1];
    const embedUrl = `https://www.tiktok.com/embed/v2/${videoId}`;
    const videoUrlNormalizada = `https://www.tiktok.com/video/${videoId}`;

    return {
      success: true,
      data: {
        plataforma: 'tiktok',
        videoId,
        embedUrl,
        videoUrlNormalizada,
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al procesar la URL de TikTok. Intenta con otra URL.'
    };
  }
}

/**
 * Normaliza URLs de YouTube (videos largos y Shorts)
 */
function normalizeYouTubeUrl(url: string): VideoNormalizationResult {
  try {
    let videoId = '';
    let tipo: 'short' | 'long' = 'long';

    // Detectar si es un Short
    if (url.includes('/shorts/')) {
      const shortsMatch = url.match(/\/shorts\/([A-Za-z0-9_-]+)/);
      if (shortsMatch) {
        videoId = shortsMatch[1];
        tipo = 'short';
      }
    } 
    // URL estándar de YouTube: youtube.com/watch?v=XXXXX
    else if (url.includes('watch?v=')) {
      const params = new URLSearchParams(url.split('?')[1]);
      videoId = params.get('v') || '';
    }
    // URL corta de YouTube: youtu.be/XXXXX
    else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
      if (match) {
        videoId = match[1];
      }
    }
    // Formato embed
    else if (url.includes('/embed/')) {
      const embedMatch = url.match(/\/embed\/([A-Za-z0-9_-]+)/);
      if (embedMatch) {
        videoId = embedMatch[1];
      }
    }

    if (!videoId) {
      return {
        success: false,
        error: 'No se pudo extraer el ID del video de YouTube. Verifica que la URL sea válida.'
      };
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const videoUrlNormalizada = tipo === 'short' 
      ? `https://www.youtube.com/shorts/${videoId}`
      : `https://www.youtube.com/watch?v=${videoId}`;

    return {
      success: true,
      data: {
        plataforma: 'youtube',
        videoId,
        embedUrl,
        videoUrlNormalizada,
        tipo,
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Error al procesar la URL de YouTube. Intenta con otra URL.'
    };
  }
}

/**
 * Función principal que detecta la plataforma y normaliza la URL
 */
export async function normalizeVideoUrl(url: string): Promise<VideoNormalizationResult> {
  if (!url || !url.trim()) {
    return {
      success: false,
      error: 'Por favor ingresa una URL de video.'
    };
  }

  const urlLower = url.toLowerCase();

  // Detectar TikTok
  if (urlLower.includes('tiktok.com')) {
    return await normalizeTikTokUrl(url);
  }

  // Detectar YouTube
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return normalizeYouTubeUrl(url);
  }

  return {
    success: false,
    error: 'URL no soportada. Solo se aceptan videos de TikTok y YouTube.'
  };
}
