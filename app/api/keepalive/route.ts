import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Esta ruta no debe ser cacheada para asegurar que el ping realmente llegue a la base de datos
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // 1. Verificación de seguridad básica (CRON_SECRET)
  // Vercel envía el header x-vercel-cron cuando ejecuta un cron job
  // Si configuramos CRON_SECRET en las variables de entorno, también validamos el Bearer token
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Si hemos configurado un secreto en Vercel, comprobamos que el token coincida
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const sb = await createClient()

    // 2. Hacer una consulta ligerísima para registrar actividad en Supabase
    // Utilizamos head: true para no descargar datos, sólo contar.
    const { error, count } = await sb
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Keepalive error:', error)
      return NextResponse.json({ error: 'Database ping failed', details: error.message }, { status: 500 })
    }

    // 3. Responder con éxito
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase kept alive', 
      timestamp: new Date().toISOString() 
    })

  } catch (error: any) {
    console.error('Keepalive exception:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
