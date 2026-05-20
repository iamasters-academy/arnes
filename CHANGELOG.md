# Changelog

Todos los cambios notables en la skill **Arnes** se documentan aqui.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.2.4] — 2026-05-20

**Doc patch tras hacer el repo publico** para integrarlo como skill opt-in
en iAmasters OS. La v0.2.3 afirmaba «(privado)» en README y SKILL.md; al
hacer el repo publico esos textos quedaban desfasados. Esta release los
sincroniza sin tocar codigo.

### Arreglado

- `README.md` cabecera: bump `v0.2.3` → `v0.2.4`.
- `README.md` cuerpo (linea 7): anrnade «Repo publico bajo licencia MIT».
- `README.md` seccion Roadmap: entrada v0.2.4 anrnadida arriba; v0.2.3
  reetiquetada como «(patch)» en lugar de «(release actual, patch)».
- `SKILL.md` pie (linea 186): «Repo: ... (publico, MIT)» en lugar de
  «(privado)».
- `.version`: `0.2.3` → `0.2.4`.
- `CITATION.cff`: bump `version: 0.2.4`.

### Sin cambios funcionales

Cero cambios en codigo, scripts, modos, plantillas o tests. Los 139 tests
(96 estructurales + 43 E2E) siguen pasando porque no se ha tocado nada
ejecutable. La validacion con 5 sub-agentes Haiku en paralelo de v0.2.3
sigue siendo valida para v0.2.4.

### Contexto

Esta release acompanra la integracion de la skill como opt-in en
`iamasters-academy/iamasters-os` v0.8.0, siguiendo el patron «vendor +
_optional + /install-skill» que el OS ya usa para la skill `cognito`.

---

## [0.2.3] — 2026-05-20

**Patch release tras nitpick de Clau** (asistente de Fernando) sobre
v0.2.2. La auditoria de v0.2.2 sobre rutas hardcoded fue exhaustiva pero
quedaron 6 sitios con la version literal `0.2.1` desfasada, incluyendo
**uno funcional critico** que la audit no detecto: el `DEFAULT_VERSION`
hardcoded en `scripts/generate-manifest.mjs`.

### Arreglado

**Critico funcional — `generate-manifest.mjs` ya no hardcodea version.**

Antes: `const DEFAULT_VERSION = '0.2.1';`. Si alguien invocaba
`generate-manifest generate <dir>` sin pasar `--version`, el manifest
salia con `"version": "0.2.1"` aunque ya estuvieramos en 0.2.2+.

Ahora: nueva funcion `resolveVersion(explicit, skillDir)` con prioridad:
1. `--version` pasado por CLI.
2. `$ARNES_VERSION` (env).
3. Lectura de `<skill-dir>/.version` (fuente de verdad — autoresolutivo).
4. Fallback `"unknown"` con aviso a stderr si nada lo resuelve.

Probado: los 3 modos de resolucion funcionan (lee .version, CLI override,
env override).

**Cosmetico — docs ya no hardcodean version en ejemplos.**

- `modos/mantener.md:284` decia `--version 0.2.1` literal → reemplazado
  por comando sin `--version` (el script lo resuelve solo).
- `docs/internos/protocolo-sesion.md:115` igual.

Ambos sitios ahora explican: «no hardcodees, el script lee .version».

**Cosmetico — docstrings y etiquetas.**

- `generate-manifest.mjs` docstring header: ejemplo `"version": "0.2.1"`
  → comentario explicando que se lee de .version.
- `generate-manifest.mjs` docstring help: `default: 0.2.1` → texto
  describiendo el orden de resolucion (CLI > env > .version > fallback).
- `smoke-test.sh:140` etiqueta `(v0.2.1)` quitada (ya no aplica).

### Anrnadido

- Check nuevo en smoke-test: «generate-manifest.mjs lee .version (no
  hardcoded)». Falla si alguien re-introduce un `const DEFAULT_VERSION = 'X.Y.Z'`.

### Leccion canonica

«Cuando arreglas N sitios con la misma version literal, audita tambien
los **ejemplos en docs/help/comments**. Mejor todavia: haz que el codigo
lea de una sola fuente de verdad (`.version`) y los docs no necesitaran
actualizarse cada release.»

