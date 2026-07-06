-- ============================================================
-- MIGRACIÓN: AGREGAR ROL DE ADMINISTRADOR
-- Proyecto: qinxaemwhjiiuehkgrge
-- Ejecuta este script en el SQL Editor de Supabase
-- ============================================================

-- 1. Agregar columna is_admin a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- 2. Actualizar políticas de RLS en profiles para permitir que los administradores actualicen cualquier perfil
DROP POLICY IF EXISTS "Admins pueden actualizar cualquier perfil" ON public.profiles;
CREATE POLICY "Admins pueden actualizar cualquier perfil"
  ON public.profiles FOR UPDATE
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );

-- 3. Actualizar políticas de RLS en partidos para permitir que los administradores eliminen partidos
DROP POLICY IF EXISTS "Admins pueden borrar partidos" ON public.partidos;
CREATE POLICY "Admins pueden borrar partidos"
  ON public.partidos FOR DELETE
  USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );

-- 4. Convertir al primer usuario registrado en administrador automáticamente (opcional)
-- O puedes ejecutar esta línea reemplazando con tu email real:
-- UPDATE public.profiles SET is_admin = TRUE WHERE email = 'tu-email@correo.com';
