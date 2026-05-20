# Arnes

Skill de Claude Code para arrancar y mantener proyectos de software con
tres niveles de rigor: rapido para prototipos, intermedio para apps
serias, y completo (SDD + TDD) para software profesional.

Basada en el trabajo de Fernando Montero (`fs-scaffold`), adaptada para
los vibe-coders no tecnicos de IA Masters Academy. Release actual:
**v0.2.1**.

---

## Para que sirve

Para que cualquier persona, **incluso sin saber programar**, pueda
arrancar un proyecto de software hablando con la IA en castellano.

Arnes adapta la cantidad de ceremonia al tipo de proyecto:

- Si es una **landing rapida o un MVP de fin de semana**, monta una web
  funcional en 5 minutos sin preguntas raras.
- Si es una **app con usuarios y datos**, te hace 3-4 preguntas, escribe
  una descripcion corta y unas comprobaciones automaticas, y la
  construye en 20-30 min.
- Si es **software profesional para cliente o producto**, aplica la
  metodologia completa: especificaciones, plan, tests previos al codigo,
  revision normal y revision adversarial.

El usuario elige el nivel al inicio de cada proyecto. Nunca decide la
skill por el.

---

## Los 5 modos

**Para proyectos nuevos (3 niveles):**

| Modo | Plantilla | Preguntas | Artefactos visibles | Tiempo | Cuando |
|------|-----------|-----------|---------------------|--------|--------|
| **Express** | web-simple (Next + Tailwind + Vercel) | 2-3 | Cero | 5 min | MVPs, landings, pruebas |
| **Estandar** | nextjs-supabase (Next + Supabase) | 3-4 | 2 (spec + tests) | 20-30 min | Apps con usuarios, datos, pagos |
| **PRO** | nextjs-supabase | 5-7 | 6 (spec, plan, tasks, tests, review, adversarial) | 1-2 h | Software profesional o de cliente |

**Para proyectos que ya existen:**

| Modo | Cuando | Que hace |
|------|--------|----------|
| **Adoptar** | Tienes un proyecto sin armazon Arnes | Auditoria, backup y inyeccion del armazon sin tocar tu codigo |
| **Mantener** | Tienes un proyecto Arnes que se quedo anticuado | Sincroniza docs, hooks y multi-IA respetando tus cambios |

El gate inicial detecta automaticamente si el directorio esta vacio o
ya tiene un proyecto, y propone el flujo adecuado.

Detalle de cada modo en `modos/`:

- [Modo Express](modos/express.md)
- [Modo Estandar](modos/estandar.md)
- [Modo PRO](modos/pro.md)
- [Modo Adoptar](modos/adoptar.md)
- [Modo Mantener](modos/mantener.md)

---

## Por donde empezar

Si es tu primera vez con Arnes, lee
[`tutorial/PRIMER-PROYECTO.md`](tutorial/PRIMER-PROYECTO.md). En 30
minutos tienes tu primera web online (Modo Express + Vercel).

Si quieres ver un ejemplo realista de un proyecto en Modo Estandar
(spec + tests + codigo resultado), mira
[`tutorial/ejemplo-spec-rellena/landing-personal/`](tutorial/ejemplo-spec-rellena/landing-personal/).

---

## Instalacion (opt-in)

Arnes viene **desactivada por defecto** en iAmasters OS. El usuario
decide si la habilita.

### En tu instalacion local (`~/.claude/skills/`)

Si ya tienes la skill en `~/.claude/skills/arnes/`, esta lista para
activarse cuando triggees con frases como «nuevo proyecto», «crear
app», «monta una web», etc.

Para deshabilitarla temporalmente, renombra `SKILL.md`:

```bash
# Desactivar
mv ~/.claude/skills/arnes/SKILL.md ~/.claude/skills/arnes/SKILL.md.disabled

# Reactivar
mv ~/.claude/skills/arnes/SKILL.md.disabled ~/.claude/skills/arnes/SKILL.md
```

