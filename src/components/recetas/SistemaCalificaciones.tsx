import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type TamañoEstrellas = "sm" | "md" | "lg";

interface SistemaCalificacionesProps {
  recetaId: string;
  tamaño?: TamañoEstrellas;
  mostrarEstadisticas?: boolean;
  readonly?: boolean;
  className?: string;
}

interface ICalificacion {
  id: string;
  receta_id: string;
  usuario_id: string;
  puntuacion: number; // ← CAMBIADO: calificacion → puntuacion
  created_at: string;
}

interface IEstadisticas {
  promedio: number;
  total: number;
  distribucion: { [key: number]: number };
}

const TAMAÑOS: Record<TamañoEstrellas, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function SistemaCalificaciones({
  recetaId,
  tamaño = "md",
  mostrarEstadisticas = true,
  readonly = false,
  className,
}: SistemaCalificacionesProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [calificacionUsuario, setCalificacionUsuario] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [estadisticas, setEstadisticas] = useState<IEstadisticas>({
    promedio: 0,
    total: 0,
    distribucion: {},
  });

  // ✅ AÑADIR: Estado para saber si el usuario es el dueño de la receta
  const [esOwner, setEsOwner] = useState(false);

  useEffect(() => {
    cargarCalificaciones();
  }, [recetaId]);

  const cargarCalificaciones = async () => {
    try {
      // Cargar todas las calificaciones activas
      const { data: todasCalificaciones, error: errorTodas } = await supabase
        .from("recetas_calificaciones")
        .select("puntuacion")
        .eq("receta_id", recetaId)
        .eq("active", true);

      if (errorTodas) throw errorTodas;

      // Calcular estadísticas
      if (todasCalificaciones && todasCalificaciones.length > 0) {
        const distribucion: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let suma = 0;

        todasCalificaciones.forEach((cal: any) => {
          suma += cal.puntuacion;
          distribucion[cal.puntuacion]++;
        });

        const promedio = suma / todasCalificaciones.length;

        setEstadisticas({
          promedio: Math.round(promedio * 10) / 10,
          total: todasCalificaciones.length,
          distribucion,
        });
      } else {
        setEstadisticas({
          promedio: 0,
          total: 0,
          distribucion: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      }

      // Cargar calificación del usuario actual
      if (user) {
        const { data: calUsuario, error: errorUsuario } = await supabase
          .from("recetas_calificaciones")
          .select("id, puntuacion")
          .eq("receta_id", recetaId)
          .eq("usuario_id", user.id)
          .eq("active", true)
          .maybeSingle();

        if (errorUsuario) throw errorUsuario;
        setCalificacionUsuario(calUsuario?.puntuacion || 0);

        // ✅ AÑADIR: Verificar si el usuario es el dueño de la receta
        const { data: recetaData } = await supabase.from("recetas").select("usuario_id").eq("id", recetaId).single();

        if (recetaData) {
          setEsOwner(recetaData.usuario_id === user.id);
        }
      }
    } catch (error) {
      console.error("Error cargando calificaciones:", error);
    }
  };

  const handleCalificar = async (puntuacion: number) => {
    if (readonly || !user) {
      if (!user) {
        toast({
          title: "Inicia sesión",
          description: "Debes iniciar sesión para calificar recetas",
          variant: "destructive",
        });
      }
      return;
    }

    // ✅ PREVENIR que usuarios califiquen sus propias recetas
    if (esOwner) {
      toast({
        title: "Acción no permitida",
        description: "No puedes calificar tus propias recetas",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Verificar si ya existe una calificación
      const { data: existente } = await supabase
        .from("recetas_calificaciones")
        .select("id")
        .eq("receta_id", recetaId)
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (existente) {
        // Actualizar calificación existente
        const { error } = await supabase
          .from("recetas_calificaciones")
          .update({
            puntuacion,
            edited: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existente.id);

        if (error) throw error;
      } else {
        // Crear nueva calificación
        const { error } = await supabase.from("recetas_calificaciones").insert({
          receta_id: recetaId,
          usuario_id: user.id,
          puntuacion,
        });

        if (error) throw error;
      }

      // ✅ CRÍTICO: Esperar un momento para que los triggers se ejecuten
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ✅ CRÍTICO: Emitir evento personalizado para forzar recarga
      window.dispatchEvent(new CustomEvent("recetasActualizadas"));

      // ✅ Actualizar estado local inmediatamente
      setCalificacionUsuario(puntuacion);

      // ✅ Recargar estadísticas
      await cargarCalificaciones();

      toast({
        title: "Calificación guardada",
        description: `Has calificado esta receta con ${puntuacion} estrella${puntuacion > 1 ? "s" : ""}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la calificación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const mostrarCalificacion = hover || calificacionUsuario;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Estrellas */}
      <div className="flex items-center gap-1">
        {loading ? (
          <Loader2 className={cn(TAMAÑOS[tamaño], "animate-spin text-primary")} />
        ) : (
          [1, 2, 3, 4, 5].map((estrella) => (
            <button
              key={estrella}
              type="button"
              disabled={readonly || loading}
              onMouseEnter={() => !readonly && setHover(estrella)}
              onMouseLeave={() => !readonly && setHover(0)}
              onClick={() => handleCalificar(estrella)}
              className={cn(
                "transition-all duration-150",
                !readonly && "hover:scale-110 cursor-pointer",
                readonly && "cursor-default",
              )}
              aria-label={`Calificar con ${estrella} estrella${estrella > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  TAMAÑOS[tamaño],
                  estrella <= mostrarCalificacion ? "fill-accent text-accent" : "text-muted-foreground",
                  "transition-colors",
                )}
              />
            </button>
          ))
        )}
      </div>

      {/* Estadísticas */}
      {mostrarEstadisticas && estadisticas.total > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{estadisticas.promedio.toFixed(1)}</span>
          <span>
            ({estadisticas.total} {estadisticas.total === 1 ? "calificación" : "calificaciones"})
          </span>
        </div>
      )}

      {/* Distribución detallada */}
      {mostrarEstadisticas && estadisticas.total > 0 && (
        <div className="space-y-1 text-xs">
          {[5, 4, 3, 2, 1].map((num) => (
            <div key={num} className="flex items-center gap-2">
              <span className="w-3 text-muted-foreground">{num}</span>
              <Star className="h-3 w-3 fill-accent text-accent" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all"
                  style={{
                    width: `${estadisticas.total > 0 ? (estadisticas.distribucion[num] / estadisticas.total) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="w-8 text-right text-muted-foreground">{estadisticas.distribucion[num] || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
