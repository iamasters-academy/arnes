#!/usr/bin/env node
/**
 * atomic.mjs — atomicidad y rollback para Arnes
 *
 * CLI:
 *   atomic.mjs log <op> [--path X] [--from X] [--to Y] [--cmd "..."] [--exit N] [--sha256 H]
 *   atomic.mjs snapshot <path>                  # snapshot antes de modificar
 *   atomic.mjs promote <staging> <dest>         # mv atomico staging -> destino
 *   atomic.mjs rollback [--dry-run]             # deshace todo el operations log
 *   atomic.mjs status                           # imprime resumen del log actual
 *
 * Variables de entorno:
 *   ARNES_PROJECT_DIR    Directorio del proyecto (default: pwd).
 *   ARNES_SESSION_ID     ID de sesion. Default: auto-generado.
 *
 * Ficheros usados:
 *   <project>/estado/operations.jsonl     Log de operaciones.
 *   <project>/.arnes-snapshots/<sid>/     Snapshots de ficheros modificados.
 */

import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const PROJECT_DIR = process.env.ARNES_PROJECT_DIR || process.cwd();
const SESSION_ID = process.env.ARNES_SESSION_ID || `sess_${crypto.randomBytes(4).toString('hex')}`;
const LOG_PATH = path.join(PROJECT_DIR, 'estado', 'operations.jsonl');
const SNAPSHOTS_DIR = path.join(PROJECT_DIR, '.arnes-snapshots', SESSION_ID);

// ─── Helpers ────────────────────────────────────────────────────────────

