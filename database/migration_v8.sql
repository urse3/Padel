-- Migración v8 FIX: Mensajes directos e Incidencias
-- Ejecuta esto en el SQL Editor de Supabase (es idempotente, se puede correr varias veces)

-- =============================================
-- 1. MENSAJES DIRECTOS (Chat entre amigos)
-- =============================================
CREATE TABLE IF NOT EXISTS public.mensajes_directos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  emisor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  receptor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  contenido text NOT NULL,
  leido boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mensajes_directos ENABLE ROW LEVEL SECURITY;

-- Borrar políticas anteriores si existen (para evitar errores)
DROP POLICY IF EXISTS "Usuarios ven sus propios mensajes" ON public.mensajes_directos;
DROP POLICY IF EXISTS "Usuarios envían mensajes" ON public.mensajes_directos;
DROP POLICY IF EXISTS "Usuarios marcan mensajes como leidos" ON public.mensajes_directos;

-- Crear políticas limpias
CREATE POLICY "Usuarios ven sus propios mensajes"
  ON public.mensajes_directos FOR SELECT
  USING (auth.uid() = emisor_id OR auth.uid() = receptor_id);

CREATE POLICY "Usuarios envían mensajes"
  ON public.mensajes_directos FOR INSERT
  WITH CHECK (auth.uid() = emisor_id);

CREATE POLICY "Usuarios marcan mensajes como leidos"
  ON public.mensajes_directos FOR UPDATE
  USING (auth.uid() = receptor_id);

-- Activar Realtime (si ya está añadida, Supabase lo ignora sin error)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes_directos;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Ya estaba añadida, ignorar
END $$;


-- =============================================
-- 2. INCIDENCIAS / CONTACTO
-- =============================================
CREATE TABLE IF NOT EXISTS public.incidencias (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  email text NOT NULL,
  tipo text NOT NULL,
  mensaje text NOT NULL,
  estado text DEFAULT 'pendiente',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.incidencias ENABLE ROW LEVEL SECURITY;

-- Borrar políticas anteriores si existen
DROP POLICY IF EXISTS "Cualquiera puede insertar incidencias" ON public.incidencias;
DROP POLICY IF EXISTS "Admins ven incidencias" ON public.incidencias;
DROP POLICY IF EXISTS "Admins actualizan incidencias" ON public.incidencias;

-- Crear políticas limpias
CREATE POLICY "Cualquiera puede insertar incidencias"
  ON public.incidencias FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins ven incidencias"
  ON public.incidencias FOR SELECT
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE);

CREATE POLICY "Admins actualizan incidencias"
  ON public.incidencias FOR UPDATE
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE);
