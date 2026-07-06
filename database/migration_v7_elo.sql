-- Modificar el valor por defecto de la columna nivel a 1.0 en perfiles
ALTER TABLE public.profiles 
ALTER COLUMN nivel SET DEFAULT 1.0;

-- (Opcional) Si se desea resetear el nivel de todos los usuarios actuales a 1.0, descomentar la siguiente línea:
-- UPDATE public.profiles SET nivel = 1.0, nivel_previo = 1.0, partidos = 0, victorias = 0, racha = 0, racha_max = 0;
