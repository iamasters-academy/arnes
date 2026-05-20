# Arnes

Skill de Claude Code que arranca proyectos de software profesional con
metodologia SDD (Spec-Driven Development) + TDD (Test-Driven Development).

Basada en el trabajo de Fernando Montero (`fs-scaffold`), adaptada y simplificada
para la comunidad IA Masters Academy. MVP v0.1.0.

---

## Para que sirve

Para arrancar proyectos de software **bien hechos desde el minuto uno**.

En vez de empezar a programar a lo loco y luego comprobar si funciona,
Arnes impone disciplina:

1. **Especificas** lo que quieres antes de tocar codigo.
2. **Escribes los tests** antes que la implementacion.
3. **Otra IA escribe el codigo** para pasar esos tests.
4. **Una IA critica busca fallos** antes de cerrar la feature.

El resultado: codigo que cumple lo que prometio, mantenible a 6 meses,
sin agujeros de seguridad, y replicable en otros proyectos.

---

## Cuando NO usarla

- Prototipos rapidos donde solo quieres ver si una idea pega.
- Hackathons o experimentos de fin de semana.
- Scripts de un solo uso.

Arnes tiene un coste de tiempo al principio (15-30 min de entrevista y plan
antes de programar). Para esos casos, es overkill.

**Por eso, cada vez que se activa, Arnes pregunta primero si quieres usarla
o si prefieres un arranque rapido sin ceremonia.** Esa decision es tuya.

---

## Instalacion (opt-in)

Arnes viene **desactivada por defecto** en iAmasters OS. El usuario decide
si la habilita.

### En tu instalacion local (~/.claude/skills/)

Si ya tienes la skill en `~/.claude/skills/arnes/`, esta lista para activarse
cuando triggees con frases como "nuevo proyecto", "crear app", etc.

Para deshabilitarla temporalmente, mueve la carpeta o renombra `SKILL.md`:

```bash
# Desactivar
mv ~/.claude/skills/arnes/SKILL.md ~/.claude/skills/arnes/SKILL.md.disabled

# Reactivar
mv ~/.claude/skills/arnes/SKILL.md.disabled ~/.claude/skills/arnes/SKILL.md
```

### En iAmasters OS (cuando se distribuya)

El instalador de iAmasters OS preguntara explicitamente:

> «¿Quieres instalar Arnes (skill para arrancar proyectos profesionales con SDD+TDD)?
> Es opt-in: solo se activa si la habilitas. Recomendado para quien quiera
> trabajar con metodo. Saltable para quien prefiera arranques rapidos.»

---

## Los 3 modos

| Modo | Cuando | Que hace |
|------|--------|----------|
| **Nuevo** | Arrancas desde cero | Entrevista, plan, monta el armazon completo |
| **Adoptar** | Tienes un proyecto sin armazon Arnes | Auditoria, backup, inyecta el armazon sin tocar tu codigo |
| **Mantener** | Tienes un proyecto con Arnes que se quedo anticuado | Sincroniza docs y hooks respetando tus cambios |

---

## Stack inicial (v1)

Solo Next.js + Supabase + Tailwind + PNPM + Playwright + Vercel.
Mas stacks (Backend API Node, CLI, Edge, Web publica) llegan en v2.

---

## Estructura de la skill

```
~/.claude/skills/arnes/
├── SKILL.md                 # Trigger + flujo principal (lo que la IA lee)
├── README.md                # Para humanos (este archivo)
├── docs/                    # Documentacion canonica (incluye ciclo-magico y glosario)
├── modos/                   # 3 pipelines (nuevo, adoptar, mantener)
├── plantillas/              # Armazon comun + plantillas de stack
├── scripts/                 # Helpers (detector de modo, rollback, lock)
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

---

## Roadmap

### v0.2.1 — 20 mayo 2026 (release actual, patch)

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
