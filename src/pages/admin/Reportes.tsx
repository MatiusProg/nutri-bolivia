import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, XCircle, Clock, Eye, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client-unsafe';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { MOTIVOS_REPORTE, ESTADOS_REPORTE, MotivoReporte, EstadoReporte } from '@/types/reportes.types';

interface ReporteConDetalles {
  id: string;
  receta_id: string;
  usuario_reportador_id: string;
  motivo: MotivoReporte;
  descripcion: string | null;
  estado: EstadoReporte;
  notas_moderacion: string | null;
  created_at: string;
  receta?: {
    nombre: string;
    usuario_id: string;
  };
  reportador?: {
    nombre_completo: string;
    email: string;
  };
}

const estadoIconos = {
  pendiente: <Clock className="h-4 w-4" />,
  en_revision: <Eye className="h-4 w-4" />,
  resuelto: <CheckCircle className="h-4 w-4" />,
  rechazado: <XCircle className="h-4 w-4" />,
};

const estadoColores: Record<EstadoReporte, string> = {
  pendiente: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  en_revision: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  resuelto: 'bg-green-500/10 text-green-500 border-green-500/20',
  rechazado: 'bg-muted text-muted-foreground border-muted',
};

export default function AdminReportes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isStaff, isLoading: rolesLoading } = useUserRole();
  const [reportes, setReportes] = useState<ReporteConDetalles[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoReporte | 'todos'>('pendiente');
  const [actualizando, setActualizando] = useState<string | null>(null);
  const [notasEditando, setNotasEditando] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!rolesLoading && !isStaff) {
      toast({
        title: 'Acceso denegado',
        description: 'No tienes permisos para acceder a esta página',
        variant: 'destructive',
      });
      navigate('/');
    }
  }, [rolesLoading, isStaff, navigate]);

  useEffect(() => {
    if (isStaff) {
      cargarReportes();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroEstado, isStaff]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reportes_recetas')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtroEstado !== 'todos') {
        query = query.eq('estado', filtroEstado);
      }

      const { data: reportesData, error } = await query;

      if (error) throw error;

      // Cargar detalles de recetas y reportadores
      const reportesConDetalles: ReporteConDetalles[] = [];
      
      for (const reporte of reportesData || []) {
        const [recetaRes, reportadorRes] = await Promise.all([
          supabase.from('recetas').select('nombre, usuario_id').eq('id', reporte.receta_id).single(),
          supabase.from('perfiles').select('nombre_completo, email').eq('id', reporte.usuario_reportador_id).single(),
        ]);

        reportesConDetalles.push({
          ...reporte,
          receta: recetaRes.data || undefined,
          reportador: reportadorRes.data || undefined,
        } as ReporteConDetalles);
      }

      setReportes(reportesConDetalles);
    } catch (error: any) {
      console.error('Error cargando reportes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los reportes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (reporteId: string, nuevoEstado: EstadoReporte) => {
    if (!user) return;

    setActualizando(reporteId);
    try {
      const updates: Record<string, any> = {
        estado: nuevoEstado,
        notas_moderacion: notasEditando[reporteId] || null,
      };

      if (nuevoEstado === 'resuelto' || nuevoEstado === 'rechazado') {
        updates.resuelto_por = user.id;
        updates.resuelto_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reportes_recetas')
        .update(updates)
        .eq('id', reporteId);

      if (error) throw error;

      toast({
        title: 'Reporte actualizado',
        description: `Estado cambiado a "${ESTADOS_REPORTE[nuevoEstado]}"`,
      });

      cargarReportes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el reporte',
        variant: 'destructive',
      });
    } finally {
      setActualizando(null);
    }
  };

  if (rolesLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isStaff) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Panel de Moderación</h1>
            <p className="text-muted-foreground">Gestiona los reportes de la comunidad</p>
          </div>
        </div>

        <Select
          value={filtroEstado}
          onValueChange={(value) => setFiltroEstado(value as EstadoReporte | 'todos')}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(ESTADOS_REPORTE).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-500">
              {reportes.filter(r => r.estado === 'pendiente').length}
            </div>
            <p className="text-sm text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-500">
              {reportes.filter(r => r.estado === 'en_revision').length}
            </div>
            <p className="text-sm text-muted-foreground">En revisión</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">
              {reportes.filter(r => r.estado === 'resuelto').length}
            </div>
            <p className="text-sm text-muted-foreground">Resueltos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-muted-foreground">
              {reportes.filter(r => r.estado === 'rechazado').length}
            </div>
            <p className="text-sm text-muted-foreground">Rechazados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de reportes */}
      {reportes.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay reportes</h3>
          <p className="text-muted-foreground">
            {filtroEstado === 'todos'
              ? 'No hay reportes en el sistema'
              : `No hay reportes con estado "${ESTADOS_REPORTE[filtroEstado as EstadoReporte]}"`}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {reportes.map((reporte) => (
            <Card key={reporte.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      <Link
                        to={`/receta/${reporte.receta_id}`}
                        className="hover:underline"
                      >
                        {reporte.receta?.nombre || 'Receta eliminada'}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Reportado por: {reporte.reportador?.nombre_completo || reporte.reportador?.email || 'Usuario'}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`gap-1 ${estadoColores[reporte.estado]}`}
                  >
                    {estadoIconos[reporte.estado]}
                    {ESTADOS_REPORTE[reporte.estado]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {MOTIVOS_REPORTE[reporte.motivo]}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(reporte.created_at).toLocaleDateString('es-BO', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {reporte.descripcion && (
                    <p className="text-sm bg-muted/50 p-3 rounded-lg">
                      {reporte.descripcion}
                    </p>
                  )}
                </div>

                {/* Notas de moderación */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notas de moderación</label>
                  <Textarea
                    placeholder="Agregar notas internas sobre este reporte..."
                    value={notasEditando[reporte.id] ?? reporte.notas_moderacion ?? ''}
                    onChange={(e) =>
                      setNotasEditando({ ...notasEditando, [reporte.id]: e.target.value })
                    }
                    rows={2}
                  />
                </div>

                {/* Acciones */}
                {reporte.estado !== 'resuelto' && reporte.estado !== 'rechazado' && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {reporte.estado === 'pendiente' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => actualizarEstado(reporte.id, 'en_revision')}
                        disabled={actualizando === reporte.id}
                      >
                        {actualizando === reporte.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        Marcar en revisión
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => actualizarEstado(reporte.id, 'resuelto')}
                      disabled={actualizando === reporte.id}
                    >
                      {actualizando === reporte.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Resolver
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => actualizarEstado(reporte.id, 'rechazado')}
                      disabled={actualizando === reporte.id}
                    >
                      {actualizando === reporte.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Rechazar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <Link to={`/receta/${reporte.receta_id}`}>
                        Ver receta
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
