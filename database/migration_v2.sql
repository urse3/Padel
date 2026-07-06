-- ============================================================
-- MIGRACIÓN COMPLETA v2.0 — PUNTO DE PADEL
-- Ejecutar en: https://supabase.com/dashboard/project/qinxaemwhjiiuehkgrge/sql/new
-- ============================================================

-- 1. ACTUALIZAR TABLA PROFILES
-- -------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url    text,
  ADD COLUMN IF NOT EXISTS pala          text,
  ADD COLUMN IF NOT EXISTS club          text,
  ADD COLUMN IF NOT EXISTS bio           text,
  ADD COLUMN IF NOT EXISTS nivel_previo  numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS racha_max     int DEFAULT 0;

-- Convertir escala de nivel 1-7 → 0-10
UPDATE public.profiles
  SET nivel = ROUND(((COALESCE(nivel, 1.0) - 1.0) / 6.0 * 10.0)::numeric, 2)
  WHERE nivel IS NOT NULL AND nivel <= 7.0;

-- 2. PARTIDOS ABIERTOS (Matchmaking)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partidos_abiertos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creador_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  club            text NOT NULL,
  fecha           date NOT NULL,
  hora            time NOT NULL,
  nivel_min       numeric DEFAULT 0,
  nivel_max       numeric DEFAULT 10,
  precio          numeric DEFAULT 0,
  es_privado      boolean DEFAULT false,
  max_jugadores   int DEFAULT 4,
  notas           text,
  estado          text DEFAULT 'abierto' CHECK (estado IN ('abierto','completo','cancelado','finalizado')),
  created_at      timestamptz DEFAULT now()
);

-- 3. INSCRIPCIONES A PARTIDOS ABIERTOS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inscripciones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id      uuid REFERENCES public.partidos_abiertos(id) ON DELETE CASCADE,
  jugador_id      uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(partido_id, jugador_id)
);

-- 4. REY DE PISTA
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rey_de_pista (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creador_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  club            text NOT NULL,
  fecha           date NOT NULL,
  hora            time NOT NULL,
  max_jugadores   int DEFAULT 8,
  nivel_min       numeric DEFAULT 0,
  nivel_max       numeric DEFAULT 10,
  precio          numeric DEFAULT 0,
  estado          text DEFAULT 'abierto' CHECK (estado IN ('abierto','en_curso','finalizado','cancelado')),
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rey_inscripciones (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rey_id          uuid REFERENCES public.rey_de_pista(id) ON DELETE CASCADE,
  jugador_id      uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  posicion        int, -- orden de llegada
  created_at      timestamptz DEFAULT now(),
  UNIQUE(rey_id, jugador_id)
);

CREATE TABLE IF NOT EXISTS public.rey_rondas (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rey_id          uuid REFERENCES public.rey_de_pista(id) ON DELETE CASCADE,
  numero_ronda    int NOT NULL,
  equipo1_j1      uuid REFERENCES public.profiles(id),
  equipo1_j2      uuid REFERENCES public.profiles(id),
  equipo2_j1      uuid REFERENCES public.profiles(id),
  equipo2_j2      uuid REFERENCES public.profiles(id),
  ganador_equipo  int, -- 1 o 2
  sets_equipo1    text,
  sets_equipo2    text,
  estado          text DEFAULT 'pendiente' CHECK (estado IN ('pendiente','jugado')),
  created_at      timestamptz DEFAULT now()
);

-- 5. TORNEOS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.torneos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          text NOT NULL,
  descripcion     text,
  fecha_inicio    date,
  fecha_fin       date,
  imagen_url      text,
  nivel_min       numeric DEFAULT 0,
  nivel_max       numeric DEFAULT 10,
  max_parejas     int DEFAULT 8,
  precio_pareja   numeric DEFAULT 0,
  estado          text DEFAULT 'inscripciones' CHECK (estado IN ('inscripciones','en_curso','finalizado','cancelado')),
  tipo            text DEFAULT 'eliminacion' CHECK (tipo IN ('eliminacion','grupos','liga')),
  creado_por      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inscripciones_torneo (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  torneo_id       uuid REFERENCES public.torneos(id) ON DELETE CASCADE,
  jugador1_id     uuid REFERENCES public.profiles(id),
  jugador2_id     uuid REFERENCES public.profiles(id),
  estado          text DEFAULT 'confirmado' CHECK (estado IN ('pendiente','confirmado','eliminado')),
  created_at      timestamptz DEFAULT now(),
  UNIQUE(torneo_id, jugador1_id),
  UNIQUE(torneo_id, jugador2_id)
);

CREATE TABLE IF NOT EXISTS public.partidos_torneo (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  torneo_id       uuid REFERENCES public.torneos(id) ON DELETE CASCADE,
  ronda           int NOT NULL,
  posicion        int NOT NULL,
  pareja1_id      uuid REFERENCES public.inscripciones_torneo(id),
  pareja2_id      uuid REFERENCES public.inscripciones_torneo(id),
  ganador_id      uuid REFERENCES public.inscripciones_torneo(id),
  sets_pareja1    text,
  sets_pareja2    text,
  fecha           date,
  estado          text DEFAULT 'pendiente' CHECK (estado IN ('pendiente','jugado','en_curso')),
  created_at      timestamptz DEFAULT now()
);

-- 6. CHAT DE PARTIDOS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mensajes_partido (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id      uuid REFERENCES public.partidos_abiertos(id) ON DELETE CASCADE,
  autor_id        uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  texto           text NOT NULL,
  created_at      timestamptz DEFAULT now()
);

-- 7. SISTEMA DE AMIGOS
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.amigos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitante_id  uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  receptor_id     uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  estado          text DEFAULT 'pendiente' CHECK (estado IN ('pendiente','aceptado','rechazado')),
  created_at      timestamptz DEFAULT now(),
  UNIQUE(solicitante_id, receptor_id)
);