La auditoria de v0.2.2 hizo 6 grep checks limpios, pero ninguno fue
`grep -rn "0\.2\.[01]" --include="*.mjs"`. Esto cierra ese hueco con
el check del smoke-test.

---

## [0.2.2] — 2026-05-20

**Patch release tras feedback de Fernando sobre v0.2.1.** Tres areas a
limpiar: README desactualizado, rutas hardcoded, versiones pnpm/node
antiguas. Auditoria exhaustiva: tambien se arreglan referencias
asociadas que Fer no menciono pero estaban en el mismo problema.

### Arreglado

**P1 — README cuerpo desactualizado (lineas 1-100).**
Antes seguia siendo el README de v0.1.0: «MVP v0.1.0», tabla «Los 3
modos: Nuevo / Adoptar / Mantener», stack solo Next+Supabase. Solo el
Roadmap estaba al dia.
Cambios:
- Header reescrito: v0.2.2 con descripcion alineada a 3 niveles.
- «Para que sirve» reescrito mencionando Express / Estandar / PRO.
- «Cuando NO usarla» eliminado (Express ya cubre ese caso).
- Tabla de modos: ahora son 5 (Express/Estandar/PRO + Adoptar/Mantener).
- Stack: tabla por modo (web-simple vs nextjs-supabase).
- Estructura de la skill: actualizada con `tutorial/`, `docs/internos/`,
  ambas plantillas, los 5 modos.
- Anrnadida seccion «Customizar la ruta (avanzado)» con `ARNES_SKILL_DIR`.

**P2 — Rutas hardcoded `~/.claude/skills/arnes/`.**
Fer marco 6 sitios en `modos/express.md` y `modos/mantener.md`.
Auditoria descubrio **10 sitios mas en `docs/internos/protocolo-sesion.md`**.
Total: 16 sitios funcionales hardcoded.

Solucion: `protocolo-sesion.md` Regla 1 ahora obliga a exportar
`ARNES_SKILL_DIR` al inicio del modo (junto con `ARNES_SESSION_ID` y
`ARNES_PROJECT_DIR`):

```bash
export ARNES_SKILL_DIR="${ARNES_SKILL_DIR:-$HOME/.claude/skills/arnes}"
```

Todos los modos y el protocolo-sesion.md usan ahora `$ARNES_SKILL_DIR/...`
en lugar de la ruta literal. Si IA Masters OS instala la skill en otra
ruta, basta con exportar la variable.

Apariciones restantes de `~/.claude/skills/arnes/` (legitimas, no
funcionales):
- 3 en `protocolo-sesion.md` (texto explicativo de la regla).
- 2 en docstrings de `scripts/generate-manifest.mjs`.
- 4 en README (ejemplos pedagogicos para el caso default).

**P3 — `packageManager: pnpm@9.0.0` y `engines.node: ">=20"`.**
Mayo 2026 toca pnpm 11 y Node 22 LTS.

Actualizado en:
- `plantillas/web-simple/package.json.tmpl`: pnpm@9.0.0 → pnpm@11.0.0,
  node >=20 → >=22.
- `plantillas/nextjs-supabase/package.json.tmpl`: idem.
- `tutorial/PRIMER-PROYECTO.md`: «Node.js version 20 o superior» →
  «version 22 o superior».
- `modos/pro.md` pre-verificacion: `node --version >= 20` → `>= 22`,
  `pnpm --version >= 8` → `>= 11`.

### Bonus encontrados durante la auditoria

- `modos/adoptar.md:149` hardcodeaba `echo "0.1.0" > .arnes/version` —
  ahora lee de `$ARNES_SKILL_DIR/.version` con fallback a 0.2.2.
- `modos/adoptar.md:191` commit message hardcodeaba `Arnes v0.1.0` —
  ahora interpola la version real del proyecto.
- `modos/mantener.md:34` fallback `echo "0.1.0"` → `echo "0.2.2"`.
- `modos/mantener.md:215` ejemplo de manifest tenia `"version": "0.1.0"`
  → `"version": "0.2.2"`.
