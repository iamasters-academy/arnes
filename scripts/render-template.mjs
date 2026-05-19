#!/usr/bin/env node
/**
 * render-template.mjs — sustituye variables {{VAR}} en plantillas Arnes.
 *
 * Es la pieza clave que conecta las plantillas (.tmpl) con un proyecto real.
 * Sin esto, todas las plantillas tienen literales {{PROJECT_NAME}} que nunca
 * se reemplazan.
 *
 * CLI:
 *   render-template.mjs <input.tmpl> <output> [--var KEY=VALUE ...]
 *   render-template.mjs --dir <input-dir> <output-dir> [--var KEY=VALUE ...] [--exclude <subpath> ...]
 *   render-template.mjs --check <input>     (lista variables sin sustituir)
 *
 * --exclude <subpath>: rutas relativas a input-dir que NO se procesan
 *                       (ni se renderizan, ni se copian). Util para plantillas
 *                       que se usan en otro momento (p.ej. specs-templates/).
 *                       Se puede pasar multiple veces.
 *
 * Variables automaticas (se rellenan si no se pasan explicitamente):
 *   {{DATE}}        Fecha hoy YYYY-MM-DD
 *   {{TIMESTAMP}}   ISO 8601
 *   {{YEAR}}        Ano actual
 *   {{HOST}}        Hostname
 *
 * Variables que el usuario suele pasar:
 *   {{PROJECT_NAME}}
 *   {{PROJECT_DESCRIPTION}}
 *   {{AUTHOR}}
 *   {{FEATURE_NAME}}
 *   {{FEATURE_TITLE}}
 *   {{STACK}}
 *   {{SESSION_ID}}
 *
 * Ejemplo:
 *   render-template.mjs package.json.tmpl mi-app/package.json \
 *     --var PROJECT_NAME=mi-app \
 *     --var PROJECT_DESCRIPTION="App de inventario"
 *
 *   render-template.mjs --dir plantillas/nextjs-supabase ~/proyectos/mi-app \
 *     --var PROJECT_NAME=mi-app
 *
 *   render-template.mjs --check plantillas/AGENTS.md.tmpl
 */

import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ─── Variables automaticas ────────────────────────────────────────

function autoVars() {
  const now = new Date();
  return {
    DATE: now.toISOString().slice(0, 10),
    TIMESTAMP: now.toISOString(),
    YEAR: String(now.getFullYear()),
    HOST: os.hostname(),
  };
}

// ─── Helpers ────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = { _: [], vars: {}, exclude: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--var') {
      const kv = argv[++i] || '';
      const eq = kv.indexOf('=');
      if (eq > 0) {
        args.vars[kv.slice(0, eq)] = kv.slice(eq + 1);
      }
    } else if (a === '--exclude') {
      const sub = argv[++i] || '';
      if (sub) args.exclude.push(sub);
    } else if (a === '--dir') {
      args.dir = true;
    } else if (a === '--check') {
      args.check = true;
    } else if (a === '--help' || a === '-h') {
      args.help = true;
    } else if (a.startsWith('--')) {
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

/**
 * Renderiza un string: sustituye {{VAR}} por el valor en vars.
 * Si una variable no tiene valor:
 *   - strict=true: lanza error.
 *   - strict=false: la deja como esta y la anade a missing[].
 */
function renderString(template, vars, { strict = false } = {}) {
  const missing = [];
  const result = template.replace(/\{\{([A-Z_][A-Z0-9_]*)\}\}/g, (match, key) => {
    if (key in vars) return vars[key];
    if (strict) throw new Error(`Variable sin sustituir: {{${key}}}`);
    missing.push(key);
    return match;
  });
  return { result, missing: [...new Set(missing)] };
}

async function renderFile(inputPath, outputPath, vars, { strict = false } = {}) {
  const content = await fs.readFile(inputPath, 'utf8');
  const { result, missing } = renderString(content, vars, { strict });
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, result);
  return missing;
}

