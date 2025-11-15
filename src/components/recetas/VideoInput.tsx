import { useState } from 'react';
import { Link2, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { normalizeVideoUrl, type VideoData } from '@/utils/videoUrlNormalizer';
import { VideoPreview } from './VideoPreview';

interface VideoInputProps {
  videoActual?: VideoData | null;
  onVideoValidado: (videoData: VideoData) => void;
  onVideoEliminado: () => void;
}

export function VideoInput({
  videoActual,
  onVideoValidado,
  onVideoEliminado
}: VideoInputProps) {
  const [url, setUrl] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<VideoData | null>(videoActual || null);

  const handleValidate = async () => {
    if (!url.trim()) {
      setError('Por favor ingresa una URL');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const result = await normalizeVideoUrl(url);

      if (!result.success) {
        setError(result.error || 'URL no válida');
        return;
      }

      if (result.data) {
        setVideoData(result.data);
        onVideoValidado(result.data);
        setUrl('');
      }
    } catch (err: any) {
      setError(err.message || 'Error al validar la URL');
    } finally {
      setValidating(false);
    }
  };

  const handleRemove = () => {
    setVideoData(null);
    setUrl('');
    setError(null);
    onVideoEliminado();
  };

  return (
    <div className="space-y-3">
      <Label>Video de la receta (opcional)</Label>
      
      {videoData ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {videoData.plataforma}
              </Badge>
              {videoData.tipo && (
                <Badge variant="secondary" className="capitalize">
                  {videoData.tipo}
                </Badge>
              )}
              <span className="text-sm text-muted-foreground truncate max-w-xs">
                {videoData.videoId}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <VideoPreview embedUrl={videoData.embedUrl} plataforma={videoData.plataforma} />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="https://www.tiktok.com/@user/video/123... o https://youtube.com/watch?v=..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              disabled={validating}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleValidate();
                }
              }}
            />
            <Button
              type="button"
              onClick={handleValidate}
              disabled={validating || !url.trim()}
              size="icon"
            >
              {validating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Formatos soportados:</p>
            <ul className="list-disc list-inside ml-2 space-y-0.5">
              <li>TikTok: vm.tiktok.com/XXXXX o enlaces completos</li>
              <li>YouTube: Videos largos y Shorts</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