- Anrnadido `.version` en la raiz de la skill con `0.2.2` (necesario
  para que los modos puedan leerlo con `cat $ARNES_SKILL_DIR/.version`).

### Anrnadido

- Fichero `.version` en la raiz de la skill (1 linea: la version actual).
- Seccion «Customizar la ruta (avanzado)» en el README.

### Modificado

- `README.md` — cuerpo completo reescrito (~140 lineas).
- `docs/internos/protocolo-sesion.md` — Regla 1 ampliada con
  `ARNES_SKILL_DIR`, todas las invocaciones de scripts usan la variable.
- `modos/express.md`, `modos/mantener.md` — rutas hardcoded → `$ARNES_SKILL_DIR`.
- `modos/pro.md` — pre-verificacion node>=22, pnpm>=11.
- `modos/adoptar.md` — leer `.version` en lugar de hardcodear «0.1.0».
- `modos/mantener.md` — bonus listed above.
- `plantillas/web-simple/package.json.tmpl` — pnpm 11, node 22.
- `plantillas/nextjs-supabase/package.json.tmpl` — idem.
- `tutorial/PRIMER-PROYECTO.md` — version Node actualizada.
- `CITATION.cff` — version 0.2.2.

### Leccion canonica

Cuando el feedback dice «6 sitios», auditar exhaustivamente: casi siempre
hay mas. La auditoria de v0.2.2 encontro 10 apariciones extra que Fer no
habia visto. Aplicar mismo grep a ficheros adyacentes (`docs/`, `scripts/`)
antes de cerrar.

---

## [0.2.1] — 2026-05-20

**Patch release tras validacion E2E de v0.2.0.** Tests con 5 sub-agentes
Claude Haiku en paralelo (5/5 PASA). Esta release arregla los 2 bugs
menores y 1 mejora que el adversarial encontro.

### Arreglado

- **Bug: `session.mjs release-lock` fallaba en flujo de adoptar.**
  Causa: el flujo podia cambiar de session_id a mitad (sub-agente
  spawned, shell distinta, etc.) y `release-lock` rechazaba la operacion.
  Solucion: nuevo doc canonico `docs/internos/protocolo-sesion.md` que
  obliga a fijar `ARNES_SESSION_ID` y `ARNES_PROJECT_DIR` UNA SOLA VEZ
  al inicio del modo, y a usarlos en TODOS los scripts del flujo.
  Referenciado en los 5 modos (express, estandar, pro, adoptar, mantener).
  El comportamiento estricto de `session.mjs` se mantiene (es feature,
  no bug).

- **`.arnes/manifest.json` no se generaba automaticamente.** Documentado
  en mantener pero ningun modo lo creaba. Sin manifest, mantener no podia
  detectar piezas modificadas por el usuario.
  Solucion: nuevo script `scripts/generate-manifest.mjs` con subcomandos
  `generate`, `verify`, `check`. Se llama en el paso final de los modos
  nuevo/adoptar y al principio de mantener (si falta, genera linea base
  con hashes actuales).

- **`setup-multi-ia.sh` no se ejecutaba en mantener.** Si la skill
  anrnadia nuevos symlinks (ej. `.cursorrules`), un proyecto antiguo no
  los recibia al hacer mantener. Anrnadido como paso de `modos/mantener.md`.

### Anrnadido

- `scripts/generate-manifest.mjs` (~200 lineas): genera/verifica/checks
  el manifest.json con sha256 de cada pieza del armazon.
- `docs/internos/protocolo-sesion.md` (~120 lineas): contrato de uso de
  ARNES_SESSION_ID, atomic.mjs, session.mjs, generate-manifest.mjs en
  los flujos. Solo para Claude, no se muestra al usuario.

### Modificado

- `modos/express.md` — anrnadida seccion «Protocolo de sesion (obligatorio)».
- `modos/estandar.md` — idem.
- `modos/pro.md` — idem.
- `modos/adoptar.md` — idem, con nota explicita sobre el bug fix v0.2.1.
- `modos/mantener.md` — protocolo + 3 sub-secciones:
  1. Generar manifest baseline si falta (proyecto pre-v0.2.1).
  2. Verificar con `generate-manifest verify` antes de tocar.
  3. Ejecutar `setup-multi-ia.sh` al final.

