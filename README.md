# 🏓 PádelRank — App privada de pádel

App web autocontenida para gestionar el ranking de nivel entre un grupo privado de jugadores de pádel. Diseñada para móvil, oscura, y con toda la lógica integrada en un único `index.html`.

---

## 🚀 Despliegue rápido (Vercel)

### Opción A — Subir directamente a Vercel (sin GitHub)
1. Ve a [vercel.com/new](https://vercel.com/new)
2. Arrastra la carpeta `appweb padel` completa al drop-zone
3. Vercel detecta automáticamente el `index.html` estático
4. Haz clic en **Deploy** → listo

### Opción B — Desde GitHub
1. Sube esta carpeta a un repositorio de GitHub
2. Conecta el repo en [vercel.com/new](https://vercel.com/new)
3. Framework preset: **Other** (static)
4. Deploy

---

## 🔑 Paso obligatorio antes del deploy: Inyectar credenciales

Abre `index.html` y busca esta sección (líneas ~400):

```javascript
const SUPABASE_URL  = 'https://qinxaemwhjiiuehkgrge.supabase.co';
const SUPABASE_ANON = 'TU_ANON_KEY_AQUI';   // ← pega aquí tu Anon Key
```

Sustituye `TU_ANON_KEY_AQUI` con tu **Anon Public Key**:
- Supabase Dashboard → tu proyecto → **Project Settings** → **API**
- La clave empieza por `eyJ...`

**En Vercel (modo seguro):**
- Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**
- Pero como es un HTML estático con JS en cliente, la Anon Key va directamente en el código (es seguro, la Anon Key es pública por diseño, las políticas RLS protegen los datos)

---

## 🗄️ Base de datos (Supabase)

### 1. Ejecutar el schema

1. Ve a tu proyecto Supabase: [supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona el proyecto `qinxaemwhjiiuehkgrge`
3. Ve a **SQL Editor** → **New Query**
4. Pega el contenido de `database/schema.sql`
5. Haz clic en **Run**

### 2. Verificar que el trigger funciona

Después de ejecutar el schema:
1. Ve a **Authentication** → **Users** → **Invite user**
2. Invita el email de tu amigo
3. Cuando acepte la invitación, ve a **Table Editor** → `profiles`
4. Deberías ver su perfil creado automáticamente ✅

### 3. Configurar autenticación por email

En Supabase Dashboard:
- **Authentication** → **Providers** → **Email** → ✅ Enable
- **Authentication** → **Email Templates** → personaliza si quieres

---

## 📐 Fórmula de niveles (Elo adaptada)

```
K = 0.20  (factor de cambio máximo)
expected = 1 / (1 + 10^((nivel_perdedor - nivel_ganador) / 2))
delta = K × (1 - expected)
delta = clamp(delta, 0.05, 0.20)

Ganadores: nivel += delta
Perdedores: nivel -= delta
Nivel mínimo: 1.00 | Nivel máximo: 7.00
```

**Ejemplo:** Equipo de nivel 2.5 gana a equipo de nivel 2.5 → delta = 0.10 (partido igualado).

---

## 🏆 Escala de niveles

| Nivel | Categoría |
|-------|-----------|
| 1.00 – 1.49 | Iniciación 🌱 |
| 1.50 – 1.99 | Categoría 9 ⚪ |
| 2.00 – 2.49 | Categoría 8 🔵 |
| 2.50 – 2.99 | Categoría 7 🟡 |
| 3.00 – 3.49 | Categoría 6 🟠 |
| 3.50 – 3.99 | Categoría 5 🔴 |
| 4.00 – 4.49 | Categoría 4 🟣 |
| 4.50 – 4.99 | Categoría 3 ⚫ |
| 5.00 – 5.99 | Primera 🥇 |
| 6.00 – 7.00 | Élite 👑 |

---

## 🔒 Seguridad

- **RLS activado** en todas las tablas
- Los usuarios solo pueden leer perfiles de otros, no modificarlos
- La Anon Key solo permite operaciones que pasen las políticas RLS
- Los triggers usan `SECURITY DEFINER` para actualizaciones internas seguras

---

## 📋 Estructura de archivos

```
appweb padel/
├── index.html          ← App completa (HTML + CSS + JS)
├── README.md           ← Este archivo
└── database/
    └── schema.sql      ← Schema de Supabase (ejecutar 1 vez)
```
