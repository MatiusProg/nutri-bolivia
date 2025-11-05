import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface PromedioEstrellasProps {
  promedio: number;
  totalCalificaciones?: number;
  tamaño?: "sm" | "md" | "lg";
  mostrarTexto?: boolean;
}

const TAMAÑOS = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function PromedioEstrellas({
  promedio,
  totalCalificaciones = 0,
  tamaño = "sm",
  mostrarTexto = true,
}: PromedioEstrellasProps) {
  const [localPromedio, setLocalPromedio] = useState(promedio);
  const [localTotal, setLocalTotal] = useState(totalCalificaciones);

  // ✅ Sincronizar con cambios externos
  useEffect(() => {
    setLocalPromedio(promedio);
    setLocalTotal(totalCalificaciones);
  }, [promedio, totalCalificaciones]);

  // ✅ Escuchar eventos de actualización
  useEffect(() => {
    const handleUpdate = () => {
      // Forzar rerender
      setLocalPromedio((prev) => prev);
    };

    window.addEventListener("recetasActualizadas", handleUpdate);
    return () => window.removeEventListener("recetasActualizadas", handleUpdate);
  }, []);

  // Si no hay calificaciones (solo verificar total)
  if (!localTotal || localTotal === 0) {
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>⭐ Nuevo</span>
      </div>
    );
  }

  // Calcular estrellas visuales
  const estrellasLlenas = Math.floor(localPromedio);
  const tieneMediaEstrella = localPromedio - estrellasLlenas >= 0.3;

  return (
    <div className="flex items-center gap-2">
      {/* Estrellas visuales */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((estrella) => (
          <Star
            key={estrella}
            className={cn(
              TAMAÑOS[tamaño],
              estrella <= estrellasLlenas
                ? "fill-yellow-400 text-yellow-400"
                : estrella === estrellasLlenas + 1 && tieneMediaEstrella
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "text-gray-300",
            )}
          />
        ))}
      </div>

      {/* Texto del promedio */}
      {mostrarTexto && (
        <div className="flex items-center gap-1 text-xs">
          <span className="font-semibold text-foreground">{localPromedio.toFixed(1)}</span>
          <span className="text-muted-foreground">({localTotal})</span>
        </div>
      )}
    </div>
  );
}