### Lecciones aprendidas

- **El estricto del session.mjs es feature, no bug.** Cuando el adversarial
  o un test encuentra una friccion, la primera reaccion no debe ser
  relajar la garantia. Documentar el uso correcto es mejor que debilitar
  la seguridad.

- **Cualquier doc que dependa de un fichero generado (manifest) debe
  garantizar que el fichero se genera.** Sin generate-manifest automatico,
  toda la logica de mantener era papel mojado.

---

## [0.2.0] — 2026-05-20

**Reorientacion completa tras feedback critico** de Fernando Montero
(co-mantenedor, concepto original fs-scaffold). Diagnostico: la v0.1.1
servia al 20% mas tecnico de la comunidad. Para los 1.000+ vibe-coders no
tecnicos de IA Masters Academy, hacia falta recortar artefactos
estructuralmente, no solo traducir el lenguaje.

### Cambios mayores

**Gate de 2 niveles → 3 niveles:**
- Modo A/B (binario) → Express / Estandar / PRO (gradual).
- Modo B vacio (skill se autoapagaba el 80% del tiempo) eliminado y
  reemplazado por Modo Express con plantilla rapida real.

**Plantillas:**
- Anrnadida `plantillas/web-simple/` (Next + Tailwind + Vercel, sin
  Supabase, sin tests, sin RLS): es la primera plantilla que se ofrece.
- `plantillas/nextjs-supabase/` (la pesada) pasa a ser opcional para
  Estandar y default para PRO.

**Modos de scaffold:**
- `modos/express.md` (NUEVO) — 3 pasos, 5 min, plantilla web-simple,
  cero artefactos.
- `modos/estandar.md` (NUEVO) — 4 pasos, 20-30 min, plantilla nextjs-supabase,
  2 artefactos visibles (spec + tests). Esconde atomicidad, lock, multi-IA
  y AGENTS.md del usuario.
- `modos/pro.md` (renombrado desde `modos/nuevo.md`) — flujo completo
  SDD+TDD con 9 etapas y 6 artefactos. Sin cambios estructurales.

**Documentacion:**
- Anrnadido `tutorial/PRIMER-PROYECTO.md` — guia de 30 minutos para tu
  primera web online, paso a paso, sin asumir conocimientos previos.
- Anrnadido `tutorial/ejemplo-spec-rellena/landing-personal/` — ejemplo
  de feature completa (spec + tests + codigo resultado) para que el
  usuario vea como se ve un proyecto «en serio».
- `docs/atomicidad.md` y `docs/sesiones.md` se mueven a `docs/internos/`.
  Son fontaneria tecnica: el usuario no las necesita ver. Solo Claude las
  consulta para operar.

**Roadmap del README:**
- Reescrito por completo. La v0.1.1 ahora se marca correctamente como
  «entregada» (antes tenia casillas `[ ]` que contradecian al CHANGELOG).

### Anrnadido

- `plantillas/web-simple/` con 7 ficheros .tmpl (package.json, tsconfig,
  next.config, .gitignore, README, app/layout, app/page, app/globals.css).
- `modos/express.md` con flujo de 3 pasos.
- `modos/estandar.md` con flujo de 4 pasos y 2 artefactos.
- `tutorial/PRIMER-PROYECTO.md` (~250 lineas) — tutorial completo paso
  a paso para no-tecnicos, con captura de cada decision.
- `tutorial/ejemplo-spec-rellena/landing-personal/` — spec.md, tests.md
  y codigo-resultado.tsx de una feature de ejemplo realista.
- `docs/internos/README.md` explicando por que estos docs no se muestran
  al usuario.

### Modificado

- `SKILL.md` — gate de 3 niveles, mas conciso (no enumera reglas internas
  exhaustivamente), referencias actualizadas a `docs/internos/`.
- `modos/pro.md` — renombrado desde `modos/nuevo.md`. Header reescrito
  para reflejar que es el modo riguroso (no «el modo nuevo»).
- `modos/adoptar.md` — actualizado: referencia `modos/pro.md` en lugar
  de `modos/nuevo.md`.
