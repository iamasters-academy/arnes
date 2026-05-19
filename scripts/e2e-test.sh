#!/usr/bin/env bash
# e2e-test.sh - test end-to-end real del flujo Arnes.
#
# Verifica que la skill funciona de verdad, no solo que los ficheros existen:
#   1. Crear sandbox temporal.
#   2. Renderizar plantillas (armazon-comun + nextjs-supabase) con variables reales.
#   3. Verificar que no quedan {{VAR}} sin sustituir.
#   4. Setup multi-IA (symlinks).
#   5. Verificar estructura final del proyecto generado.
#   6. Verificar que atomic.mjs y session.mjs pueden operar en el sandbox.
#   7. Limpieza.
#
# NO ejecuta `pnpm install` (eso tarda 2-3 min y este test es rapido).
# Para eso, hacer una prueba manual aparte (ver al final del script).
#
# Exit code: 0 OK, 1 fallo.

set -euo pipefail

SKILL_DIR="${1:-$HOME/.claude/skills/arnes}"
SANDBOX="/tmp/arnes-e2e-$(date +%s)-$$"

if [[ -t 1 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  CYAN='\033[0;36m'
  NC='\033[0m'
else
  RED=''
  GREEN=''
  YELLOW=''
  CYAN=''
  NC=''
fi

FAIL=0
PASS=0

check() {
  local desc="$1"
  local cmd="$2"
  if eval "$cmd" > /dev/null 2>&1; then
    echo -e "  ${GREEN}OK${NC}    $desc"
    PASS=$((PASS+1))
  else
    echo -e "  ${RED}FAIL${NC}  $desc"
    FAIL=$((FAIL+1))
  fi
}

cleanup() {
  rm -rf "$SANDBOX" "/tmp/arnes-test-render-tmp" 2>/dev/null || true
}
trap cleanup EXIT

echo ""
echo -e "${CYAN}====================================="
echo -e "    Arnes — Smoke test E2E real"
echo -e "=====================================${NC}"
echo "Skill:   $SKILL_DIR"
echo "Sandbox: $SANDBOX"
echo ""

mkdir -p "$SANDBOX"

# ─── 1. Render armazon-comun (excluyendo specs-templates) ──────
echo -e "${CYAN}1. Renderizar armazon comun${NC}"
echo -e "${YELLOW}   (specs-templates se excluyen: son plantillas para crear features mas tarde, no para copiarse al proyecto raiz)${NC}"

node "$SKILL_DIR/scripts/render-template.mjs" --dir \
  "$SKILL_DIR/plantillas/armazon-comun" \
  "$SANDBOX/proyecto-test" \
  --var PROJECT_NAME=mi-app-test \
  --var PROJECT_DESCRIPTION="App de inventario de prueba" \
  --exclude specs-templates \
  > /dev/null

check "render del armazon comun no falla"  "true"
check "AGENTS.md existe"                    "test -f '$SANDBOX/proyecto-test/AGENTS.md'"
check "hooks/pre-commit existe"             "test -f '$SANDBOX/proyecto-test/hooks/pre-commit'"
check "hooks/scan-secrets.mjs existe"       "test -f '$SANDBOX/proyecto-test/hooks/scan-secrets.mjs'"
check "specs-templates NO se copio (se excluyo)" "! test -d '$SANDBOX/proyecto-test/specs-templates'"
check "AGENTS.md sin {{VAR}} sin sustituir" "! grep -qE '\\{\\{[A-Z_]+\\}\\}' '$SANDBOX/proyecto-test/AGENTS.md'"
echo ""

# ─── 2. Render plantilla nextjs-supabase ────────────────────────
echo -e "${CYAN}2. Renderizar plantilla nextjs-supabase encima del armazon comun${NC}"

# El stack se aplica encima (en el mismo directorio)
node "$SKILL_DIR/scripts/render-template.mjs" --dir \
  "$SKILL_DIR/plantillas/nextjs-supabase" \
  "$SANDBOX/proyecto-test" \
  --var PROJECT_NAME=mi-app-test \
  --var PROJECT_DESCRIPTION="App de inventario de prueba" \
  > /dev/null

check "package.json existe"           "test -f '$SANDBOX/proyecto-test/package.json'"
check "tsconfig.json existe"          "test -f '$SANDBOX/proyecto-test/tsconfig.json'"
check "next.config.ts existe"         "test -f '$SANDBOX/proyecto-test/next.config.ts'"
check "app/layout.tsx existe"         "test -f '$SANDBOX/proyecto-test/app/layout.tsx'"
check "app/page.tsx existe"           "test -f '$SANDBOX/proyecto-test/app/page.tsx'"
check "lib/supabase/server.ts existe" "test -f '$SANDBOX/proyecto-test/lib/supabase/server.ts'"
check "lib/supabase/client.ts existe" "test -f '$SANDBOX/proyecto-test/lib/supabase/client.ts'"
check "middleware.ts existe"          "test -f '$SANDBOX/proyecto-test/middleware.ts'"
check ".env.example existe"           "test -f '$SANDBOX/proyecto-test/.env.example'"
check "supabase/config.toml existe"   "test -f '$SANDBOX/proyecto-test/supabase/config.toml'"
echo ""

# ─── 3. Verificar sustitucion de variables ───────────────────────
echo -e "${CYAN}3. Verificar sustitucion de variables${NC}"

check "package.json tiene 'mi-app-test'" \
  "grep -q '\"name\": \"mi-app-test\"' '$SANDBOX/proyecto-test/package.json'"
check "README tiene la descripcion correcta" \
  "grep -q 'App de inventario de prueba' '$SANDBOX/proyecto-test/README.md'"
check "AGENTS.md menciona el proyecto" \
  "grep -q 'mi-app-test' '$SANDBOX/proyecto-test/AGENTS.md'"
check "Sin {{VAR}} sin sustituir en TODO el proyecto" \
  "! grep -rE '\\{\\{[A-Z_]+\\}\\}' '$SANDBOX/proyecto-test/' --include='*.ts' --include='*.tsx' --include='*.json' --include='*.md' --include='*.toml' --include='*.sql' --include='*.css' 2>/dev/null"
echo ""

# ─── 4. Setup multi-IA (symlinks) ────────────────────────────────
echo -e "${CYAN}4. Setup multi-IA (symlinks AGENTS.md ↔ CLAUDE/Codex/etc.)${NC}"

bash "$SKILL_DIR/scripts/setup-multi-ia.sh" "$SANDBOX/proyecto-test" > /dev/null

check "CLAUDE.md es symlink"                     "test -L '$SANDBOX/proyecto-test/CLAUDE.md'"
check "GEMINI.md es symlink"                     "test -L '$SANDBOX/proyecto-test/GEMINI.md'"
check ".codex/instructions.md es symlink"        "test -L '$SANDBOX/proyecto-test/.codex/instructions.md'"
check ".github/copilot-instructions.md symlink"  "test -L '$SANDBOX/proyecto-test/.github/copilot-instructions.md'"
check ".cursorrules es symlink"                  "test -L '$SANDBOX/proyecto-test/.cursorrules'"
check "Symlinks apuntan al mismo AGENTS.md" \
  "diff '$SANDBOX/proyecto-test/CLAUDE.md' '$SANDBOX/proyecto-test/AGENTS.md'"
echo ""

# ─── 5. atomic.mjs funciona en el sandbox ────────────────────────
echo -e "${CYAN}5. atomic.mjs (operations log + rollback)${NC}"

export ARNES_PROJECT_DIR="$SANDBOX/proyecto-test"
export ARNES_SESSION_ID="sess_e2e_$$"

# Crear estado/ que atomic.mjs necesita
mkdir -p "$SANDBOX/proyecto-test/estado"

# Test: log + write + rollback
echo "contenido" > "$SANDBOX/proyecto-test/test-fichero.txt"
node "$SKILL_DIR/scripts/atomic.mjs" log write \
  --path "$SANDBOX/proyecto-test/test-fichero.txt" > /dev/null

check "atomic.mjs log escribio en operations.jsonl" \
  "test -f '$SANDBOX/proyecto-test/estado/operations.jsonl'"
check "operations.jsonl tiene 1 entrada"  \
  "[ \$(wc -l < '$SANDBOX/proyecto-test/estado/operations.jsonl') -eq 1 ]"

# Snapshot de un fichero, modificacion, rollback
echo "original" > "$SANDBOX/proyecto-test/snapshotted.txt"
node "$SKILL_DIR/scripts/atomic.mjs" snapshot \
  "$SANDBOX/proyecto-test/snapshotted.txt" > /dev/null
echo "modificado" > "$SANDBOX/proyecto-test/snapshotted.txt"

node "$SKILL_DIR/scripts/atomic.mjs" rollback > /dev/null 2>&1

check "rollback restauro snapshotted.txt al original" \
  "grep -q 'original' '$SANDBOX/proyecto-test/snapshotted.txt'"
check "rollback elimino test-fichero.txt" \
  "! test -f '$SANDBOX/proyecto-test/test-fichero.txt'"
echo ""

# ─── 6. session.mjs (lock concurrente) ──────────────────────────
echo -e "${CYAN}6. session.mjs (lock concurrente)${NC}"

export ARNES_SESSION_ID="sess_lock_test_$$"

node "$SKILL_DIR/scripts/session.mjs" acquire-lock --current-op test > /dev/null

check "Lock se creo"  "test -f '$SANDBOX/proyecto-test/estado/.lock'"

# Otra sesion intenta adquirir y debe fallar
export ARNES_SESSION_ID="sess_otra_$$"
check "Otra sesion no puede adquirir el lock" \
  "! node '$SKILL_DIR/scripts/session.mjs' acquire-lock --current-op test 2>/dev/null"

# Volvemos a la original y liberamos
export ARNES_SESSION_ID="sess_lock_test_$$"
node "$SKILL_DIR/scripts/session.mjs" release-lock > /dev/null

check "Lock liberado"  "! test -f '$SANDBOX/proyecto-test/estado/.lock'"
echo ""

# ─── 7. scan-secrets en el sandbox renderizado ─────────────────
echo -e "${CYAN}7. scan-secrets funciona en el proyecto generado${NC}"

# Crear un fichero «limpio» y otro con secreto
# Nota: construimos la fake-key por partes para evitar triggear secret scanners
# en este propio fichero (irony level: alto).
echo "const x = 1;" > "$SANDBOX/clean.ts"
FAKE_PREFIX="sk-proj"
FAKE_BODY="AbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABCD"
echo "const k = '${FAKE_PREFIX}-${FAKE_BODY}';" > "$SANDBOX/dirty.ts"

check "scan-secrets pasa con fichero limpio" \
  "node '$SANDBOX/proyecto-test/hooks/scan-secrets.mjs' '$SANDBOX/clean.ts'"
check "scan-secrets bloquea con OpenAI key" \
  "! node '$SANDBOX/proyecto-test/hooks/scan-secrets.mjs' '$SANDBOX/dirty.ts' 2>&1 | grep -q '^OK'"
echo ""

# ─── 8. Estructura final del proyecto ───────────────────────────
echo -e "${CYAN}8. Estructura final del proyecto generado${NC}"

# Carpetas esperadas (las que vienen de las plantillas)
for d in app lib/supabase supabase/migrations hooks estado; do
  check "Carpeta '$d' existe" "test -d '$SANDBOX/proyecto-test/$d'"
done

# components/ es opcional (no viene en la plantilla v1)
check "components/ NO viene por defecto en v1" "! test -d '$SANDBOX/proyecto-test/components'"

# Estructura .specs/ (vacia pero existente)
mkdir -p "$SANDBOX/proyecto-test/.specs/active" "$SANDBOX/proyecto-test/.specs/archived"
check ".specs/active existe"   "test -d '$SANDBOX/proyecto-test/.specs/active'"
check ".specs/archived existe" "test -d '$SANDBOX/proyecto-test/.specs/archived'"
echo ""

# ─── Resumen ───────────────────────────────────────────────────
echo -e "${CYAN}=====================================${NC}"
echo -e "Pasados: ${GREEN}$PASS${NC} | Fallos: ${RED}$FAIL${NC}"
echo -e "${CYAN}=====================================${NC}"

if [[ $FAIL -eq 0 ]]; then
  echo -e "${GREEN}Smoke test E2E: OK${NC}"
  echo ""
  echo "Para verificar el flujo completo (incluyendo pnpm install y pnpm dev),"
  echo "ejecuta manualmente:"
  echo ""
  echo "  cd $SANDBOX/proyecto-test"
  echo "  pnpm install                # 2-3 min"
  echo "  pnpm typecheck              # debe pasar"
  echo "  pnpm lint                   # debe pasar"
  echo "  pnpm dev                    # arranca en localhost:3000"
  echo ""
  echo "(Sandbox se borra automaticamente al salir del script.)"
  exit 0
else
  echo -e "${RED}Smoke test E2E: FALLO${NC}"
  echo ""
  echo "Sandbox conservado en: $SANDBOX (para investigar)"
  trap - EXIT
  exit 1
fi
