-- ============================================================
-- MIGRACIÓN v10 — REY DE PISTA (Políticas) + Notificaciones de Invitación
-- Ejecutar en: https://supabase.com/dashboard/project/_/sql/new
-- ============================================================

-- -------------------------------------------------------
-- 1. POLÍTICAS RLS PARA REY_INSCRIPCIONES
--    (los usuarios autenticados pueden inscribirse y salir)
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Usuarios pueden ver inscripciones de rey" ON public.rey_inscripciones;
DROP POLICY IF EXISTS "Usuarios se pueden inscribir en rey" ON public.rey_inscripciones;
DROP POLICY IF EXISTS "Usuarios pueden salir de rey" ON public.rey_inscripciones;

CREATE POLICY "Usuarios pueden ver inscripciones de rey"
  ON public.rey_inscripciones FOR SELECT
  USING (true);

CREATE POLICY "Usuarios se pueden inscribir en rey"
  ON public.rey_inscripciones FOR INSERT
  WITH CHECK (auth.uid() = jugador_id);

CREATE POLICY "Usuarios pueden salir de rey"
  ON public.rey_inscripciones FOR DELETE
  USING (auth.uid() = jugador_id);

-- -------------------------------------------------------
-- 2. POLÍTICAS RLS PARA REY_DE_PISTA
--    (SELECT público, INSERT para creadores, UPDATE para creadores)
-- -------------------------------------------------------

-- Borrar todas las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Creadores pueden actualizar rey" ON public.rey_de_pista;
DROP POLICY IF EXISTS "Usuarios pueden crear rey de pista" ON public.rey_de_pista;
DROP POLICY IF EXISTS "Rey de pista es visible publicamente" ON public.rey_de_pista;
DROP POLICY IF EXISTS "Cualquiera puede ver rey de pista" ON public.rey_de_pista;
DROP POLICY IF EXISTS "Rey de pista visible para todos" ON public.rey_de_pista;

-- SELECT: todo el mundo puede leer (anónimo y autenticado)
CREATE POLICY "Rey de pista visible para todos"
  ON public.rey_de_pista FOR SELECT
  USING (true);

-- INSERT: solo usuarios autenticados que son el creador
CREATE POLICY "Usuarios pueden crear rey de pista"
  ON public.rey_de_pista FOR INSERT
  WITH CHECK (auth.uid() = creador_id);

-- UPDATE: solo el creador puede editar su evento
CREATE POLICY "Creadores pueden actualizar rey"
  ON public.rey_de_pista FOR UPDATE
  USING (auth.uid() = creador_id);

-- -------------------------------------------------------
-- 3. HABILITAR REALTIME PARA REY DE PISTA
-- -------------------------------------------------------
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rey_de_pista;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rey_inscripciones;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- -------------------------------------------------------
-- 4. ASEGURARSE DE QUE NOTIFICACIONES TIENE TODOS LOS CAMPOS
-- -------------------------------------------------------
ALTER TABLE public.notificaciones
  ADD COLUMN IF NOT EXISTS enlace text;

-- -------------------------------------------------------
-- 5. ACTUALIZAR CONSTRAINT DEL TIPO DE NOTIFICACIÓN
--    para incluir 'sistema' si no existía
-- -------------------------------------------------------
ALTER TABLE public.notificaciones
  DROP CONSTRAINT IF EXISTS notificaciones_tipo_check;

ALTER TABLE public.notificaciones
  ADD CONSTRAINT notificaciones_tipo_check
  CHECK (tipo IN ('mensaje', 'partido', 'torneo', 'sistema', 'amistad', 'rey_pista'));
