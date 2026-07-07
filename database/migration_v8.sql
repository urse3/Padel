-- Migración v8: Mensajes directos e Incidencias (Contacto)

-- 1. Tabla de Mensajes Directos (Chat entre amigos)
CREATE TABLE IF NOT EXISTS public.mensajes_directos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  emisor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  receptor_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  contenido text NOT NULL,
  leido boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mensajes_directos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus propios mensajes" 
  ON public.mensajes_directos FOR SELECT 
  USING (auth.uid() = emisor_id OR auth.uid() = receptor_id);

CREATE POLICY "Usuarios envían mensajes" 
  ON public.mensajes_directos FOR INSERT 
  WITH CHECK (auth.uid() = emisor_id);

CREATE POLICY "Usuarios marcan mensajes como leidos" 
  ON public.mensajes_directos FOR UPDATE 
  USING (auth.uid() = receptor_id);

-- Activar Realtime para los mensajes
ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes_directos;


-- 2. Tabla de Incidencias / Contacto
CREATE TABLE IF NOT EXISTS public.incidencias (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  email text NOT NULL,
  tipo text NOT NULL, -- 'consulta', 'soporte', 'incidencia_tecnica'
  mensaje text NOT NULL,
  estado text DEFAULT 'pendiente', -- 'pendiente', 'leido', 'resuelto'
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.incidencias ENABLE ROW LEVEL SECURITY;

-- Cualquiera (incluso no registrados) puede enviar incidencias
CREATE POLICY "Cualquiera puede insertar incidencias" 
  ON public.incidencias FOR INSERT 
  WITH CHECK (true);

-- Solo los admin pueden ver o actualizar incidencias
CREATE POLICY "Admins ven incidencias" 
  ON public.incidencias FOR SELECT 
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE);

CREATE POLICY "Admins actualizan incidencias" 
  ON public.incidencias FOR UPDATE 
  USING ((SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = TRUE);
