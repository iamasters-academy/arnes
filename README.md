# Arnes — v0.2.3

Skill de Claude Code que ayuda a vibe-coders no tecnicos a arrancar y
mantener proyectos de software paso a paso, sin que la IA se descontrole.

Basada en el trabajo de Fernando Montero (`fs-scaffold`), adaptada para la
comunidad IA Masters Academy. **Skill opt-in en IA Masters OS.**

---

## Para que sirve

Para construir proyectos de software **al nivel que tu necesites**, sin
abrumar:

- ⚡ **Express** — una web simple en 5 minutos (sin specs, sin tests, sin
  ceremonia). Para landings, prototipos y MVPs.
- 🛠️ **Estandar** — proyectos con login y datos en 20-30 min, con
  blueprint y verificaciones automaticas. Para apps personales o de tu negocio.
- 🎯 **PRO** — software profesional con disciplina SDD+TDD completa,
  revision adversarial de seguridad. Para clientes que pagan o proyectos
  que aguantaran anros.

Y para proyectos que ya existen:

- **Adoptar** — meter el armazon Arnes en un proyecto antiguo sin tocar
  tu codigo.
- **Mantener** — actualizar el armazon de un proyecto Arnes cuando la
  skill evoluciona.

**Siempre que se activa, Arnes pregunta primero que nivel necesitas.** La
decision es tuya. Para el 80% de casos vale con Express.

---

## Instalacion (opt-in)

Arnes viene **desactivada por defecto** en IA Masters OS. El usuario
decide si la habilita.

### En tu instalacion local

Si ya tienes la skill en `~/.claude/skills/arnes/`, esta lista para
activarse cuando triggees con frases como «nueva web», «crea una app»,
«arrancar proyecto», etc.

Para deshabilitarla temporalmente:

```bash
mv ~/.claude/skills/arnes/SKILL.md ~/.claude/skills/arnes/SKILL.md.disabled
```

Para reactivarla:

```bash
mv ~/.claude/skills/arnes/SKILL.md.disabled ~/.claude/skills/arnes/SKILL.md
```

### En IA Masters OS (cuando se distribuya)

El instalador de IA Masters OS preguntara explicitamente si la quieres.
Si no la activas, no aparece — opt-in puro.

### Customizar la ruta (avanzado)

Si la skill no esta en `~/.claude/skills/arnes/` (por ejemplo, en una
instalacion compartida o portatil), define la variable de entorno:

```bash
export ARNES_SKILL_DIR="/ruta/a/tu/copia/de/arnes"
```

Los scripts y modos leen esa variable para localizar el armazon.

---

## Tutorial: tu primer proyecto

Si nunca has usado Claude Code o no sabes que es un repo, mira primero
[`tutorial/PRIMER-PROYECTO.md`](tutorial/PRIMER-PROYECTO.md). En 30 minutos
tienes tu primera web online.

---

## Los 5 modos

### Para proyectos nuevos

| Modo | Cuando | Tiempo | Artefactos | Plantilla |
|------|--------|--------|------------|-----------|
| ⚡ **Express** | Landing, MVP, prueba rapida | 5 min | Cero | `web-simple` (Next + Tailwind) |
| 🛠️ **Estandar** | App con usuarios y datos | 20-30 min | 2 (spec + tests) | `nextjs-supabase` |
| 🎯 **PRO** | Cliente que paga, alta calidad | 1-2 h | 6 (spec, plan, tasks, tests, review, adversarial) | `nextjs-supabase` |

### Para proyectos existentes

| Modo | Cuando | Promesa |
|------|--------|---------|
| **Adoptar** | Tu proyecto NO tiene armazon Arnes | No toco tu codigo, solo anrnado armazon |
| **Mantener** | Tu proyecto SI tiene Arnes (vieja version) | Solo actualizo armazon, respeto tus specs |

---

## Stack segun modo

| Modo | Frontend | Backend | Tests | Deploy | Plantilla |
|------|----------|---------|-------|--------|-----------|
| Express | Next.js + Tailwind | — | — | Vercel | `web-simple` |
| Estandar | Next.js + Tailwind | Supabase (login + DB) | Playwright basico | Vercel | `nextjs-supabase` |
| PRO | Next.js + Tailwind | Supabase + RLS + migrations | Vitest + Playwright completo | Vercel | `nextjs-supabase` |

Si quieres otro stack (Vue, Astro, etc.), usa Modo Express y montatelo a
mano. Mas plantillas (Backend API Node, CLI, Edge) llegan en v0.3.

---

## Estructura de la skill

```
~/.claude/skills/arnes/
├── SKILL.md                 # Trigger + gate de 3 niveles
├── README.md                # Este fichero
├── CHANGELOG.md             # Historial de versiones
├── docs/                    # Documentacion para usuarios
│   ├── arnes.md             #   manifiesto
│   ├── glosario.md          #   traduccion de jerga
│   ├── ciclo-magico.md      #   9 etapas del modo PRO
│   ├── seguridad.md         #   reglas inviolables
│   └── internos/            #   docs solo para Claude (no visibles al usuario)
├── modos/                   # 5 pipelines
│   ├── express.md
│   ├── estandar.md
│   ├── pro.md
│   ├── adoptar.md
│   └── mantener.md
├── plantillas/              # Plantillas que se inyectan en proyectos
│   ├── armazon-comun/       #   AGENTS.md, hooks, specs-templates
│   ├── web-simple/          #   Next + Tailwind (Modo Express)
│   └── nextjs-supabase/     #   Next + Supabase (Modo Estandar/PRO)
├── scripts/                 # Helpers (Bash + Node ESM)
├── tutorial/                # Guia 30 min + ejemplo de feature
└── estado/                  # Templates del implementation-status
```

---

## Documentacion

### Para usuarios

