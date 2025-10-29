import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Loader2, Search, Clock, ChefHat, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SistemaCalificaciones } from '@/components/recetas/SistemaCalificaciones';
import { IRecetaConPerfil, TDificultad, DIFICULTADES } from '@/types/receta.types';

export default function RecetasGuardadas() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recetas, setRecetas] = useState<IRecetaConPerfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  
  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroDificultad, setFiltroDificultad] = useState<TDificultad | 'todas'>('todas');
  const [ordenarPor, setOrdenarPor] = useState<'fecha' | 'popularidad' | 'tiempo'>('fecha');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadRecetasGuardadas();
  }, [user]);

  const loadRecetasGuardadas = async () => {
    if (!user) return;
    
    try {
      // 1. Obtener IDs de recetas guardadas
      const { data: guardados, error: errorGuardados } = await (supabase as any)
        .from('recetas_interacciones')
        .select('receta_id')
        .eq('usuario_id', user.id)
        .eq('tipo', 'guardar');

      if (errorGuardados) throw errorGuardados;
      if (!guardados || guardados.length === 0) {
        setRecetas([]);
        setLoading(false);
        return;
      }

      const recetaIds = guardados.map((g: any) => g.receta_id);

      // 2. Obtener recetas desde la vista
      const { data: recetasData, error: errorRecetas } = await (supabase as any)
        .from('recetas_comunidad')
        .select('*')
        .in('id', recetaIds)
        .order('created_at', { ascending: false });

      if (errorRecetas) throw errorRecetas;

      // 3. Adaptar datos al tipo esperado
      const recetasAdaptadas = (recetasData as any[])?.map((receta: any) => ({
        ...receta,
        perfil: {
          nombre_completo: receta.autor_nombre,
          avatar_url: receta.autor_avatar,
          email: ''
        }
      })) || [];

      setRecetas(recetasAdaptadas);
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las recetas guardadas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuitarGuardado = async (recetaId: string) => {
    if (!user) return;
    
    setActionLoading({ ...actionLoading, [recetaId]: true });
    try {
      await (supabase as any)
        .from('recetas_interacciones')
        .delete()
        .eq('receta_id', recetaId)
        .eq('usuario_id', user.id)
        .eq('tipo', 'guardar');

      setRecetas(recetas.filter(r => r.id !== recetaId));
      toast({
        title: 'Receta eliminada',
        description: 'La receta ha sido quitada de guardadas'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setActionLoading({ ...actionLoading, [recetaId]: false });
    }
  };

  const recetasFiltradas = useMemo(() => {
    let resultado = [...recetas];
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase();
      resultado = resultado.filter(r => 
        r.nombre.toLowerCase().includes(b) || 
        r.descripcion?.toLowerCase().includes(b)
      );
    }
    if (filtroDificultad !== 'todas') {
      resultado = resultado.filter(r => r.dificultad === filtroDificultad);
    }
    resultado.sort((a, b) => {
      if (ordenarPor === 'popularidad') {
        return (b.contador_likes + b.contador_guardados) - (a.contador_likes + a.contador_guardados);
      }
      if (ordenarPor === 'tiempo') {
        return (a.tiempo_preparacion || 9999) - (b.tiempo_preparacion || 9999);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return resultado;
  }, [recetas, busqueda, filtroDificultad, ordenarPor]);

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
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Bookmark className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Recetas Guardadas
            </h1>
            <p className="text-muted-foreground mt-1">
              {recetas.length} {recetas.length === 1 ? 'receta guardada' : 'recetas guardadas'}
            </p>
          </div>
        </div>

        {recetas.length > 0 && (
          <div className="grid md:grid-cols-4 gap-4">
            <div className="col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar recetas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroDificultad} onValueChange={(v) => setFiltroDificultad(v as any)}>
              <SelectTrigger><SelectValue placeholder="Dificultad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {Object.entries(DIFICULTADES).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={ordenarPor} onValueChange={(v) => setOrdenarPor(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fecha">Más recientes</SelectItem>
                <SelectItem value="popularidad">Más populares</SelectItem>
                <SelectItem value="tiempo">Menos tiempo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {recetasFiltradas.length === 0 ? (
        <Card className="p-12 text-center">
          <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">No hay recetas guardadas</h3>
          <p className="text-muted-foreground mb-6">
            {busqueda || filtroDificultad !== 'todas' 
              ? 'No se encontraron recetas con esos filtros'
              : 'Explora la comunidad y guarda tus recetas favoritas'
            }
          </p>
          {!busqueda && filtroDificultad === 'todas' && (
            <Button onClick={() => navigate('/comunidad')}>
              Explorar Comunidad
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recetasFiltradas.map((receta) => (
            <Card
              key={receta.id}
              className="p-6 hover:shadow-lg transition-all flex flex-col relative group"
            >
              {/* Botón de quitar guardado */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuitarGuardado(receta.id);
                }}
                disabled={actionLoading[receta.id]}
              >
                {actionLoading[receta.id] ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>

              <div
                className="cursor-pointer flex flex-col flex-1"
                onClick={() => navigate(`/receta/${receta.id}`)}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={receta.perfil?.avatar_url || undefined} />
                    <AvatarFallback>
                      {receta.perfil?.nombre_completo?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {receta.perfil?.nombre_completo || receta.perfil?.email || 'Usuario'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {receta.dificultad && (
                        <Badge variant="outline" className="text-xs">
                          {DIFICULTADES[receta.dificultad]}
                        </Badge>
                      )}
                      {receta.tiempo_preparacion && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {receta.tiempo_preparacion} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 line-clamp-2">{receta.nombre}</h3>
                {receta.descripcion && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {receta.descripcion}
                  </p>
                )}

                <div className="mb-4">
                  <SistemaCalificaciones 
                    recetaId={receta.id} 
                    tamaño="sm" 
                    mostrarEstadisticas={false} 
                  />
                </div>

                <div className="flex gap-2 mt-auto text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <ChefHat className="h-4 w-4" />
                    {receta.contador_likes || 0} likes
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark className="h-4 w-4" />
                    {receta.contador_guardados || 0} guardados
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
