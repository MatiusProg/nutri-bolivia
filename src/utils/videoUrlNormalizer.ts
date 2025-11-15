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
    let finalUrl = url;

    // Si es un enlace corto vm.tiktok.com, seguir el redirect
    if (url.includes('vm.tiktok.com') || url.includes('vt.tiktok.com')) {
      try {
        // Intentar obtener la URL final
        const response = await fetch(url, { 
          method: 'HEAD', 
          redirect: 'follow',
          mode: 'no-cors' 
        });
        finalUrl = response.url || url;
      } catch {
        // Si falla el fetch, intentar extraer del enlace original
        finalUrl = url;
      }
    }

    // Extraer video ID de diferentes formatos de TikTok
    // Formatos soportados:
    // - https://www.tiktok.com/@username/video/1234567890
    // - https://www.tiktok.com/t/XXXXX/
    // - https://vm.tiktok.com/XXXXX/
    let videoId = '';
    
    // Intentar extraer de /video/XXXXXX
    const videoMatch = finalUrl.match(/\/video\/(\d+)/);
    if (videoMatch) {
      videoId = videoMatch[1];
    } else {
      // Intentar extraer del path para enlaces cortos
      const shortMatch = finalUrl.match(/tiktok\.com\/(?:t|@[\w.]+\/video)\/([A-Za-z0-9]+)/);
      if (shortMatch) {
        videoId = shortMatch[1];
      }
    }

    if (!videoId) {
      return {
        success: false,
        error: 'No se pudo extraer el ID del video de TikTok. Verifica que la URL sea válida.'
      };
    }

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
