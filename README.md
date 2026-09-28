# 🎾 Punto de Padel

**Punto de Padel** es una plataforma web integral diseñada para comunidades y clubes de pádel. Permite a los jugadores gestionar su nivel mediante un algoritmo ELO dinámico, encontrar contrincantes, organizar partidos ("Partidos Abiertos" y "Rey de Pista"), inscribirse en torneos y seguir el ranking de su club.

## ✨ Características Principales

- **📈 Sistema de Ranking ELO**: Los jugadores ganan o pierden puntos dependiendo de sus victorias/derrotas y la diferencia de nivel con sus oponentes.
- **🎾 Organización de Partidos**: Crea partidos privados o abiertos, encuentra jugadores de tu nivel y gestiona tu agenda.
- **👑 Modo "Rey de Pista"**: Modalidad especial para 6-12 jugadores con rotaciones continuas.
- **🏆 Torneos Oficiales**: Apúntate a competiciones organizadas por la comunidad, revisa los brackets y sube a lo más alto de la clasificación.
- **🔔 Notificaciones y Amigos**: Chat directo, notificaciones en tiempo real para invitaciones a partidos y avisos sobre cambios en tu agenda.
- **⚡ Auto-Inscripción por Enlace**: Comparte enlaces inteligentes (`/partidos/[id]`) por WhatsApp para que tus amigos se unan a la pista con un solo clic.

## 🛠️ Stack Tecnológico

Este proyecto está construido con las tecnologías modernas más potentes del ecosistema React:

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Base de Datos & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Componentes & UI**: [Radix UI](https://www.radix-ui.com/) + [Lucide Icons](https://lucide.dev/)
- **Despliegue**: [Vercel](https://vercel.com/) (Incluye Vercel Cron Jobs para Keep-Alive de Supabase)

## 🚀 Empezando en Local

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/urse3/Padel.git
cd Padel
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto basándote en las credenciales de tu proyecto de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica
```

### 4. Ejecutar el servidor de desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver el resultado.

## 📦 Despliegue en Vercel

El proyecto está optimizado para su despliegue en Vercel. 
> **Nota de Arquitectura**: Utilizamos `proxy.ts` en lugar del antiguo `middleware.ts` en base a las nuevas especificaciones de Next.js 16 para evitar problemas en el entorno Edge.

Además, el archivo `vercel.json` incluye la configuración de un **Cron Job** (`/api/keepalive`) que evita que el plan gratuito de Supabase pause la base de datos tras 7 días de inactividad. 
- *Asegúrate de configurar la variable `CRON_SECRET` en los ajustes de tu proyecto en Vercel.*

## 📄 Licencia

Desarrollado para la comunidad de Punto de Padel.
