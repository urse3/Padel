-- ============================================================
-- MIGRACIÓN v5.0 — POLÍTICAS RLS PÚBLICAS PARA PÁGINAS DE COMUNIDAD
-- Ejecutar en: https://supabase.com/dashboard/project/_/sql/new
-- ============================================================

-- Las páginas públicas /comunidad/ranking, /comunidad/torneos y
-- /comunidad/partidos necesitan leer datos SIN autenticación.
-- Este script añade las políticas de lectura pública necesarias.

-- -------------------------------------------------------
-- 1. PROFILES — Lectura pública del ranking
-- -------------------------------------------------------
-- Eliminar si ya existiera (para evitar conflictos)
DROP POLICY IF EXISTS "Perfiles son publicos" ON public.profiles;
DROP POLICY IF EXISTS "Perfiles publicos para todos" ON public.profiles;
DROP POLICY IF EXISTS "Perfiles son visibles publicamente" ON public.profiles;

CREATE POLICY "Perfiles son visibles publicamente"
  ON public.profiles FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- 2. PARTIDOS (completados) — Lectura pública del feed de resultados
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Partidos son publicos" ON public.partidos;
DROP POLICY IF EXISTS "Cualquiera puede ver partidos" ON public.partidos;

CREATE POLICY "Partidos son visibles publicamente"
  ON public.partidos FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- 3. PARTIDOS_ABIERTOS — Ya tienen política pública pero la reforzamos
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver partidos abiertos" ON public.partidos_abiertos;

CREATE POLICY "Partidos abiertos son visibles publicamente"
  ON public.partidos_abiertos FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- 4. REY_DE_PISTA — Ya tienen política pública pero la reforzamos
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Cualquiera puede ver rey de pista" ON public.rey_de_pista;

CREATE POLICY "Rey de pista es visible publicamente"
  ON public.rey_de_pista FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- 5. TORNEOS — Ya tienen política pública pero la reforzamos
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Torneos son publicos" ON public.torneos;

CREATE POLICY "Torneos son visibles publicamente"
  ON public.torneos FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- 6. EVENTOS (noticias) — Ya tienen política pública pero la reforzamos
-- -------------------------------------------------------
DROP POLICY IF EXISTS "Eventos publicos para todos" ON public.eventos;

CREATE POLICY "Eventos son visibles publicamente"
  ON public.eventos FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- FIN DE MIGRACIÓN
-- Tras ejecutar, las páginas /comunidad/* cargarán datos correctamente.
-- -------------------------------------------------------
