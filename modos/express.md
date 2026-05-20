# Modo: Express

**El modo del 80% de los casos.** Te monto una web simple en 5 minutos,
sin preguntas raras, sin specs, sin tests, sin ceremonia.

---

## Para que sirve

- Validar una idea rapida.
- Tener un sitio personal para enlazar desde redes sociales.
- Una landing de presentacion antes de un lanzamiento.
- Un MVP de fin de semana.
- Hackathons.
- «A ver si esta idea pega».

**Si tu proyecto va a tener usuarios, datos persistentes o pagos**,
mejor usa el [Modo Estandar](estandar.md). Es solo 25 minutos mas pero
te ahorra rehacerlo desde cero cuando crezca.

---

## El flujo (3 pasos, 5 minutos)

### Paso 1 — 2 preguntas rapidas

Solo dos cosas:

> «¿Que nombre quieres para el proyecto?»

Espero respuesta. Validacion minima: que sea texto sin espacios raros (kebab-case).

> «¿Que quieres que aparezca en la pagina? Dame una frase y, opcional,
> 2-3 cosas clave que destacar.»

Espero respuesta. Texto libre.

**Eso es todo.** No pregunto stack, no pregunto base de datos, no
pregunto deploy. Asumo lo razonable.

---

### Paso 2 — Construyo en staging (2-3 min)

Sin avisarte de cada operacion (no merece la pena para 5 min de trabajo).
Te enseno un solo mensaje:

> «Voy a montar tu web en una zona temporal. Dame 2 minutos.»

Lo que hago internamente:

1. Adquiero el cerrojo de sesion (silencioso).
2. Renderizo la plantilla `plantillas/web-simple/` con tus variables:
   ```bash
   node scripts/render-template.mjs --dir \
     ~/.claude/skills/arnes/plantillas/web-simple \
     ~/.arnes-staging/<sid>/<nombre-proyecto> \
     --var PROJECT_NAME=<nombre> \
     --var PROJECT_DESCRIPTION="<descripcion>"
   ```
3. Si el usuario dio «cosas clave», las inyecto en `app/page.tsx` (cambio
   las 3 lineas placeholder por su contenido).
4. `pnpm install` (silencioso, en staging).
5. Si todo verde, paso al paso 3. Si algo falla, rollback + aviso.

**No instalo:** Supabase, Vitest, Playwright, hooks de seguridad, AGENTS.md
completo, `.specs/`, ni nada del armazon SDD. **Solo lo minimo para
arrancar.**

---

### Paso 3 — Mover al destino final + entrega

Le pregunto al usuario:

> «Listo. ¿En que carpeta lo dejo? Por defecto, `~/proyectos/<nombre>`.»

Si dice «vale» o «por defecto», uso el default. Si dice otro path, uso ese.

Lo muevo de staging al destino:
```bash
node scripts/atomic.mjs promote <staging> <destino>
```

Inicializo git con un primer commit:
```bash
cd <destino>
git init -b main
git add .
git commit -m "chore: scaffold inicial con Arnes Modo Express"
```

Libero el cerrojo.

**Mensaje final al usuario:**

> «¡Listo! Tu web esta en `<destino>`. Para verla en local:
>
> ```bash
> cd <destino>
> pnpm dev
> ```
>
> Abre http://localhost:3000.
>
> Cuando quieras publicarla en internet (gratis):
> 1. Sube el repo a GitHub: `gh repo create <nombre> --private --source=. --push`.
> 2. Entra en https://vercel.com, conecta GitHub, importa el repo, pulsa Deploy.
> 3. En 2 minutos tendras una URL publica.
>
> ¿Algo mas o lo dejas para luego?»

---

## Lo que NO hago en Express