const nowISO = () => new Date().toISOString();

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function sha256OfFile(p) {
  const buf = await fs.readFile(p);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

async function appendLog(entry) {
  await ensureDir(path.dirname(LOG_PATH));
  const line = JSON.stringify({ ts: nowISO(), sid: SESSION_ID, ...entry });
  await fs.appendFile(LOG_PATH, line + '\n');
  return line;
}

async function readLog() {
  if (!existsSync(LOG_PATH)) return [];
  const content = await fs.readFile(LOG_PATH, 'utf8');
  return content
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

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

// ─── Comandos ────────────────────────────────────────────────────────────

async function cmdLog(args) {
  const op = args._[1];
  if (!op) throw new Error('Falta el tipo de operacion: log <op>');

  const entry = { op };
  if (args.path) entry.path = args.path;
  if (args.from) entry.from = args.from;
  if (args.to) entry.to = args.to;
  if (args.cmd) entry.cmd = args.cmd;
  if (args.exit != null) entry.exit = Number(args.exit);
  if (args.sha256) entry.sha256 = args.sha256;
  if (args.cwd) entry.cwd = args.cwd;

  // Si es write y existe el path, calcula sha256 automaticamente
  if (op === 'write' && args.path && existsSync(args.path) && !args.sha256) {
    try {
      entry.sha256 = await sha256OfFile(args.path);
    } catch {}
  }

  const line = await appendLog(entry);
  console.log(line);
}

async function cmdSnapshot(args) {
  const target = args._[1];
  if (!target) throw new Error('Falta el path: snapshot <path>');
  if (!existsSync(target)) {
    console.error(`No existe: ${target} (no se snapshot, era nuevo)`);
    return;
  }

  await ensureDir(SNAPSHOTS_DIR);
  const rel = path.relative(PROJECT_DIR, path.resolve(target));
  const snapPath = path.join(SNAPSHOTS_DIR, rel + '.bak');
  await ensureDir(path.dirname(snapPath));
  await fs.copyFile(target, snapPath);
  const sha = await sha256OfFile(target);

  await appendLog({ op: 'snapshot', path: target, snapshot: snapPath, sha256: sha });
  console.log(`Snapshot: ${target} -> ${snapPath}`);
}

async function cmdPromote(args) {
  const staging = args._[1];
  const dest = args._[2];
  if (!staging || !dest) {
    throw new Error('Faltan argumentos: promote <staging> <dest>');
  }
  if (!existsSync(staging)) {
    throw new Error(`Staging no existe: ${staging}`);
  }
  if (existsSync(dest)) {
    throw new Error(`Destino ya existe (no sobrescribimos sin permiso): ${dest}`);
  }

  // mv atomico. fs.rename es atomico si origen y destino estan en el mismo fs.
  await ensureDir(path.dirname(dest));
  await fs.rename(staging, dest);

  await appendLog({ op: 'mv', from: staging, to: dest });
  console.log(`Promoted: ${staging} -> ${dest}`);
}

async function cmdRollback(args) {
  const dryRun = !!args['dry-run'];
  const entries = await readLog();
  if (entries.length === 0) {
    console.log('Log vacio. Nada que deshacer.');
    return;
  }

  // Filtrar solo las de esta sesion (sid)
  const mine = entries.filter((e) => e.sid === SESSION_ID);
  if (mine.length === 0) {
    console.log(`No hay operaciones de la sesion actual (${SESSION_ID}).`);
    return;
  }

  console.log(`Deshaciendo ${mine.length} operaciones (sesion ${SESSION_ID})${dryRun ? ' [dry-run]' : ''}:`);

  // Deshacer en orden inverso
  for (const e of [...mine].reverse()) {
    try {
      await undoOp(e, dryRun);
    } catch (err) {
      console.error(`  ! Fallo al deshacer ${JSON.stringify(e)}: ${err.message}`);
    }
  }

  if (!dryRun) {
    // Marcar log como rolled-back: anadimos una entrada final.
    await appendLog({ op: 'rollback-complete', count: mine.length });
  }
}

async function undoOp(e, dryRun) {
  const log = (msg) => console.log(`  - ${msg}${dryRun ? ' [dry-run]' : ''}`);
  switch (e.op) {
    case 'mkdir':
      log(`rmdir ${e.path}`);
      if (!dryRun && existsSync(e.path)) {
        try {
          await fs.rmdir(e.path);
        } catch {
          // No vacio: dejar.
        }
      }
      break;
    case 'write':
      log(`rm ${e.path}`);
      if (!dryRun && existsSync(e.path)) await fs.unlink(e.path);
      break;
    case 'snapshot':
      log(`restore ${e.path} desde ${e.snapshot}`);
      if (!dryRun && existsSync(e.snapshot)) {
        await fs.copyFile(e.snapshot, e.path);
      }
      break;
    case 'symlink':
      log(`rm symlink ${e.to}`);
      if (!dryRun && existsSync(e.to)) await fs.unlink(e.to);
      break;
    case 'mv':
      log(`mv inverso ${e.to} -> ${e.from}`);
      if (!dryRun && existsSync(e.to)) {
        await ensureDir(path.dirname(e.from));
        await fs.rename(e.to, e.from);
      }
      break;
    case 'exec':
      // Los exec no son auto-reversibles. Avisamos al usuario.
      log(`exec NO reversible: ${e.cmd} (revisa manualmente)`);
      break;
    case 'git-init':
      log(`rm -rf ${e.path}/.git`);
      if (!dryRun && existsSync(path.join(e.path, '.git'))) {
        await fs.rm(path.join(e.path, '.git'), { recursive: true, force: true });
      }
      break;
    case 'git-commit':
      log(`git reset --soft HEAD~1 (en ${e.cwd || PROJECT_DIR})`);
      if (!dryRun) {
        try {
          execSync('git reset --soft HEAD~1', { cwd: e.cwd || PROJECT_DIR, stdio: 'pipe' });
        } catch (err) {
          console.error(`    git reset fallo: ${err.message}`);
        }
      }
      break;
    case 'rollback-complete':
      // No-op.
      break;
    default:
      log(`operacion sin reversa definida: ${e.op}`);
  }
}

async function cmdStatus() {
  const entries = await readLog();
  if (entries.length === 0) {
    console.log('Log vacio.');
    return;
  }

  console.log(`Total operaciones: ${entries.length}`);
  const bySession = {};
  for (const e of entries) {
    bySession[e.sid] ||= 0;
    bySession[e.sid]++;
  }
  console.log('Por sesion:');
  for (const [sid, count] of Object.entries(bySession)) {
    console.log(`  ${sid}: ${count}`);
  }

  const byOp = {};
  for (const e of entries) {
    byOp[e.op] ||= 0;
    byOp[e.op]++;
  }
  console.log('Por operacion:');
  for (const [op, count] of Object.entries(byOp)) {
    console.log(`  ${op}: ${count}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];

  switch (cmd) {
    case 'log':
      await cmdLog(args);
      break;
    case 'snapshot':
      await cmdSnapshot(args);
      break;
    case 'promote':
      await cmdPromote(args);
      break;
    case 'rollback':
      await cmdRollback(args);
      break;
    case 'status':
      await cmdStatus();
      break;
    case '--help':
    case '-h':
    case undefined:
      console.log(`atomic.mjs — atomicidad y rollback para Arnes

Comandos:
  log <op> [--path X] [--from X --to Y] [--cmd "..."] [--exit N] [--sha256 H]
                  Anade una entrada al operations.jsonl.
  snapshot <path> Hace copia de seguridad de un fichero antes de modificarlo.
  promote <staging> <dest>
                  mv atomico de staging a destino.
  rollback [--dry-run]
                  Deshace todas las operaciones de la sesion actual.
  status          Resumen del operations log.

Variables de entorno:
  ARNES_PROJECT_DIR   Directorio del proyecto (default: pwd).
  ARNES_SESSION_ID    ID de sesion (default: auto-generado).
`);
      break;
    default:
      console.error(`Comando desconocido: ${cmd}`);
      console.error('Usa --help para ver los comandos.');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});
