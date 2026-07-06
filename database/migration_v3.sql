-- ============================================================
-- MIGRACIÓN COMPLETA v3.0 — PUNTO DE PADEL
-- Añade tabla "pistas" y modifica tablas existentes
-- ============================================================

-- 1. Crear tabla pistas
CREATE TABLE IF NOT EXISTS public.pistas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL,
  tipo_pared      text NOT NULL CHECK (tipo_pared IN ('cristal','muro')),
  tipo_techo      text NOT NULL CHECK (tipo_techo IN ('cubierta','descubierta')),
  creado_por      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pistas ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Pistas son publicas para todos"
  ON public.pistas FOR SELECT USING (true);

CREATE POLICY "Solo admin crea pistas"
  ON public.pistas FOR INSERT WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );

CREATE POLICY "Solo admin modifica pistas"
  ON public.pistas FOR UPDATE USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );

-- 2. Modificar tablas existentes para enlazar con pista_id
ALTER TABLE public.partidos_abiertos
  ADD COLUMN IF NOT EXISTS pista_id uuid REFERENCES public.pistas(id) ON DELETE SET NULL;

ALTER TABLE public.rey_de_pista
  ADD COLUMN IF NOT EXISTS pista_id uuid REFERENCES public.pistas(id) ON DELETE SET NULL;

ALTER TABLE public.torneos
  ADD COLUMN IF NOT EXISTS pista_id uuid REFERENCES public.pistas(id) ON DELETE SET NULL;

-- Nota: Mantendremos la columna 'club' temporalmente por retrocompatibilidad o por si quieren texto libre,
-- pero idealmente se usará 'pista_id'.
