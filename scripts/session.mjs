#!/usr/bin/env node
/**
 * session.mjs — lock concurrente + auto-resume para Arnes
 *
 * CLI:
 *   session.mjs acquire-lock [--current-op X]  Adquiere el lock o avisa.
 *   session.mjs release-lock                   Libera el lock de la sesion actual.
 *   session.mjs check-stale-lock               Detecta lock huerfano.
 *   session.mjs force-unlock                   Libera lock huerfano (peligroso).
 *   session.mjs resume                         Lee implementation-status.md y resume.
 *   session.mjs update-status --field K --value V
 *                                              Actualiza un campo del status.
 *   session.mjs status                         Imprime el estado actual.
 *
 * Variables de entorno:
 *   ARNES_PROJECT_DIR    Directorio del proyecto (default: pwd).
 *   ARNES_SESSION_ID     ID de sesion (default: auto-generado).
 *
 * Ficheros usados:
 *   <project>/estado/.lock                       Lockfile JSON.
 *   <project>/estado/implementation-status.md    Estado actual del proyecto.
 */

import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';

const PROJECT_DIR = process.env.ARNES_PROJECT_DIR || process.cwd();
const SESSION_ID = process.env.ARNES_SESSION_ID || `sess_${crypto.randomBytes(4).toString('hex')}`;
const HOST = process.env.ARNES_HOST || os.hostname();
const LOCK_PATH = path.join(PROJECT_DIR, 'estado', '.lock');
const STATUS_PATH = path.join(PROJECT_DIR, 'estado', 'implementation-status.md');

// Edad maxima de un lock antes de considerarse stale (1 hora).
const STALE_LOCK_MS = 60 * 60 * 1000;

// ─── Helpers ────────────────────────────────────────────────────────────

const nowISO = () => new Date().toISOString();

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
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

