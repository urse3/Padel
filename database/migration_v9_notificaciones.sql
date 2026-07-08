-- Migración v9: Sistema de Notificaciones Globales
-- =============================================
-- 1. TABLA NOTIFICACIONES
-- =============================================
CREATE TABLE IF NOT EXISTS public.notificaciones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo text NOT NULL, -- 'torneo', 'partido', 'sistema'
  mensaje text NOT NULL,
  enlace text, -- opcional, url a la que redirigir
  leido boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Borrar políticas anteriores si existen (idempotencia)
DROP POLICY IF EXISTS "Usuarios ven sus propias notificaciones" ON public.notificaciones;
DROP POLICY IF EXISTS "Sistema o Admins insertan notificaciones" ON public.notificaciones;
DROP POLICY IF EXISTS "Usuarios marcan como leidas sus notificaciones" ON public.notificaciones;

-- Crear políticas
CREATE POLICY "Usuarios ven sus propias notificaciones"
  ON public.notificaciones FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Cualquiera inserta notificaciones (sistema)"
  ON public.notificaciones FOR INSERT
  WITH CHECK (true); -- Permitimos inserción libre para que el cliente pueda generar invitaciones si es necesario, o triggers

CREATE POLICY "Usuarios marcan como leidas sus notificaciones"
  ON public.notificaciones FOR UPDATE
  USING (auth.uid() = usuario_id);

-- Activar Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notificaciones;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
