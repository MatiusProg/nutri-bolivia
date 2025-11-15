-- LOVABLE CLOUD - Analytics y Multimedia System
-- Fase 1: Configuración de Storage para Imágenes

-- Crear bucket público para imágenes de recetas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recetas-imagenes',
  'recetas-imagenes',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Políticas RLS para el bucket
CREATE POLICY "Imágenes públicas para lectura"
ON storage.objects FOR SELECT
USING (bucket_id = 'recetas-imagenes');

CREATE POLICY "Usuarios autenticados pueden subir imágenes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recetas-imagenes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuarios pueden actualizar sus propias imágenes"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'recetas-imagenes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Usuarios pueden eliminar sus propias imágenes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recetas-imagenes' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Fase 2: Tabla de Analytics - Eventos
CREATE TABLE IF NOT EXISTS public.eventos_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_tipo text NOT NULL,
  usuario_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  receta_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  user_agent text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_eventos_tipo ON public.eventos_analytics(evento_tipo);
CREATE INDEX idx_eventos_usuario ON public.eventos_analytics(usuario_id);
CREATE INDEX idx_eventos_receta ON public.eventos_analytics(receta_id);
CREATE INDEX idx_eventos_fecha ON public.eventos_analytics(created_at);

ALTER TABLE public.eventos_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eventos son insertables por cualquiera"
ON public.eventos_analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Solo admins pueden ver eventos"
ON public.eventos_analytics FOR SELECT
USING (false); -- Por ahora nadie puede leer, solo insertar

-- Fase 3: Tabla de Métricas Diarias
CREATE TABLE IF NOT EXISTS public.metricas_diarias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha date NOT NULL UNIQUE,
  total_vistas_pagina integer DEFAULT 0,
  total_recetas_vistas integer DEFAULT 0,
  total_recetas_creadas integer DEFAULT 0,
  total_likes integer DEFAULT 0,
  total_guardados integer DEFAULT 0,
  usuarios_activos integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_metricas_fecha ON public.metricas_diarias(fecha);

ALTER TABLE public.metricas_diarias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Métricas son visibles solo para admins"
ON public.metricas_diarias FOR SELECT
USING (false); -- Por ahora solo sistema puede escribir

-- Fase 4: Tabla de Imágenes de Recetas
CREATE TABLE IF NOT EXISTS public.recetas_imagenes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id uuid NOT NULL,
  imagen_url text NOT NULL,
  storage_path text NOT NULL,
  es_principal boolean DEFAULT true,
  orden integer DEFAULT 0,
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_recetas_imagenes_receta ON public.recetas_imagenes(receta_id);
CREATE INDEX idx_recetas_imagenes_usuario ON public.recetas_imagenes(usuario_id);

ALTER TABLE public.recetas_imagenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Imágenes son públicas para lectura"
ON public.recetas_imagenes FOR SELECT
USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar imágenes"
ON public.recetas_imagenes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus propias imágenes"
ON public.recetas_imagenes FOR UPDATE
TO authenticated
USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus propias imágenes"
ON public.recetas_imagenes FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_recetas_imagenes_updated_at
BEFORE UPDATE ON public.recetas_imagenes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fase 5: Tabla de Videos de Recetas
CREATE TABLE IF NOT EXISTS public.recetas_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  receta_id uuid NOT NULL,
  video_url text NOT NULL,
  video_url_normalizada text NOT NULL,
  plataforma text NOT NULL CHECK (plataforma IN ('tiktok', 'youtube')),
  tipo_video text CHECK (tipo_video IN ('short', 'long')),
  video_id text NOT NULL,
  embed_url text NOT NULL,
  usuario_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_recetas_videos_receta ON public.recetas_videos(receta_id);
CREATE INDEX idx_recetas_videos_usuario ON public.recetas_videos(usuario_id);
CREATE INDEX idx_recetas_videos_plataforma ON public.recetas_videos(plataforma);

ALTER TABLE public.recetas_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videos son públicos para lectura"
ON public.recetas_videos FOR SELECT
USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar videos"
ON public.recetas_videos FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus propios videos"
ON public.recetas_videos FOR UPDATE
TO authenticated
USING (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden eliminar sus propios videos"
ON public.recetas_videos FOR DELETE
TO authenticated
USING (auth.uid() = usuario_id);

CREATE TRIGGER update_recetas_videos_updated_at
BEFORE UPDATE ON public.recetas_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();