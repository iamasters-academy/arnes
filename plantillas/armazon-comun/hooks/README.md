# Hooks de Arnes

Hooks de git que se instalan automaticamente en cada proyecto Arnes.

---

## Que hace cada hook

### `pre-commit`

Se ejecuta antes de cada `git commit`. Si falla cualquier paso, aborta el commit.

Pasos:

1. **scan-secrets** — detecta secrets en ficheros staged (API keys, tokens,
   `.env` files no-example). Bloqueante.
2. **lint** — `pnpm lint`. Bloqueante si hay errores.
3. **typecheck** — `pnpm typecheck`. Bloqueante si hay errores.
4. **tests** (opcional) — `pnpm test --run`. Activable con
   `ARNES_PRECOMMIT_TESTS=1`. Por defecto desactivado porque puede ser lento.

### `scan-secrets.mjs`

Script Node ESM que escanea ficheros en busca de:

- API keys conocidas (OpenAI, Anthropic, Stripe, Supabase service_role, AWS, etc.).
- Private keys (PEM headers).
- Ficheros `.env*` (excepto `.env.example`, `.env.sample`, `.env.template`).
- Patrones genericos (variables tipo `api_key: "..."`).

Se puede usar standalone:

```bash
node hooks/scan-secrets.mjs              # escanea staged files
node hooks/scan-secrets.mjs src/foo.ts   # escanea ficheros especificos
```

---

## Instalacion en un proyecto

Cuando Arnes monta un proyecto nuevo, copia estos hooks al proyecto:

```
proyecto/
├── .git/hooks/pre-commit -> hooks/pre-commit    (symlink)
├── hooks/
│   ├── pre-commit
│   ├── scan-secrets.mjs
│   └── README.md
```

Para instalar manualmente en un proyecto existente:

```bash
mkdir -p hooks
cp ~/.claude/skills/arnes/plantillas/armazon-comun/hooks/* hooks/
chmod +x hooks/pre-commit
ln -sf ../../hooks/pre-commit .git/hooks/pre-commit
```

O via `husky` / `lefthook` / `simple-git-hooks` (recomendado para que se
instale automaticamente al hacer `pnpm install`):

```jsonc
// package.json
{
  "simple-git-hooks": {
    "pre-commit": "bash ./hooks/pre-commit"
  }
}
```

Y anadir `pnpm dlx simple-git-hooks` como `postinstall`.

---

## Bypassear el hook (cuando NO hacerlo)

`git commit --no-verify` salta los hooks. **No lo hagas** salvo en estos casos:

- Estas commiteando un fix de emergencia y los tests fallan por una razon
  no relacionada (y vas a arreglarlos despues).
- Estas en un branch privado de experimentos.
- El hook tiene un falso positivo demostrable (y vas a abrir issue para
  arreglarlo).

**Nunca** uses `--no-verify` para:

- Commit con secrets (rota el secret y vuelve a empezar).
- Saltar lint para «commitear rapido».
- Saltar typecheck «porque ya lo arreglo en el siguiente commit».

Si te encuentras usando `--no-verify` con frecuencia, el problema NO es el
hook. Es tu flujo. Para y revisa.

---

## Customizar los hooks

Si tu proyecto necesita verificaciones extra (ESLint con plugin custom,
test de migraciones DB, etc.), edita el hook localmente:

```bash
$EDITOR hooks/pre-commit
```

Y commitealo. Los hooks viven en el repo (no en `.git/hooks/`), asi que
todos los devs los reciben.

**Importante:** NO desactives `scan-secrets` ni el typecheck. Si necesitas
mas tiempo, optimiza, no quites.

---

## Anadir nuevos patrones de secrets

Si tu equipo usa un servicio que no esta en la lista (p.ej. Twilio, SendGrid),
edita `hooks/scan-secrets.mjs` y anade un patron al array `PATTERNS`:

```js
{ name: 'Twilio Auth Token', re: /SK[a-f0-9]{32}/ },
```

Commit + push. Todos los devs lo reciben.

---

## Que NO hace el hook

- **No ejecuta E2E.** Demasiado lento. Eso va en CI.
- **No corre migraciones DB.** Riesgoso. Eso va en CI.
- **No formatea automaticamente.** El hook valida pero NO toca tu codigo.
  Para autoformat, usa `prettier --write` antes de commitear (o IDE on-save).

---

## Comportamiento en CI

En CI (GitHub Actions, etc.), el hook **no se ejecuta** automaticamente
porque CI hace su propio flujo. Pero las mismas verificaciones se replican
en CI:

```yaml
# .github/workflows/ci.yml (ejemplo)
- run: node hooks/scan-secrets.mjs $(git diff --name-only origin/main...HEAD)
- run: pnpm lint
- run: pnpm typecheck
- run: pnpm test --run
- run: pnpm test:e2e
```

Asi, si alguien commitea con `--no-verify` y bypassa el local, CI lo detecta.
