import { useState } from 'react';
import { Copy, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client-unsafe';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LIMITE_RECETAS_PRIVADAS } from '@/types/receta.types';

interface CopiarRecetaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recetaOriginal: {
    id: string;
    nombre: string;
    descripcion?: string;
    ingredientes: any[];
    dificultad?: string;
    tiempo_preparacion?: number;
    etiquetas?: string[];
    nutrientes_totales: any;
    autor_nombre?: string;
  };
}

export function CopiarRecetaModal({ open, onOpenChange, recetaOriginal }: CopiarRecetaModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState(`Copia de ${recetaOriginal.nombre}`);
  const [descripcion, setDescripcion] = useState(
    recetaOriginal.descripcion 
      ? `${recetaOriginal.descripcion}\n\n✨ Receta inspirada en ${recetaOriginal.autor_nombre || 'la comunidad'}`
      : `✨ Receta inspirada en ${recetaOriginal.autor_nombre || 'la comunidad'}`
  );

  const handleCopiar = async () => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para copiar recetas',
        variant: 'destructive'
      });
      return;
    }

    if (!nombre.trim()) {
      toast({
        title: 'Nombre requerido',
        description: 'La receta debe tener un nombre',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Verificar límite de recetas privadas
      const { data: recetasUsuario, error: countError } = await supabase
        .from('recetas')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('visibilidad', 'privada');

      if (countError) throw countError;

      if (recetasUsuario && recetasUsuario.length >= LIMITE_RECETAS_PRIVADAS) {
        toast({
          title: 'Límite alcanzado',
          description: `Ya tienes ${LIMITE_RECETAS_PRIVADAS} recetas privadas. Haz pública alguna para copiar más.`,
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }

      // Crear copia de la receta
      const nuevaReceta = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        ingredientes: recetaOriginal.ingredientes,
        nutrientes_totales: recetaOriginal.nutrientes_totales,
        visibilidad: 'privada',
        usuario_id: user.id,
        dificultad: recetaOriginal.dificultad || null,
        tiempo_preparacion: recetaOriginal.tiempo_preparacion || null,
        etiquetas: recetaOriginal.etiquetas || [],
        receta_original_id: recetaOriginal.id,
      };

      const { data: recetaCreada, error: insertError } = await supabase
        .from('recetas')
        .insert(nuevaReceta)
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: '¡Receta copiada!',
        description: 'La receta se ha copiado a tus recetas privadas'
      });

      onOpenChange(false);
      navigate(`/receta/${recetaCreada.id}`);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo copiar la receta',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-primary" />
            Copiar Receta
          </DialogTitle>
          <DialogDescription>
            Crea una copia personalizable de esta receta en tus recetas privadas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la receta *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Mi versión de..."
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              {nombre.length}/100 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Añade tus notas o modificaciones..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {descripcion.length}/500 caracteres
            </p>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Nota:</strong> La receta se creará como privada. Podrás editarla
              y hacerla pública desde "Mis Recetas".
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleCopiar} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Copiando...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar Receta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
