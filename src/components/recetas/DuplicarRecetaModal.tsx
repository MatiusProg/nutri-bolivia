import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { IRecetaConPerfil, TVisibilidad } from '@/types/receta.types';

interface DuplicarRecetaModalProps {
  receta: IRecetaConPerfil;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DuplicarRecetaModal = ({ receta, open, onOpenChange }: DuplicarRecetaModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [incluirMencion, setIncluirMencion] = useState(true);
  
  const [formData, setFormData] = useState({
    nombre: `Copia de ${receta.nombre}`,
    descripcion: receta.descripcion || '',
    visibilidad: 'privada' as TVisibilidad,
  });

  const handleDuplicar = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para copiar recetas',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.nombre.trim()) {
      toast({
        title: 'Error',
        description: 'El nombre de la receta es obligatorio',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      // Verificar límite de recetas privadas si la nueva receta es privada
      if (formData.visibilidad === 'privada') {
        const { data: recetasPrivadas } = await (supabase as any)
          .from('recetas')
          .select('id')
          .eq('usuario_id', user.id)
          .eq('visibilidad', 'privada');

        if (recetasPrivadas && recetasPrivadas.length >= 5) {
          toast({
            title: 'Límite alcanzado',
            description: 'Has alcanzado el límite de 5 recetas privadas. Cambia alguna a pública o elimina una.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      // Construir descripción con mención al autor original
      let descripcionFinal = formData.descripcion;
      if (incluirMencion) {
        const autorNombre = receta.perfil?.nombre_completo || 'Autor original';
        const mencion = `\n\n---\n📝 Receta original de: ${autorNombre}`;
        descripcionFinal = descripcionFinal + mencion;
      }

      // Crear la receta duplicada
      const { data: nuevaReceta, error } = await (supabase as any)
        .from('recetas')
        .insert({
          usuario_id: user.id,
          nombre: formData.nombre,
          descripcion: descripcionFinal,
          ingredientes: receta.ingredientes,
          nutrientes_totales: receta.nutrientes_totales,
          visibilidad: formData.visibilidad,
          es_duplicada: true,
          receta_original_id: receta.id,
          tiempo_preparacion: receta.tiempo_preparacion,
          dificultad: receta.dificultad,
          etiquetas: receta.etiquetas,
        })
        .select()
        .single();

      if (error) throw error;

      if (!error && nuevaReceta) {
        // Incrementar contador de guardados de la receta original
        await (supabase as any)
          .from('recetas')
          .update({ 
            contador_guardados: (receta.contador_guardados || 0) + 1 
          })
          .eq('id', receta.id);

        toast({
          title: '¡Receta copiada!',
          description: 'La receta se copió exitosamente a tu colección',
        });

        onOpenChange(false);
        navigate(`/receta/${nuevaReceta.id}`);
      }
    } catch (error) {
      console.error('Error duplicando receta:', error);
      toast({
        title: 'Error',
        description: 'No se pudo copiar la receta. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Copiar Receta</DialogTitle>
          <DialogDescription>
            Crea una copia de "{receta.nombre}" para editarla y personalizarla
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la receta</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Mi versión de..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe tu versión de la receta..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibilidad">Visibilidad</Label>
            <Select
              value={formData.visibilidad}
              onValueChange={(value: TVisibilidad) => 
                setFormData({ ...formData, visibilidad: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="privada">Privada (solo yo)</SelectItem>
                <SelectItem value="publica">Pública (todos pueden ver)</SelectItem>
                <SelectItem value="enlace">Enlace (solo con link)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.visibilidad === 'privada' && 
                'Solo tú podrás ver esta receta (límite: 5 recetas privadas)'}
              {formData.visibilidad === 'publica' && 
                'Todos los usuarios podrán ver tu receta en la comunidad'}
              {formData.visibilidad === 'enlace' && 
                'Solo usuarios con el enlace podrán ver la receta'}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="mencion"
              checked={incluirMencion}
              onCheckedChange={(checked) => setIncluirMencion(checked as boolean)}
            />
            <Label
              htmlFor="mencion"
              className="text-sm font-normal cursor-pointer"
            >
              Incluir mención al autor original
            </Label>
          </div>

          {incluirMencion && (
            <div className="bg-muted p-3 rounded-md text-sm">
              <p className="text-muted-foreground">
                Se agregará al final de la descripción:
              </p>
              <p className="mt-1 italic">
                "📝 Receta original de: {receta.perfil?.nombre_completo || 'Autor original'}"
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleDuplicar} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Copiando...
              </>
            ) : (
              'Crear Copia'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DuplicarRecetaModal;