-- 8. EVENTOS / NOTICIAS (para la landing pública)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eventos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo          text NOT NULL,
  descripcion     text,
  fecha           date,
  imagen_url      text,
  tipo            text DEFAULT 'noticia' CHECK (tipo IN ('noticia','evento','torneo_destacado')),
  torneo_id       uuid REFERENCES public.torneos(id) ON DELETE SET NULL,
  creado_por      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  published       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- 9. CAMPO tipo_actividad en tabla PARTIDOS (para el feed de la landing)
-- -------------------------------------------------------
ALTER TABLE public.partidos
  ADD COLUMN IF NOT EXISTS tipo_actividad  text DEFAULT 'partido'
    CHECK (tipo_actividad IN ('partido','rey_de_pista','torneo')),
  ADD COLUMN IF NOT EXISTS multiplicador   numeric DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS torneo_id       uuid REFERENCES public.torneos(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rey_id          uuid REFERENCES public.rey_de_pista(id) ON DELETE SET NULL;

-- 10. SUPABASE STORAGE — crear bucket de avatares
-- (Ejecutar como admin desde el dashboard de Supabase > Storage)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatares', 'avatares', true)
-- ON CONFLICT DO NOTHING;

-- 11. HABILITAR REALTIME en las tablas de chat y ranking
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes_partido;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rey_rondas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.partidos;

-- 12. RLS POLICIES — Nuevas tablas
-- -------------------------------------------------------
ALTER TABLE public.partidos_abiertos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rey_de_pista ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rey_inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rey_rondas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.torneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones_torneo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidos_torneo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes_partido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amigos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Partidos abiertos: cualquier autenticado puede leer y crear
CREATE POLICY "Cualquiera puede ver partidos abiertos"
  ON public.partidos_abiertos FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados crean partidos"
  ON public.partidos_abiertos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "El creador puede actualizar su partido"
  ON public.partidos_abiertos FOR UPDATE USING (creador_id = auth.uid());

-- Inscripciones
CREATE POLICY "Cualquiera puede ver inscripciones"
  ON public.inscripciones FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados se inscriben"
  ON public.inscripciones FOR INSERT WITH CHECK (jugador_id = auth.uid());
CREATE POLICY "Usuarios cancelan su propia inscripcion"
  ON public.inscripciones FOR DELETE USING (jugador_id = auth.uid());

-- Rey de Pista
CREATE POLICY "Cualquiera puede ver rey de pista"
  ON public.rey_de_pista FOR SELECT USING (true);
CREATE POLICY "Usuarios autenticados crean rey"
  ON public.rey_de_pista FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "El creador actualiza su rey"
  ON public.rey_de_pista FOR UPDATE USING (creador_id = auth.uid());

CREATE POLICY "Cualquiera ve inscripciones rey"
  ON public.rey_inscripciones FOR SELECT USING (true);
CREATE POLICY "Usuarios se inscriben en rey"
  ON public.rey_inscripciones FOR INSERT WITH CHECK (jugador_id = auth.uid());
CREATE POLICY "Usuarios se dan de baja de rey"
  ON public.rey_inscripciones FOR DELETE USING (jugador_id = auth.uid());

CREATE POLICY "Cualquiera ve rondas rey"
  ON public.rey_rondas FOR SELECT USING (true);
CREATE POLICY "Creador gestiona rondas"
  ON public.rey_rondas FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.rey_de_pista WHERE id = rey_id AND creador_id = auth.uid())
  );

