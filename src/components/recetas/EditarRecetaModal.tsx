import { useState, useEffect } from 'react';
import { Loader2, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  IReceta, 
  TVisibilidad, 
  TDificultad, 
  LIMITE_RECETAS_PRIVADAS,
  DIFICULTADES,
  ETIQUETAS_DISPONIBLES 
} from '@/types/receta.types';

interface EditarRecetaModalProps {
  receta: IReceta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecetaActualizada: () => void;
  recetasPrivadasCount: number;
}

export function EditarRecetaModal({
  receta,
  open,
  onOpenChange,
  onRecetaActualizada,
  recetasPrivadasCount,
}: EditarRecetaModalProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [visibilidad, setVisibilidad] = useState<TVisibilidad>('privada');
  const [tiempoPreparacion, setTiempoPreparacion] = useState<string>('');
  const [dificultad, setDificultad] = useState<TDificultad | ''>('');
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([]);

  // Cargar datos de la receta cuando se abre el modal
  useEffect(() => {
    if (receta && open) {
      setNombre(receta.nombre);
      setDescripcion(receta.descripcion || '');
      setVisibilidad(receta.visibilidad);
      setTiempoPreparacion(receta.tiempo_preparacion?.toString() || '');
      setDificultad(receta.dificultad || '');
      setEtiquetasSeleccionadas(receta.etiquetas || []);
    }
  }, [receta, open]);

  const validarLimiteRecetas = (): boolean => {
    // Si ya es privada, no hay problema
    if (receta?.visibilidad === 'privada' && visibilidad === 'privada') {
      return true;
    }
    
    // Si está cambiando a privada y ya alcanzó el límite
    if (visibilidad === 'privada' && recetasPrivadasCount >= LIMITE_RECETAS_PRIVADAS) {
      toast({
        title: 'Límite alcanzado',
        description: `Ya tienes ${LIMITE_RECETAS_PRIVADAS} recetas privadas. Haz pública alguna para liberar espacio.`,
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };

  const handleGuardar = async () => {
    if (!receta) return;

    // Validaciones
    if (!nombre.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre de la receta es obligatorio',
        variant: 'destructive',
      });
      return;
    }

    if (!validarLimiteRecetas()) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('recetas')
        .update({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          visibilidad,
          tiempo_preparacion: tiempoPreparacion ? parseInt(tiempoPreparacion) : null,
          dificultad: dificultad || null,
          etiquetas: etiquetasSeleccionadas.length > 0 ? etiquetasSeleccionadas : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', receta.id);

      if (error) throw error;

      toast({
        title: 'Receta actualizada',
        description: 'Los cambios se guardaron exitosamente',
      });

      onRecetaActualizada();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la receta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async () => {
    if (!receta) return;

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('recetas')
        .delete()
        .eq('id', receta.id);

      if (error) throw error;

      toast({
        title: 'Receta eliminada',
        description: 'La receta ha sido eliminada exitosamente',
      });

      onRecetaActualizada();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la receta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const toggleEtiqueta = (etiqueta: string) => {
    setEtiquetasSeleccionadas(prev =>
      prev.includes(etiqueta)
        ? prev.filter(e => e !== etiqueta)
        : [...prev, etiqueta]
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Receta</DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu receta
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la receta *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Ensalada tropical"
                maxLength={100}
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe tu receta..."
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Visibilidad */}
            <div className="space-y-2">
              <Label htmlFor="visibilidad">Visibilidad</Label>
              <Select value={visibilidad} onValueChange={(v) => setVisibilidad(v as TVisibilidad)}>
                <SelectTrigger id="visibilidad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="privada">🔒 Privada</SelectItem>
                  <SelectItem value="publica">🌐 Pública</SelectItem>
                  <SelectItem value="enlace">🔗 Solo con enlace</SelectItem>
                </SelectContent>
              </Select>
              {visibilidad === 'privada' && (
                <p className="text-xs text-muted-foreground">
                  Recetas privadas: {recetasPrivadasCount}/{LIMITE_RECETAS_PRIVADAS}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tiempo de preparación */}
              <div className="space-y-2">
                <Label htmlFor="tiempo">Tiempo (minutos)</Label>
                <Input
                  id="tiempo"
                  type="number"
                  value={tiempoPreparacion}
                  onChange={(e) => setTiempoPreparacion(e.target.value)}
                  placeholder="30"
                  min="1"
                  max="999"
                />
              </div>

              {/* Dificultad */}
              <div className="space-y-2">
                <Label htmlFor="dificultad">Dificultad</Label>
                <Select value={dificultad} onValueChange={(v) => setDificultad(v as TDificultad)}>
                  <SelectTrigger id="dificultad">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFICULTADES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Etiquetas */}
            <div className="space-y-2">
              <Label>Etiquetas</Label>
              <div className="flex flex-wrap gap-2">
                {ETIQUETAS_DISPONIBLES.map((etiqueta) => (
                  <Badge
                    key={etiqueta}
                    variant={etiquetasSeleccionadas.includes(etiqueta) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleEtiqueta(etiqueta)}
                  >
                    {etiqueta}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={loading}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
            
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button onClick={handleGuardar} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar receta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La receta "{receta?.nombre}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