- `docs/ciclo-magico.md` — quitadas las referencias a «Modo A/B»,
  reemplazadas por «Modo Express / Estandar / PRO».
- `README.md` — Roadmap reescrito: v0.1.1 como release completo, v0.2.0
  como release en marcha tras feedback, v0.3.0 para siguientes ideas.

### Movido

- `docs/atomicidad.md` → `docs/internos/atomicidad.md`.
- `docs/sesiones.md` → `docs/internos/sesiones.md`.

### Por que estos cambios (feedback Fernando, 20 mayo)

1. **README vs CHANGELOG contradictorios:** un alumno leyendo el README
   veria casillas `[ ]` que decian que ni siquiera estaban entregados
   sub-agentes, atomicidad, hooks. El CHANGELOG decia lo contrario.
   Si el repo se publica asi, parece roto. Arreglado.

2. **Modo B vacio:** «en cuanto el vibe-coder elige B, la skill se
   apaga». 80% de los casos. La skill no aporta valor en la mayoria de
   sus invocaciones. Hecho Modo Express con plantilla real.

3. **SDD heavy traducido sigue siendo SDD heavy:** 9 etapas, 6 roles,
   6 artefactos por feature. La adaptacion correcta no era traducir, era
   recortar. Creado Modo Estandar con 4 pasos y 2 artefactos.

4. **Plantilla mas cara como unica opcion:** Next+Supabase+Playwright+RLS+
   migrations era artilleria pesada para alguien que aun no ha
   desplegado nada. Anrnadida web-simple, deja Supabase para cuando se
   pide persistencia.

5. **Falta tutorial:** abrir el repo sin un ejemplo concreto = abandono
   inmediato. Anrnadido tutorial + ejemplo rellenado.

### Aprendizaje canonico para v0.3+

«Traducir no es recortar.» Para audiencias no tecnicas, la simplificacion
real es **menos artefactos**, **menos etapas**, **menos conceptos
visibles**. El idioma llano sin recorte sigue siendo abrumador.

---

## [0.1.1] — 2026-05-19

### Anadido

**Documentacion canonica (Fase 1):**
- `docs/arnes.md` — manifiesto: que es Arnes, por que existe, que garantiza.
- `docs/sdd-tdd.md` — metodologia Spec-Driven + Test-Driven Development.
- `docs/seguridad.md` — reglas inviolables (secrets, RLS, OWASP).
- `docs/atomicidad.md` — operaciones atomicas y rollback.
- `docs/sesiones.md` — lock concurrente, auto-resume.

**Gate de activacion (Fase 0):**
- SKILL.md con gate explicito: cuando triggea, pregunta «Arnes (profesional)
  o arranque rapido (MVP)?» antes de tocar nada. Opt-in en iAmasters OS.

**Detector de modo (Fase 2):**
- `scripts/detectar-modo.sh` — bash script que devuelve `nuevo | adoptar |
  mantener | ambiguo` segun el estado del directorio.

**Ciclo magico — 9 etapas, 6 roles (Fase 3 + consolidacion v0.1.1):**
- `docs/ciclo-magico.md` — un solo documento con las 9 etapas del ciclo
  (entrevista → blueprint → plan → pasos → tests → codigo → revision →
  revision dura → archive) y los 6 roles que la IA asume (preguntador,
  escritor de specs, arquitecto, descomponedor, probador previo,
  implementador, revisor, escéptico).
- En v0.1.0 inicial esto era 6 ficheros separados en `agents/` (1365 lineas).
  Consolidados en 1 fichero de 383 lineas: misma cobertura, menos redundancia,
  mas legible para vibe-coders.

**Sistema SDD (Fase 4):**
- 6 plantillas para los artefactos del ciclo: spec, plan, tasks, tests,
  review, adversarial.
- `estado/implementation-status.md.tmpl` — template del status file.
- `plantillas/armazon-comun/specs-templates/README.md` — convenciones.

**Atomicidad y rollback (Fase 5):**
- `scripts/atomic.mjs` — CLI Node ESM con subcomandos: log, snapshot,
  promote, rollback, status.
- Operations log en formato JSONL.
- Snapshots de ficheros antes de modificar.
- Rollback en orden inverso de operaciones.

