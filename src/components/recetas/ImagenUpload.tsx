import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

import { supabase } from '@/integrations/supabase/client-unsafe';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ImagenUploadProps {
  recetaId?: string;
  imagenActual?: string | null;
  onImagenCargada: (url: string, storagePath: string) => void;
  onImagenEliminada: () => void;
}

export function ImagenUpload({
  recetaId,
  imagenActual,
  onImagenCargada,
  onImagenEliminada
}: ImagenUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(imagenActual || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Reducir tamaño si es mayor a 1920px
          const maxSize = 1920;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para subir imágenes.',
        variant: 'destructive',
      });
      return;
    }

    console.log('📸 Iniciando subida de imagen:', { fileName: file.name, size: file.size });

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Formato no válido',
        description: 'Solo se aceptan imágenes JPG, PNG o WEBP',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'La imagen no debe superar los 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Comprimir imagen
      console.log('🔄 Comprimiendo imagen...');
      const compressedFile = await compressImage(file);
      console.log('✅ Imagen comprimida:', { size: compressedFile.size });

      // Crear preview
      const objectUrl = URL.createObjectURL(compressedFile);
      setPreview(objectUrl);

      // Subir a Storage
      const fileName = `${user.id}/${Date.now()}_${compressedFile.name}`;
      console.log('⬆️ Subiendo a bucket recetas-imagenes:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recetas-imagenes')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('❌ Error en upload:', uploadError);
        throw uploadError;
      }
      
      console.log('✅ Upload exitoso:', uploadData);

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('recetas-imagenes')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData.publicUrl;

      // Guardar referencia en la tabla si hay recetaId
      if (recetaId) {
        const { error: dbError } = await supabase
          .from('recetas_imagenes')
          .insert({
            receta_id: recetaId,
            imagen_url: publicUrl,
            storage_path: fileName,
            usuario_id: user.id,
            es_principal: true,
          });

        if (dbError) throw dbError;
      }

      onImagenCargada(publicUrl, fileName);

      toast({
        title: 'Imagen subida',
        description: 'La imagen se ha cargado correctamente',
      });
    } catch (error: any) {
      console.error('Error subiendo imagen:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo subir la imagen',
        variant: 'destructive',
      });
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!preview) return;

    try {
      // Si hay recetaId, eliminar de la base de datos
      if (recetaId) {
        await supabase
          .from('recetas_imagenes')
          .delete()
          .eq('receta_id', recetaId)
          .eq('usuario_id', user?.id);
      }

      setPreview(null);
      onImagenEliminada();

      toast({
        title: 'Imagen eliminada',
        description: 'La imagen ha sido eliminada',
      });
    } catch (error: any) {
      console.error('Error eliminando imagen:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la imagen',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-3">
      <Label>Imagen de la receta</Label>
      
      {preview ? (
        <Card className="relative overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </Card>
      ) : (
        <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
          <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 text-muted-foreground animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click para seleccionar imagen
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG o WEBP • Máx 5MB
                </p>
              </>
            )}
          </label>
        </Card>
      )}
    </div>
  );
}
