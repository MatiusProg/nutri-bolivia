import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { useRecetaMultimedia } from '@/hooks/useRecetaMultimedia';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface RecetaCardImagenProps {
  recetaId: string;
}

export function RecetaCardImagen({ recetaId }: RecetaCardImagenProps) {
  const { multimedia, loading } = useRecetaMultimedia(recetaId);
  const [imageError, setImageError] = useState(false);

  if (loading) {
    return (
      <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg mb-4 flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
      </AspectRatio>
    );
  }

  if (!multimedia.imagen_url || imageError) {
    return (
      <AspectRatio ratio={16 / 9} className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg mb-4 flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={16 / 9} className="mb-4 rounded-lg overflow-hidden bg-muted">
      <img
        src={multimedia.imagen_url}
        alt="Imagen de receta"
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </AspectRatio>
  );
}
