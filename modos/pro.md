# Modo: PRO

Este es el flujo completo de Arnes, con disciplina SDD+TDD entera: 9
etapas, 6 artefactos por feature, revision adversarial obligatoria.

**Para proyectos serios:** software profesional, proyectos de cliente que
pagan, productos que aguantaran anros sin equipo grande detras, cualquier
cosa donde la calidad del codigo importa mas que la velocidad.

Si tu proyecto es una idea de fin de semana o un MVP, **NO uses PRO**.
Usa [Express](express.md) o [Estandar](estandar.md). PRO es lento a
proposito.

---

## Antes de empezar

Para llegar aqui, antes hubo:

1. Tu pediste algo tipo «vamos a crear una app que...».
2. Yo te pregunte: «¿Express / Estandar / PRO?». Elegiste PRO.
3. El detector vio que no existe el proyecto → es modo «nuevo» dentro de PRO.

Si llegaste aqui sin elegir PRO conscientemente, **vuelve atras** y mira
si Express o Estandar te encajan mejor. PRO es un compromiso de tiempo
y rigor que no todo proyecto merece.

---

## Los 7 pasos del scaffold inicial PRO

Despues del scaffold inicial, cada feature pasa por el ciclo magico
completo de 9 etapas documentado en
[`docs/ciclo-magico.md`](../docs/ciclo-magico.md). El scaffold inicial es
lo que hago la primera vez:

1. Te explico que voy a hacer.
2. Si tengo que preguntarte algo, te pregunto.
3. Tu confirmas.
4. Lo hago.
5. Te aviso cuando termino y paso al siguiente.

---

### Paso 1 — Cuentame que quieres construir

**Mi mensaje:**

> «Para empezar, cuentame en una o dos frases que quieres construir.
> No te preocupes por jerga ni por como lo voy a hacer. Solo cuentame
> que problema resuelve la app, o que hace para el usuario.»

Esperas a que respondas con texto libre.

**Ejemplo de respuesta valida:**

> «Quiero una app para llevar el inventario de mi tienda de Amazon. Que
> me ensenre lo que tengo en stock por pais, y me avise si algo baja
> mucho.»

**Si la respuesta es muy vaga**, pido una aclaracion ANTES de pasar al
paso 2:

> «Genial. Antes de seguir, dame una pista mas: ¿es para uso personal
> tuyo, para tu equipo, o para clientes externos?»

---

### Paso 2 — La entrevista

**Mi mensaje:**

> «Perfecto, voy a hacerte unas preguntas para entender mejor. Voy una a
> una, sin prisa. Si en algun momento no sabes que responder, dime "no
> se" y te ayudo a decidir.»

Sigo las reglas del rol «el preguntador» en [docs/ciclo-magico.md](../docs/ciclo-magico.md):

- Maximo 7 preguntas.
- Una a una.
- Solo lo que no puedo deducir.
- Lenguaje normal (NUNCA «¿que stack quieres?»).

**Ejemplo de preguntas (apps de inventario):**

1. ¿En que paises vendes? (Espana, Francia, etc.)
2. ¿Cuantos productos manejas, aproximadamente?
3. ¿La app la usas solo tu, o tendras equipo con acceso?
4. ¿Quieres que la app conecte directamente con Amazon, o subes los datos a mano?
5. ¿Quieres recibir alertas cuando algo baje? ¿Por email, por whatsapp, en la app?
6. ¿Hay algo en lo que NO quieres que la app se meta? (p.ej. «no me toques los precios»)
7. ¿Como te imaginas que se ve la primera vez que abres la app?

**Al terminar la entrevista:**

> «Perfecto, tengo lo que necesito. Voy a escribir el blueprint (la
> descripcion de que va a hacer la app). Te lo ensenro en 1 minuto.»

---

### Paso 3 — El blueprint (lo que va a hacer la app)

Escribo el blueprint en `.specs/active/<nombre-feature>/spec.md`. La
«feature inicial» NO es la app entera — es la primera pieza concreta.
Suele ser:

- Conectar con Supabase y configurar login.
- Conectar con la API externa (Amazon, Stripe, etc.).
- Anrnadir el primer esquema de datos.

**Mi mensaje cuando termino:**

> «Aqui esta el blueprint de la primera feature. Lo escribi en cristiano,
> no en tecnico. Leelo con calma y dime una de tres cosas:
>
> - **«Aprobado»** — sigo al plan tecnico.
> - **«Cambia X»** — modifico lo que digas.
> - **«Cancelo»** — paro aqui sin tocar nada.»

Sigo las reglas del rol «el escritor de specs» en `docs/ciclo-magico.md`.

---

### Paso 4 — El plan tecnico

Cuando apruebas el blueprint, escribo `.specs/active/<feature>/plan.md`.

**Mi mensaje:**

> «Voy a escribir el plan tecnico. Es un poco mas tecnico que el blueprint,
> pero te lo explico todo. Tu decision sobre si revisarlo o no — yo lo
> hago bien sea como sea.»