async function readLock() {
  if (!existsSync(LOCK_PATH)) return null;
  try {
    const content = await fs.readFile(LOCK_PATH, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

async function writeLock(data) {
  await ensureDir(path.dirname(LOCK_PATH));
  await fs.writeFile(LOCK_PATH, JSON.stringify(data, null, 2));
}

function lockIsStale(lock) {
  if (!lock || !lock.started_at) return true;
  const age = Date.now() - new Date(lock.started_at).getTime();
  return age > STALE_LOCK_MS;
}

function pidExists(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// ─── Comandos ────────────────────────────────────────────────────────────

async function cmdAcquireLock(args) {
  const existing = await readLock();

  if (existing && existing.session_id === SESSION_ID) {
    // Nuestro propio lock. Actualizar current_op si se paso.
    if (args['current-op']) {
      existing.current_op = args['current-op'];
      existing.updated_at = nowISO();
      await writeLock(existing);
    }
    console.log(`Lock ya en posesion de esta sesion (${SESSION_ID}).`);
    return;
  }

  if (existing) {
    const stale = lockIsStale(existing);
    const alive = pidExists(existing.pid);

    if (stale && !alive) {
      console.error(`BLOQUEO: Hay un lock huerfano (${existing.session_id}, hace > 1h, proceso muerto).`);
      console.error('Ejecuta: session.mjs force-unlock para liberarlo.');
      process.exit(2);
    }

    console.error(`BLOQUEO: Hay otra sesion Arnes activa.`);
    console.error(`  session_id: ${existing.session_id}`);
    console.error(`  iniciada:   ${existing.started_at}`);
    console.error(`  operacion:  ${existing.current_op || 'desconocida'}`);
    console.error(`  host:       ${existing.host}`);
    console.error('');
    console.error('Opciones:');
    console.error('  [A] Esperar a que termine y reintenta.');
    console.error('  [B] session.mjs force-unlock (solo si la otra sesion esta muerta).');
    console.error('  [C] Abrir el proyecto en modo solo lectura.');
    process.exit(2);
  }

  // No hay lock. Adquirir.
  const lock = {
    session_id: SESSION_ID,
    pid: process.pid,
    started_at: nowISO(),
    updated_at: nowISO(),
    current_op: args['current-op'] || 'idle',
    host: HOST,
  };
  await writeLock(lock);
  console.log(`Lock adquirido: ${SESSION_ID}`);
}

async function cmdReleaseLock() {
  const existing = await readLock();
  if (!existing) {
    console.log('No hay lock que liberar.');
    return;
  }
  if (existing.session_id !== SESSION_ID) {
    console.error(`No puedes liberar el lock de otra sesion (${existing.session_id}).`);
    console.error('Usa force-unlock si estas seguro de que esta muerta.');
    process.exit(2);
  }
  await fs.unlink(LOCK_PATH);
  console.log(`Lock liberado: ${SESSION_ID}`);
}

async function cmdForceUnlock() {
  const existing = await readLock();
  if (!existing) {
    console.log('No hay lock que liberar.');
    return;
  }

  const stale = lockIsStale(existing);
  const alive = pidExists(existing.pid);

  if (alive) {
    console.error(`PELIGRO: El proceso ${existing.pid} esta vivo.`);
    console.error('No deberias forzar el unlock. Si estas seguro, borra el fichero manualmente:');
    console.error(`  rm ${LOCK_PATH}`);
    process.exit(2);
  }

  if (!stale) {
    console.error(`AVISO: El lock no es stale (< 1h). Estas seguro?`);
    console.error('Si si, borra manualmente:');
    console.error(`  rm ${LOCK_PATH}`);
    process.exit(2);
  }

  await fs.unlink(LOCK_PATH);
  console.log(`Lock huerfano liberado (era: ${existing.session_id}).`);
}

async function cmdCheckStaleLock() {
  const existing = await readLock();
  if (!existing) {
    console.log('Sin lock activo.');
    return;
  }
  const stale = lockIsStale(existing);
  const alive = pidExists(existing.pid);
  console.log(`Lock actual: ${existing.session_id}`);
  console.log(`  PID: ${existing.pid} (vivo: ${alive})`);
  console.log(`  Iniciado: ${existing.started_at}`);
  console.log(`  Stale: ${stale}`);
  if (stale && !alive) {
    console.log('Recomendacion: force-unlock');
  }
}

async function cmdResume() {
  if (!existsSync(STATUS_PATH)) {
    console.log('No hay implementation-status.md. Proyecto nuevo o sin Arnes.');
    return;
  }
  const content = await fs.readFile(STATUS_PATH, 'utf8');

  // Parsear los campos clave del header (formato markdown)
  const fields = {};
  const re = /\*\*([^:]+):\*\*\s*(.+)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    fields[m[1].trim()] = m[2].trim();
  }

  console.log('=== Resume del proyecto ===');
  console.log(`Proyecto: ${fields['Proyecto'] || '?'}`);
  console.log(`Modo: ${fields['Modo'] || '?'}`);
  console.log(`Feature activa: ${fields['Active feature'] || 'ninguna'}`);
  console.log(`Fase actual: ${fields['Fase actual'] || '?'}`);
  console.log(`Ultima actualizacion: ${fields['Ultima actualizacion'] || '?'}`);
  console.log(`Sesion activa: ${fields['Sesion activa'] || '?'}`);

  // Bloqueos
  const blockMatch = content.match(/## Bloqueos actuales\n([\s\S]*?)(\n##|$)/);
  if (blockMatch) {
    const block = blockMatch[1].trim();
    if (block && !block.startsWith('- ninguno') && !block.includes('<!--')) {
      console.log('\nBLOQUEOS:');
      console.log(block);
    }
  }
}

async function cmdUpdateStatus(args) {
  if (!existsSync(STATUS_PATH)) {
    console.error(`No existe ${STATUS_PATH}. Genera primero el implementation-status.md.`);
    process.exit(1);
  }
  const field = args.field;
  const value = args.value;
  if (!field) {
    console.error('Falta --field <nombre>');
    process.exit(1);
  }

  let content = await fs.readFile(STATUS_PATH, 'utf8');
  const re = new RegExp(`(\\*\\*${field}:\\*\\*)\\s*[^\\n]*`);
  if (!re.test(content)) {
    console.error(`No se encontro el campo "${field}" en el status file.`);
    process.exit(1);
  }
  content = content.replace(re, `$1 ${value}`);
  // Actualizar tambien "Ultima actualizacion"
  const reUltima = /(\*\*Ultima actualizacion:\*\*)\s*[^\n]*/;
  if (reUltima.test(content)) {
    content = content.replace(reUltima, `$1 ${nowISO()}`);
  }
  await fs.writeFile(STATUS_PATH, content);
  console.log(`Actualizado: ${field} = ${value}`);
}

async function cmdStatus() {
  const lock = await readLock();
  console.log('=== Lock ===');
  if (lock) {
    console.log(JSON.stringify(lock, null, 2));
  } else {
    console.log('Sin lock activo.');
  }
  console.log('\n=== Resume ===');
  await cmdResume();
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cmd = args._[0];

  switch (cmd) {
    case 'acquire-lock':
      await cmdAcquireLock(args);
      break;
    case 'release-lock':
      await cmdReleaseLock();
      break;
    case 'force-unlock':
      await cmdForceUnlock();
      break;
    case 'check-stale-lock':
      await cmdCheckStaleLock();
      break;
    case 'resume':
      await cmdResume();
      break;
    case 'update-status':
      await cmdUpdateStatus(args);
      break;
    case 'status':
      await cmdStatus();
      break;
    case '--help':
    case '-h':
    case undefined:
      console.log(`session.mjs — lock + auto-resume para Arnes

Comandos:
  acquire-lock [--current-op X]   Adquiere lock o avisa.
  release-lock                    Libera el lock de la sesion actual.
  force-unlock                    Libera lock huerfano (solo si stale + dead).
  check-stale-lock                Diagnostica el lock actual.
  resume                          Resume la sesion: lee implementation-status.md.
  update-status --field K --value V
                                  Actualiza un campo del status.
  status                          Imprime lock + resume.

Variables de entorno:
  ARNES_PROJECT_DIR   Directorio del proyecto (default: pwd).
  ARNES_SESSION_ID    ID de sesion (default: auto-generado).
  ARNES_HOST          Hostname (default: os.hostname()).
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
