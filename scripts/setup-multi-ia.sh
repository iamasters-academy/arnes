#!/usr/bin/env bash
# setup-multi-ia.sh - crea los symlinks para que todas las IAs lean AGENTS.md
#
# Uso:
#   setup-multi-ia.sh <project-dir>
#
# Crea (relativos a <project-dir>):
#   CLAUDE.md                              -> AGENTS.md
#   GEMINI.md                              -> AGENTS.md
#   .codex/instructions.md                 -> ../AGENTS.md
#   .github/copilot-instructions.md        -> ../AGENTS.md
#   .cursorrules                           -> AGENTS.md (Cursor legacy)
#
# Requiere que AGENTS.md ya exista en <project-dir>.

set -euo pipefail

PROJECT_DIR="${1:-.}"

if [[ ! -d "$PROJECT_DIR" ]]; then
  echo "ERROR: directorio no existe: $PROJECT_DIR" >&2
  exit 1
fi

cd "$PROJECT_DIR"

if [[ ! -f "AGENTS.md" ]]; then
  echo "ERROR: AGENTS.md no existe en $PROJECT_DIR" >&2
  echo "       Generalo primero (ver plantillas/armazon-comun/AGENTS.md.tmpl)." >&2
  exit 1
fi

echo "Configurando multi-IA en $PROJECT_DIR ..."

# 1. CLAUDE.md
if [[ -e "CLAUDE.md" || -L "CLAUDE.md" ]]; then
  echo "  CLAUDE.md ya existe, saltando."
else
  ln -s "AGENTS.md" "CLAUDE.md"
  echo "  CLAUDE.md -> AGENTS.md"
fi

# 2. GEMINI.md
if [[ -e "GEMINI.md" || -L "GEMINI.md" ]]; then
  echo "  GEMINI.md ya existe, saltando."
else
  ln -s "AGENTS.md" "GEMINI.md"
  echo "  GEMINI.md -> AGENTS.md"
fi

# 3. .codex/instructions.md
mkdir -p ".codex"
if [[ -e ".codex/instructions.md" || -L ".codex/instructions.md" ]]; then
  echo "  .codex/instructions.md ya existe, saltando."
else
  ln -s "../AGENTS.md" ".codex/instructions.md"
  echo "  .codex/instructions.md -> ../AGENTS.md"
fi

# 4. .github/copilot-instructions.md
mkdir -p ".github"
if [[ -e ".github/copilot-instructions.md" || -L ".github/copilot-instructions.md" ]]; then
  echo "  .github/copilot-instructions.md ya existe, saltando."
else
  ln -s "../AGENTS.md" ".github/copilot-instructions.md"
  echo "  .github/copilot-instructions.md -> ../AGENTS.md"
fi

# 5. .cursorrules (legacy, pero algunos lo usan)
if [[ -e ".cursorrules" || -L ".cursorrules" ]]; then
  echo "  .cursorrules ya existe, saltando."
else
  ln -s "AGENTS.md" ".cursorrules"
  echo "  .cursorrules -> AGENTS.md"
fi

echo ""
echo "Listo. Las siguientes IAs leen el mismo AGENTS.md:"
echo "  - Claude Code (CLAUDE.md)"
echo "  - Codex (.codex/instructions.md)"
echo "  - GitHub Copilot (.github/copilot-instructions.md)"
echo "  - Gemini (GEMINI.md)"
echo "  - Cursor (.cursorrules)"
