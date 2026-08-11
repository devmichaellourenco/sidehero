/**
 * Servidor do Balance Lab — simulador + editor de batalhas de missões.
 * Uso: npm run balance-lab
 */
import * as esbuild from 'esbuild';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(root, 'tools/balance-lab/dist');
const port = Number(process.env.BALANCE_LAB_PORT ?? 5179);

const OVERRIDES_PATH = join(
  root,
  'src/domain/campaign/data/phase-battle-overrides.json',
);
const BACKUPS_DIR = join(
  root,
  'src/domain/campaign/data/backups/phase-battle-overrides',
);

/** @type {null | typeof import('../tools/balance-lab/missionBattlesCatalog.ts')} */
let catalogApi = null;

async function build() {
  await mkdir(outDir, { recursive: true });
  await mkdir(BACKUPS_DIR, { recursive: true });

  await esbuild.build({
    entryPoints: [join(root, 'tools/balance-lab/lab.ts')],
    outfile: join(outDir, 'lab.js'),
    bundle: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    sourcemap: true,
    logLevel: 'info',
  });

  await esbuild.build({
    entryPoints: [join(root, 'tools/balance-lab/missionBattlesCatalog.ts')],
    outfile: join(outDir, 'missionBattlesCatalog.mjs'),
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    packages: 'bundle',
    logLevel: 'info',
  });

  await copyFile(join(root, 'tools/balance-lab/index.html'), join(outDir, 'index.html'));
  await copyFile(join(root, 'tools/balance-lab/lab.css'), join(outDir, 'lab.css'));

  catalogApi = await import(pathToFileURL(join(outDir, 'missionBattlesCatalog.mjs')).href);
}

