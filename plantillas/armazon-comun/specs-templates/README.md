# Specs Templates

Estas son las **plantillas** que el motor Arnes copia a un proyecto cuando se
crea una nueva feature. Cada feature en `.specs/active/<feature-name>/` se
construye a partir de estas plantillas, en orden.

---

## Plantillas disponibles

| Plantilla | Producida por | Fase del ciclo |
|-----------|---------------|----------------|
| `spec.md.tmpl` | spec-writer | 2 |
| `plan.md.tmpl` | planner | 3 |
| `tasks.md.tmpl` | task-writer | 4 |
| `tests.md.tmpl` | test-writer | 5 |
| `review.md.tmpl` | reviewer | 7 |
| `adversarial.md.tmpl` | adversarial-reviewer | 8 |

---

## Estructura final de una feature

Cuando una feature pasa por todas las fases, su carpeta contiene:

```
.specs/active/<feature-name>/
├── spec.md                              # Fase 2
├── plan.md                              # Fase 3
├── tasks.md                             # Fase 4
├── tests.md                             # Fase 5
├── reviews/
│   ├── 2026-05-19_2034.md               # Fase 7 (puede haber varias rondas)
│   └── 2026-05-19_2105.md
└── adversarial/
    └── 2026-05-19_2130.md               # Fase 8
```

Al archivar (fase 9), se mueve a:

```
.specs/archived/<YYYY-MM-DD>_<feature-name>/
```

---

## Variables de plantilla

Las plantillas usan estas variables (formato `{{VAR}}`):

| Variable | Significado |
|----------|-------------|
| `{{FEATURE_NAME}}` | Nombre kebab-case de la feature (`api-credentials`). |
| `{{FEATURE_TITLE}}` | Titulo legible (`API Credentials`). |
| `{{DATE}}` | Fecha actual en formato `YYYY-MM-DD`. |
| `{{TIMESTAMP}}` | Timestamp ISO 8601. |
| `{{AUTHOR}}` | Nombre del sub-agente o usuario que genera el doc. |
| `{{PROJECT_NAME}}` | Nombre del proyecto (de `package.json`). |
| `{{STACK}}` | Stack del proyecto (de AGENTS.md). |

Cuando una plantilla se copia, el orquestador reemplaza las variables.

---

## Convenciones

- **Nombres en kebab-case** para folders y ficheros (`api-credentials`).
- **Fecha en formato ISO** (`2026-05-19`), no `19/05/2026`.
- **Timestamps en UTC** para evitar confusiones de zona horaria.
- **Idioma:** castellano para contenido de specs (lo lee el usuario). Codigo
  en el idioma del proyecto (ingles por defecto).

---

## Como se usan las plantillas

El orquestador hace algo asi (pseudocodigo):

```python
def crear_feature(nombre, sub_agente, plantilla):
    src = f"plantillas/armazon-comun/specs-templates/{plantilla}"
    dst = f".specs/active/{nombre}/{plantilla.replace('.tmpl', '')}"

    contenido = read(src)
    for var, valor in variables_actuales().items():
        contenido = contenido.replace(f"{{{{{var}}}}}", valor)

    write(dst, contenido)
    return dst
```

Despues, el sub-agente correspondiente rellena el contenido.

---

## Una sola feature activa a la vez

`.specs/active/` solo puede contener **una** carpeta de feature. Si intentas
crear una segunda mientras hay una activa, Arnes lo bloquea:

> «Hay una feature activa: `api-credentials` (fase: plan). Termina o cancela
> antes de crear una nueva.»

Esto evita el caos de specs cruzadas y context switching.
