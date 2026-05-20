# Modo: mantener un proyecto Arnes al dia

Este flujo es para cuando ya tienes un proyecto con Arnes instalado, y la
skill Arnes ha evolucionado (sale una version nueva con mejoras).

**Promesa absoluta:** SOLO actualizo el armazon (reglas, plantillas, hooks).
NO toco tu codigo, NI tus features, NI tus specs archivadas.

---

## Cuando uso este modo

El detector-modo me da «mantener» cuando:

- Existe el directorio del proyecto.
- Tiene `AGENTS.md` Y `.specs/` Y `.arnes/version`.

Si falta alguno de esos tres, **no es un proyecto Arnes valido** y voy a
preguntar antes de actuar.

---

## Los 5 pasos

### Paso 1 — Diagnostico

**Mi mensaje:**

> «Voy a revisar tu proyecto y compararlo con la version actual de Arnes.»

Leo:
```bash
INSTALLED=$(cat .arnes/version)        # version instalada en tu proyecto
SKILL=$(cat $ARNES_SKILL_DIR/.version 2>/dev/null || echo "0.2.2")
```

Comparo cada pieza del armazon-comun con la que vino instalada.

**Mi mensaje al terminar:**

> «Diagnostico:
>
> - **Tu version Arnes:** $INSTALLED
> - **Version actual de la skill:** $SKILL
> - **Estado:** {{actualizada | desactualizada | igual}}
>
> Piezas que detecto:
> - `AGENTS.md` → {{al dia | desactualizado | modificado por ti}}
> - `hooks/scan-secrets.mjs` → {{...}}
> - `hooks/pre-commit` → {{...}}
> - `.specs/` estructura → {{...}}
>
> **Tu trabajo (no se toca):**
> - Features archivadas: $N en `.specs/archived/`
> - Feature activa: {{ninguna | nombre}}
> - Tu codigo: intacto»

Si tu version == version actual:

> «Tu armazon esta al dia. Nada que hacer. ¿Algo mas?»

Si hay diferencia: paso a 2.

---

### Paso 2 — Plan de actualizacion

Para cada pieza del armazon, la comparo en 3 grupos:

**Grupo A: Identicas.** No las toco.

**Grupo B: Cambiadas en la skill pero NO modificadas por ti.**
Las puedo actualizar sin preguntarte. Las comparo via hash sha256 con
`.arnes/manifest.json` (registro de hashes que dejo al instalar).

**Grupo C: Modificadas por ti.**
NO las sobrescribo. Te muestro el diff y pregunto:

> «`AGENTS.md` ha cambiado en Arnes Y tambien lo modificaste tu. Opciones:
> **[A]** Mantener tu version (no actualizar este fichero).
> **[B]** Sobrescribir con la version nueva de Arnes (pierdes tus cambios).
> **[C]** Generar `.arnes-new` aparte y mergeo manual cuando termines.»

**Mi mensaje:**

> «Plan de actualizacion:
>
> **Se actualizan solas (no las has tocado):**
> - `hooks/scan-secrets.mjs` (nuevo patron para Twilio).
> - `plantillas/specs-templates/spec.md.tmpl` (campo «Dependencias» nuevo).
>
> **Necesitan tu decision (las modificaste):**
> - `AGENTS.md`.
>
> **NO cambia nada de:**
> - `.specs/active/` ni `.specs/archived/` (tus specs son sagradas).
> - `estado/implementation-status.md` (tu estado es sagrado).
> - Migraciones SQL, codigo de la app, package.json.
>
> ¿Procedo, ajustamos, o cancelo?»

---

### Paso 3 — Backup + cerrojo

```bash
BACKUP_DIR=~/.arnes-backups/$(basename $PROJECT_DIR)_pre-update_$(date +%Y-%m-%d_%H-%M-%S)
cp -R "$PROJECT_DIR" "$BACKUP_DIR"

node scripts/session.mjs acquire-lock --current-op mantener
```

---

### Paso 4 — Actualizar piezas

Para cada pieza del **Grupo B** (las que no has tocado):

```bash
# Snapshot por si acaso
node scripts/atomic.mjs snapshot <fichero>

# Renderizar nueva version desde plantilla
node scripts/render-template.mjs <plantilla.tmpl> <fichero> \
  --var PROJECT_NAME=<nombre>

# Loguear la operacion
node scripts/atomic.mjs log write --path <fichero>
```

Para piezas del **Grupo C** donde elegiste [B] (sobrescribir):
Mismo proceso.

Para piezas del **Grupo C** donde elegiste [C] (merge manual):
Genero `<fichero>.arnes-new` aparte y te aviso:

> «Generado `<fichero>.arnes-new`. Compara con el original asi:
> ```bash
> diff <fichero> <fichero>.arnes-new
> ```
> Cuando termines de mergear, borra el `.arnes-new`.»

---

### Paso 5 — Verificar + commit

