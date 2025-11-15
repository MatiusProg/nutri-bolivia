import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface VideoPreviewProps {
  embedUrl: string;
  plataforma: 'tiktok' | 'youtube';
}

export function VideoPreview({ embedUrl, plataforma }: VideoPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // TikTok usa aspect ratio 9:16 (vertical), YouTube usa 16:9 (horizontal)
  const aspectRatio = plataforma === 'tiktok' ? 9 / 16 : 16 / 9;

  return (
    <Card className="overflow-hidden bg-muted/50">
      <AspectRatio ratio={aspectRatio}>
        <div className="relative w-full h-full">
          {loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <p className="text-sm text-muted-foreground">
                No se pudo cargar el preview del video
              </p>
            </div>
          ) : (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )}
        </div>
      </AspectRatio>
    </Card>
  );
}
