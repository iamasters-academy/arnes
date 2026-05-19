# Changelog

Todos los cambios notables en la skill **Arnes** se documentan aqui.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.1.0] — 2026-05-19

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

## Pendiente para v0.2.0

- 4 plantillas adicionales (Web publica, Backend API Node, CLI, Edge service).
- Catalogo firmado de skills auxiliares (HMAC).
- Suite de meta-tests automaticos (15 evaluaciones, 30 pruebas, 10 escenarios).
- 21 fases formalizadas como artefactos auditables.
- Compatibilidad Windows (PowerShell variants de los scripts).
- Integracion con Sinapsis (instincts especificos para Arnes).
- Migracion automatica entre stacks (Pages Router → App Router, etc.).
