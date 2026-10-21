# Publicar InclusiveCourt (sin túnel Cloudflare)

Recomendación: **frontend en Vercel** + **API FastAPI en Render** (gratis).  
Así tienes URL estable HTTPS y no dependes de `trycloudflare` ni de dejar el portátil encendido.

```text
Navegador  →  https://tu-app.vercel.app  (Next.js)
                 └─ rewrite /api/*  →  https://tu-api.onrender.com  (FastAPI)
```

> Meter todo el backend en Vercel (Python serverless) no encaja bien: TTS (`edge-tts`), PDFs y llamadas largas a Gemini se cortan por timeouts/cold starts. Por eso la API va aparte.

---

## 1. API en Render (unos minutos)

1. Entra en [render.com](https://render.com) y conecta el repo `tiago-volta/DATATHON-2026`.
2. **New → Blueprint** y elige el `render.yaml` de la raíz, **o** Web Service manual:
   - Root Directory: `backend`
   - Runtime: Python 3
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Variables de entorno (Dashboard → Environment):

| Variable | Valor |
|----------|--------|
| `LLM_PROVIDER` | `gemini` (o `mock` para demo sin clave) |
| `GEMINI_API_KEY` | tu clave (si usas Gemini) |
| `GEMINI_MODEL` | `gemini-3.8-flash` (opcional) |

4. Copia la URL pública, p. ej. `https://court-api.onrender.com`.  
   Comprueba: `https://…/docs` debe abrir Swagger.

**Nota:** en el plan free, Render duerme la API tras ~15 min sin tráfico; la primera petición puede tardar ~30–60 s.

---

## 2. Frontend en Vercel

1. Entra en [vercel.com](https://vercel.com) → **Add New Project** → importa el mismo repo.
2. Ajustes del proyecto:
   - **Root Directory:** `frontend`
   - Framework: Next.js (autodetectado)
   - Build: `npm run build` / Output: default
3. Variables de entorno:

| Variable | Valor | Notas |
|----------|--------|--------|
| `BACKEND_URL` | `https://tu-api.onrender.com` | Sin barra final. Sirve el rewrite `/api → API`. |
| `NEXT_PUBLIC_API_URL` | *(vacío)* | Dejar vacío para que el navegador llame a `/api/...` en el mismo dominio Vercel. |

4. Deploy. URL típica: `https://datathon-2026.vercel.app` (o el dominio que elijas).

Cada push a `main` (si conectas Git) redespliega solo.

---

## 3. Comprobar

- `/` y `/pasaporte` cargan en Vercel.
- `/citacion` → Transformar documento (si Gemini está configurado en Render).
- `/api/tts` o «Modo con voz» (proxy vía rewrite).
- QR del Pasaporte: debe apuntar a `https://tu-app.vercel.app/pasaporte/ver?...`.

---

## Local vs producción

| | Local | Producción |
|--|--------|------------|
| Web | `./start.sh` → localhost:3000 | Vercel |
| API | localhost:8000 | Render |
| Túnel | Cloudflare quick tunnel | No hace falta |

En local puedes seguir con `BACKEND_URL` por defecto (`http://127.0.0.1:8000`) en `next.config.js`.