### En iAmasters OS (cuando se distribuya)

El instalador preguntara explicitamente:

> «¿Quieres instalar Arnes (skill para arrancar proyectos de software con
> tres niveles de rigor)?
>
> Es opt-in: solo se activa si la habilitas. Recomendado para arrancar
> tu primera web, montar MVPs o trabajar proyectos serios con metodo.»

---

## Cuando NO usarla

Como Arnes tiene Modo Express, el rango de casos para los que sirve es
amplio. Tiene poco sentido NO usarla cuando vas a crear cualquier
proyecto. Aun asi, hay casos donde no aporta:

- Scripts de un solo uso que se ejecutan una vez y se borran.
- Trabajo dentro de un repo que ya existe y NO necesita armazon (en ese
  caso usa Modo Adoptar si quieres meterlo).
- Editar codigo de otra persona sin crear proyecto nuevo.

Para todo lo demas que sea «empezar algo desde cero», incluso un
prototipo de fin de semana, **Modo Express es lo correcto**.

---

## Stack por modo (v0.2)

| Modo | Frontend | Backend | Tests | Deploy |
|------|----------|---------|-------|--------|
| Express | Next.js + Tailwind | (sin backend) | (sin tests) | Vercel |
| Estandar | Next.js + Tailwind | Supabase (login + DB) | Playwright basico | Vercel |
| PRO | Next.js + Tailwind | Supabase + RLS + migrations | Vitest + Playwright completo | Vercel |

Otros stacks (Backend API Node, CLI, Edge service, Web publica) llegan
en v0.3.

---

## Estructura de la skill

```
~/.claude/skills/arnes/
├── SKILL.md                 # Trigger + gate (lo que la IA lee al activarse)
├── README.md                # Para humanos (este archivo)
├── CHANGELOG.md             # Historial de versiones
├── docs/                    # Documentacion canonica del usuario
│   ├── arnes.md             # Manifiesto
│   ├── glosario.md          # Traduccion de jerga tecnica
│   ├── ciclo-magico.md      # Las 9 etapas del Modo PRO
│   ├── seguridad.md         # Reglas inviolables (secrets, RLS, OWASP)
│   └── internos/            # Fontaneria tecnica (Claude only)
│       ├── atomicidad.md
│       ├── sesiones.md
│       └── protocolo-sesion.md  # Uso de ARNES_SESSION_ID
├── modos/                   # 5 pipelines
│   ├── express.md           # Modo Express
│   ├── estandar.md          # Modo Estandar
│   ├── pro.md               # Modo PRO
│   ├── adoptar.md           # Adoptar proyecto existente
│   └── mantener.md          # Mantener proyecto Arnes al dia
├── plantillas/
│   ├── armazon-comun/       # AGENTS.md, hooks, specs-templates
│   ├── web-simple/          # Plantilla del Modo Express
│   └── nextjs-supabase/     # Plantilla del Modo Estandar / PRO
├── scripts/                 # Detector de modo, atomicidad, sesion, manifest
│   ├── detectar-modo.sh
│   ├── atomic.mjs
│   ├── session.mjs
│   ├── generate-manifest.mjs
│   ├── render-template.mjs
│   ├── setup-multi-ia.sh
│   ├── smoke-test.sh
│   └── e2e-test.sh
├── tutorial/                # Onboarding del usuario
│   ├── PRIMER-PROYECTO.md
│   └── ejemplo-spec-rellena/
└── estado/                  # Templates del implementation-status
```

---

## Documentacion

### Para usuarios

- [Manifiesto](docs/arnes.md) -- que garantiza Arnes
- [Glosario](docs/glosario.md) -- traduccion de cualquier termino tecnico
- [Ciclo magico](docs/ciclo-magico.md) -- las 9 etapas del Modo PRO
- [Seguridad](docs/seguridad.md) -- reglas inviolables
- [Tutorial primer proyecto](tutorial/PRIMER-PROYECTO.md) -- 30 minutos paso a paso

