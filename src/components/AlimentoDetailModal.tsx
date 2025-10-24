import { useState } from 'react';
import { Alimento } from '@/types/database';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Scale } from 'lucide-react';

interface AlimentoDetailModalProps {
  alimento: Alimento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AlimentoDetailModal({
  alimento,
  open,
  onOpenChange,
}: AlimentoDetailModalProps) {
  const [gramos, setGramos] = useState(100);

  if (!alimento) return null;

  const calcular = (valor: number | null) => {
    if (!valor) return 0;
    return ((valor * gramos) / 100).toFixed(2);
  };

  const nutrientes = [
    {
      categoria: 'Macronutrientes',
      items: [
        { nombre: 'Energía', valor: alimento.energia_kcal, unidad: 'kcal' },
        { nombre: 'Proteínas', valor: alimento.proteina_g, unidad: 'g' },
        { nombre: 'Grasas totales', valor: alimento.grasa_total_g, unidad: 'g' },
        { nombre: 'Carbohidratos', valor: alimento.carbohidratos_totales_g, unidad: 'g' },
        { nombre: 'Fibra dietética', valor: alimento.fibra_dietetica_g, unidad: 'g' },
        { nombre: 'Azúcares totales', valor: alimento.azucares_totales_g, unidad: 'g' },
      ],
    },
    {
      categoria: 'Minerales',
      items: [
        { nombre: 'Calcio', valor: alimento.calcio_mg, unidad: 'mg' },
        { nombre: 'Hierro', valor: alimento.hierro_mg, unidad: 'mg' },
        { nombre: 'Magnesio', valor: alimento.magnesio_mg, unidad: 'mg' },
        { nombre: 'Fósforo', valor: alimento.fosforo_mg, unidad: 'mg' },
        { nombre: 'Potasio', valor: alimento.potasio_mg, unidad: 'mg' },
        { nombre: 'Sodio', valor: alimento.sodio_mg, unidad: 'mg' },
        { nombre: 'Zinc', valor: alimento.zinc_mg, unidad: 'mg' },
      ],
    },
    {
      categoria: 'Vitaminas',
      items: [
        { nombre: 'Vitamina C', valor: alimento.vitamina_c_mg, unidad: 'mg' },
        { nombre: 'Tiamina (B1)', valor: alimento.tiamina_mg, unidad: 'mg' },
        { nombre: 'Riboflavina (B2)', valor: alimento.riboflavina_mg, unidad: 'mg' },
        { nombre: 'Niacina (B3)', valor: alimento.niacina_mg, unidad: 'mg' },
        { nombre: 'Vitamina B6', valor: alimento.vitamina_b6_mg, unidad: 'mg' },
        { nombre: 'Folato (B9)', valor: alimento.folato_ug, unidad: 'μg' },
        { nombre: 'Vitamina B12', valor: alimento.vitamina_b12_ug, unidad: 'μg' },
        { nombre: 'Vitamina A', valor: alimento.vitamina_a_ug, unidad: 'μg' },
        { nombre: 'Vitamina E', valor: alimento.vitamina_e_mg, unidad: 'mg' },
        { nombre: 'Vitamina D', valor: alimento.vitamina_d_ug, unidad: 'μg' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-start justify-between gap-4">
            <span>{alimento.nombre_alimento}</span>
            {alimento.grupo_alimento && (
              <Badge variant="secondary" className="text-sm">
                {alimento.grupo_alimento}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Calculadora de Gramos */}
        <div className="bg-primary/5 p-6 rounded-xl border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-semibold">Calculadora de Porciones</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="gramos" className="text-base">
              Cantidad de alimento (gramos)
            </Label>
            <Input
              id="gramos"
              type="number"
              min="1"
              value={gramos}
              onChange={(e) => setGramos(Math.max(1, parseInt(e.target.value) || 100))}
              className="text-lg h-12 border-2"
            />
            <p className="text-sm text-muted-foreground">
              Los valores nutricionales se calculan automáticamente para {gramos}g
            </p>
          </div>
        </div>

        {/* Información Nutricional */}
        <div className="space-y-6">
          {nutrientes.map((categoria) => (
            <div key={categoria.categoria}>
              <h3 className="text-lg font-semibold mb-3 text-primary">
                {categoria.categoria}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoria.items.map((item) => (
                  <div
                    key={item.nombre}
                    className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg"
                  >
                    <span className="text-sm font-medium">{item.nombre}</span>
                    <span className="text-sm font-semibold">
                      {item.valor ? calcular(item.valor) : '0'} {item.unidad}
                    </span>
                  </div>
                ))}
              </div>
              {categoria.categoria !== 'Vitaminas' && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mt-4 p-4 bg-muted/50 rounded-lg">
          <p>
            * Valores nutricionales por 100g del alimento. Los valores mostrados son
            calculados para la cantidad especificada en la calculadora.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