- [Manifiesto](docs/arnes.md) — que garantiza Arnes
- [Glosario](docs/glosario.md) — traduccion de cualquier termino tecnico
- [Ciclo magico](docs/ciclo-magico.md) — los 9 pasos del modo PRO
- [Seguridad](docs/seguridad.md) — reglas inviolables
- [Tutorial primer proyecto](tutorial/PRIMER-PROYECTO.md) — 30 minutos

### Para Claude (internos)

- [docs/internos/atomicidad.md](docs/internos/atomicidad.md) — staging y rollback
- [docs/internos/sesiones.md](docs/internos/sesiones.md) — lock y auto-resume
- [docs/internos/protocolo-sesion.md](docs/internos/protocolo-sesion.md) — uso de ARNES_SKILL_DIR / SESSION_ID / PROJECT_DIR

---

## Roadmap

### v0.2.3 — 20 mayo 2026 (release actual, patch)

Tras nitpick de Clau (asistente de Fer) sobre v0.2.2. La audit del v0.2.2
sobre rutas era exhaustiva pero quedaron 6 sitios con la version literal
`0.2.1` desfasada, incluyendo un `DEFAULT_VERSION = '0.2.1'` en
`generate-manifest.mjs` (funcional, no cosmetico).

- [x] `generate-manifest.mjs` resuelve version: CLI > env > `.version` > fallback
- [x] Docs (`modos/mantener.md`, `protocolo-sesion.md`) ya no hardcodean version
- [x] Docstrings y help del script actualizados
- [x] Check nuevo en smoke-test: detecta si alguien reintroduce `DEFAULT_VERSION`

### v0.2.2 — 20 mayo 2026 (patch)

Tras feedback de Fernando sobre v0.2.1. Limpia README, rutas hardcoded y
versiones obsoletas.

- [x] README cuerpo (lineas 1-100) reescrito y alineado a v0.2.2
- [x] Introducida variable `ARNES_SKILL_DIR` en protocolo-sesion.md
- [x] 16 rutas hardcoded `~/.claude/skills/arnes/` → `$ARNES_SKILL_DIR`
      (en modos, docs/internos y referencias asociadas)
- [x] `packageManager: pnpm@9.0.0` → `pnpm@11.0.0` en ambas plantillas
- [x] `engines.node: ">=20"` → `">=22"` en ambas plantillas
- [x] Tutorial Node version actualizada a 22
- [x] Fix bonus: versiones `0.1.0` hardcoded en modos/adoptar y modos/mantener
- [x] Fichero `.version` en raiz de la skill

### v0.2.1 — 20 mayo 2026 (patch)

Tras E2E con 5 sub-agentes Claude Haiku en paralelo (5/5 PASA), arreglo
los 2 bugs y 1 mejora detectados.

- [x] `scripts/generate-manifest.mjs` (genera/verifica/checks sha256 del armazon)
- [x] Doc canonico `docs/internos/protocolo-sesion.md` (uso de ARNES_SESSION_ID)
- [x] Los 5 modos referencian el protocolo de sesion
- [x] `modos/mantener.md` ahora invoca `generate-manifest verify` antes de tocar
- [x] `modos/mantener.md` ejecuta `setup-multi-ia.sh` al final
- [x] Bug fixed: `session.mjs release-lock` fallaba en adoptar

### v0.2.0 — 20 mayo 2026

Tras feedback critico de Fernando: la v0.1.1 solo servia al 20% mas
tecnico. Esta version recorta artefactos para servir al 80% no tecnico
de IA Masters Academy.

- [x] Plantilla `web-simple` (Next + Tailwind + Vercel, sin Supabase ni tests)
- [x] Tutorial «primer proyecto en 30 min» con ejemplo de feature rellenada
- [x] 3 niveles en el gate: Express / Estandar / PRO
- [x] Modo Express: 2 preguntas, 5 min, monta web-simple sin ceremonia
- [x] Modo Estandar: 4 pasos, 2 artefactos visibles (spec + tests)
- [x] Modo PRO: el flujo SDD+TDD completo (renombrado desde modos/nuevo.md)
- [x] Docs internas reubicadas a `docs/internos/` (no visibles al usuario)
- [x] CITATION + CHANGELOG + version bump a 0.2.0

### v0.1.1 — 19 mayo 2026

Refactor a lenguaje vibe-coder. Toda la infraestructura tecnica.

- [x] Gate de activacion + detector de modo
- [x] Documentacion canonica + glosario
- [x] 6 roles consolidados en `docs/ciclo-magico.md`
- [x] Sistema SDD (.specs/, plantillas)
- [x] Atomicidad y rollback (`scripts/atomic.mjs`)
- [x] Lock concurrente + auto-resume (`scripts/session.mjs`)
- [x] Sustitucion de variables (`scripts/render-template.mjs`)
- [x] Hooks pre-commit, multi-IA, plantilla Next.js+Supabase
- [x] Smoke tests: E2E (43) + estructural (64)

### v0.3.0 (futuro)

- Catalogo firmado de skills auxiliares con hash + HMAC
- 3 plantillas mas (Backend API Node, CLI, Edge service)
- Suite interna de meta-tests
- Compatibilidad Windows
- Integracion explicita con Sinapsis (instincts especificos)
- Flujo de upgrade automatico Express → Estandar → PRO

---

## Creditos

- **Concepto original:** Fernando Montero, presentado en Cafe Camaleonico
  del 18 de mayo de 2026 (`fs-scaffold`)
- **Adaptacion iAmasters:** Angel Aparicio
- **Inspiracion SDD:** Ricardo (comunidad iAmasters), mayo 2026
- **Comunidad:** IA Masters Academy

---

## Licencia

MIT (se anadira `LICENSE` en la fase de distribucion a iamasters-os).