### Para Claude (internos)

- [docs/internos/atomicidad.md](docs/internos/atomicidad.md) -- staging y rollback
- [docs/internos/sesiones.md](docs/internos/sesiones.md) -- lock y auto-resume
- [docs/internos/protocolo-sesion.md](docs/internos/protocolo-sesion.md) -- uso de `ARNES_SESSION_ID`

---

## Roadmap

### v0.2.1 — 20 mayo 2026 (release actual, patch)

Tras E2E con 5 sub-agentes Claude Haiku en paralelo (5/5 PASA), arreglo
los 2 bugs y 1 mejora detectados.

- [x] `scripts/generate-manifest.mjs` (genera/verifica/checks sha256 del armazon)
- [x] Doc canonico `docs/internos/protocolo-sesion.md` (uso de `ARNES_SESSION_ID`)
- [x] Los 5 modos referencian el protocolo de sesion
- [x] `modos/mantener.md` invoca `generate-manifest verify` antes de tocar
- [x] `modos/mantener.md` ejecuta `setup-multi-ia.sh` al final
- [x] Bug fix: `session.mjs release-lock` fallaba en adoptar

### v0.2.0 — 20 mayo 2026

Tras feedback de Fernando Montero: la v0.1.1 solo servia al 20% mas
tecnico. Esta version recorta artefactos para servir al 80% no tecnico
de IA Masters Academy.

- [x] Plantilla `web-simple` (Next + Tailwind + Vercel, sin Supabase ni tests)
- [x] Tutorial «primer proyecto en 30 min» con ejemplo de feature rellenada
- [x] 3 niveles en el gate: Express / Estandar / PRO
- [x] Modo Express: 2 preguntas, 5 min, monta web-simple sin ceremonia
- [x] Modo Estandar: 4 pasos, 2 artefactos visibles (spec + tests)
- [x] Modo PRO: el flujo SDD+TDD completo (renombrado desde `modos/nuevo.md`)
- [x] Docs internas reubicadas a `docs/internos/` (no visibles al usuario)
- [x] CITATION + CHANGELOG + version bump a 0.2.0

### v0.1.1 — 19 mayo 2026

Refactor a lenguaje vibe-coder. Toda la infraestructura tecnica.

- [x] Gate de activacion + detector de modo
- [x] Documentacion canonica + glosario
- [x] 6 roles consolidados en `docs/ciclo-magico.md`
- [x] Sistema SDD (`.specs/`, plantillas)
- [x] Atomicidad y rollback (`scripts/atomic.mjs`)
- [x] Lock concurrente + auto-resume (`scripts/session.mjs`)
- [x] Sustitucion de variables (`scripts/render-template.mjs`)
- [x] Hooks pre-commit, multi-IA, plantilla Next.js+Supabase
- [x] Smoke tests: E2E (43) + estructural (64)

### v0.3.0 (futuro)

- Flujo de upgrade automatico Express -> Estandar -> PRO
- 3 plantillas mas (Backend API Node, CLI, Edge service)
- Catalogo firmado de skills auxiliares con hash + HMAC
- Suite interna de meta-tests
- Compatibilidad Windows
- Integracion explicita con Sinapsis (instincts especificos para Arnes)
- Resolucion de la ruta de la skill en runtime (sin asumir `~/.claude/skills/arnes/`)

---

## Creditos

- **Concepto original:** Fernando Montero, presentado en Cafe Camaleonico
  del 18 de mayo de 2026 (`fs-scaffold`).
- **Adaptacion iAmasters:** Angel Aparicio.
- **Inspiracion SDD:** Ricardo (comunidad iAmasters), mayo 2026.
- **Comunidad:** IA Masters Academy.

---

## Licencia

MIT (se anrnadira `LICENSE` en la fase de distribucion a iamasters-os).