```bash
# Actualizar version y manifest
echo "$SKILL" > .arnes/version

# Verificar que tu proyecto sigue funcionando
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint

# Si todo OK, commit
git add .arnes/ AGENTS.md hooks/ plantillas/
git commit -m "chore: update Arnes armazon to v$SKILL"

# Liberar cerrojo
node scripts/session.mjs release-lock
```

Si la verificacion falla:

```bash
node scripts/atomic.mjs rollback
```

Y te aviso que algo se rompio. Investigo con tu permiso.

**Mensaje final:**

> «Armazon actualizado a v$SKILL.
>
> - Piezas actualizadas: $N
> - Piezas que mantuviste: $M
> - Piezas para merge manual: $K (`*.arnes-new` esperando)
>
> Backup pre-update: $BACKUP_DIR.
>
> ¿Algo mas?»

---

## Que NUNCA toca «mantener»

1. **No toca `.specs/`** (tus specs son tuyas).
2. **No toca el codigo de la app** (`app/`, `lib/`, `components/`).
3. **No toca las migraciones de Supabase.**
4. **No toca `estado/implementation-status.md`** salvo metadata.
5. **No actualiza tus dependencias** (`package.json` queda como esta).
6. **No sobrescribe ficheros que tu modificaste** sin tu permiso explicito.

---

## Cuando NO usar este modo

- **Solo quieres una pieza nueva** (p.ej. un sub-agente): copialo a mano,
  mas rapido.
- **Estas a la mitad de una feature activa**: termina la feature primero,
  luego actualiza.
- **La skill subio de major version (0.X → 1.0)**: revisa el CHANGELOG
  antes. Puede haber breaking changes.

---

## El manifest (registro de hashes)

Para detectar piezas que modificaste, llevo este registro en
`.arnes/manifest.json`:

```json
{
  "version": "0.2.2",
  "installed_at": "2026-05-20T13:34:12Z",
  "files": {
    "AGENTS.md": {
      "sha256_at_install": "abc...",
      "tmpl_origin": "armazon-comun/AGENTS.md.tmpl"
    },
    "hooks/scan-secrets.mjs": {
      "sha256_at_install": "def...",
      "tmpl_origin": "armazon-comun/hooks/scan-secrets.mjs"
    }
  }
}
```

Cuando comparo:
- Hash actual del fichero **== `sha256_at_install`** → No lo tocaste, puedo actualizar.
- Hash actual **!= `sha256_at_install`** → Lo modificaste, te pregunto.

El manifest se genera la primera vez con `scripts/generate-manifest.mjs`
(pendiente para v0.1.1 — por ahora se asume que nada esta modificado
salvo `AGENTS.md`).

---

## Para Claude (instrucciones internas)

1. Antes de tocar, leo `.arnes/version` para entender que versiones comparar.
2. Si el manifest no existe, asumo «nada modificado» pero AVISO al usuario:
   > «No tengo registro previo de hashes. Voy a actualizar respetando lo
   > que se vea claramente modificado (AGENTS.md). Si dudas, dime.»
3. Backup SIEMPRE antes de tocar.
4. Pregunto explicitamente para piezas en Grupo C.
5. Si la verificacion final falla, rollback automatico.

**Protocolo de sesion (obligatorio):** lee
[`docs/internos/protocolo-sesion.md`](../docs/internos/protocolo-sesion.md)
antes de ejecutar nada. En resumen:

- Fija `ARNES_SESSION_ID` y `ARNES_PROJECT_DIR` UNA VEZ al inicio.

- **Si NO existe `.arnes/manifest.json`** (proyecto pre-v0.2.1):
  genera uno con los hashes actuales como linea base ANTES de tocar nada.
  No asumas que «sin manifest = todo modificado». Asume que «sin manifest
  = nada modificado hasta probar lo contrario».

  ```bash
  node $ARNES_SKILL_DIR/scripts/generate-manifest.mjs generate \
    "$ARNES_PROJECT_DIR" --version "$(cat $ARNES_PROJECT_DIR/.arnes/version)"
  ```

- **Verificar:**
  ```bash
  node $ARNES_SKILL_DIR/scripts/generate-manifest.mjs verify "$ARNES_PROJECT_DIR"
  ```
  Output: unchanged / modified / missing por fichero. Solo sobrescribir
  los `unchanged`. Para los `modified`, preguntar al usuario.

- **Setup multi-IA (anrnadido en v0.2.1):** ejecutar `setup-multi-ia.sh`
  al final, por si la skill anrnadio nuevos symlinks (es idempotente,
  no rompe los existentes).

  ```bash
  bash $ARNES_SKILL_DIR/scripts/setup-multi-ia.sh "$ARNES_PROJECT_DIR"
  ```

- **Regenerar manifest** con la nueva version tras actualizar.
  No hardcodees la version: el script lee `.version` de la skill por
  defecto, asi que basta con:
  ```bash
  node $ARNES_SKILL_DIR/scripts/generate-manifest.mjs generate \
    "$ARNES_PROJECT_DIR"
  ```
  (Solo pasa `--version <ver>` si quieres forzar otra version distinta
  a la actual de la skill — caso raro.)
