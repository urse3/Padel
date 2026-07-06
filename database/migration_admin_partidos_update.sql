-- ============================================================
-- MIGRACIÓN ADICIONAL: ACTUALIZAR PARTIDOS POR ADMINISTRADOR
-- Proyecto: qinxaemwhjiiuehkgrge
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================================

-- 1. Crear política para permitir la actualización de partidos a los administradores
DROP POLICY IF EXISTS "Admins pueden actualizar partidos" ON public.partidos;
CREATE POLICY "Admins pueden actualizar partidos"
  ON public.partidos FOR UPDATE
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );
