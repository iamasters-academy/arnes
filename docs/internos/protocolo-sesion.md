# Protocolo de sesion — uso de ARNES_SESSION_ID y manifest

Documento INTERNO. Solo para Claude/IA. Define el contrato de uso de
`scripts/session.mjs`, `scripts/atomic.mjs` y `scripts/generate-manifest.mjs`
en los flujos de los modos (express, estandar, pro, adoptar, mantener).

**Este doc no se muestra al usuario. NUNCA. Si el usuario pregunta como
funciona, responde en lenguaje plano sin referenciar este fichero.**

---

## Regla 1: tres variables fijadas UNA SOLA VEZ al inicio del modo

Antes de invocar nada en `scripts/`, generar y exportar las tres variables
clave:

```bash
# Path a la skill. Por defecto ~/.claude/skills/arnes, pero IA Masters OS
# puede instalarla en otra ruta — siempre leer la env var.
export ARNES_SKILL_DIR="${ARNES_SKILL_DIR:-$HOME/.claude/skills/arnes}"

# Identificador unico de esta sesion. Lo respetan atomic.mjs y session.mjs.
export ARNES_SESSION_ID="sess_$(date +%s)_$$"

# Donde vivira el proyecto (o staging si aplica).
export ARNES_PROJECT_DIR="<destino-final>"
```

Y mantenerlos hasta que termine el modo. Todos los `node $ARNES_SKILL_DIR/scripts/...`,
`bash $ARNES_SKILL_DIR/scripts/...` heredan estas vars.

**Por que `ARNES_SKILL_DIR`:** la skill puede estar en `~/.claude/skills/arnes/`
(default), en `~/iamasters-os/skills/arnes/` (cuando IA Masters OS la instala),
o en cualquier otra ruta. Hardcodear `~/.claude/skills/arnes` rompe esto.
Siempre usar la variable.

**Por que:** session.mjs es estricto a proposito — solo el dueno del lock
puede liberarlo. Si Claude cambia de session_id a mitad de flujo (porque
invoca un sub-agente, porque el comando se ejecuta en una shell distinta,
etc.), `release-lock` falla con «no puedes liberar lock de otra sesion».

Esto se descubrio en test E2E v0.2.0 (Test 4 — Adoptar). Solucion:
fijar la var de entorno como primer paso del modo.

---

## Regla 2: el orden de los scripts es siempre el mismo

Plantilla de modo (aplicable a express, estandar, pro, adoptar):

```bash
# Paso 0: vars
export ARNES_SESSION_ID="sess_$(date +%s)_$$"
export ARNES_PROJECT_DIR="<destino>"

# Paso 1: adquirir lock
node $ARNES_SKILL_DIR/scripts/session.mjs acquire-lock --current-op <op>

# Paso 2: trabajar en staging
mkdir -p ~/.arnes-staging/$ARNES_SESSION_ID/<proyecto>
node $ARNES_SKILL_DIR/scripts/render-template.mjs --dir ... <staging>
node $ARNES_SKILL_DIR/scripts/atomic.mjs log mkdir --path <staging>
# ... mas operaciones, cada una loguea con atomic.mjs ...

# Paso 3: promote atomico
node $ARNES_SKILL_DIR/scripts/atomic.mjs promote <staging> <destino>

# Paso 4: configurar el armazon
bash $ARNES_SKILL_DIR/scripts/setup-multi-ia.sh <destino>

# Paso 5: generar manifest (NUEVO en v0.2.1)
node $ARNES_SKILL_DIR/scripts/generate-manifest.mjs generate <destino>

# Paso 6: git init + commit
cd <destino>
git init -b main
git add .
git commit -m "..." --no-verify   # solo el primer commit; despues el hook esta activo

# Paso 7: liberar lock (MISMO ARNES_SESSION_ID que en paso 1)
node $ARNES_SKILL_DIR/scripts/session.mjs release-lock
```

---

## Regla 3: en modo «mantener», fijar SESSION_ID y generar manifest si falta

Mantener se ejecuta sobre un proyecto que ya tiene Arnes. Si el manifest
no existe (proyecto instalado con version <= 0.2.0), genera uno con los
hashes actuales como linea base antes de tocar nada. **No asumir que falta
de manifest = todo modificado** — asumir que el usuario no toco nada hasta
que tengamos prueba.

```bash
export ARNES_SESSION_ID="sess_$(date +%s)_$$"
export ARNES_PROJECT_DIR="<proyecto>"

# Verificar manifest. Si no existe, generar uno con los hashes actuales.
if [ ! -f "$ARNES_PROJECT_DIR/.arnes/manifest.json" ]; then
  echo "Manifest no existe (proyecto instalado pre-v0.2.1). Generando linea base."
  node $ARNES_SKILL_DIR/scripts/generate-manifest.mjs generate "$ARNES_PROJECT_DIR" \
    --version "$(cat $ARNES_PROJECT_DIR/.arnes/version)"
fi

# Verificar que ficheros estan modificados
node $ARNES_SKILL_DIR/scripts/generate-manifest.mjs verify "$ARNES_PROJECT_DIR"
# Output dira: unchanged / modified / missing por fichero.
# Solo sobrescribir los unchanged. Para los modified, preguntar al usuario.
```

Tras actualizar, regenerar el manifest. **No hardcodear la version** —
el script lee `$ARNES_SKILL_DIR/.version` por defecto, asi que basta:

```bash
node $ARNES_SKILL_DIR/scripts/generate-manifest.mjs generate "$ARNES_PROJECT_DIR"
```

---

## Regla 4: en modo «mantener», verificar symlinks multi-IA

Test E2E v0.2.0 (Test 5) detecto que `setup-multi-ia.sh` no se ejecutaba
en mantener. Si la skill anrnadio symlinks nuevos (p.ej. `.cursorrules`
que antes no existia), un proyecto antiguo no los recibira.

Solucion: en mantener, ejecutar `setup-multi-ia.sh` al final (es
idempotente — si el symlink ya existe, lo salta).

```bash
bash $ARNES_SKILL_DIR/scripts/setup-multi-ia.sh "$ARNES_PROJECT_DIR"
```

---

## Regla 5: rollback usa el MISMO session_id

Si algo falla y hay que hacer rollback:

```bash
node $ARNES_SKILL_DIR/scripts/atomic.mjs rollback
# Usa ARNES_SESSION_ID actual para identificar que operaciones deshacer.
```

Por eso es crucial mantener la var de entorno constante.

---

## Que NO hacer

- ❌ Lanzar sub-agentes que cambien de session_id durante un flujo. Si
  necesitas delegar, el sub-agente debe HEREDAR ARNES_SESSION_ID y
  ARNES_PROJECT_DIR via env. NO crear uno nuevo.
- ❌ Llamar a `release-lock` desde otra terminal o sesion. Si necesitas
  liberar un lock huerfano, usar `force-unlock` (con justificacion).
- ❌ Saltar `generate-manifest` al instalar. Sin manifest, mantener no
  puede operar correctamente.

---

## Resumen para la IA

Antes de tocar nada, exporta:
- `ARNES_SESSION_ID` (una vez, formato `sess_<timestamp>_<pid>`)
- `ARNES_PROJECT_DIR` (path al proyecto destino)

Despues:
- Acquire lock → trabaja → promote → setup-multi-ia → **generate-manifest** → release lock.
- Si rollback: usa el mismo session_id.
- En mantener: genera manifest si falta, verifica, actualiza solo lo unchanged.
