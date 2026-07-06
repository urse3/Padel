-- ============================================================
-- PÁDEL APP - SCHEMA COMPLETO
-- Proyecto: qinxaemwhjiiuehkgrge
-- ============================================================

-- 1. EXTENSIÓN UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 2. TABLA DE PERFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  nivel       NUMERIC(4, 2) DEFAULT 1.00 NOT NULL,
  partidos    INT DEFAULT 0 NOT NULL,
  victorias   INT DEFAULT 0 NOT NULL,
  derrotas    INT DEFAULT 0 NOT NULL,
  racha       INT DEFAULT 0 NOT NULL,
  racha_max   INT DEFAULT 0 NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles visibles para todos los usuarios autenticados"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- 3. TABLA DE PARTIDOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.partidos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha           DATE DEFAULT CURRENT_DATE NOT NULL,
  ganador_1_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ganador_2_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  perdedor_1_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  perdedor_2_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sets_ganadores  TEXT NOT NULL,
  sets_perdedores TEXT NOT NULL,
  delta_nivel     NUMERIC(4, 2) DEFAULT 0.10,
  creado_por      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.partidos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partidos visibles para todos los autenticados"
  ON public.partidos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar partidos"
  ON public.partidos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 4. FUNCION: calcular_delta_nivel (formula Elo adaptada)
-- ============================================================
CREATE OR REPLACE FUNCTION calcular_delta_nivel(
  nivel_ganador  NUMERIC,
  nivel_perdedor NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  K         NUMERIC := 0.20;
  expected  NUMERIC;
  delta     NUMERIC;
BEGIN
  expected := 1.0 / (1.0 + POWER(10, (nivel_perdedor - nivel_ganador) / 2.0));
  delta := K * (1 - expected);
  delta := GREATEST(0.05, LEAST(0.20, delta));
  RETURN ROUND(delta, 2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 5. TRIGGER: actualizar niveles despues de cada partido
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_niveles_post_partido()
RETURNS TRIGGER AS $$
DECLARE
  niv_gan  NUMERIC;
  niv_per  NUMERIC;
  delta    NUMERIC;
BEGIN
  SELECT AVG(nivel) INTO niv_gan
  FROM public.profiles
  WHERE id IN (NEW.ganador_1_id, NEW.ganador_2_id);

  SELECT AVG(nivel) INTO niv_per
  FROM public.profiles
  WHERE id IN (NEW.perdedor_1_id, NEW.perdedor_2_id);

  delta := calcular_delta_nivel(niv_gan, niv_per);

  UPDATE public.profiles SET
    nivel     = GREATEST(1.00, LEAST(7.00, nivel + delta)),
    partidos  = partidos + 1,
    victorias = victorias + 1,
    racha     = CASE WHEN racha >= 0 THEN racha + 1 ELSE 1 END,
    racha_max = GREATEST(racha_max, CASE WHEN racha >= 0 THEN racha + 1 ELSE 1 END),
    updated_at = NOW()
  WHERE id IN (NEW.ganador_1_id, NEW.ganador_2_id);

  UPDATE public.profiles SET
    nivel    = GREATEST(1.00, LEAST(7.00, nivel - delta)),
    partidos = partidos + 1,
    derrotas = derrotas + 1,
    racha    = CASE WHEN racha <= 0 THEN racha - 1 ELSE -1 END,
    updated_at = NOW()
  WHERE id IN (NEW.perdedor_1_id, NEW.perdedor_2_id);

  UPDATE public.partidos SET delta_nivel = delta WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_actualizar_niveles ON public.partidos;
CREATE TRIGGER trg_actualizar_niveles
  AFTER INSERT ON public.partidos
  FOR EACH ROW EXECUTE FUNCTION actualizar_niveles_post_partido();

-- ============================================================
-- 6. TRIGGER: crear perfil automatico al registrarse
-- ============================================================
CREATE OR REPLACE FUNCTION crear_perfil_nuevo_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_crear_perfil_usuario ON auth.users;
CREATE TRIGGER trg_crear_perfil_usuario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION crear_perfil_nuevo_usuario();

-- ============================================================
-- 7. VISTA RANKING
-- ============================================================
CREATE OR REPLACE VIEW public.ranking AS
  SELECT
    ROW_NUMBER() OVER (ORDER BY nivel DESC, victorias DESC) AS posicion,
    id,
    full_name,
    email,
    nivel,
    partidos,
    victorias,
    derrotas,
    racha,
    racha_max
  FROM public.profiles
  ORDER BY nivel DESC, victorias DESC;

GRANT SELECT ON public.ranking TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT ON public.partidos TO authenticated;
