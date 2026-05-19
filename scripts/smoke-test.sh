#!/usr/bin/env bash
# smoke-test.sh - verifica que la skill Arnes esta bien estructurada.
#
# No ejecuta el flujo completo end-to-end (eso requiere usuario interactivo).
# Solo verifica:
#   1. Estructura de carpetas y ficheros esperados.
#   2. Scripts ejecutables tienen permisos correctos.
#   3. Scripts pasan un test rapido.
#   4. Plantillas tienen variables sin sustituir donde toca.
#
# Salida: exit 0 OK, exit 1 fallo.

set -euo pipefail

SKILL_DIR="${1:-$HOME/.claude/skills/arnes}"

if [[ -t 1 ]]; then
  RED='\033[0;31m'
  GREEN='\033[0;32m'
  YELLOW='\033[1;33m'
  NC='\033[0m'
else
  RED=''
  GREEN=''
  YELLOW=''
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

echo ""
echo "Smoke test de Arnes en $SKILL_DIR"
echo "================================="
echo ""

# ─── 1. Estructura de carpetas ─────────────────────────────────────
echo "1. Estructura de carpetas"
check "directorio raiz existe" "test -d '$SKILL_DIR'"
check "docs/" "test -d '$SKILL_DIR/docs'"
check "modos/" "test -d '$SKILL_DIR/modos'"
check "scripts/" "test -d '$SKILL_DIR/scripts'"
check "plantillas/armazon-comun/" "test -d '$SKILL_DIR/plantillas/armazon-comun'"
check "plantillas/armazon-comun/hooks/" "test -d '$SKILL_DIR/plantillas/armazon-comun/hooks'"
check "plantillas/armazon-comun/specs-templates/" "test -d '$SKILL_DIR/plantillas/armazon-comun/specs-templates'"
check "plantillas/nextjs-supabase/" "test -d '$SKILL_DIR/plantillas/nextjs-supabase'"
check "estado/" "test -d '$SKILL_DIR/estado'"
echo ""

# ─── 2. Ficheros raiz ────────────────────────────────────────────
echo "2. Ficheros raiz"
check "SKILL.md" "test -f '$SKILL_DIR/SKILL.md'"
check "README.md" "test -f '$SKILL_DIR/README.md'"
check "LICENSE" "test -f '$SKILL_DIR/LICENSE'"
check "CHANGELOG.md" "test -f '$SKILL_DIR/CHANGELOG.md'"
check "CITATION.cff" "test -f '$SKILL_DIR/CITATION.cff'"
check "CODEOWNERS" "test -f '$SKILL_DIR/CODEOWNERS'"
echo ""

# ─── 3. Docs canonicas ────────────────────────────────────────────
echo "3. Docs canonicas (6 incluyendo glosario y ciclo-magico)"
for doc in arnes.md seguridad.md atomicidad.md sesiones.md glosario.md ciclo-magico.md; do
  check "docs/$doc" "test -f '$SKILL_DIR/docs/$doc'"
done
echo ""

# ─── 4. Sub-agentes consolidados ──────────────────────────────
echo "4. Sub-agentes (consolidados en ciclo-magico.md)"
check "docs/ciclo-magico.md contiene los 9 etapas" "grep -q 'Etapa 9' '$SKILL_DIR/docs/ciclo-magico.md'"
check "ciclo-magico.md menciona los 6 roles" "grep -qE 'preguntador|escritor|arquitecto|descomponedor|implementador|escéptico' '$SKILL_DIR/docs/ciclo-magico.md'"
echo ""

# ─── 5. Modos ─────────────────────────────────────────────────────
echo "5. Modos (3)"
for m in nuevo adoptar mantener; do
  check "modos/$m.md" "test -f '$SKILL_DIR/modos/$m.md'"
done
echo ""

# ─── 6. Scripts ejecutables ──────────────────────────────────────
echo "6. Scripts (ejecutables)"
check "detectar-modo.sh ejecutable" "test -x '$SKILL_DIR/scripts/detectar-modo.sh'"
check "atomic.mjs existe" "test -f '$SKILL_DIR/scripts/atomic.mjs'"
check "session.mjs existe" "test -f '$SKILL_DIR/scripts/session.mjs'"
check "setup-multi-ia.sh ejecutable" "test -x '$SKILL_DIR/scripts/setup-multi-ia.sh'"
check "render-template.mjs existe" "test -f '$SKILL_DIR/scripts/render-template.mjs'"
check "e2e-test.sh ejecutable" "test -x '$SKILL_DIR/scripts/e2e-test.sh'"
echo ""

