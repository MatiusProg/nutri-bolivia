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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LIMITE_RECETAS_PRIVADAS, TVisibilidad } from '@/types/receta.types';

interface CopiarRecetaModalProps {
  receta: {
    id: string;
    nombre: string;
    descripcion: string | null;
    ingredientes: any[];
    nutrientes_totales: any;
    tiempo_preparacion: number | null;
    dificultad: string | null;
    etiquetas: string[] | null;
    perfil?: {
      nombre_completo: string | null;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CopiarRecetaModal({ receta, open, onOpenChange }: CopiarRecetaModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState(`Copia de ${receta.nombre}`);
  const [descripcion, setDescripcion] = useState(
    `Receta basada en "${receta.nombre}"${receta.perfil?.nombre_completo ? ` de ${receta.perfil.nombre_completo}` : ''}`
  );
  const [visibilidad, setVisibilidad] = useState<TVisibilidad>('privada');

  const validarLimiteRecetas = async (): Promise<boolean> => {
    if (visibilidad !== 'privada' || !user) return true;

    try {
      const { count, error } = await (supabase as any)
        .from('recetas')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', user.id)
        .eq('visibilidad', 'privada');

      if (error) throw error;

      if (count !== null && count >= LIMITE_RECETAS_PRIVADAS) {
        toast({
          title: 'Límite alcanzado',
          description: `Has alcanzado el límite de ${LIMITE_RECETAS_PRIVADAS} recetas privadas. Elimina alguna o haz la nueva receta pública.`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  };

  const handleCopiar = async () => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para copiar recetas',
        variant: 'destructive',
      });
      return;
    }

    if (!nombre.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre es obligatorio',
        variant: 'destructive',
      });
      return;
    }

    const puedeCrear = await validarLimiteRecetas();
    if (!puedeCrear) return;

    setLoading(true);
    try {
      const { data: nuevaReceta, error } = await (supabase as any)
        .from('recetas')
        .insert({
          usuario_id: user.id,
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          ingredientes: receta.ingredientes,
          nutrientes_totales: receta.nutrientes_totales,
          visibilidad: visibilidad,
          es_duplicada: true,
          receta_original_id: receta.id,
          tiempo_preparacion: receta.tiempo_preparacion,
          dificultad: receta.dificultad,
          etiquetas: receta.etiquetas,
          contador_likes: 0,
          contador_guardados: 0,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Receta copiada',
        description: 'La receta ha sido copiada exitosamente',
      });

      onOpenChange(false);
      
      // Redirigir a la nueva receta para edición
      navigate(`/receta/${nuevaReceta.id}`);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo copiar la receta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Copiar Receta
          </DialogTitle>
          <DialogDescription>
            Crea una copia personalizada de esta receta. Podrás editarla después.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la receta</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de tu receta"
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Añade una descripción personalizada..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Puedes incluir créditos al autor original
            </p>
          </div>

          <div className="space-y-2">
            <Label>Visibilidad</Label>
            <RadioGroup value={visibilidad} onValueChange={(v) => setVisibilidad(v as TVisibilidad)}>
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="privada" id="privada" />
                <Label htmlFor="privada" className="flex-1 cursor-pointer">
                  <div className="font-medium">Privada</div>
                  <div className="text-sm text-muted-foreground">
                    Solo tú podrás ver esta receta
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-3">
                <RadioGroupItem value="publica" id="publica" />
                <Label htmlFor="publica" className="flex-1 cursor-pointer">
                  <div className="font-medium">Pública</div>
                  <div className="text-sm text-muted-foreground">
                    Visible en la comunidad
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Nota importante:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>La copia incluirá todos los ingredientes y nutrientes</li>
              <li>Podrás editar la receta después de crearla</li>
              <li>Límite de {LIMITE_RECETAS_PRIVADAS} recetas privadas por usuario</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleCopiar} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Copiando...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copiar Receta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
