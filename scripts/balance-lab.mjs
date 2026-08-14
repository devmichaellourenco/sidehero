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
const REWARD_OVERRIDES_PATH = join(
  root,
  'src/domain/campaign/data/phase-reward-overrides.json',
);
const REWARD_BACKUPS_DIR = join(
  root,
  'src/domain/campaign/data/backups/phase-reward-overrides',
);
const HERO_COMBAT_PATH = join(
  root,
  'src/domain/progression/data/hero-combat-overrides.json',
);
const HERO_COMBAT_BACKUPS_DIR = join(
  root,
  'src/domain/progression/data/backups/hero-combat-overrides',
);
const HERO_LEVEL_XP_PATH = join(
  root,
  'src/domain/progression/data/hero-level-xp-overrides.json',
);
const HERO_LEVEL_XP_BACKUPS_DIR = join(
  root,
  'src/domain/progression/data/backups/hero-level-xp-overrides',
);
const PANEL_ASSETS_DIR = join(root, 'dist/panel/assets');
const PUBLIC_ENEMY_SPRITES_DIR = join(root, 'public/sprites/enemies');

/** @type {null | typeof import('../tools/balance-lab/missionBattlesCatalog.ts')} */
let catalogApi = null;

async function build() {
  await mkdir(outDir, { recursive: true });
  await mkdir(BACKUPS_DIR, { recursive: true });
  await mkdir(REWARD_BACKUPS_DIR, { recursive: true });
  await mkdir(HERO_COMBAT_BACKUPS_DIR, { recursive: true });
  await mkdir(HERO_LEVEL_XP_BACKUPS_DIR, { recursive: true });

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
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

async function tryReadFile(filePath) {
  try {
    return await readFile(filePath);
  } catch {
    return null;
  }
}

/** Serve sprites do build do painel, com fallback em public/sprites/enemies. */
async function servePanelAsset(pathname, res) {
  const relative = pathname.replace(/^\/panel\/assets\//, '');
  if (relative.includes('..')) {
    res.writeHead(403).end('Forbidden');
    return true;
  }

  const primary = join(PANEL_ASSETS_DIR, relative);
  if (!primary.startsWith(PANEL_ASSETS_DIR)) {
    res.writeHead(403).end('Forbidden');
    return true;
  }

  let body = await tryReadFile(primary);
  if (!body && relative.startsWith('characters/')) {
    const basename = relative.slice('characters/'.length);
    const fallback = join(PUBLIC_ENEMY_SPRITES_DIR, basename);
    if (fallback.startsWith(PUBLIC_ENEMY_SPRITES_DIR)) {
      body = await tryReadFile(fallback);
    }
  }
  if (!body && relative.startsWith('characters/')) {
    body = await tryReadFile(join(PANEL_ASSETS_DIR, 'characters/goblin.png'));
  }
  if (!body) {
    res.writeHead(404).end('Not found');
    return true;
  }

  res.writeHead(200, {
    'Content-Type': contentType(relative),
    'Cache-Control': 'public, max-age=3600',
  });
  res.end(body);
  return true;
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

async function readRewardOverridesFile() {
  try {
    const raw = await readFile(REWARD_OVERRIDES_PATH, 'utf8');
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

async function writeRewardOverridesFile(file) {
  await mkdir(dirname(REWARD_OVERRIDES_PATH), { recursive: true });
  const payload = `${JSON.stringify(file, null, 2)}\n`;
  await writeFile(REWARD_OVERRIDES_PATH, payload, 'utf8');
}

async function backupCurrentRewardOverrides() {
  await mkdir(REWARD_BACKUPS_DIR, { recursive: true });
  try {
    await readFile(REWARD_OVERRIDES_PATH);
  } catch {
    return null;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = join(REWARD_BACKUPS_DIR, `phase-reward-overrides-${stamp}.json`);
  await copyFile(REWARD_OVERRIDES_PATH, dest);
  return dest;
}

async function listRewardBackups() {
  await mkdir(REWARD_BACKUPS_DIR, { recursive: true });
  const names = await readdir(REWARD_BACKUPS_DIR);
  return names
    .filter((name) => name.endsWith('.json'))
    .sort()
    .reverse()
    .map((name) => ({ id: name, path: `backups/${name}` }));
}

function validateRewardOverride(body) {
  const normalized = catalogApi.normalizePhaseRewardOverride(body);
  if (!normalized) {
    throw new Error('Informe displayName e/ou targetXp/targetGold > 0');
  }
  return normalized;
}

async function readHeroCombatFile() {
  try {
    const raw = await readFile(HERO_COMBAT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      version: parsed.version ?? 1,
      updatedAt: parsed.updatedAt ?? null,
      skills: parsed.skills ?? {},
      identities: parsed.identities ?? {},
      baseStats: parsed.baseStats ?? {},
      passives: parsed.passives ?? {},
      ascensions: parsed.ascensions ?? {},
    };
  } catch {
    return {
      version: 1,
      updatedAt: null,
      skills: {},
      identities: {},
      baseStats: {},
      passives: {},
      ascensions: {},
    };
  }
}

async function writeHeroCombatFile(file) {
  await mkdir(dirname(HERO_COMBAT_PATH), { recursive: true });
  await writeFile(HERO_COMBAT_PATH, `${JSON.stringify(file, null, 2)}\n`, 'utf8');
}

async function backupCurrentHeroCombat() {
  await mkdir(HERO_COMBAT_BACKUPS_DIR, { recursive: true });
  try {
    await readFile(HERO_COMBAT_PATH);
  } catch {
    return null;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = join(HERO_COMBAT_BACKUPS_DIR, `hero-combat-overrides-${stamp}.json`);
  await copyFile(HERO_COMBAT_PATH, dest);
  return dest;
}

async function listHeroCombatBackups() {
  await mkdir(HERO_COMBAT_BACKUPS_DIR, { recursive: true });
  const names = await readdir(HERO_COMBAT_BACKUPS_DIR);
  return names
    .filter((name) => name.endsWith('.json'))
    .sort()
    .reverse()
    .map((name) => ({ id: name, path: `backups/${name}` }));
}

async function readHeroLevelXpFile() {
  try {
    const raw = await readFile(HERO_LEVEL_XP_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return {
      version: parsed.version ?? 1,
      updatedAt: parsed.updatedAt ?? null,
      levels: parsed.levels ?? {},
    };
  } catch {
    return { version: 1, updatedAt: null, levels: {} };
  }
}

async function writeHeroLevelXpFile(file) {
  await mkdir(dirname(HERO_LEVEL_XP_PATH), { recursive: true });
  await writeFile(HERO_LEVEL_XP_PATH, `${JSON.stringify(file, null, 2)}\n`, 'utf8');
}

async function backupCurrentHeroLevelXp() {
  await mkdir(HERO_LEVEL_XP_BACKUPS_DIR, { recursive: true });
  try {
    await readFile(HERO_LEVEL_XP_PATH);
  } catch {
    return null;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dest = join(HERO_LEVEL_XP_BACKUPS_DIR, `hero-level-xp-overrides-${stamp}.json`);
  await copyFile(HERO_LEVEL_XP_PATH, dest);
  return dest;
}

async function listHeroLevelXpBackups() {
  await mkdir(HERO_LEVEL_XP_BACKUPS_DIR, { recursive: true });
  const names = await readdir(HERO_LEVEL_XP_BACKUPS_DIR);
  return names
    .filter((name) => name.endsWith('.json'))
    .sort()
    .reverse()
    .map((name) => ({ id: name, path: `backups/${name}` }));
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

  const rewardFile = await readRewardOverridesFile();

  // Curva de XP por nível do disco vale para todas as rotas (ex.: nível projetado).
  const levelXpFile = await readHeroLevelXpFile();
  catalogApi.applyLabHeroLevelXpOverrides(levelXpFile.levels);

  if (req.method === 'GET' && url.pathname === '/api/hero-level-xp') {
    const bandRaw = url.searchParams.get('bandMin');
    const bandMin = bandRaw !== null && bandRaw !== '' ? Number(bandRaw) : undefined;
    const payload = catalogApi.buildHeroLevelXpLabPayload({
      diskOverrides: levelXpFile.levels,
      updatedAt: levelXpFile.updatedAt,
      bandMin: bandMin !== undefined && Number.isFinite(bandMin) ? bandMin : undefined,
    });
    sendJson(res, 200, {
      ok: true,
      ...payload,
      backups: await listHeroLevelXpBackups(),
    });
    return;
  }

  if (req.method === 'PUT' && url.pathname === '/api/hero-level-xp') {
    const body = await readBody(req);
    const incoming = catalogApi.normalizeHeroLevelXpOverrides(body?.levels ?? {});
    const clearList = Array.isArray(body?.clear) ? body.clear : [];
    const backupPath = await backupCurrentHeroLevelXp();

    for (const level of clearList) {
      const key = String(Math.floor(Number(level)));
      if (key !== 'NaN') delete levelXpFile.levels[key];
    }
    for (const [level, value] of Object.entries(incoming)) {
      levelXpFile.levels[level] = value;
    }
    levelXpFile.updatedAt = new Date().toISOString();
    levelXpFile.version = 1;
    await writeHeroLevelXpFile(levelXpFile);
    sendJson(res, 200, {
      ok: true,
      backupPath,
      updatedAt: levelXpFile.updatedAt,
      overrideCount: Object.keys(levelXpFile.levels).length,
    });
    return;
  }

  const levelXpDetailMatch = url.pathname.match(/^\/api\/hero-level-xp\/([^/]+)$/);
  if (req.method === 'DELETE' && levelXpDetailMatch) {
    const level = String(Math.floor(Number(decodeURIComponent(levelXpDetailMatch[1]))));
    if (level === 'NaN') {
      sendJson(res, 400, { ok: false, error: 'Nível inválido' });
      return;
    }
    const backupPath = await backupCurrentHeroLevelXp();
    delete levelXpFile.levels[level];
    levelXpFile.updatedAt = new Date().toISOString();
    await writeHeroLevelXpFile(levelXpFile);
    sendJson(res, 200, { ok: true, backupPath, updatedAt: levelXpFile.updatedAt });
    return;
  }

  const levelXpRestoreMatch = url.pathname.match(
    /^\/api\/hero-level-xp-backups\/([^/]+)\/restore$/,
  );
  if (req.method === 'POST' && levelXpRestoreMatch) {
    const backupId = decodeURIComponent(levelXpRestoreMatch[1]);
    const src = join(HERO_LEVEL_XP_BACKUPS_DIR, backupId);
    if (!src.startsWith(HERO_LEVEL_XP_BACKUPS_DIR) || !backupId.endsWith('.json')) {
      sendJson(res, 400, { ok: false, error: 'Backup inválido' });
      return;
    }
    const backupPath = await backupCurrentHeroLevelXp();
    await copyFile(src, HERO_LEVEL_XP_PATH);
    const restored = await readHeroLevelXpFile();
    sendJson(res, 200, {
      ok: true,
      restoredFrom: backupId,
      previousBackupPath: backupPath,
      updatedAt: restored.updatedAt,
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/phase-rewards') {
    const mapId = url.searchParams.get('mapId') || undefined;
    const chapterRaw = url.searchParams.get('chapterMain');
    const chapterMain =
      chapterRaw !== null && chapterRaw !== '' ? Number(chapterRaw) : undefined;
    const payload = catalogApi.buildPhaseRewardsLabPayload({
      mapId,
      chapterMain:
        chapterMain !== undefined && Number.isFinite(chapterMain)
          ? chapterMain
          : undefined,
      diskOverrides: rewardFile.overrides,
      updatedAt: rewardFile.updatedAt,
    });
    sendJson(res, 200, {
      ok: true,
      ...payload,
      backups: await listRewardBackups(),
    });
    return;
  }

  if (req.method === 'PUT' && url.pathname === '/api/phase-rewards') {
    const body = await readBody(req);
    const incoming =
      body?.overrides && typeof body.overrides === 'object' ? body.overrides : {};
    const clearList = Array.isArray(body?.clear) ? body.clear : [];
    const backupPath = await backupCurrentRewardOverrides();

    for (const phaseId of clearList) {
      if (typeof phaseId === 'string' && phaseId.trim()) {
        delete rewardFile.overrides[phaseId.trim()];
      }
    }
    for (const [phaseId, raw] of Object.entries(incoming)) {
      if (!phaseId || typeof phaseId !== 'string') continue;
      rewardFile.overrides[phaseId] = validateRewardOverride(raw);
    }
    rewardFile.updatedAt = new Date().toISOString();
    rewardFile.version = 1;
    await writeRewardOverridesFile(rewardFile);
    sendJson(res, 200, {
      ok: true,
      backupPath,
      updatedAt: rewardFile.updatedAt,
      overrideCount: Object.keys(rewardFile.overrides).length,
    });
    return;
  }

  const rewardDetailMatch = url.pathname.match(/^\/api\/phase-rewards\/([^/]+)$/);
  if (req.method === 'DELETE' && rewardDetailMatch) {
    const phaseId = decodeURIComponent(rewardDetailMatch[1]);
    const backupPath = await backupCurrentRewardOverrides();
    delete rewardFile.overrides[phaseId];
    rewardFile.updatedAt = new Date().toISOString();
    await writeRewardOverridesFile(rewardFile);
    sendJson(res, 200, { ok: true, backupPath, updatedAt: rewardFile.updatedAt });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/phase-rewards-backups') {
    sendJson(res, 200, { ok: true, backups: await listRewardBackups() });
    return;
  }

  const rewardRestoreMatch = url.pathname.match(
    /^\/api\/phase-rewards-backups\/([^/]+)\/restore$/,
  );
  if (req.method === 'POST' && rewardRestoreMatch) {
    const backupId = decodeURIComponent(rewardRestoreMatch[1]);
    const src = join(REWARD_BACKUPS_DIR, backupId);
    if (!src.startsWith(REWARD_BACKUPS_DIR) || !backupId.endsWith('.json')) {
      sendJson(res, 400, { ok: false, error: 'Backup inválido' });
      return;
    }
    const backupPath = await backupCurrentRewardOverrides();
    await copyFile(src, REWARD_OVERRIDES_PATH);
    const restored = await readRewardOverridesFile();
    sendJson(res, 200, {
      ok: true,
      restoredFrom: backupId,
      previousBackupPath: backupPath,
      updatedAt: restored.updatedAt,
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/hero-combat') {
    const heroFile = await readHeroCombatFile();
    const payload = catalogApi.buildHeroCombatLabPayload({
      diskOverrides: heroFile,
      updatedAt: heroFile.updatedAt,
    });
    sendJson(res, 200, {
      ok: true,
      ...payload,
      backups: await listHeroCombatBackups(),
    });
    return;
  }

  if (req.method === 'PUT' && url.pathname === '/api/hero-combat') {
    const heroFile = await readHeroCombatFile();
    const body = await readBody(req);
    const backupPath = await backupCurrentHeroCombat();

    for (const id of Array.isArray(body?.clearSkills) ? body.clearSkills : []) {
      if (typeof id === 'string') delete heroFile.skills[id];
    }
    for (const id of Array.isArray(body?.clearIdentities) ? body.clearIdentities : []) {
      if (typeof id === 'string') delete heroFile.identities[id];
    }
    for (const id of Array.isArray(body?.clearBaseStats) ? body.clearBaseStats : []) {
      if (typeof id === 'string') delete heroFile.baseStats[id];
    }
    for (const id of Array.isArray(body?.clearPassives) ? body.clearPassives : []) {
      if (typeof id === 'string') delete heroFile.passives[id];
    }
    for (const id of Array.isArray(body?.clearAscensions) ? body.clearAscensions : []) {
      if (typeof id === 'string') delete heroFile.ascensions[id];
    }

    for (const [skillId, raw] of Object.entries(body?.skills ?? {})) {
      const normalized = catalogApi.normalizeSkillCombatOverride(raw);
      if (!normalized) throw new Error(`Skill ${skillId}: informe ao menos um knob`);
      heroFile.skills[skillId] = normalized;
    }
    for (const [heroClass, raw] of Object.entries(body?.identities ?? {})) {
      const normalized = catalogApi.normalizeIdentityOverride(raw);
      if (!normalized) throw new Error(`Identidade ${heroClass}: informe ao menos um knob`);
      heroFile.identities[heroClass] = normalized;
    }
    for (const [heroClass, raw] of Object.entries(body?.baseStats ?? {})) {
      const normalized = catalogApi.normalizeBaseStatsOverride(raw);
      if (!normalized) throw new Error(`Stats base ${heroClass}: informe ATK/DEF/HP`);
      heroFile.baseStats[heroClass] = normalized;
    }
    for (const [passiveId, raw] of Object.entries(body?.passives ?? {})) {
      const normalized = catalogApi.normalizePassiveOverride(raw);
      if (!normalized) throw new Error(`Passiva ${passiveId}: informe efeitos numéricos`);
      heroFile.passives[passiveId] = normalized;
    }
    for (const [ascensionId, raw] of Object.entries(body?.ascensions ?? {})) {
      const normalized = catalogApi.normalizeAscensionOverride(raw);
      if (!normalized) throw new Error(`Evolução ${ascensionId}: informe pontos, textos ou requisitos`);
      heroFile.ascensions[ascensionId] = normalized;
    }

    heroFile.updatedAt = new Date().toISOString();
    heroFile.version = 1;
    await writeHeroCombatFile(heroFile);
    sendJson(res, 200, { ok: true, backupPath, updatedAt: heroFile.updatedAt });
    return;
  }

  const heroRestoreMatch = url.pathname.match(
    /^\/api\/hero-combat-backups\/([^/]+)\/restore$/,
  );
  if (req.method === 'POST' && heroRestoreMatch) {
    const backupId = decodeURIComponent(heroRestoreMatch[1]);
    const src = join(HERO_COMBAT_BACKUPS_DIR, backupId);
    if (!src.startsWith(HERO_COMBAT_BACKUPS_DIR) || !backupId.endsWith('.json')) {
      sendJson(res, 400, { ok: false, error: 'Backup inválido' });
      return;
    }
    const backupPath = await backupCurrentHeroCombat();
    await copyFile(src, HERO_COMBAT_PATH);
    sendJson(res, 200, { ok: true, restoredFrom: backupId, previousBackupPath: backupPath });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/mission-battles') {
    const kind = url.searchParams.get('kind') || undefined;
    const mapId = url.searchParams.get('mapId') || undefined;
    const q = url.searchParams.get('q') || undefined;
    const chapterRaw = url.searchParams.get('chapterMain');
    const chapterMain =
      chapterRaw !== null && chapterRaw !== ''
        ? Number(chapterRaw)
        : undefined;
    const payload = catalogApi.buildMissionBattleLabPayload(file.overrides, {
      kind,
      mapId,
      q,
      chapterMain:
        chapterMain !== undefined && Number.isFinite(chapterMain)
          ? chapterMain
          : undefined,
    });
    sendJson(res, 200, {
      ok: true,
      updatedAt: file.updatedAt,
      enemies: payload.enemies,
      missions: payload.missions,
      chapters: payload.chapters,
      maps: payload.maps,
      backups: await listBackups(),
    });
    return;
  }

  if (req.method === 'PUT' && url.pathname === '/api/mission-battles') {
    const body = await readBody(req);
    const updates =
      body?.updates && typeof body.updates === 'object' ? body.updates : null;
    if (!updates || Object.keys(updates).length === 0) {
      sendJson(res, 400, { ok: false, error: 'Informe updates: { [missionId]: draft }' });
      return;
    }
    const backupPath = await backupCurrentOverrides();
    const saved = [];
    for (const [missionId, raw] of Object.entries(updates)) {
      if (typeof missionId !== 'string' || !missionId.trim()) continue;
      const detail = catalogApi.getMissionBattleDetail(missionId, file.overrides);
      if (!detail) {
        throw new Error(`Missão não encontrada: ${missionId}`);
      }
      const override = validateOverride(raw);
      file.overrides[detail.mission.phaseTemplateId] = override;
      saved.push({
        missionId,
        phaseTemplateId: detail.mission.phaseTemplateId,
      });
    }
    file.updatedAt = new Date().toISOString();
    file.version = 1;
    await writeOverridesFile(file);
    sendJson(res, 200, {
      ok: true,
      backupPath,
      updatedAt: file.updatedAt,
      saved,
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

      if (url.pathname.startsWith('/panel/assets/')) {
        await servePanelAsset(url.pathname, res);
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
    console.log('Aba XP por fase: alvos XP/ouro → phase-reward-overrides.json');
    console.log('Aba XP por nível: curva de level-up → hero-level-xp-overrides.json');
    console.log('Aba Personagens: skills/identidade/passivas/evoluções → hero-combat-overrides.json');
    console.log('Ctrl+C para encerrar.\n');
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
