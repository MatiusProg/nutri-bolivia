import { useState, useEffect } from 'react';
import { Loader2, Save, Trash2, X, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { supabase } from '@/integrations/supabase/client-unsafe';
import { toast } from '@/hooks/use-toast';
import { 
  IReceta, 
  IIngrediente,
  TVisibilidad, 
  TDificultad, 
  LIMITE_RECETAS_PRIVADAS,
  DIFICULTADES,
  ETIQUETAS_DISPONIBLES,
  INutrientesTotales
} from '@/types/receta.types';
import { ImagenUpload } from './ImagenUpload';
import { VideoInput } from './VideoInput';

interface EditarRecetaModalProps {
  receta: IReceta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecetaActualizada: () => void;
  recetasPrivadasCount: number;
}

export function EditarRecetaModal({
  receta,
  open,
  onOpenChange,
  onRecetaActualizada,
  recetasPrivadasCount,
}: EditarRecetaModalProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showIngredientesWarning, setShowIngredientesWarning] = useState(false);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [visibilidad, setVisibilidad] = useState<TVisibilidad>('privada');
  const [tiempoPreparacion, setTiempoPreparacion] = useState<string>('');
  const [dificultad, setDificultad] = useState<TDificultad | ''>('');
  const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([]);

  // Multimedia state
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);
  const [imagenStoragePath, setImagenStoragePath] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<any>(null);

  // Ingredientes state
  const [ingredientes, setIngredientes] = useState<IIngrediente[]>([]);
  const [ingredientesOriginales, setIngredientesOriginales] = useState<IIngrediente[]>([]);
  
  // Búsqueda de ingredientes
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [alimentos, setAlimentos] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Cargar datos de la receta cuando se abre el modal
  useEffect(() => {
    if (receta && open) {
      setNombre(receta.nombre);
      setDescripcion(receta.descripcion || '');
      setVisibilidad(receta.visibilidad);
      setTiempoPreparacion(receta.tiempo_preparacion?.toString() || '');
      setDificultad(receta.dificultad || '');
      setEtiquetasSeleccionadas(receta.etiquetas || []);
      setIngredientes(receta.ingredientes);
      setIngredientesOriginales(JSON.parse(JSON.stringify(receta.ingredientes)));
      
      // Cargar multimedia
      cargarImagenActual(receta.id);
      cargarVideoActual(receta.id);
    }
  }, [receta, open]);

  const cargarImagenActual = async (recetaId: string) => {
    const { data } = await supabase
      .from('recetas_imagenes')
      .select('imagen_url, storage_path')
      .eq('receta_id', recetaId)
      .eq('es_principal', true)
      .maybeSingle();
    
    if (data) {
      setImagenUrl(data.imagen_url);
      setImagenStoragePath(data.storage_path);
    }
  };

  const cargarVideoActual = async (recetaId: string) => {
    const { data } = await supabase
      .from('recetas_videos')
      .select('*')
      .eq('receta_id', recetaId)
      .maybeSingle();
    
    if (data) {
      setVideoData({
        videoId: data.video_id,
        videoUrlNormalizada: data.video_url_normalizada,
        embedUrl: data.embed_url,
        plataforma: data.plataforma,
        tipo: data.tipo_video
      });
    }
  };

  const searchAlimentos = async (query: string) => {
    if (!query || query.length < 2) {
      setAlimentos([]);
      return;
    }

    setSearchLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('alimentos')
        .select('*')
        .ilike('nombre_alimento', `%${query}%`)
        .limit(10);

      if (error) throw error;
      setAlimentos(data || []);
    } catch (error) {
      console.error('Error buscando alimentos:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const addIngredient = (alimento: any) => {
    setIngredientes([
      ...ingredientes,
      {
        id_alimento: alimento.id_alimento,
        nombre_alimento: alimento.nombre_alimento,
        cantidad_g: 100,
        nutrientes: {
          energia_kcal: alimento.energia_kcal || 0,
          proteinas_g: alimento.proteinas_g || 0,
          grasas_g: alimento.grasas_g || 0,
          hidratoscarbonototal_g: alimento.hidratoscarbonototal_g || 0,
          fibracruda_g: alimento.fibracruda_g || 0,
          calcio_mg: alimento.calcio_mg || 0,
          hierro_mg: alimento.hierro_mg || 0,
        }
      }
    ]);
    setSearchOpen(false);
    setSearchValue('');
    setAlimentos([]);
  };

  const removeIngredient = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, cantidad: number) => {
    const updated = [...ingredientes];
    updated[index].cantidad_g = cantidad;
    setIngredientes(updated);
  };

  const calcularNutrientesTotales = (ingredientes: IIngrediente[]): INutrientesTotales => {
    const totales: INutrientesTotales = {
      energia_kcal: 0,
      proteinas_g: 0,
      grasas_g: 0,
      hidratoscarbonototal_g: 0,
      fibracruda_g: 0,
      calcio_mg: 0,
      hierro_mg: 0,
    };

    ingredientes.forEach(ing => {
      const factor = ing.cantidad_g / 100;
      
      if (ing.nutrientes) {
        totales.energia_kcal += (ing.nutrientes.energia_kcal || 0) * factor;
        totales.proteinas_g += (ing.nutrientes.proteinas_g || 0) * factor;
        totales.grasas_g += (ing.nutrientes.grasas_g || 0) * factor;
        totales.hidratoscarbonototal_g += (ing.nutrientes.hidratoscarbonototal_g || 0) * factor;
        totales.fibracruda_g += (ing.nutrientes.fibracruda_g || 0) * factor;
        totales.calcio_mg += (ing.nutrientes.calcio_mg || 0) * factor;
        totales.hierro_mg += (ing.nutrientes.hierro_mg || 0) * factor;
      }
    });

    return totales;
  };

  const validarLimiteRecetas = (): boolean => {
    if (receta?.visibilidad === 'privada' && visibilidad === 'privada') {
      return true;
    }
    
    if (visibilidad === 'privada' && recetasPrivadasCount >= LIMITE_RECETAS_PRIVADAS) {
      toast({
        title: 'Límite alcanzado',
        description: `Ya tienes ${LIMITE_RECETAS_PRIVADAS} recetas privadas. Haz pública alguna para liberar espacio.`,
        variant: 'destructive',
      });
      return false;
    }
    
    return true;
  };

  const resetearInteracciones = async (recetaId: string) => {
    try {
      // 1. Eliminar interacciones (likes y guardados)
      const { error: interaccionesError } = await (supabase as any)
        .from('recetas_interacciones')
        .delete()
        .eq('receta_id', recetaId);

      if (interaccionesError) {
        console.error('Error eliminando interacciones:', interaccionesError);
      }

      // 2. Eliminar calificaciones
      const { error: calificacionesError } = await (supabase as any)
        .from('recetas_calificaciones')
        .delete()
        .eq('receta_id', recetaId);

      if (calificacionesError) {
        console.error('Error eliminando calificaciones:', calificacionesError);
      }

      // 3. Resetear contadores en la tabla recetas
      const { error: updateError } = await (supabase as any)
        .from('recetas')
        .update({ 
          contador_likes: 0, 
          contador_guardados: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', recetaId);

      if (updateError) {
        console.error('Error reseteando contadores:', updateError);
      }
    } catch (error) {
      console.error('Error en resetearInteracciones:', error);
      throw error;
    }
  };

  const handleGuardar = async () => {
    if (!receta) return;

    // Validaciones
    if (!nombre.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre de la receta es obligatorio',
        variant: 'destructive',
      });
      return;
    }

    if (ingredientes.length === 0) {
      toast({
        title: 'Error de validación',
        description: 'Debes agregar al menos un ingrediente',
        variant: 'destructive',
      });
      return;
    }

    if (!validarLimiteRecetas()) {
      return;
    }

    // Verificar si los ingredientes cambiaron
    const ingredientesCambiaron = JSON.stringify(ingredientes) !== JSON.stringify(ingredientesOriginales);
    
    if (ingredientesCambiaron) {
      setShowIngredientesWarning(true);
      return;
    }

    // Si no cambiaron ingredientes, guardar directamente
    await guardarCambios(false);
  };

  const guardarCambios = async (resetearStats: boolean) => {
    if (!receta) return;
    
    setLoading(true);
    try {
      // Calcular nutrientes actualizados
      const nutrientesTotales = calcularNutrientesTotales(ingredientes);

      // 1. Actualizar receta básica
      const { error: recetaError } = await (supabase as any)
        .from('recetas')
        .update({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          visibilidad,
          tiempo_preparacion: tiempoPreparacion ? parseInt(tiempoPreparacion) : null,
          dificultad: dificultad || null,
          etiquetas: etiquetasSeleccionadas.length > 0 ? etiquetasSeleccionadas : null,
          ingredientes: ingredientes.map(ing => ({
            id_alimento: ing.id_alimento,
            nombre_alimento: ing.nombre_alimento,
            cantidad_g: ing.cantidad_g,
            nutrientes: ing.nutrientes || {},
          })),
          nutrientes_totales: nutrientesTotales,
          updated_at: new Date().toISOString(),
        })
        .eq('id', receta.id);

      if (recetaError) throw recetaError;

      // 2. Actualizar imagen si cambió
      if (imagenUrl && imagenStoragePath) {
        const { error: imagenError } = await (supabase as any)
          .from('recetas_imagenes')
          .upsert({
            receta_id: receta.id,
            imagen_url: imagenUrl,
            storage_path: imagenStoragePath,
            usuario_id: receta.usuario_id,
            es_principal: true,
          }, {
            onConflict: 'receta_id,es_principal'
          });

        if (imagenError) console.error('Error guardando imagen:', imagenError);
      }

      // 3. Actualizar video si cambió
      if (videoData) {
        await (supabase as any)
          .from('recetas_videos')
          .delete()
          .eq('receta_id', receta.id);

        const { error: videoError } = await (supabase as any)
          .from('recetas_videos')
          .insert({
            receta_id: receta.id,
            video_id: videoData.videoId,
            video_url: videoData.videoUrlNormalizada,
            video_url_normalizada: videoData.videoUrlNormalizada,
            embed_url: videoData.embedUrl,
            plataforma: videoData.plataforma,
            tipo_video: videoData.tipo,
            usuario_id: receta.usuario_id,
          });

        if (videoError) console.error('Error guardando video:', videoError);
      }

      // 4. Si se confirmó resetear stats, ejecutar las eliminaciones
      if (resetearStats) {
        await resetearInteracciones(receta.id);
      }

      toast({
        title: 'Receta actualizada',
        description: resetearStats 
          ? 'Los cambios se guardaron y las estadísticas se han reiniciado'
          : 'Los cambios se guardaron exitosamente',
      });

      onRecetaActualizada();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la receta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setShowIngredientesWarning(false);
    }
  };

  const handleEliminar = async () => {
    if (!receta) return;

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('recetas')
        .delete()
        .eq('id', receta.id);

      if (error) throw error;

      toast({
        title: 'Receta eliminada',
        description: 'La receta ha sido eliminada exitosamente',
      });

      onRecetaActualizada();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la receta',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const toggleEtiqueta = (etiqueta: string) => {
    setEtiquetasSeleccionadas(prev =>
      prev.includes(etiqueta)
        ? prev.filter(e => e !== etiqueta)
        : [...prev, etiqueta]
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Receta</DialogTitle>
            <DialogDescription>
              Modifica los detalles de tu receta. Si cambias los ingredientes, se reiniciarán las estadísticas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre de la receta *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Ensalada tropical"
                maxLength={100}
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe tu receta..."
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Visibilidad */}
            <div className="space-y-2">
              <Label htmlFor="visibilidad">Visibilidad</Label>
              <Select value={visibilidad} onValueChange={(v) => setVisibilidad(v as TVisibilidad)}>
                <SelectTrigger id="visibilidad">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="privada">🔒 Privada</SelectItem>
                  <SelectItem value="publica">🌐 Pública</SelectItem>
                  <SelectItem value="enlace">🔗 Solo con enlace</SelectItem>
                </SelectContent>
              </Select>
              {visibilidad === 'privada' && (
                <p className="text-xs text-muted-foreground">
                  Recetas privadas: {recetasPrivadasCount}/{LIMITE_RECETAS_PRIVADAS}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tiempo de preparación */}
              <div className="space-y-2">
                <Label htmlFor="tiempo">Tiempo (minutos)</Label>
                <Input
                  id="tiempo"
                  type="number"
                  value={tiempoPreparacion}
                  onChange={(e) => setTiempoPreparacion(e.target.value)}
                  placeholder="30"
                  min="1"
                  max="999"
                />
              </div>

              {/* Dificultad */}
              <div className="space-y-2">
                <Label htmlFor="dificultad">Dificultad</Label>
                <Select value={dificultad} onValueChange={(v) => setDificultad(v as TDificultad)}>
                  <SelectTrigger id="dificultad">
                    <SelectValue placeholder="Selecciona..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFICULTADES).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Etiquetas */}
            <div className="space-y-2">
              <Label>Etiquetas</Label>
              <div className="flex flex-wrap gap-2">
                {ETIQUETAS_DISPONIBLES.map((etiqueta) => (
                  <Badge
                    key={etiqueta}
                    variant={etiquetasSeleccionadas.includes(etiqueta) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleEtiqueta(etiqueta)}
                  >
                    {etiqueta}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Sección de Imagen */}
            <div className="border-t pt-4 mt-4">
              <ImagenUpload
                recetaId={receta?.id}
                imagenActual={imagenUrl}
                onImagenCargada={(url, path) => {
                  setImagenUrl(url);
                  setImagenStoragePath(path);
                }}
                onImagenEliminada={() => {
                  setImagenUrl(null);
                  setImagenStoragePath(null);
                }}
              />
            </div>

            {/* Sección de Video */}
            <div className="border-t pt-4 mt-4">
              <VideoInput
                videoActual={videoData}
                onVideoValidado={(data) => setVideoData(data)}
                onVideoEliminado={() => setVideoData(null)}
              />
            </div>

            {/* Sección de Ingredientes */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <Label>Ingredientes *</Label>
                <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Agregar
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Buscar alimento..."
                        value={searchValue}
                        onValueChange={(value) => {
                          setSearchValue(value);
                          searchAlimentos(value);
                        }}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {searchLoading ? 'Buscando...' : 'No se encontraron alimentos'}
                        </CommandEmpty>
                        <CommandGroup>
                          {alimentos.map((alimento) => (
                            <CommandItem
                              key={alimento.id_alimento}
                              onSelect={() => addIngredient(alimento)}
                              className="cursor-pointer"
                            >
                              <div>
                                <p className="font-medium">{alimento.nombre_alimento}</p>
                                <p className="text-xs text-muted-foreground">
                                  {alimento.grupo_alimenticio}
                                </p>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {ingredientes.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">
                  <p className="text-sm">No hay ingredientes. Agrega al menos uno para guardar los cambios.</p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {ingredientes.map((ing, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{ing.nombre_alimento}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              value={ing.cantidad_g}
                              onChange={(e) => updateQuantity(index, parseFloat(e.target.value) || 0)}
                              className="w-20 h-8"
                              step="1"
                              min="1"
                            />
                            <span className="text-xs text-muted-foreground">gramos</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredient(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={loading}
              className="sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
            
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button onClick={handleGuardar} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar receta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La receta "{receta?.nombre}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEliminar}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Advertencia de cambio de ingredientes */}
      <AlertDialog open={showIngredientesWarning} onOpenChange={setShowIngredientesWarning}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              ⚠️ ATENCIÓN: Cambios en Ingredientes
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-left">
              <p className="font-semibold">
                Al modificar los ingredientes, se reiniciará:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-destructive mt-0.5" />
                  <span>
                    <strong>Todos los likes</strong> ({receta?.contador_likes || 0} usuarios)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-destructive mt-0.5" />
                  <span>
                    <strong>Todos los guardados</strong> ({receta?.contador_guardados || 0} usuarios)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="h-4 w-4 text-destructive mt-0.5" />
                  <span>
                    <strong>Todas las calificaciones</strong>
                  </span>
                </li>
              </ul>
              
              <div className="bg-muted p-3 rounded-md mt-4">
                <p className="text-sm">
                  <strong>Razón:</strong> Los usuarios calificaron esta receta con los 
                  ingredientes originales. Al modificarlos, los valores nutricionales 
                  cambiarán y ya no será la misma receta.
                </p>
              </div>

              <p className="text-sm font-semibold mt-4">
                ¿Estás seguro de que deseas continuar?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowIngredientesWarning(false);
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await guardarCambios(true);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Confirmar y Reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}