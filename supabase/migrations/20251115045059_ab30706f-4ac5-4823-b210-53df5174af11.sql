-- Actualizar políticas RLS para recetas_imagenes para permitir subida pública de imágenes

-- Eliminar la política restrictiva de INSERT
DROP POLICY IF EXISTS "Usuarios autenticados pueden insertar imágenes" ON public.recetas_imagenes;

-- Crear nueva política que permita inserciones públicas
CREATE POLICY "Permitir inserción pública de imágenes"
ON public.recetas_imagenes
FOR INSERT
WITH CHECK (true);

-- Asegurar que el bucket de storage permite uploads públicos
UPDATE storage.buckets 
SET public = true 
WHERE id = 'recetas-imagenes';

-- Crear política de storage para permitir uploads públicos
DROP POLICY IF EXISTS "Permitir uploads públicos" ON storage.objects;
CREATE POLICY "Permitir uploads públicos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'recetas-imagenes');