**Lock concurrente + auto-resume (Fase 6):**
- `scripts/session.mjs` — CLI con: acquire-lock, release-lock, force-unlock,
  resume, update-status, check-stale-lock, status.
- Deteccion de lock stale (> 1h sin actividad + proceso muerto).
- Auto-resume desde implementation-status.md.

**Hooks pre-commit (Fase 7):**
- `plantillas/armazon-comun/hooks/pre-commit` — bash script con 4 pasos:
  secrets, lint, typecheck, tests (opcional).
- `plantillas/armazon-comun/hooks/scan-secrets.mjs` — escaner con patrones
  para OpenAI, Anthropic, Stripe, Supabase service_role, AWS, GitHub, Slack,
  Google API, private keys, genericos.
- Bloqueo absoluto de ficheros `.env*` (excepto `.env.example`).

**Multi-IA (Fase 8):**
- `plantillas/armazon-comun/AGENTS.md.tmpl` — source of truth para todas
  las IAs (Claude, Codex, Copilot, Gemini, Cursor).
- `scripts/setup-multi-ia.sh` — crea symlinks: CLAUDE.md, GEMINI.md,
  .codex/instructions.md, .github/copilot-instructions.md, .cursorrules.

**Modo «nuevo» (Fase 9):**
- `modos/nuevo.md` — pipeline de 7 pasos: idea, entrevista, plan, staging,
  promote, primer commit, entrega.
- `plantillas/nextjs-supabase/` — plantilla MVP con 16 ficheros: package.json,
  tsconfig, next.config, .gitignore, .env.example, README, layout, page,
  globals.css, lib/supabase/{server,client}, middleware, vitest.config,
  playwright.config, supabase/config.toml, supabase/migrations/000_init.sql.

**Modo «adoptar» (Fase 10):**
- `modos/adoptar.md` — pipeline de 6 pasos: auditoria, backup, lock,
  inyectar armazon respetando lo existente, verificar, commit.

**Modo «mantener» (Fase 11):**
- `modos/mantener.md` — pipeline de 5 pasos: diagnostico, plan, backup+lock,
  actualizar piezas, verificar+commit.

### Verificado

- Detector de modo: 5 casos (nuevo, vacio, adoptar Next.js, mantener Arnes, ambiguo).
- atomic.mjs: log + snapshot + rollback con restauracion completa.
- session.mjs: lock concurrente, re-acquire, release, force-unlock, resume.
- scan-secrets.mjs: detecta OpenAI (proj + legacy), Anthropic, .env files;
  ignora .env.example.
- setup-multi-ia.sh: crea 5 symlinks que resuelven al mismo AGENTS.md.

### Conocido / no incluido

- **No** soporta otros stacks que Next.js+Supabase (Backend API Node, CLI,
  Edge service, Web publica vienen en v0.2.0).
- **No** firma el catalogo de skills auxiliares con HMAC (v0.2.0).
- **No** tiene suite interna de meta-tests automaticos (v0.2.0).
- **No** soporta Windows nativamente (los scripts son bash + Node ESM).
- **No** automatiza la fase «code» del ciclo SDD: la implementacion del
  codigo de cada feature la hace Claude / Codex segun el plan. Arnes
  orquesta y verifica, pero no es generador automatico.

### Atribucion

- **Concepto original:** Fernando Montero, presentado en Cafe Camaleonico
  del 18 de mayo de 2026 (`fs-scaffold`).
- **Adaptacion iAmasters:** Angel Aparicio.
- **Inspiracion SDD:** Ricardo (comunidad iAmasters).
- **TDD:** Kent Beck, 2002.

---

## Pendiente para v0.3.0

- 4 plantillas adicionales (Web publica, Backend API Node, CLI, Edge service).
- Catalogo firmado de skills auxiliares (HMAC).
- Suite de meta-tests automaticos (15 evaluaciones, 30 pruebas, 10 escenarios).
- 21 fases formalizadas como artefactos auditables.
- Compatibilidad Windows (PowerShell variants de los scripts).
- Integracion con Sinapsis (instincts especificos para Arnes).
- Migracion automatica entre stacks (Pages Router → App Router, etc.).
