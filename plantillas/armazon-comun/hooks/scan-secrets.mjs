#!/usr/bin/env node
/**
 * scan-secrets.mjs — escanea ficheros staged en busca de secrets.
 *
 * Uso (desde pre-commit):
 *   node hooks/scan-secrets.mjs              # escanea staged files
 *   node hooks/scan-secrets.mjs <files...>   # escanea ficheros especificos
 *
 * Exit code:
 *   0 = sin secrets detectados
 *   1 = secrets encontrados (bloquea commit)
 *   2 = error de ejecucion
 */

import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

// Patrones de secrets conocidos. Anadir mas segun necesidad.
const PATTERNS = [
  // OpenAI / Anthropic. OpenAI moderno usa sk-proj-XXXX o sk-XXXX (legacy).
  // Anthropic usa sk-ant-...
  { name: 'Anthropic API Key', re: /sk-ant-[A-Za-z0-9_-]{20,}/ },
  { name: 'OpenAI API Key', re: /sk-(proj-)?[A-Za-z0-9_-]{20,}/ },
  // Supabase service_role
  { name: 'Supabase service_role', re: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/, contextRequired: /service_role|SUPABASE_SERVICE_ROLE/i },
  // Stripe
  { name: 'Stripe Live Secret Key', re: /sk_live_[A-Za-z0-9]{24,}/ },
  { name: 'Stripe Test Secret Key', re: /sk_test_[A-Za-z0-9]{24,}/ },
  // AWS
  { name: 'AWS Access Key ID', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'AWS Secret Access Key (heuristica)', re: /aws_secret_access_key\s*=\s*['"]?[A-Za-z0-9/+=]{40}['"]?/i },
  // GitHub
  { name: 'GitHub Personal Access Token', re: /ghp_[A-Za-z0-9]{36}/ },
  { name: 'GitHub OAuth Token', re: /gho_[A-Za-z0-9]{36}/ },
  // Slack
  { name: 'Slack Token', re: /xox[abprs]-[A-Za-z0-9-]{10,}/ },
  // Private keys
  { name: 'Private Key Header', re: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/ },
  // Google API
  { name: 'Google API Key', re: /AIza[0-9A-Za-z_-]{35}/ },
  // Genericos: claves API en ENV
  { name: 'Generic secret in code', re: /(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/i, contextRequired: /^(?!.*example|.*placeholder|.*your[_-]?key).+$/im },
];

// Ficheros que se ignoran por defecto
const IGNORED_PATHS = [
  /\.env\.example$/,
  /\.env\.sample$/,
  /\.env\.template$/,
  /node_modules\//,
  /\.next\//,
  /\.git\//,
  /dist\//,
  /build\//,
  /coverage\//,
  /\.lock$/,
  /pnpm-lock\.yaml$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
];

// .env* (no .env.example) siempre se bloquea como secret-bearing
const ENV_FILE_RE = /(^|\/)\.env($|\.[^.]+(?<!\.example|\.sample|\.template)$)/;

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' });
    return out.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function isIgnored(filepath) {
  return IGNORED_PATHS.some((p) => p.test(filepath));
}

function isEnvSecretFile(filepath) {
  return ENV_FILE_RE.test(filepath);
}

async function scanFile(filepath) {
  if (!existsSync(filepath)) return [];

  const findings = [];

  // Regla absoluta: no commitear .env* (excepto .env.example/.sample/.template)
  if (isEnvSecretFile(filepath)) {
    findings.push({ file: filepath, line: 0, pattern: '.env-file (no commitear .env)', match: filepath });
    return findings;
  }

  const content = await fs.readFile(filepath, 'utf8').catch(() => '');
  if (!content) return findings;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Ignorar comentarios obvios (todavia, se podria afinar)
    for (const p of PATTERNS) {
      const m = line.match(p.re);
      if (!m) continue;
      // Si tiene contextRequired, verifica en el resto del fichero o en la linea
      if (p.contextRequired && !p.contextRequired.test(content)) continue;
      findings.push({
        file: filepath,
        line: i + 1,
        pattern: p.name,
        match: m[0].slice(0, 60) + (m[0].length > 60 ? '...' : ''),
      });
    }
  }

  return findings;
}

async function main() {
  const argv = process.argv.slice(2);
  let files = argv.length > 0 ? argv : getStagedFiles();

  if (files.length === 0) {
    console.log('Sin ficheros staged. Nada que escanear.');
    return;
  }

  files = files.filter((f) => !isIgnored(f));
  if (files.length === 0) {
    console.log('Todos los ficheros staged son ignorados. OK.');
    return;
  }

  console.log(`Escaneando ${files.length} fichero(s) en busca de secrets...`);

  let allFindings = [];
  for (const f of files) {
    const findings = await scanFile(f);
    allFindings = allFindings.concat(findings);
  }

  if (allFindings.length === 0) {
    console.log('OK. Sin secrets detectados.');
    return;
  }

  console.error('');
  console.error('SECRETS DETECTADOS - commit bloqueado:');
  console.error('');
  for (const f of allFindings) {
    console.error(`  ${f.file}:${f.line}`);
    console.error(`    ${f.pattern}`);
    console.error(`    ${f.match}`);
    console.error('');
  }
  console.error('Acciones recomendadas:');
  console.error('  1. Quita los secrets del fichero.');
  console.error('  2. Si crees que es falso positivo, revisalo con cuidado y commitea con --no-verify SOLO si estas seguro.');
  console.error('  3. Si el secret YA se commiteo en un commit anterior, rotalo inmediatamente: ya no es secreto.');
  process.exit(1);
}

main().catch((err) => {
  console.error(`Error en scan-secrets: ${err.message}`);
  process.exit(2);
});
