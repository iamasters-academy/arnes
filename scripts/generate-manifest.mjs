#!/usr/bin/env node
/**
 * generate-manifest.mjs — genera y verifica `.arnes/manifest.json`.
 *
 * Este fichero guarda el sha256 de cada pieza del armazon en el momento
 * de la instalacion. El modo «mantener» lo lee para detectar piezas
 * modificadas por el usuario (y asi no sobrescribirlas sin permiso).
 *
 * CLI:
 *   generate-manifest.mjs generate <project-dir> [--armazon <path>] [--version <ver>]
 *   generate-manifest.mjs verify <project-dir>            # compara hashes actuales vs manifest
 *   generate-manifest.mjs check <project-dir> <file>      # ¿el usuario modifico este fichero?
 *
 * Resolucion de la version (en orden):
 *   1. --version pasado por CLI
 *   2. $ARNES_VERSION (env)
 *   3. Lectura de `<skill-dir>/.version` (la fuente de verdad)
 *   4. Fallback hardcoded (solo si el .version no se puede leer)
 *
 * Variables de entorno:
 *   ARNES_VERSION         Version a guardar (override puntual)
 *   ARNES_SKILL_DIR       Path a la skill (default: ~/.claude/skills/arnes)
 *
 * Formato del manifest (ejemplo con version actual leida de .version):
 *
 * {
 *   "version": "<leida de .version>",
 *   "installed_at": "2026-05-20T15:34:12Z",
 *   "skill_origin": "<path a la skill>",
 *   "files": {
 *     "AGENTS.md": { "sha256_at_install": "abc...", "tmpl_origin": "..." },
 *     ...
 *   }
 * }
 *
 * El manifest se commitea al repo (es util para auditoria).
 */

import { promises as fs } from 'node:fs';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';

const DEFAULT_SKILL_DIR = path.join(os.homedir(), '.claude', 'skills', 'arnes');

// Fallback solo si no podemos leer .version desde la skill — no debe ocurrir
// en una instalacion correcta. Mantenido como ultimo recurso defensivo.
const HARDCODED_FALLBACK_VERSION = 'unknown';

/**
 * Resuelve la version a usar para el manifest.
 * Prioridad: explicit > env > .version del skill-dir > fallback.
 */
function resolveVersion(explicitVersion, skillDir) {
  if (explicitVersion) return explicitVersion;
  if (process.env.ARNES_VERSION) return process.env.ARNES_VERSION;
  try {
    const versionFile = path.join(skillDir, '.version');
    return readFileSync(versionFile, 'utf8').trim();
  } catch {
    return HARDCODED_FALLBACK_VERSION;
  }
}

// Lista de ficheros canonicos del armazon que se trackean.
// Si el usuario los modifica, mantener pregunta antes de sobrescribir.
const TRACKED_FILES = [
  'AGENTS.md',
  'CLAUDE.md',
  'GEMINI.md',
  '.cursorrules',
  '.codex/instructions.md',
  '.github/copilot-instructions.md',
  'hooks/pre-commit',
  'hooks/scan-secrets.mjs',
  'hooks/README.md',
  // .gitignore puede haber sido editado por el usuario; tracked pero light.
];

// Mapeo de fichero → plantilla origen (para reinstalar en mantener).
const TMPL_ORIGIN = {
  'AGENTS.md': 'armazon-comun/AGENTS.md.tmpl',
  'hooks/pre-commit': 'armazon-comun/hooks/pre-commit',
  'hooks/scan-secrets.mjs': 'armazon-comun/hooks/scan-secrets.mjs',
  'hooks/README.md': 'armazon-comun/hooks/README.md',
  // Symlinks no tienen tmpl propio (apuntan a AGENTS.md)
  'CLAUDE.md': '(symlink to AGENTS.md)',
  'GEMINI.md': '(symlink to AGENTS.md)',
  '.cursorrules': '(symlink to AGENTS.md)',
  '.codex/instructions.md': '(symlink to ../AGENTS.md)',
  '.github/copilot-instructions.md': '(symlink to ../AGENTS.md)',
};

// ─── Helpers ─────────────────────────────────────────────

async function sha256OfFile(filepath) {
  try {
    const buf = await fs.readFile(filepath);
    return crypto.createHash('sha256').update(buf).digest('hex');
  } catch {
    return null;
  }
}

const nowISO = () => new Date().toISOString();

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

// ─── Comandos ─────────────────────────────────────────────

