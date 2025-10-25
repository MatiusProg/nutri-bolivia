import { useState, useEffect } from 'react';
import { User as UserIcon, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Perfil {
  nombre_completo: string;
  avatar_url: string;
  preferencias_dieteticas: any; // Json type from database
}

interface Stats {
  total_recetas: number;
  recetas_privadas: number;
  recetas_publicas: number;
  total_likes: number;
}

export default function Perfil() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [perfil, setPerfil] = useState<Perfil>({
    nombre_completo: '',
    avatar_url: '',
    preferencias_dieteticas: '',
  });
  const [stats, setStats] = useState<Stats>({
    total_recetas: 0,
    recetas_privadas: 0,
    recetas_publicas: 0,
    total_likes: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadProfile();
    loadStats();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('perfiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPerfil({
          nombre_completo: (data as any).nombre_completo || '',
          avatar_url: (data as any).avatar_url || '',
          preferencias_dieteticas: typeof (data as any).preferencias_dieteticas === 'string' 
            ? (data as any).preferencias_dieteticas 
            : JSON.stringify((data as any).preferencias_dieteticas || ''),
        });
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: recetas } = await (supabase as any)
        .from('recetas')
        .select('visibilidad, contador_likes')
        .eq('usuario_id', user?.id);

      if (recetas) {
        const privadas = recetas.filter((r: any) => r.visibilidad === 'privada').length;
        const publicas = recetas.filter((r: any) => r.visibilidad === 'publica').length;
        const likes = recetas.reduce((sum: number, r: any) => sum + (r.contador_likes || 0), 0);

        setStats({
          total_recetas: recetas.length,
          recetas_privadas: privadas,
          recetas_publicas: publicas,
          total_likes: likes,
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from('perfiles')
        .update({
          nombre_completo: perfil.nombre_completo,
          avatar_url: perfil.avatar_url,
          preferencias_dieteticas: perfil.preferencias_dieteticas,
        })
        .eq('id', user?.id);

      if (error) throw error;

      toast({
        title: 'Perfil actualizado',
        description: 'Tus cambios han sido guardados exitosamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-primary/10 rounded-xl">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Mi Perfil
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tu información personal y preferencias
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Estadísticas */}
        <div className="grid sm:grid-cols-4 gap-4">
          <Card className="p-6 text-center">
            <p className="text-3xl font-bold text-primary">{stats.total_recetas}</p>
            <p className="text-sm text-muted-foreground mt-1">Recetas Totales</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-3xl font-bold">{stats.recetas_privadas}/5</p>
            <p className="text-sm text-muted-foreground mt-1">Recetas Privadas</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.recetas_publicas}</p>
            <p className="text-sm text-muted-foreground mt-1">Recetas Públicas</p>
          </Card>
          <Card className="p-6 text-center">
            <p className="text-3xl font-bold text-red-500">{stats.total_likes}</p>
            <p className="text-sm text-muted-foreground mt-1">Likes Recibidos</p>
          </Card>
        </div>

        {/* Información Personal */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Información Personal</h2>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="mt-2 bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input
                id="nombre"
                value={perfil.nombre_completo}
                onChange={(e) => setPerfil({ ...perfil, nombre_completo: e.target.value })}
                placeholder="Tu nombre completo"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="avatar">URL de Avatar</Label>
              <Input
                id="avatar"
                value={perfil.avatar_url}
                onChange={(e) => setPerfil({ ...perfil, avatar_url: e.target.value })}
                placeholder="https://ejemplo.com/avatar.jpg"
                className="mt-2"
              />
              {perfil.avatar_url && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={perfil.avatar_url}
                    alt="Preview"
                    className="h-16 w-16 rounded-full object-cover border-2 border-border"
                    onError={(e) => {
                      e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user?.email;
                    }}
                  />
                  <p className="text-sm text-muted-foreground">Vista previa del avatar</p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="preferencias">Preferencias Dietéticas</Label>
              <Input
                id="preferencias"
                value={perfil.preferencias_dieteticas}
                onChange={(e) => setPerfil({ ...perfil, preferencias_dieteticas: e.target.value })}
                placeholder="Ej: Vegetariano, Sin gluten, etc."
                className="mt-2"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto gap-2"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
