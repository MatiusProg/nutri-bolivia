import { supabase } from "@/integrations/supabase/client";

/**
 * Recomputa los promedios de calificación para una lista de recetas
 * consultando directamente la tabla recetas_calificaciones
 */
export async function recomputarPromediosPara(recetas: any[]): Promise<any[]> {
  if (!recetas || recetas.length === 0) return recetas;

  try {
    const recetaIds = recetas.map((r) => r.id);

    // Cargar todas las calificaciones activas para estas recetas
    const { data: calificaciones, error } = await supabase
      .from("recetas_calificaciones")
      .select("receta_id, puntuacion")
      .in("receta_id", recetaIds)
      .eq("active", true);

    if (error) {
      console.error("❌ Error al recomputar promedios:", error);
      return recetas;
    }

    // Calcular promedios por receta
    const promediosPorReceta: Record<string, { promedio: number; total: number }> = {};

    recetaIds.forEach((id) => {
      promediosPorReceta[id] = { promedio: 0, total: 0 };
    });

    calificaciones?.forEach((cal: any) => {
      const id = cal.receta_id;
      if (!promediosPorReceta[id]) {
        promediosPorReceta[id] = { promedio: 0, total: 0 };
      }
      promediosPorReceta[id].promedio += cal.puntuacion;
      promediosPorReceta[id].total += 1;
    });

    // Calcular promedios finales
    Object.keys(promediosPorReceta).forEach((id) => {
      const stats = promediosPorReceta[id];
      if (stats.total > 0) {
        stats.promedio = Math.round((stats.promedio / stats.total) * 10) / 10;
      }
    });

    console.log("✅ Promedios recomputados:", promediosPorReceta);

    // Actualizar recetas con los nuevos promedios
    return recetas.map((receta) => ({
      ...receta,
      promedio_calificacion: promediosPorReceta[receta.id]?.promedio || 0,
      total_calificaciones: promediosPorReceta[receta.id]?.total || 0,
    }));
  } catch (error) {
    console.error("❌ Error al recomputar promedios:", error);
    return recetas;
  }
}
