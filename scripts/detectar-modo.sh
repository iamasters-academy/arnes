#!/usr/bin/env bash
# detectar-modo.sh - detecta el modo Arnes segun el estado del directorio.
#
# Salida (stdout): "nuevo" | "adoptar" | "mantener" | "ambiguo"
# Exit code: 0 OK, 1 error
#
# Uso:
#   detectar-modo.sh [path]
#
# Si no se pasa path, usa el directorio actual.

set -euo pipefail

PROYECTO="${1:-.}"

# Caso 1: el directorio no existe -> nuevo (vamos a crearlo)
if [[ ! -d "$PROYECTO" ]]; then
  echo "nuevo"
  exit 0
fi

# Caso 2: el directorio existe pero esta vacio -> nuevo
if [[ -z "$(ls -A "$PROYECTO" 2>/dev/null)" ]]; then
  echo "nuevo"
  exit 0
fi

# Caso 3: tiene armazon Arnes instalado -> mantener
TIENE_AGENTS="false"
TIENE_SPECS="false"
TIENE_ARNES_VERSION="false"

[[ -f "$PROYECTO/AGENTS.md" ]] && TIENE_AGENTS="true"
[[ -d "$PROYECTO/.specs" ]] && TIENE_SPECS="true"
[[ -f "$PROYECTO/.arnes/version" ]] && TIENE_ARNES_VERSION="true"

# Requiere los 3 marcadores para considerarse "mantener".
# Si solo tiene uno o dos, probablemente esta a medias o fue copiado mal.
if [[ "$TIENE_AGENTS" == "true" && "$TIENE_SPECS" == "true" && "$TIENE_ARNES_VERSION" == "true" ]]; then
  echo "mantener"
  exit 0
fi

# Caso 4: existe proyecto pero sin armazon Arnes
# Contamos senales tipicas de proyecto de software
SENALES=0

# Manifests de packages
[[ -f "$PROYECTO/package.json" ]] && SENALES=$((SENALES + 1))
[[ -f "$PROYECTO/pyproject.toml" ]] && SENALES=$((SENALES + 1))
[[ -f "$PROYECTO/Cargo.toml" ]] && SENALES=$((SENALES + 1))
[[ -f "$PROYECTO/go.mod" ]] && SENALES=$((SENALES + 1))

# Lockfiles
[[ -f "$PROYECTO/pnpm-lock.yaml" ]] && SENALES=$((SENALES + 1))
[[ -f "$PROYECTO/yarn.lock" ]] && SENALES=$((SENALES + 1))
[[ -f "$PROYECTO/package-lock.json" ]] && SENALES=$((SENALES + 1))
[[ -f "$PROYECTO/poetry.lock" ]] && SENALES=$((SENALES + 1))

# Estructura tipica
[[ -d "$PROYECTO/.git" ]] && SENALES=$((SENALES + 1))
[[ -d "$PROYECTO/src" ]] && SENALES=$((SENALES + 1))
[[ -d "$PROYECTO/app" ]] && SENALES=$((SENALES + 1))
[[ -d "$PROYECTO/pages" ]] && SENALES=$((SENALES + 1))

# Configs
[[ -f "$PROYECTO/tsconfig.json" ]] && SENALES=$((SENALES + 1))
[[ -f "$PROYECTO/next.config.js" ]] && SENALES=$((SENALES + 1))
[[ -f "$PROYECTO/next.config.ts" ]] && SENALES=$((SENALES + 1))
[[ -f "$PROYECTO/next.config.mjs" ]] && SENALES=$((SENALES + 1))

# 2 o mas senales = proyecto de software claro -> adoptar
if [[ $SENALES -ge 2 ]]; then
  echo "adoptar"
  exit 0
fi

# Hay cosas pero no parece un proyecto de software
echo "ambiguo"
exit 0
