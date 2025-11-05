import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
  // Calcular estrellas llenas y media estrella
  const estrellasLlenas = Math.floor(promedio);
  const tieneMediaEstrella = promedio - estrellasLlenas >= 0.3; // Más flexible

  return (
    <div className="flex items-center gap-1.5">
      {/* Estrellas visuales */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((estrella) => (
          <Star
            key={estrella}
            className={cn(
              TAMAÑOS[tamaño],
              estrella <= estrellasLlenas
                ? "fill-yellow-400 text-yellow-400" // Amarillo más visible
                : estrella === estrellasLlenas + 1 && tieneMediaEstrella
                  ? "fill-yellow-400/50 text-yellow-400"
                  : "text-gray-300", // Gris para estrellas vacías
            )}
          />
        ))}
      </div>

      {/* Texto del promedio */}
      {mostrarTexto !== false && ( // ✅ Solo mostrar texto si no es false
        <div className="flex items-center gap-1 text-xs">
          <span className="font-semibold text-foreground">{promedio > 0 ? promedio.toFixed(1) : "Nuevo"}</span>
          {totalCalificaciones > 0 && <span className="text-muted-foreground">({totalCalificaciones})</span>}
        </div>
      )}
    </div>
  );
}