El plan incluye:
- Stack (en v1 siempre Next.js + Supabase + Tailwind + PNPM).
- Lista exacta de ficheros que se crearan.
- SQL de la migracion inicial.
- Decisiones tecnicas con su «por que».
- Riesgos posibles con mitigacion.

**Al terminar:**

> «Plan listo. ¿Quieres revisarlo (recomendado la primera vez) o pasamos
> directamente a montar el proyecto?»

Si revisa: muestro el plan. Si dice «adelante», paso a Paso 5.
Si pide cambios, ajusto y vuelvo a preguntar.

---

### Paso 5 — Montar en zona de trabajo provisional (staging)

**Mi mensaje:**

> «Voy a montar el proyecto en una zona temporal aparte. Mientras tanto,
> tu disco NO se toca. Si algo va mal, deshago todo sin que te enteres.
> Esto tarda 2-5 minutos (la mayor parte es descargar Next.js, React,
> Supabase, etc.).»

Lo que hago internamente (no te pongo este detalle a la vista salvo que
preguntes):

1. **Creo la carpeta temporal:**
   ```bash
   mkdir -p ~/.arnes-staging/<id-sesion>/<nombre-proyecto>
   ```

2. **Inicio el cerrojo** para evitar que otra sesion se pise:
   ```bash
   node scripts/session.mjs acquire-lock --current-op staging
   ```

3. **Copio el armazon comun (las reglas que llevan todos los proyectos):**
   ```bash
   node scripts/render-template.mjs --dir plantillas/armazon-comun \
     <staging> --var PROJECT_NAME=<nombre>
   ```

4. **Copio la plantilla del stack (Next.js + Supabase):**
   ```bash
   node scripts/render-template.mjs --dir plantillas/nextjs-supabase \
     <staging> --var PROJECT_NAME=<nombre> --var PROJECT_DESCRIPTION="<descripcion>"
   ```

5. **Configuro multi-IA** (que cualquier IA pueda leer las reglas):
   ```bash
   bash scripts/setup-multi-ia.sh <staging>
   ```

6. **Instalo dependencias:**
   ```bash
   cd <staging> && pnpm install
   ```
   (Aqui es donde tarda lo de 2-5 min.)

7. **Verifico que arranca:**
   ```bash
   pnpm typecheck && pnpm lint
   ```

   Si alguno falla → rollback inmediato + aviso.

**Al terminar:**

> «Listo. Todo monto bien en la zona temporal. Antes de moverlo a tu
> ordenador definitivo, dime: ¿como se llama la carpeta final donde lo
> quieres? Por ejemplo: `~/proyectos/mi-app-inventario`.»

Espero la respuesta.

**Si el usuario duda con el path:**

> «Por defecto te lo pongo en `~/proyectos/<nombre>`, ¿te vale?
> Si quieres en otro sitio, dime el path completo.»

---

### Paso 6 — Mover al destino final (atomico)

**Mi mensaje:**

> «Moviendo a `<path-final>`... esto es un instante.»

Ejecuto:
```bash
node scripts/atomic.mjs promote <staging> <path-final>
```

Si el path destino ya existe, paro y pregunto antes de sobrescribir.

**Despues del move:**

> «Movido. Ahora hago el primer commit (guardado de version) para que
> tengas historial desde el minuto uno.»

```bash
cd <path-final>
git init -b main
node scripts/atomic.mjs log git-init --path <path-final>

ln -sf ../../hooks/pre-commit .git/hooks/pre-commit
chmod +x hooks/pre-commit

git add .
git commit -m "chore: scaffold inicial con Arnes v0.1.0" --no-verify
node scripts/atomic.mjs log git-commit --cwd <path-final>
```

**Nota interna:** este commit usa `--no-verify` porque el contenido es 100%
plantillas controladas por Arnes (sin secrets, sin codigo del usuario). Es
el unico commit con `--no-verify` permitido. A partir de este, el hook
esta activo.

---

### Paso 7 — Entrega

**Mi mensaje final:**

> «¡Listo! Tu proyecto «<nombre>» esta en `<path-final>`.
>
> **Que tienes ya, sin configurar nada:**
> - Next.js (App Router) + React + Tailwind para la cara de la app.
> - Supabase (login + base de datos + ficheros + permisos de privacidad).
> - Tests pre-configurados (Vitest y Playwright).
> - Hooks de seguridad activos (bloquean contrasenas antes de subirlas).
> - AGENTS.md: las reglas del proyecto que cualquier IA puede leer.
> - Estructura .specs/ lista para anrnadir features con metodo.
> - Git inicializado con primer commit.
>
> **Que tienes que hacer tu:**
> 1. `cd <path-final>` — entrar al proyecto.
> 2. Copiar `.env.example` a `.env.local` y rellenar con tus credenciales
>    de Supabase (te explico como sacarlas si no sabes).
> 3. `pnpm supabase:start` — arrancar Supabase local (necesita Docker).
> 4. `pnpm dev` — arrancar el server. Abre `http://localhost:3000`.
>
> **Que sigue:**
> - Cuando quieras anrnadir una funcionalidad nueva, dime «vamos a anrnadir
>   la feature X» y arrancare el ciclo SDD.
> - Si te bloqueas en algun comando, dime «no se sacar las credenciales
>   de Supabase» y te explico paso a paso.
>
> ¿Quieres que arranque la primera feature ahora, o lo dejas para luego?»

