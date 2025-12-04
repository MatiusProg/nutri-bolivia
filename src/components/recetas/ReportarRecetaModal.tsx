import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client-unsafe';
import { useAuth } from '@/hooks/useAuth';
import { MOTIVOS_REPORTE, MotivoReporte } from '@/types/reportes.types';

interface ReportarRecetaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recetaId: string;
  recetaNombre: string;
}

export function ReportarRecetaModal({
  open,
  onOpenChange,
  recetaId,
  recetaNombre,
}: ReportarRecetaModalProps) {
  const { user } = useAuth();
  const [motivo, setMotivo] = useState<MotivoReporte | ''>('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para reportar',
        variant: 'destructive',
      });
      return;
    }

    if (!motivo) {
      toast({
        title: 'Error',
        description: 'Selecciona un motivo para el reporte',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('reportes_recetas').insert({
        receta_id: recetaId,
        usuario_reportador_id: user.id,
        motivo: motivo,
        descripcion: descripcion.trim() || null,
      });

      if (error) throw error;

      toast({
        title: 'Reporte enviado',
        description: 'Tu reporte será revisado por nuestro equipo. Gracias por ayudarnos a mantener la comunidad segura.',
      });

      // Reset form
      setMotivo('');
      setDescripcion('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error al reportar:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo enviar el reporte',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" />
            Reportar Receta
          </DialogTitle>
          <DialogDescription>
            Reportar: <span className="font-medium">{recetaNombre}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo del reporte *</Label>
            <Select
              value={motivo}
              onValueChange={(value) => setMotivo(value as MotivoReporte)}
            >
              <SelectTrigger id="motivo">
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MOTIVOS_REPORTE).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción adicional (opcional)</Label>
            <Textarea
              id="descripcion"
              placeholder="Proporciona más detalles sobre el problema..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {descripcion.length}/500
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !motivo}
            variant="destructive"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar Reporte'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