async function cmdGenerate(projectDir, opts = {}) {
  if (!existsSync(projectDir)) {
    console.error(`No existe: ${projectDir}`);
    process.exit(1);
  }

  const skillDir = opts.armazon || process.env.ARNES_SKILL_DIR || DEFAULT_SKILL_DIR;
  const version = resolveVersion(opts.version, skillDir);
  if (version === HARDCODED_FALLBACK_VERSION) {
    console.error(`AVISO: no se pudo leer ${skillDir}/.version. Usando "${HARDCODED_FALLBACK_VERSION}".`);
    console.error('       Pasa --version <ver> o exporta ARNES_VERSION para evitarlo.');
  }

  const manifest = {
    version,
    installed_at: nowISO(),
    skill_origin: skillDir,
    files: {},
  };

  for (const relFile of TRACKED_FILES) {
    const fullPath = path.join(projectDir, relFile);
    if (!existsSync(fullPath)) {
      // Fichero no presente — no entra en el manifest.
      continue;
    }
    // Si es un symlink, calculamos el sha256 del target real (lo que ve la IA).
    const sha = await sha256OfFile(fullPath);
    if (sha == null) continue;
    manifest.files[relFile] = {
      sha256_at_install: sha,
      tmpl_origin: TMPL_ORIGIN[relFile] || '(unknown)',
    };
  }

  const arnesDir = path.join(projectDir, '.arnes');
  await fs.mkdir(arnesDir, { recursive: true });
  const manifestPath = path.join(arnesDir, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`Manifest generado: ${manifestPath}`);
  console.log(`  Version: ${version}`);
  console.log(`  Ficheros trackeados: ${Object.keys(manifest.files).length}`);
}

async function cmdVerify(projectDir) {
  const manifestPath = path.join(projectDir, '.arnes', 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.error(`No existe manifest: ${manifestPath}`);
    console.error('Genera primero con: generate-manifest.mjs generate <project-dir>');
    process.exit(1);
  }

  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  console.log(`Manifest v${manifest.version}, instalado ${manifest.installed_at}`);
  console.log('');

  const results = { unchanged: [], modified: [], missing: [] };

  for (const [relFile, info] of Object.entries(manifest.files)) {
    const fullPath = path.join(projectDir, relFile);
    if (!existsSync(fullPath)) {
      results.missing.push(relFile);
      continue;
    }
    const currentSha = await sha256OfFile(fullPath);
    if (currentSha === info.sha256_at_install) {
      results.unchanged.push(relFile);
    } else {
      results.modified.push(relFile);
    }
  }

  console.log(`Sin modificar (${results.unchanged.length}):`);
  for (const f of results.unchanged) console.log(`  ✓ ${f}`);
  console.log('');

  if (results.modified.length > 0) {
    console.log(`MODIFICADOS POR EL USUARIO (${results.modified.length}):`);
    for (const f of results.modified) console.log(`  ⚠ ${f}`);
    console.log('  → mantener preguntara antes de sobrescribirlos.');
    console.log('');
  }

  if (results.missing.length > 0) {
    console.log(`FALTANTES (${results.missing.length}):`);
    for (const f of results.missing) console.log(`  ✗ ${f}`);
    console.log('  → mantener los recreara.');
    console.log('');
  }
}

async function cmdCheck(projectDir, relFile) {
  const manifestPath = path.join(projectDir, '.arnes', 'manifest.json');
  if (!existsSync(manifestPath)) {
    console.error(`No existe manifest: ${manifestPath}`);
    process.exit(1);
  }
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const info = manifest.files[relFile];
  if (!info) {
    console.log(`untracked`);
    return;
  }
  const fullPath = path.join(projectDir, relFile);
  if (!existsSync(fullPath)) {
    console.log(`missing`);
    return;
  }
  const currentSha = await sha256OfFile(fullPath);
  console.log(currentSha === info.sha256_at_install ? 'unchanged' : 'modified');
}

// ─── Main ─────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];

  switch (cmd) {
    case 'generate': {
      const projectDir = args._[1];
      if (!projectDir) {
        console.error('Uso: generate-manifest.mjs generate <project-dir>');
        process.exit(1);
      }
      await cmdGenerate(projectDir, args);
      break;
    }
    case 'verify': {
      const projectDir = args._[1];
      if (!projectDir) {
        console.error('Uso: generate-manifest.mjs verify <project-dir>');
        process.exit(1);
      }
      await cmdVerify(projectDir);
      break;
    }
    case 'check': {
      const [, projectDir, relFile] = args._;
      if (!projectDir || !relFile) {
        console.error('Uso: generate-manifest.mjs check <project-dir> <relative-file>');
        process.exit(1);
      }
      await cmdCheck(projectDir, relFile);
      break;
    }
    case '--help':
    case '-h':
    case undefined: {
      console.log(`generate-manifest.mjs — sha256 del armazon Arnes.

Comandos:
  generate <project-dir> [--version VER] [--armazon PATH]
              Crea .arnes/manifest.json con sha256 de cada pieza del armazon.

  verify <project-dir>
              Compara los hashes actuales con los del manifest.
              Lista: sin modificar / modificados por el usuario / faltantes.

  check <project-dir> <relative-file>
              Imprime el estado de un fichero: unchanged / modified / missing / untracked.

Variables de entorno:
  ARNES_VERSION       Version a usar (override). Si no se pasa,
                      se lee de \`<skill-dir>/.version\`.
  ARNES_SKILL_DIR     Path skill (default: ${DEFAULT_SKILL_DIR})

Ejemplos:
  generate-manifest.mjs generate ~/proyectos/mi-app
  generate-manifest.mjs verify ~/proyectos/mi-app
  generate-manifest.mjs check ~/proyectos/mi-app AGENTS.md
`);
      break;
    }
    default:
      console.error(`Comando desconocido: ${cmd}`);
      console.error('Usa --help para ver opciones.');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
