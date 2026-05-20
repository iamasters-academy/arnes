# Modo: adoptar un proyecto que YA EXISTE

Este flujo es para cuando ya tienes un proyecto montado (puede ser tuyo o
de otro), y quieres «meterle» el armazon Arnes para empezar a anrnadir
features con metodo SDD+TDD.

**Promesa absoluta:** NO toco tu codigo. Solo anrnado encima.

---

## Cuando uso este modo

El detector-modo me da «adoptar» cuando:

- Existe el directorio del proyecto.
- Tiene senrales de proyecto de software (`package.json`, `.git/`, `src/`, etc.).
- NO tiene armazon Arnes (sin `AGENTS.md`, sin `.specs/`, sin `.arnes/version`).

Si tu proyecto ya tiene `AGENTS.md` pero quieres updaterear el armazon,
usa el modo «mantener» (no este).

---

## Los 6 pasos

### Paso 1 — Auditoria

**Mi mensaje:**

> «Antes de tocar nada, te explico que voy a hacer. Primero te muestro
> que tienes para que estemos en la misma pagina.»

Inspecciono tu proyecto:
- `package.json` (que stack usas).
- `.git/` (en que rama vas, si hay cambios sin commitear).
- Carpetas tipicas (`app/`, `src/`, `pages/`, `lib/`).
- Si ya tienes ficheros que podrian chocar (`AGENTS.md`, `CLAUDE.md`,
  `hooks/`, `.specs/`).

**Mi mensaje al terminar la auditoria:**

> «He revisado el proyecto. Esto es lo que veo:
>
> - **Nombre:** `<nombre>`
> - **Stack:** Next.js + Supabase + PNPM (compatible con Arnes v1).
> - **Estado git:** rama `main`, 47 commits, sin cambios pendientes.
>
> **Lo que ya tienes:**
> - `CLAUDE.md` (lo respeto: hare backup y te pregunto que hacer).
> - `.cursorrules` (igual: lo respeto).
>
> **Lo que voy a anrnadir:**
> - Backup completo de tu proyecto a `~/.arnes-backups/<nombre>_<fecha>/`
>   (asi puedes volver atras si quieres).
> - `AGENTS.md` (las reglas para las IAs).
> - Symlinks de multi-IA respetando lo que ya tienes.
> - `hooks/` (verificacion automatica antes de commits).
> - `.specs/` (estructura para anrnadir features con metodo).
> - `estado/` (donde guardo el progreso).
>
> **Lo que NO voy a tocar:**
> - Tu codigo (carpetas `app/`, `src/`, `lib/`, `components/`, `pages/`).
> - Tu `package.json` (salvo anrnadir scripts que falten, con tu permiso).
> - Tus migraciones de Supabase si las tienes.
> - Tu CI/CD (`.github/workflows/`).
>
> ¿Procedo, modifico algo del plan, o cancelo?»

Si cancela: paro, no toco nada.
Si pide cambios: ajusto el plan y vuelvo a preguntar.
Si procede: paso a 2.

---

### Paso 2 — Backup obligatorio

**Mi mensaje:**

> «Voy a hacer un backup completo de tu proyecto, por si algo va mal.»

```bash
BACKUP_DIR=~/.arnes-backups/$(basename $PROJECT_DIR)_$(date +%Y-%m-%d_%H-%M-%S)
cp -R "$PROJECT_DIR" "$BACKUP_DIR"
```

**Al terminar:**

> «Backup hecho en `$BACKUP_DIR`. Si algo va mal mas adelante, puedes
> restaurar con:
> ```bash
> rm -rf <tu-proyecto> && cp -R $BACKUP_DIR <tu-proyecto>
> ```
> El backup se conserva 30 dias. Sigo con la inyeccion del armazon.»

---

### Paso 3 — Activar el cerrojo

```bash
node scripts/session.mjs acquire-lock --current-op adoptar
```

Esto evita que otra sesion toque el mismo proyecto a la vez.

---

### Paso 4 — Inyectar el armazon

Voy pieza a pieza, respetando lo que ya tienes:

**4.1. AGENTS.md**
- Si NO existe → lo creo desde la plantilla.
- Si YA existe (caso raro) → pregunto:
  > «Ya tienes un `AGENTS.md`. Opciones:
  > **[A]** Lo respeto y anrnado una seccion «Arnes» al final.
  > **[B]** Lo sustituyo (hago backup primero).
  > **[C]** Lo dejo como esta y no instalo el multi-IA.»

**4.2. CLAUDE.md / .codex / .github/copilot-instructions / GEMINI.md / .cursorrules**
- Si NO existen: creo symlinks que apunten a AGENTS.md.
- Si YA existen: los respeto. Solo anrnado los que falten.