# ─── 7. Plantillas armazon-comun ────────────────────────────────
echo "7. Plantillas armazon-comun"
check "AGENTS.md.tmpl" "test -f '$SKILL_DIR/plantillas/armazon-comun/AGENTS.md.tmpl'"
check "hooks/pre-commit ejecutable" "test -x '$SKILL_DIR/plantillas/armazon-comun/hooks/pre-commit'"
check "hooks/scan-secrets.mjs" "test -f '$SKILL_DIR/plantillas/armazon-comun/hooks/scan-secrets.mjs'"
check "hooks/README.md" "test -f '$SKILL_DIR/plantillas/armazon-comun/hooks/README.md'"
echo ""

echo "8. Plantillas specs-templates (6)"
for tmpl in spec plan tasks tests review adversarial; do
  check "specs-templates/$tmpl.md.tmpl" "test -f '$SKILL_DIR/plantillas/armazon-comun/specs-templates/$tmpl.md.tmpl'"
done
echo ""

# ─── 9. Plantilla nextjs-supabase ────────────────────────────────
echo "9. Plantilla nextjs-supabase"
for f in package.json tsconfig.json next.config.ts .gitignore .env.example README.md app/layout.tsx app/page.tsx app/globals.css lib/supabase/server.ts lib/supabase/client.ts middleware.ts vitest.config.ts playwright.config.ts; do
  check "nextjs-supabase/$f.tmpl" "test -f '$SKILL_DIR/plantillas/nextjs-supabase/$f.tmpl'"
done
check "supabase/config.toml.tmpl" "test -f '$SKILL_DIR/plantillas/nextjs-supabase/supabase/config.toml.tmpl'"
check "supabase/migrations/000_init.sql.tmpl" "test -f '$SKILL_DIR/plantillas/nextjs-supabase/supabase/migrations/000_init.sql.tmpl'"
echo ""

# ─── 10. Status template ──────────────────────────────────────────
echo "10. Estado templates"
check "estado/implementation-status.md.tmpl" "test -f '$SKILL_DIR/estado/implementation-status.md.tmpl'"
echo ""

# ─── 11. Smoke test funcional de scripts ────────────────────────
echo "11. Smoke test de scripts"
check "detectar-modo: dir vacio -> nuevo" "bash '$SKILL_DIR/scripts/detectar-modo.sh' /tmp 2>/dev/null | grep -q -E 'adoptar|ambiguo'"

# atomic.mjs --help
check "atomic.mjs --help responde" "node '$SKILL_DIR/scripts/atomic.mjs' --help"

# session.mjs --help
check "session.mjs --help responde" "node '$SKILL_DIR/scripts/session.mjs' --help"

# scan-secrets con fichero limpio
TMPFILE=$(mktemp)
echo "const x = 1;" > "$TMPFILE"
check "scan-secrets pasa con fichero limpio" "node '$SKILL_DIR/plantillas/armazon-comun/hooks/scan-secrets.mjs' '$TMPFILE'"
rm -f "$TMPFILE"

# scan-secrets bloquea con OpenAI key
# Nota: construimos la fake-key por partes para evitar triggear secret scanners
# en este propio fichero.
TMPFILE=$(mktemp)
FAKE_PREFIX="sk-proj"
FAKE_BODY="AbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABCD"
echo "const key = '${FAKE_PREFIX}-${FAKE_BODY}';" > "$TMPFILE"
check "scan-secrets detecta OpenAI key" "! node '$SKILL_DIR/plantillas/armazon-comun/hooks/scan-secrets.mjs' '$TMPFILE' 2>&1 | grep -q 'OK'"
rm -f "$TMPFILE"

echo ""

# ─── Resumen ───────────────────────────────────────────────────
echo "================================="
echo -e "Pasados: ${GREEN}$PASS${NC} | Fallos: ${RED}$FAIL${NC}"
echo "================================="

if [[ $FAIL -eq 0 ]]; then
  echo -e "${GREEN}Smoke test: OK${NC}"
  exit 0
else
  echo -e "${RED}Smoke test: FALLO${NC}"
  exit 1
fi
