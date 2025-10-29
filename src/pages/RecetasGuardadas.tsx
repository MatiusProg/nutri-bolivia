import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SistemaCalificaciones } from '@/components/recetas/SistemaCalificaciones';

interface RecetaGuardada {
  id: string;
  nombre: string;
  descripcion: string;
  tiempo_preparacion: number | null;
  dificultad: string | null;
  contador_likes: number;
  created_at: string;
  fecha_guardado: string;
  perfil: {
    nombre_completo: string | null;
    avatar_url: string | null;
  };
}

const RecetasGuardadas = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recetas, setRecetas] = useState<RecetaGuardada[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      cargarRecetasGuardadas();
    }
  }, [user]);

  const cargarRecetasGuardadas = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Obtener IDs de recetas guardadas
      const { data: interacciones, error: errorInteracciones } = await (supabase as any)
        .from('recetas_interacciones')
        .select('receta_id, created_at')
        .eq('usuario_id', user.id)
        .eq('tipo', 'guardar')
        .order('created_at', { ascending: false });

      if (errorInteracciones) throw errorInteracciones;

      if (!interacciones || interacciones.length === 0) {
        setRecetas([]);
        setLoading(false);
        return;
      }

      // Obtener datos completos de las recetas
      const recetaIds = interacciones.map((i: any) => i.receta_id);
      const { data: recetasData, error: errorRecetas } = await (supabase as any)
        .from('recetas')
        .select(`
          *,
          perfil:perfiles!recetas_usuario_id_fkey(
            nombre_completo,
            avatar_url
          )
        `)
        .in('id', recetaIds);

      if (errorRecetas) throw errorRecetas;

      // Combinar datos con fecha de guardado
      const recetasConFecha = (recetasData || []).map((receta: any) => {
        const interaccion = interacciones?.find((i: any) => i.receta_id === receta.id);
        return {
          ...receta,
          fecha_guardado: interaccion?.created_at || receta.created_at
        };
      });

      // Ordenar por fecha de guardado
      recetasConFecha.sort((a: any, b: any) => 
        new Date(b.fecha_guardado).getTime() - new Date(a.fecha_guardado).getTime()
      );

      setRecetas(recetasConFecha);
    } catch (error) {
      console.error('Error cargando recetas guardadas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las recetas guardadas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverGuardado = async (recetaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('recetas_interacciones')
        .delete()
        .eq('receta_id', recetaId)
        .eq('usuario_id', user.id)
        .eq('tipo', 'guardar');

      if (error) throw error;

      setRecetas(prev => prev.filter(r => r.id !== recetaId));
      
      toast({
        title: 'Receta removida',
        description: 'La receta se eliminó de tus guardados',
      });
    } catch (error) {
      console.error('Error removiendo guardado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo remover la receta',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Inicia sesión para ver tus recetas guardadas
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mis Recetas Guardadas</h1>
        <p className="text-muted-foreground">
          {recetas.length} {recetas.length === 1 ? 'receta guardada' : 'recetas guardadas'}
        </p>
      </div>

      {recetas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No tienes recetas guardadas</h3>
            <p className="text-muted-foreground mb-6">
              Explora la comunidad y guarda tus recetas favoritas
            </p>
            <Button onClick={() => navigate('/comunidad')}>
              Explorar Comunidad
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recetas.map((receta) => (
            <Card
              key={receta.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/receta/${receta.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{receta.nombre}</CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleRemoverGuardado(receta.id, e)}
                  >
                    <Bookmark className="h-4 w-4 fill-current" />
                  </Button>
                </div>
                <CardDescription className="line-clamp-2">
                  {receta.descripcion}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {receta.dificultad && (
                      <Badge variant="secondary">
                        {receta.dificultad === 'facil' ? 'Fácil' : 
                         receta.dificultad === 'medio' ? 'Medio' : 'Difícil'}
                      </Badge>
                    )}
                    {receta.tiempo_preparacion && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {receta.tiempo_preparacion} min
                      </Badge>
                    )}
                  </div>

                  <SistemaCalificaciones recetaId={receta.id} />

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {receta.contador_likes} likes
                    </div>
                    <div>
                      Por: {receta.perfil?.nombre_completo || 'Usuario'}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Guardada el {new Date(receta.fecha_guardado).toLocaleDateString('es-BO')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecetasGuardadas;