function contentType(path) {
  if (path.endsWith('.html')) return 'text/html; charset=utf-8';
  if (path.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (path.endsWith('.css')) return 'text/css; charset=utf-8';
  if (path.endsWith('.map') || path.endsWith('.json')) return 'application/json';
  return 'application/octet-stream';
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

async function readOverridesFile() {
  try {
    const raw = await readFile(OVERRIDES_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      version: parsed.version ?? 1,
      updatedAt: parsed.updatedAt ?? null,
      overrides: parsed.overrides ?? {},
    };
  } catch {
    return { version: 1, updatedAt: null, overrides: {} };
  }
}

async function writeOverridesFile(file) {
  await mkdir(dirname(OVERRIDES_PATH), { recursive: true });
  const payload = `${JSON.stringify(file, null, 2)}\n`;
  await writeFile(OVERRIDES_PATH, payload, 'utf8');
}

async function backupCurrentOverrides() {
  await mkdir(BACKUPS_DIR, { recursive: true });
  try {
    await readFile(OVERRIDES_PATH);
  } catch {
    return null;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = join(BACKUPS_DIR, `phase-battle-overrides-${stamp}.json`);
  await copyFile(OVERRIDES_PATH, dest);
  return dest;
}

async function listBackups() {
  await mkdir(BACKUPS_DIR, { recursive: true });
  const names = await readdir(BACKUPS_DIR);
  return names
    .filter((name) => name.endsWith('.json'))
    .sort()
    .reverse()
    .map((name) => ({ id: name, path: `backups/${name}` }));
}

function validateOverride(body) {
  if (!body || typeof body !== 'object') throw new Error('Body inválido');
  if (!Array.isArray(body.waves) || body.waves.length === 0) {
    throw new Error('Informe ao menos uma wave');
  }
  for (const [wi, wave] of body.waves.entries()) {
    if (!Array.isArray(wave.slots) || wave.slots.length === 0) {
      throw new Error(`Wave ${wi + 1} sem slots`);
    }
    for (const [si, slot] of wave.slots.entries()) {
      if (!slot.enemyType) throw new Error(`Wave ${wi + 1} slot ${si + 1}: enemyType obrigatório`);
      if (!['trash', 'elite', 'boss'].includes(slot.role)) {
        throw new Error(`Wave ${wi + 1} slot ${si + 1}: role inválido`);
      }
      if (!Number.isFinite(Number(slot.count)) || Number(slot.count) < 1) {
        throw new Error(`Wave ${wi + 1} slot ${si + 1}: count inválido`);
      }
    }
  }
  return {
    displayName: typeof body.displayName === 'string' ? body.displayName : undefined,
    statMultiplier:
      typeof body.statMultiplier === 'number' && Number.isFinite(body.statMultiplier)
        ? body.statMultiplier
        : undefined,
    waves: body.waves,
  };
}

async function handleApi(req, res, url) {
  if (!catalogApi) {
    sendJson(res, 503, { ok: false, error: 'Catálogo ainda não carregou' });
    return;
  }

  const file = await readOverridesFile();

  if (req.method === 'GET' && url.pathname === '/api/mission-battles') {
    const kind = url.searchParams.get('kind') || undefined;
    const mapId = url.searchParams.get('mapId') || undefined;
    let missions = catalogApi.buildMissionBattleLabPayload(file.overrides).missions;
    if (kind) missions = missions.filter((m) => m.kind === kind);
    if (mapId) missions = missions.filter((m) => m.mapId === mapId);
    sendJson(res, 200, {
      ok: true,
      updatedAt: file.updatedAt,
      enemies: catalogApi.listEnemyOptionsForLab(),
      missions,
      backups: await listBackups(),
    });
    return;
  }

  const detailMatch = url.pathname.match(/^\/api\/mission-battles\/([^/]+)$/);
  if (req.method === 'GET' && detailMatch) {
    const missionId = decodeURIComponent(detailMatch[1]);
    const detail = catalogApi.getMissionBattleDetail(missionId, file.overrides);
    if (!detail) {
      sendJson(res, 404, { ok: false, error: 'Missão não encontrada' });
      return;
    }
    sendJson(res, 200, { ok: true, ...detail });
    return;
  }

  if (req.method === 'PUT' && detailMatch) {
    const missionId = decodeURIComponent(detailMatch[1]);
    const detail = catalogApi.getMissionBattleDetail(missionId, file.overrides);
    if (!detail) {
      sendJson(res, 404, { ok: false, error: 'Missão não encontrada' });
      return;
    }
    const body = await readBody(req);
    const override = validateOverride(body);
    const backupPath = await backupCurrentOverrides();
    file.overrides[detail.mission.phaseTemplateId] = override;
    file.updatedAt = new Date().toISOString();
    file.version = 1;
    await writeOverridesFile(file);
    sendJson(res, 200, {
      ok: true,
      phaseTemplateId: detail.mission.phaseTemplateId,
      backupPath,
      updatedAt: file.updatedAt,
      detail: catalogApi.getMissionBattleDetail(missionId, file.overrides),
    });
    return;
  }

  if (req.method === 'DELETE' && detailMatch) {
    const missionId = decodeURIComponent(detailMatch[1]);
    const detail = catalogApi.getMissionBattleDetail(missionId, file.overrides);
    if (!detail) {
      sendJson(res, 404, { ok: false, error: 'Missão não encontrada' });
      return;
    }
    const backupPath = await backupCurrentOverrides();
    delete file.overrides[detail.mission.phaseTemplateId];
    file.updatedAt = new Date().toISOString();
    await writeOverridesFile(file);
    sendJson(res, 200, {
      ok: true,
      backupPath,
      detail: catalogApi.getMissionBattleDetail(missionId, file.overrides),
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/mission-battles-backups') {
    sendJson(res, 200, { ok: true, backups: await listBackups() });
    return;
  }

  const restoreMatch = url.pathname.match(/^\/api\/mission-battles-backups\/([^/]+)\/restore$/);
  if (req.method === 'POST' && restoreMatch) {
    const backupId = decodeURIComponent(restoreMatch[1]);
    const src = join(BACKUPS_DIR, backupId);
    if (!src.startsWith(BACKUPS_DIR) || !backupId.endsWith('.json')) {
      sendJson(res, 400, { ok: false, error: 'Backup inválido' });
      return;
    }
    const backupPath = await backupCurrentOverrides();
    await copyFile(src, OVERRIDES_PATH);
    const restored = await readOverridesFile();
    sendJson(res, 200, {
      ok: true,
      restoredFrom: backupId,
      previousBackupPath: backupPath,
      updatedAt: restored.updatedAt,
    });
    return;
  }

  sendJson(res, 404, { ok: false, error: 'Rota não encontrada' });
}

async function main() {
  await build();

  const server = createServer(async (req, res) => {
    const isApi = (req.url ?? '').startsWith('/api/');
    try {
      const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
      if (url.pathname.startsWith('/api/')) {
        await handleApi(req, res, url);
        return;
      }

      let pathname = url.pathname === '/' ? '/index.html' : url.pathname;
      const filePath = join(outDir, pathname.replace(/^\//, ''));
      if (!filePath.startsWith(outDir)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': contentType(filePath) });
      res.end(body);
    } catch (error) {
      if (isApi) {
        sendJson(res, 500, {
          ok: false,
          error: error instanceof Error ? error.message : String(error),
        });
        return;
      }
      res.writeHead(404).end('Not found');
    }
  });

  server.listen(port, '127.0.0.1', () => {
    console.log(`\nBalance Lab: http://127.0.0.1:${port}/`);
    console.log('Aba Missões: editor de batalhas → phase-battle-overrides.json');
    console.log('Ctrl+C para encerrar.\n');
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
