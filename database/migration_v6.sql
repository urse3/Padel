-- ============================================================
-- MIGRACIÓN v6.0 — ESTADOS DE INSCRIPCIÓN (Aprobación)
-- Ejecutar en: https://supabase.com/dashboard/project/_/sql/new
-- ============================================================

-- 1. Añadir estado a la tabla inscripciones (Partidos Abiertos)
ALTER TABLE public.inscripciones
  ADD COLUMN IF NOT EXISTS estado text DEFAULT 'pendiente' CHECK (estado IN ('pendiente','confirmado','rechazado','cancelado'));

-- Si hay inscripciones existentes, las marcamos como confirmadas
UPDATE public.inscripciones SET estado = 'confirmado' WHERE estado = 'pendiente';

-- 2. Asegurarse de que inscripciones_torneo tiene el estado y RLS
-- Ya existe, pero nos aseguramos de que el admin pueda gestionarlas.
-- Las politicas actuales dicen "Admin gestiona inscripciones torneo" (ALL)
-- Así que el admin ya puede hacer UPDATE estado = 'confirmado'.

-- 3. Permitir que el creador del partido pueda aceptar/rechazar inscripciones
-- Actualmente: CREATE POLICY "Usuarios cancelan su propia inscripcion" ON inscripciones FOR DELETE
-- Necesitamos que el creador del partido pueda hacer UPDATE a la inscripción.

DROP POLICY IF EXISTS "Creador gestiona inscripciones" ON public.inscripciones;
CREATE POLICY "Creador gestiona inscripciones"
  ON public.inscripciones FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.partidos_abiertos p
      WHERE p.id = partido_id AND p.creador_id = auth.uid()
    )
  );
