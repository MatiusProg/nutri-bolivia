import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Alimento } from '@/types/database';
import { Search, Loader2, Apple } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AlimentoDetailModal from '@/components/AlimentoDetailModal';

export default function Alimentos() {
  const [alimentos, setAlimentos] = useState<Alimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedAlimento, setSelectedAlimento] = useState<Alimento | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 20;

  useEffect(() => {
    fetchAlimentos();
  }, [searchTerm, page]);

  const fetchAlimentos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('alimentos')
        .select('*', { count: 'exact' })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1)
        .order('nombre_alimento');

      if (searchTerm) {
        query = query.ilike('nombre_alimento', `%${searchTerm}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setAlimentos(data || []);
      setHasMore(count ? count > page * itemsPerPage : false);
    } catch (error) {
      console.error('Error al cargar alimentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleAlimentoClick = (alimento: Alimento) => {
    setSelectedAlimento(alimento);
    setModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <Apple className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Base de Datos de Alimentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Explora {alimentos.length}+ alimentos bolivianos con información nutricional completa
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar alimentos (ej: quinua, papa, carne...)"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-12 text-lg border-2 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : alimentos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            No se encontraron alimentos. Intenta con otro término de búsqueda.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up">
            {alimentos.map((alimento, index) => (
              <Card
                key={alimento.id}
                className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleAlimentoClick(alimento)}
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2 text-foreground">
                      {alimento.nombre_alimento}
                    </h3>
                    {alimento.grupo_alimento && (
                      <Badge variant="secondary" className="mb-2">
                        {alimento.grupo_alimento}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
                      <span className="text-lg">🔥</span>
                      <div>
                        <p className="text-xs text-muted-foreground">Energía</p>
                        <p className="font-semibold text-primary">
                          {alimento.energia_kcal?.toFixed(0) || 0} kcal
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                      <span className="text-lg">💪</span>
                      <div>
                        <p className="text-xs text-muted-foreground">Proteínas</p>
                        <p className="font-semibold">
                          {alimento.proteina_g?.toFixed(1) || 0}g
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                      <span className="text-lg">🥑</span>
                      <div>
                        <p className="text-xs text-muted-foreground">Grasas</p>
                        <p className="font-semibold">
                          {alimento.grasa_total_g?.toFixed(1) || 0}g
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                      <span className="text-lg">🌾</span>
                      <div>
                        <p className="text-xs text-muted-foreground">Carbohidratos</p>
                        <p className="font-semibold">
                          {alimento.carbohidratos_totales_g?.toFixed(1) || 0}g
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-muted-foreground">
              Página {page}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore}
            >
              Siguiente
            </Button>
          </div>
        </>
      )}

      {/* CTA for recipe builder */}
      <div className="mt-12 text-center p-8 bg-gradient-subtle rounded-2xl border">
        <h2 className="text-2xl font-bold mb-2">¿Listo para crear tu receta?</h2>
        <p className="text-muted-foreground mb-4">
          Usa estos alimentos para construir recetas nutritivas personalizadas
        </p>
        <Button onClick={() => navigate('/recetas/nueva')} size="lg">
          Crear Receta
        </Button>
      </div>

      {/* Modal de detalles del alimento */}
      <AlimentoDetailModal
        alimento={selectedAlimento}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
