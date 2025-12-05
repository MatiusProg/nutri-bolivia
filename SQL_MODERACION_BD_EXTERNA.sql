-- ============================================================
-- SQL PARA EJECUTAR EN TU BASE DE DATOS EXTERNA (cikrrifmawnptypogrdl)
-- Esto habilita las acciones de moderación para admins/moderadores
-- ============================================================

-- 1. Función para eliminar receta (solo admins)
CREATE OR REPLACE FUNCTION public.admin_eliminar_receta(
  p_receta_id UUID,
  p_admin_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_es_admin BOOLEAN;
BEGIN
  -- Verificar que el usuario es admin
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_admin_id AND role = 'admin'
  ) INTO v_es_admin;
  
  IF NOT v_es_admin THEN
    RAISE EXCEPTION 'No tienes permisos de administrador';
  END IF;
  
  -- Eliminar la receta
  DELETE FROM recetas WHERE id = p_receta_id;
  
  RETURN TRUE;
END;
$$;

-- 2. Función para hacer receta privada (admins y moderadores)
CREATE OR REPLACE FUNCTION public.admin_hacer_receta_privada(
  p_receta_id UUID,
  p_moderador_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tiene_permisos BOOLEAN;
BEGIN
  -- Verificar que el usuario es admin o moderador
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = p_moderador_id AND role IN ('admin', 'moderador')
  ) INTO v_tiene_permisos;
  
  IF NOT v_tiene_permisos THEN
    RAISE EXCEPTION 'No tienes permisos de moderación';
  END IF;
  
  -- Cambiar visibilidad a privada
  UPDATE recetas 
  SET visibilidad = 'privada', updated_at = now()
  WHERE id = p_receta_id;
  
  RETURN TRUE;
END;
$$;

-- 3. Dar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.admin_eliminar_receta(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_hacer_receta_privada(UUID, UUID) TO authenticated;

-- ============================================================
-- VERIFICACIÓN: Ejecuta esto para confirmar que funcionó
-- ============================================================
-- SELECT proname FROM pg_proc WHERE proname LIKE 'admin_%';