**4.3. hooks/**
- Si NO existe `hooks/`: copio toda la carpeta.
- Si YA existe: anrnado solo los ficheros que falten. NUNCA sobrescribo
  hooks tuyos sin preguntar.

**4.4. .specs/**
- Creo `.specs/active/` y `.specs/archived/` (vacios).

**4.5. estado/**
- Creo `estado/implementation-status.md` con tu proyecto en estado «idle».

**4.6. .gitignore**
- Anrnado al final del `.gitignore` que ya tienes (sin duplicar):
  ```
  # Arnes - estado local
  estado/.lock
  estado/operations.jsonl
  .arnes-staging/
  .arnes-snapshots/
  .arnes-backups/
  ```

**4.7. .arnes/version**
- Marcador para que la proxima vez sepa que tu proyecto ya tiene Arnes:
  ```bash
  mkdir -p .arnes
  echo "0.1.0" > .arnes/version
  ```

**4.8. Pre-commit hook activo**
- Instalo el hook para que se ejecute antes de cada `git commit`:
  ```bash
  chmod +x hooks/pre-commit hooks/scan-secrets.mjs
  ln -sf ../../hooks/pre-commit .git/hooks/pre-commit
  ```

---

### Paso 5 — Verificar que tu proyecto sigue funcionando

**Mi mensaje:**

> «He inyectado el armazon. Ahora verifico que tu proyecto sigue funcionando
> exactamente como antes (no he tocado tu codigo).»

```bash
pnpm install
pnpm lint
pnpm typecheck
```

Si algo falla:

> «Detecto que `pnpm typecheck` falla. Importante: yo no he tocado tu
> codigo, asi que este problema **ya existia antes** de que llegara yo.
> Tengo dos opciones para ti:
> **[A]** Procedo con el commit (los errores quedan documentados, los
> arreglas despues).
> **[B]** Cancelo y dejo el proyecto sin Arnes (puedes intentar de nuevo
> cuando arregles los typecheck).»

---

### Paso 6 — Commit + entrega

```bash
git add AGENTS.md CLAUDE.md GEMINI.md .codex .github .cursorrules \
  hooks/ .specs/ estado/ .arnes/ .gitignore
git commit -m "chore: adopt Arnes v0.1.0 (SDD+TDD framework)"
```

Este commit pasa por el hook (scan-secrets, etc.). Si falla, hay un problema
preexistente que hay que resolver primero.

**Mensaje final:**

> «¡Adopcion completa!
>
> **Que ha cambiado:**
> - Tu proyecto ahora tiene un `AGENTS.md` con reglas claras para cualquier IA.
> - Cada `git commit` pasa por verificacion automatica de secretos.
> - `.specs/` esta listo para anrnadir features con metodo SDD+TDD.
> - `estado/` lleva el control de en que estamos.
>
> **Tu codigo NO se ha tocado.**
>
> **Backup conservado:** `<backup-path>` (30 dias por defecto).
>
> **Siguientes pasos:**
> 1. Echa un ojo al `AGENTS.md` generado y ajustalo si quieres (es lo que
>    las IAs van a leer).
> 2. Cuando quieras anrnadir una feature nueva con metodo, dime «vamos a
>    crear la feature X» y arrancare el ciclo.
>
> ¿Algo mas, o lo dejamos aqui?»

Y libero el cerrojo:

```bash
node scripts/session.mjs release-lock
```

---

## Casos especiales

### Tu proyecto usa Vue, no Next.js

Lo respeto. Genero un `AGENTS.md` que refleja Vue en lugar de Next.js.
En v1, las plantillas SDD funcionan igual (son agnosticas al frontend).
Lo que cambia es lo que pongo en la seccion «Stack» del AGENTS.md.

### Tu proyecto usa Pages Router (no App Router)

Lo respeto. El AGENTS.md lo refleja. Sugerencia opcional de migrar a App
Router cuando tengas tiempo (no obligatorio).

### Tu proyecto no tiene tests configurados

NO instalo Vitest automaticamente. Lo sugiero como siguiente paso. Si me
dices «instalalo», abro una feature nueva con el modo SDD.

### Hay conflicto con un fichero existente

Pregunto SIEMPRE antes de sobrescribir. Tu decision.

---

## Si algo se tuerce

**Auto-rollback** (operations.jsonl):
```bash
node scripts/atomic.mjs rollback
```

Esto deshace todos los ficheros que yo cree o modifique. Tu codigo
intacto (nunca lo toque).

**Rollback manual** desde el backup (si lo de arriba falla):
```bash
rm -rf <tu-proyecto>
cp -R <backup-path> <tu-proyecto>
```

---

## Reglas que NUNCA rompo en este modo

1. **NO toco tu codigo** (`app/`, `lib/`, `components/`, `src/`, `pages/`).
2. **NO toco tu `package.json`** salvo anrnadir scripts faltantes (con permiso).
3. **NO toco tus migraciones de Supabase.**
4. **Backup obligatorio** antes de tocar nada.
5. **Si hay conflicto, pregunto** antes de sobrescribir.
6. **Despues del commit, tu proyecto sigue funcionando** exactamente como antes.

---

## Despues de adoptar

Una vez tienes el armazon instalado, **cualquier feature nueva** la
anrnades con el flujo del ciclo SDD (entrevista → blueprint → plan →
verificaciones → codigo → revisiones → archive).

Pero el scaffold inicial **ya esta** — no se vuelve a montar Next.js o
Supabase. Solo se anrnade encima.

---

## Para Claude (instrucciones internas)

Igual que en `modos/pro.md`:

1. Cada paso empieza explicando que voy a hacer.
2. Espero confirmacion explicita en los puntos clave (auditoria, conflictos).
3. NUNCA toco el codigo del usuario.
4. Si dudo, pregunto.
5. Mantengo `estado/implementation-status.md` actualizado.

**La diferencia con «nuevo»:**
- Hay backup obligatorio.
- Reviso antes lo que ya tienes y lo respeto.
- El primer commit NO usa `--no-verify` (porque pasa por validaciones reales).