async function walkDir(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walkDir(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

/**
 * Renderiza un directorio entero.
 * Para cada fichero:
 *   - si termina en .tmpl: lo renderiza y quita la extension .tmpl.
 *   - si no: lo copia tal cual.
 */
function isExcluded(rel, excludes) {
  return excludes.some((ex) => rel === ex || rel.startsWith(ex + path.sep) || rel.startsWith(ex + '/'));
}

async function renderDir(inputDir, outputDir, vars, { strict = false, exclude = [] } = {}) {
  const files = await walkDir(inputDir);
  const allMissing = new Set();
  let count = 0;
  let skipped = 0;

  for (const inputFile of files) {
    const rel = path.relative(inputDir, inputFile);

    // Saltarse rutas excluidas (ni renderizar ni copiar).
    if (isExcluded(rel, exclude)) {
      skipped++;
      continue;
    }

    let outRel = rel;
    let isTmpl = false;

    if (outRel.endsWith('.tmpl')) {
      outRel = outRel.slice(0, -5);
      isTmpl = true;
    }

    const outputFile = path.join(outputDir, outRel);
    await fs.mkdir(path.dirname(outputFile), { recursive: true });

    if (isTmpl) {
      const missing = await renderFile(inputFile, outputFile, vars, { strict });
      missing.forEach((m) => allMissing.add(m));
      count++;
    } else {
      await fs.copyFile(inputFile, outputFile);
      count++;
    }
  }

  return { count, skipped, missing: [...allMissing] };
}

// ─── Comandos ────────────────────────────────────────────────────

async function cmdCheck(input) {
  const content = await fs.readFile(input, 'utf8');
  const matches = [...content.matchAll(/\{\{([A-Z_][A-Z0-9_]*)\}\}/g)];
  const unique = [...new Set(matches.map((m) => m[1]))];
  if (unique.length === 0) {
    console.log(`${input}: sin variables {{VAR}}.`);
    return;
  }
  console.log(`Variables encontradas en ${input}:`);
  for (const v of unique.sort()) {
    console.log(`  {{${v}}}`);
  }
}

async function cmdRenderFile(input, output, vars) {
  if (!existsSync(input)) {
    console.error(`No existe: ${input}`);
    process.exit(1);
  }
  // Si output ya existe, lo respetamos (no sobrescribimos por defecto).
  if (existsSync(output)) {
    console.error(`Output ya existe (no sobrescribimos): ${output}`);
    process.exit(2);
  }
  const missing = await renderFile(input, output, vars);
  console.log(`Renderizado: ${input} -> ${output}`);
  if (missing.length > 0) {
    console.log('');
    console.log('AVISO: variables sin sustituir (se dejaron literales):');
    for (const m of missing) console.log(`  {{${m}}}`);
  }
}

async function cmdRenderDir(inputDir, outputDir, vars, exclude = []) {
  if (!existsSync(inputDir)) {
    console.error(`No existe directorio entrada: ${inputDir}`);
    process.exit(1);
  }
  const stat = await fs.stat(inputDir);
  if (!stat.isDirectory()) {
    console.error(`No es un directorio: ${inputDir}`);
    process.exit(1);
  }
  const { count, skipped, missing } = await renderDir(inputDir, outputDir, vars, { exclude });
  console.log(`Renderizado ${count} fichero(s) de ${inputDir} a ${outputDir}.`);
  if (skipped > 0) {
    console.log(`Saltados ${skipped} fichero(s) por --exclude.`);
  }
  if (missing.length > 0) {
    console.log('');
    console.log('AVISO: variables sin sustituir (se dejaron literales):');
    for (const m of missing) console.log(`  {{${m}}}`);
  }
}

function printHelp() {
  console.log(`render-template.mjs — sustituye {{VAR}} en plantillas Arnes.

Modos:
  Renderizar un fichero:
    render-template.mjs <input.tmpl> <output> --var KEY=VALUE [--var ...]

  Renderizar un directorio (todos los .tmpl):
    render-template.mjs --dir <input-dir> <output-dir> --var KEY=VALUE [--var ...]

  Listar variables de un fichero (sin renderizar):
    render-template.mjs --check <input>

Variables automaticas (se rellenan solas):
  DATE         Hoy, formato YYYY-MM-DD
  TIMESTAMP    Hoy, ISO 8601
  YEAR         Ano actual
  HOST         Hostname del equipo

Variables que sueles pasar:
  PROJECT_NAME, PROJECT_DESCRIPTION, AUTHOR
  FEATURE_NAME, FEATURE_TITLE
  STACK, SESSION_ID

Ejemplos:
  render-template.mjs package.json.tmpl mi-app/package.json \\
    --var PROJECT_NAME=mi-app \\
    --var PROJECT_DESCRIPTION="App de inventario"

  render-template.mjs --dir plantillas/nextjs-supabase ~/proyectos/mi-app \\
    --var PROJECT_NAME=mi-app

  render-template.mjs --check plantillas/AGENTS.md.tmpl
`);
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args._.length === 0) {
    printHelp();
    return;
  }

  // Mezclar auto-vars (con menor prioridad) + vars del usuario (mayor).
  const vars = { ...autoVars(), ...args.vars };

  if (args.check) {
    const input = args._[0];
    await cmdCheck(input);
    return;
  }

  if (args.dir) {
    const [inputDir, outputDir] = args._;
    if (!inputDir || !outputDir) {
      console.error('--dir requiere <input-dir> y <output-dir>.');
      process.exit(1);
    }
    await cmdRenderDir(inputDir, outputDir, vars, args.exclude);
    return;
  }

  // Modo fichero unico
  const [input, output] = args._;
  if (!input || !output) {
    console.error('Modo fichero unico requiere <input> y <output>.');
    process.exit(1);
  }
  await cmdRenderFile(input, output, vars);
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
