import { useState, useEffect } from 'react';
import { Users, Heart, Bookmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface RecetaPublica {
  id: string;
  nombre: string;
  descripcion: string;
  nutrientes_totales: {
    energia_kcal: number;
    proteina_g: number;
    grasa_total_g: number;
    carbohidratos_totales_g: number;
  };
  likes_count: number;
  guardados_count: number;
  created_at: string;
  perfiles: {
    nombre_completo: string;
    avatar_url: string;
  };
  usuario_id: string;
}

interface UserInteraction {
  liked: boolean;
  saved: boolean;
}

export default function Comunidad() {
  const { user } = useAuth();
  const [recetas, setRecetas] = useState<RecetaPublica[]>([]);
  const [interactions, setInteractions] = useState<Record<string, UserInteraction>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadRecetas();
    if (user) {
      loadUserInteractions();
    }
  }, [user]);

  const loadRecetas = async () => {
    try {
      const { data, error } = await supabase
        .from('recetas')
        .select(`
          *,
          perfiles:usuario_id (
            nombre_completo,
            avatar_url
          )
        `)
        .eq('visibilidad', 'publica')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecetas(data || []);
    } catch (error) {
      console.error('Error cargando recetas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las recetas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserInteractions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('recetas_interacciones')
        .select('receta_id, ha_dado_like, ha_guardado')
        .eq('usuario_id', user.id);

      if (error) throw error;

      const interactionsMap: Record<string, UserInteraction> = {};
      data?.forEach(item => {
        interactionsMap[item.receta_id] = {
          liked: item.ha_dado_like,
          saved: item.ha_guardado,
        };
      });

      setInteractions(interactionsMap);
    } catch (error) {
      console.error('Error cargando interacciones:', error);
    }
  };

  const handleLike = async (recetaId: string) => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para dar like',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(recetaId + '-like');
    const currentLiked = interactions[recetaId]?.liked || false;

    try {
      if (currentLiked) {
        // Remove like
        await supabase
          .from('recetas_interacciones')
          .update({ ha_dado_like: false })
          .eq('usuario_id', user.id)
          .eq('receta_id', recetaId);
      } else {
        // Add like
        await supabase
          .from('recetas_interacciones')
          .upsert({
            usuario_id: user.id,
            receta_id: recetaId,
            ha_dado_like: true,
          });
      }

      setInteractions({
        ...interactions,
        [recetaId]: {
          ...interactions[recetaId],
          liked: !currentLiked,
        },
      });

      // Update local count
      setRecetas(recetas.map(r => 
        r.id === recetaId 
          ? { ...r, likes_count: r.likes_count + (currentLiked ? -1 : 1) }
          : r
      ));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo dar like',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async (recetaId: string) => {
    if (!user) {
      toast({
        title: 'Inicia sesión',
        description: 'Debes iniciar sesión para guardar recetas',
        variant: 'destructive',
      });
      return;
    }

    setActionLoading(recetaId + '-save');
    const currentSaved = interactions[recetaId]?.saved || false;

    try {
      if (currentSaved) {
        await supabase
          .from('recetas_interacciones')
          .update({ ha_guardado: false })
          .eq('usuario_id', user.id)
          .eq('receta_id', recetaId);
      } else {
        await supabase
          .from('recetas_interacciones')
          .upsert({
            usuario_id: user.id,
            receta_id: recetaId,
            ha_guardado: true,
          });
      }

      setInteractions({
        ...interactions,
        [recetaId]: {
          ...interactions[recetaId],
          saved: !currentSaved,
        },
      });

      toast({
        title: currentSaved ? 'Receta removida' : 'Receta guardada',
        description: currentSaved ? 'Se removió de tus guardados' : 'Se guardó en tu colección',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Recetas de la Comunidad
            </h1>
            <p className="text-muted-foreground mt-1">
              Descubre recetas creadas por otros usuarios
            </p>
          </div>
        </div>
      </div>

      {recetas.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">No hay recetas públicas aún</h3>
          <p className="text-muted-foreground">
            Sé el primero en compartir una receta con la comunidad
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recetas.map((receta) => {
            const userLiked = interactions[receta.id]?.liked || false;
            const userSaved = interactions[receta.id]?.saved || false;

            return (
              <Card key={receta.id} className="p-6 hover:shadow-lg transition-all">
                {/* Creator Info */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={receta.perfiles?.avatar_url} />
                    <AvatarFallback>
                      {receta.perfiles?.nombre_completo?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {receta.perfiles?.nombre_completo || 'Usuario'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(receta.created_at).toLocaleDateString('es-BO')}
                    </p>
                  </div>
                </div>

                {/* Recipe Info */}
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{receta.nombre}</h3>
                {receta.descripcion && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {receta.descripcion}
                  </p>
                )}

                {/* Nutrients */}
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Energía</p>
                    <p className="font-semibold">
                      {receta.nutrientes_totales?.energia_kcal?.toFixed(0) || 0} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Proteínas</p>
                    <p className="font-semibold">
                      {receta.nutrientes_totales?.proteina_g?.toFixed(1) || 0}g
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant={userLiked ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleLike(receta.id)}
                    disabled={actionLoading === receta.id + '-like'}
                  >
                    {actionLoading === receta.id + '-like' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Heart className={`h-4 w-4 ${userLiked ? 'fill-current' : ''}`} />
                    )}
                    {receta.likes_count || 0}
                  </Button>
                  
                  <Button
                    variant={userSaved ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleSave(receta.id)}
                    disabled={actionLoading === receta.id + '-save'}
                  >
                    {actionLoading === receta.id + '-save' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Bookmark className={`h-4 w-4 ${userSaved ? 'fill-current' : ''}`} />
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
