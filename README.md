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

- [Manifiesto](docs/arnes.md) — que garantiza Arnes
- [SDD + TDD](docs/sdd-tdd.md) — la metodologia
- [Seguridad](docs/seguridad.md) — reglas inviolables
- [Atomicidad](docs/atomicidad.md) — rollback automatico
- [Sesiones](docs/sesiones.md) — lock concurrente y auto-resume

---

## Roadmap

### v0.1.0 (MVP, este release) — Mayo 2026
- [x] Gate de activacion (Arnes vs arranque rapido)
- [x] Detector de modo (nuevo / adoptar / mantener)
- [x] Documentacion canonica
- [ ] 6 sub-agentes (spec-writer, planner, task-writer, test-writer, reviewer, adversarial)
- [ ] Sistema SDD (.specs/ + ciclo completo)
- [ ] Atomicidad y rollback
- [ ] Lock concurrente + auto-resume
- [ ] Hooks pre-commit
- [ ] Multi-IA via AGENTS.md
- [ ] 1 plantilla: Next.js + Supabase
- [ ] Smoke test end-to-end

### v0.2.0 (futuro)
- Catalogo firmado de skills auxiliares con hash + HMAC
- 4 plantillas adicionales (Web publica, Backend API, CLI, Edge)
- Suite interna de meta-tests
- 21 fases formalizadas como artefactos auditables
- Compatibilidad Windows
- Integracion explicita con Sinapsis (instincts especificos para Arnes)

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
