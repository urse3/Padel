-- ============================================================
-- MIGRACIÓN v4.0 — BUCKET DE AVATARES Y DATOS INICIALES
-- ============================================================

-- 1. CREAR EL BUCKET DE AVATARES
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatares', 'avatares', true)
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS DE SEGURIDAD PARA EL BUCKET
-- Permitir lectura pública a cualquier avatar
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatares' );

-- Permitir a usuarios autenticados subir avatares
CREATE POLICY "Users can upload their own avatars."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatares' AND auth.role() = 'authenticated' );

-- Permitir a usuarios actualizar sus propios avatares
CREATE POLICY "Users can update their own avatars."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatares' AND auth.role() = 'authenticated' );

-- 3. CREAR UN TORNEO DE PRUEBA
INSERT INTO public.torneos (nombre, descripcion, fecha_inicio, fecha_fin, nivel_min, nivel_max, max_parejas, precio_pareja, estado, tipo)
VALUES (
  'Torneo de Primavera 2026',
  '¡Apúntate al torneo más esperado de la temporada! Grandes premios y mucho nivel.',
  '2026-08-01',
  '2026-08-02',
  3.0,
  6.5,
  16,
  30.00,
  'inscripciones',
  'grupos'
);

-- 4. CREAR UNA NOTICIA DE PRUEBA
INSERT INTO public.eventos (titulo, descripcion, tipo, published)
VALUES (
  '¡Bienvenidos a la nueva versión!',
  'Hemos lanzado nuestra plataforma oficial con ranking ELO, inscripción a torneos y mucho más. ¡Prepárate para competir!',
  'noticia',
  true
);
