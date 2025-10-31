import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ChefHat, User, Heart, Bookmark, Loader2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { SistemaCalificaciones } from '@/components/recetas/SistemaCalificaciones';
import { DIFICULTADES } from '@/types/receta.types';
import { Copy } from 'lucide-react';
import { CopiarRecetaModal } from '@/components/recetas/CopiarRecetaModal';

interface Receta {
  id: string;
  nombre: string;
  descripcion: string;
  ingredientes: any[];
  nutrientes_totales: any;
  visibilidad: string;
  tiempo_preparacion: number;
  dificultad: string;
  etiquetas: string[];
  usuario_id: string;
  contador_likes: number;
  contador_guardados: number;
  created_at: string;
  perfil?: {
    nombre_completo: string;
    avatar_url: string;
    email: string;
  };
}

interface IngredienteDetallado {
  nombre: string;
  cantidad_g: number;
  alimento?: any;
  nutrientes: {
    energia_kcal: number;
    proteinas_g: number;
    grasas_g: number;
    hidratoscarbonototal_g: number;
    fibracruda_g: number;
  };
}

export default function RecetaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [receta, setReceta] = useState<Receta | null>(null);
  const [ingredientesDetallados, setIngredientesDetallados] = useState<IngredienteDetallado[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  //Nuevos estados
  const [copiarModalOpen, setCopiarModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      cargarReceta();
      if (user) cargarInteracciones();
    }
  }, [id, user]);

  const cargarReceta = async () => {
    try {
      // 1. Obtener receta sin join
      const { data: recetaData, error: recetaError } = await supabase
        .from('recetas')
        .select('*')
        .eq('id', id)
        .single();
  
      if (recetaError) throw recetaError;
      if (!recetaData) {
        toast({ 
          title: 'Receta no encontrada', 
          description: 'La receta que buscas no existe',
          variant: 'destructive' 
        });
        navigate('/comunidad');
        return;
      }
  
      // 2. Obtener perfil por separado
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfiles')
        .select('nombre_completo, avatar_url, email')
        .eq('id', recetaData.usuario_id)
        .single();
  
    // 3. Combinar datos manualmente
    const recetaCompleta = {
      ...recetaData,
      ingredientes: recetaData.ingredientes as unknown as any[],
      nutrientes_totales: recetaData.nutrientes_totales as unknown as any,
      perfil: perfilData || { 
        nombre_completo: 'Usuario', 
        avatar_url: null, 
        email: null 
      }
    };

    setReceta(recetaCompleta);
    await cargarDetalleIngredientes(recetaData.ingredientes as unknown as any[]);
    } catch (error: any) {
      console.error('Error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'No se pudo cargar la receta', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarDetalleIngredientes = async (ingredientes: any[]) => {
    if (!ingredientes || ingredientes.length === 0) return;

    try {
      const ids = ingredientes.map((ing: any) => ing.alimento_id);
      const { data: alimentos } = await supabase
        .from('alimentos')
        .select('*')
        .in('id_alimento', ids);

      const detallados: IngredienteDetallado[] = ingredientes.map((ing: any) => {
        const alimento = alimentos?.find((a: any) => a.id_alimento === ing.alimento_id);
        const factor = ing.cantidad_g / 100;

        return {
          nombre: ing.nombre || alimento?.nombre_alimento || 'Desconocido',
          cantidad_g: ing.cantidad_g,
          alimento,
          nutrientes: {
            energia_kcal: (alimento?.energia_kcal || 0) * factor,
            proteinas_g: (alimento?.proteinas_g || 0) * factor,
            grasas_g: (alimento?.grasas_g || 0) * factor,
            hidratoscarbonototal_g: (alimento?.hidratoscarbonototal_g || 0) * factor,
            fibracruda_g: (alimento?.fibracruda_g || 0) * factor,
          },
        };
      });

      setIngredientesDetallados(detallados);
    } catch (error) {
      console.error('Error cargando ingredientes:', error);
    }
  };

  const cargarInteracciones = async () => {
    if (!user || !id) return;

    try {
      const { data } = await supabase
        .from('recetas_interacciones')
        .select('tipo')
        .eq('receta_id', id)
        .eq('usuario_id', user.id);

      setHasLiked(data?.some((i: any) => i.tipo === 'like') || false);
      setHasSaved(data?.some((i: any) => i.tipo === 'guardar') || false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({ title: 'Inicia sesión', description: 'Debes iniciar sesión para dar like', variant: 'destructive' });
      return;
    }
    if (!receta) return;

    setActionLoading('like');
    try {
      if (hasLiked) {
        await supabase.from('recetas_interacciones').delete().eq('receta_id', receta.id).eq('usuario_id', user.id).eq('tipo', 'like');
        setHasLiked(false);
        setReceta({ ...receta, contador_likes: Math.max(0, receta.contador_likes - 1) });
      } else {
        await supabase.from('recetas_interacciones').insert({ receta_id: receta.id, usuario_id: user.id, tipo: 'like' });
        setHasLiked(true);
        setReceta({ ...receta, contador_likes: receta.contador_likes + 1 });
      }
      await cargarInteracciones();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Inicia sesión', description: 'Debes iniciar sesión para guardar', variant: 'destructive' });
      return;
    }
    if (!receta) return;

    setActionLoading('save');
    try {
      if (hasSaved) {
        await supabase.from('recetas_interacciones').delete().eq('receta_id', receta.id).eq('usuario_id', user.id).eq('tipo', 'guardar');
        setHasSaved(false);
        setReceta({ ...receta, contador_guardados: Math.max(0, receta.contador_guardados - 1) });
      } else {
        await supabase.from('recetas_interacciones').insert({ receta_id: receta.id, usuario_id: user.id, tipo: 'guardar' });
        setHasSaved(true);
        setReceta({ ...receta, contador_guardados: receta.contador_guardados + 1 });
      }
      await cargarInteracciones();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEliminar = async () => {
    if (!receta || !user) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('recetas')
        .delete()
        .eq('id', receta.id)
        .eq('usuario_id', user.id);

      if (error) throw error;

      toast({
        title: 'Receta eliminada',
        description: 'La receta ha sido eliminada exitosamente',
      });

      navigate('/mis-recetas');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la receta',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!receta) {
    return null;
  }

  const esOwner = user?.id === receta.usuario_id;
  const nutrientes = receta.nutrientes_totales || {};
  const pesoTotal = ingredientesDetallados.reduce((sum, ing) => sum + ing.cantidad_g, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-4xl font-bold mb-2">{receta.nombre}</h1>
            {receta.descripcion && (
              <p className="text-lg text-muted-foreground mb-4">{receta.descripcion}</p>
            )}

            {/* Autor */}
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={receta.perfil?.avatar_url || undefined} />
                <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{receta.perfil?.nombre_completo || receta.perfil?.email || 'Usuario'}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(receta.created_at).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap gap-3 mb-4">
              {receta.dificultad && (
                <Badge variant="outline" className="gap-1">
                  <ChefHat className="h-3 w-3" />
                  {DIFICULTADES[receta.dificultad as keyof typeof DIFICULTADES]}
                </Badge>
              )}
              {receta.tiempo_preparacion && (
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {receta.tiempo_preparacion} min
                </Badge>
              )}
              {receta.etiquetas?.map((etiqueta: string) => (
                <Badge key={etiqueta} variant="secondary">{etiqueta}</Badge>
              ))}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2 flex-wrap">
            {esOwner ? (
              <>
                <Button variant="outline" onClick={() => navigate(`/mis-recetas`)} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Editar
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </>
            ) : (
              <>
                {/* ✅ NUEVO: Botón Copiar */}
                <Button
                  variant="outline"
                  onClick={() => setCopiarModalOpen(true)}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Receta
                </Button>
                <Button
                  variant={hasLiked ? 'default' : 'outline'}
                  onClick={handleLike}
                  disabled={actionLoading === 'like'}
                  className="gap-2"
                >
                  {actionLoading === 'like' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${hasLiked ? 'fill-current' : ''}`} />}
                  {receta.contador_likes}
                </Button>
                <Button
                  variant={hasSaved ? 'default' : 'outline'}
                  onClick={handleSave}
                  disabled={actionLoading === 'save'}
                  className="gap-2"
                >
                  {actionLoading === 'save' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className={`h-4 w-4 ${hasSaved ? 'fill-current' : ''}`} />}
                  Guardar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Ingredientes y Desglose Nutricional */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ingredientes */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Ingredientes</h2>
            <div className="space-y-2">
              {ingredientesDetallados.map((ing, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">{ing.nombre}</span>
                  <span className="text-muted-foreground">{ing.cantidad_g}g</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Peso total: <span className="font-semibold text-foreground">{pesoTotal}g</span>
              </p>
            </div>
          </Card>

          {/* Desglose Nutricional por Ingrediente */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Desglose Nutricional por Ingrediente</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingrediente</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Energía</TableHead>
                    <TableHead className="text-right">Proteínas</TableHead>
                    <TableHead className="text-right">Grasas</TableHead>
                    <TableHead className="text-right">Carbohidratos</TableHead>
                    <TableHead className="text-right">Fibra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredientesDetallados.map((ing, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{ing.nombre}</TableCell>
                      <TableCell className="text-right">{ing.cantidad_g}g</TableCell>
                      <TableCell className="text-right">{ing.nutrientes.energia_kcal.toFixed(0)} kcal</TableCell>
                      <TableCell className="text-right">{ing.nutrientes.proteinas_g.toFixed(1)}g</TableCell>
                      <TableCell className="text-right">{ing.nutrientes.grasas_g.toFixed(1)}g</TableCell>
                      <TableCell className="text-right">{ing.nutrientes.hidratoscarbonototal_g.toFixed(1)}g</TableCell>
                      <TableCell className="text-right">{ing.nutrientes.fibracruda_g.toFixed(1)}g</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Nutrientes Totales */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Nutrientes Totales</h2>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Energía Total</p>
                <p className="text-3xl font-bold text-primary">{nutrientes.energia_kcal?.toFixed(0) || 0} kcal</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Proteínas</span>
                  <span className="text-lg font-semibold">{nutrientes.proteinas_g?.toFixed(1) || 0}g</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Carbohidratos</span>
                  <span className="text-lg font-semibold">{nutrientes.hidratoscarbonototal_g?.toFixed(1) || 0}g</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Grasas</span>
                  <span className="text-lg font-semibold">{nutrientes.grasas_g?.toFixed(1) || 0}g</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Fibra</span>
                  <span className="text-lg font-semibold">{nutrientes.fibracruda_g?.toFixed(1) || 0}g</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Calificaciones */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Calificación</h2>
            <SistemaCalificaciones recetaId={receta.id} readonly={esOwner} />
          </Card>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar receta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La receta "{receta.nombre}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEliminar} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
              {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* ✅ NUEVO: Modal de Copiar Receta */}
      {receta && (
        <CopiarRecetaModal
          open={copiarModalOpen}
          onOpenChange={setCopiarModalOpen}
          recetaOriginal={receta}
        />
      )}
    </div>
  );
}