- ❌ Preguntar por stack (Next.js + Tailwind fijo).
- ❌ Preguntar por base de datos (no hay).
- ❌ Preguntar por auth/login (no hay).
- ❌ Escribir specs.
- ❌ Escribir tests.
- ❌ Configurar hooks de seguridad.
- ❌ Configurar AGENTS.md (es minimo, sin armazon).
- ❌ Configurar `.specs/`.
- ❌ Configurar migraciones SQL.
- ❌ Adversarial review.

**El compromiso es claridad:** el usuario no quiere hacer un proyecto
profesional. Quiere ver algo pronto. Yo le doy eso.

---

## Que SI hago en Express

- ✅ Next.js 15 con App Router.
- ✅ Tailwind CSS 4.
- ✅ TypeScript estricto (tipos basicos).
- ✅ Cabeceras de seguridad por defecto (vienen en `next.config.ts` aunque sea minimo).
- ✅ Git inicializado con primer commit.
- ✅ README con instrucciones para deploy a Vercel.
- ✅ `.gitignore` correcto (no se sube `.env.local`).
- ✅ Atomicidad en el montaje (staging + promote).

El staging y el rollback siguen funcionando — son cosas que tu no ves
pero te protegen.

---

## Que pasa si el usuario quiere mas despues

Cuando el usuario pida algo que necesita mas (login, datos, pagos), le
digo:

> «Esto que pides necesita anrnadir base de datos y login. Te propongo
> upgradear el proyecto al Modo Estandar. Implica:
>
> - Anrnadir Supabase (login + base de datos + ficheros).
> - Anrnadir verificaciones automaticas (tests basicos).
> - Anrnadir hooks de seguridad para que no subas claves al repo por error.
>
> Tarda 15-20 minutos hacer el upgrade. ¿Adelante?»

El upgrade es un flujo distinto (`modos/upgrade-express-a-estandar.md`,
viene en v0.3). Por ahora, lo manejo conversacionalmente.

---

## Rollback

Si en el paso 2 algo falla:
```bash
node scripts/atomic.mjs rollback
```

Esto deshace todo lo de staging. Tu disco como antes. No te enteras.

Si el usuario dice «cancela» en cualquier momento:
- Antes de paso 3: rollback automatico (estamos en staging, no se ha
  tocado el destino).
- Despues de paso 3: tengo que borrar el destino. Pregunto antes:
  «Voy a borrar la carpeta `<destino>` que acabo de crear. ¿Adelante?»

---

## Para Claude (instrucciones internas)

**Tono Express:** mas relajado, mas conversacional, menos formal que
los otros modos. El usuario eligio Express porque queria ir rapido.

**Reglas:**
1. Solo 2 preguntas iniciales. Punto.
2. No expliques jerga tecnica que no sea esencial. Si el usuario pregunta,
   ahi si.
3. No menciones SDD, TDD, RLS, hooks, locks, atomicidad. El usuario no
   los necesita saber.
4. No menciones `docs/ciclo-magico.md` ni `docs/seguridad.md`. Eso es del
   Modo PRO.
5. Si el usuario pide algo que necesita Modo Estandar/PRO, propon el
   upgrade. No intentes hacerlo todo en Express.

**Variables que se sustituyen automaticamente** (por
`render-template.mjs`):
- `{{PROJECT_NAME}}` — lo que diga el usuario en pregunta 1
- `{{PROJECT_DESCRIPTION}}` — la frase de pregunta 2
- `{{DATE}}`, `{{YEAR}}`, `{{HOST}}` — automaticas

**Protocolo de sesion (obligatorio):** lee
[`docs/internos/protocolo-sesion.md`](../docs/internos/protocolo-sesion.md)
antes de ejecutar nada. En resumen:
- Fija `ARNES_SESSION_ID` y `ARNES_PROJECT_DIR` UNA VEZ al inicio.
- Ejecuta en orden: acquire-lock → render → atomic.log/promote →
  setup-multi-ia → **generate-manifest** → git init/commit → release-lock.
- No cambies de session_id a mitad de flujo (rompe el lock).