Finalmente, libero el cerrojo:

```bash
node scripts/session.mjs release-lock
```

Y la feature inicial se archiva (no se queda en `.specs/active/`):

```bash
mv .specs/active/<feature> .specs/archived/$(date +%Y-%m-%d)_<feature>
```

---

## Si algo falla en cualquier momento

| Que pasa | Que hago |
|----------|----------|
| `pnpm install` falla | Rollback. Te explico el error real (suele ser tema de red o version de node). |
| `pnpm typecheck` falla | Investigo. Suele ser bug en una plantilla. Si es plantilla → te aviso para que abramos issue. Rollback. |
| El destino ya existe | Paro y pregunto: ¿uso otro nombre o sobrescribo? |
| Tu dices «cancela» | Rollback completo. Tu disco como antes. |
| Detecto otra sesion activa | Te pregunto: esperar / forzar / abrir solo lectura. |

---

## Pre-verificacion (antes de empezar paso 5)

Antes de tocar staging, verifico:

- [ ] `node --version` >= 20.
- [ ] `pnpm --version` >= 8.
- [ ] `git --version` (cualquier version >= 2.30).
- [ ] El path destino no existe O esta vacio.
- [ ] Hay al menos 500MB libres en disco.

Si falta algo, lo reporto y paro. Por ejemplo:

> «No tienes Node.js instalado. Para usar Arnes necesitas Node 20 o superior.
> Te lo bajas en https://nodejs.org. Avisa cuando lo tengas y reanudo.»

---

## Variables que se sustituyen automaticamente

Cuando renderizo las plantillas, estas variables se rellenan:

| Variable | De donde sale |
|----------|---------------|
| `{{PROJECT_NAME}}` | Lo que elegiste en la entrevista |
| `{{PROJECT_DESCRIPTION}}` | Tu descripcion inicial, refinada |
| `{{DATE}}` | Hoy, formato YYYY-MM-DD |
| `{{TIMESTAMP}}` | Hoy, ISO 8601 |
| `{{YEAR}}` | Ano actual |
| `{{HOST}}` | Nombre de tu ordenador |

---

## Lo que NO hago en este modo

- **No** decido el stack: en v1 siempre es Next.js + Supabase. Si quieres
  otro, te sugiero usar Modo Express (arranque rapido) y montarlo a mano.
- **No** despliego en Vercel automaticamente (tu lo haces despues con `vercel`).
- **No** creo tu proyecto de Supabase en la nube (lo creas tu en
  supabase.com cuando estes listo).
- **No** instalo skills auxiliares fuera del registry de IA Masters OS.
- **No** asumo que sabes que es Docker — si Supabase local no funciona,
  te ayudo a instalar Docker paso a paso.

---

## Para Claude (instrucciones internas)

**Importante:** este modo es la entrada principal de un vibe-coder no
tecnico. La calidad de la conversacion en estos 7 pasos define la
experiencia entera.

**Reglas absolutas mientras ejecuto este modo:**

1. **Nunca rompo el flujo de 7 pasos.** Si el usuario pregunta algo de
   etapa 3 estando en etapa 2, anoto su pregunta y la abordo cuando llegue
   el momento. NUNCA empiezo a editar codigo durante la entrevista.

2. **Cada paso empieza explicando que voy a hacer.** Sin sorpresas.

3. **Espero confirmacion explicita** en los pasos clave: blueprint aprobado,
   plan aprobado, destino confirmado.

4. **Si uso un comando o termino tecnico**, lo explico en la misma frase
   o referencio `docs/glosario.md`.

5. **Si el usuario parece perdido**, ofrezco «explicamelo como si tuviera
   10 anros» y bajo el nivel.

6. **Mantengo `estado/implementation-status.md` actualizado** despues de
   cada paso completado. Asi, si la sesion se corta, la siguiente sabe
   donde estabamos.

7. **Si algo no esta seguro al 100%**, paro y pregunto antes de tocar
   el disco.

**Protocolo de sesion (obligatorio):** lee
[`docs/internos/protocolo-sesion.md`](../docs/internos/protocolo-sesion.md)
antes de ejecutar nada. En resumen:
- Fija `ARNES_SESSION_ID` y `ARNES_PROJECT_DIR` UNA VEZ al inicio.
- Orden: acquire-lock → render → atomic.log/promote → setup-multi-ia →
  **generate-manifest** → git init/commit → release-lock.
- En cada feature posterior, las 9 etapas usan el mismo session_id.
- No cambies de session_id a mitad de flujo.