-- Torneos: públicos para leer, solo admins crean
CREATE POLICY "Torneos son publicos"
  ON public.torneos FOR SELECT USING (true);
CREATE POLICY "Solo admin crea torneos"
  ON public.torneos FOR INSERT WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );
CREATE POLICY "Solo admin modifica torneos"
  ON public.torneos FOR UPDATE USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );

-- Inscripciones torneo
CREATE POLICY "Inscripciones torneo publicas"
  ON public.inscripciones_torneo FOR SELECT USING (true);
CREATE POLICY "Jugadores se inscriben en torneo"
  ON public.inscripciones_torneo FOR INSERT WITH CHECK (
    jugador1_id = auth.uid() OR jugador2_id = auth.uid()
  );
CREATE POLICY "Admin gestiona inscripciones torneo"
  ON public.inscripciones_torneo FOR UPDATE USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );

-- Partidos torneo
CREATE POLICY "Partidos torneo publicos"
  ON public.partidos_torneo FOR SELECT USING (true);
CREATE POLICY "Admin gestiona partidos torneo"
  ON public.partidos_torneo FOR ALL USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );

-- Chat
CREATE POLICY "Mensajes publicos para autenticados"
  ON public.mensajes_partido FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Autenticados envian mensajes"
  ON public.mensajes_partido FOR INSERT WITH CHECK (autor_id = auth.uid());

-- Amigos
CREATE POLICY "Ver propias relaciones de amigos"
  ON public.amigos FOR SELECT USING (
    solicitante_id = auth.uid() OR receptor_id = auth.uid()
  );
CREATE POLICY "Enviar solicitud de amistad"
  ON public.amigos FOR INSERT WITH CHECK (solicitante_id = auth.uid());
CREATE POLICY "Gestionar propias solicitudes"
  ON public.amigos FOR UPDATE USING (
    receptor_id = auth.uid() OR solicitante_id = auth.uid()
  );
CREATE POLICY "Eliminar amistad propia"
  ON public.amigos FOR DELETE USING (
    solicitante_id = auth.uid() OR receptor_id = auth.uid()
  );

-- Eventos
CREATE POLICY "Eventos publicos para todos"
  ON public.eventos FOR SELECT USING (published = true);
CREATE POLICY "Admin crea eventos"
  ON public.eventos FOR INSERT WITH CHECK (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );
CREATE POLICY "Admin modifica eventos"
  ON public.eventos FOR UPDATE USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
  );
