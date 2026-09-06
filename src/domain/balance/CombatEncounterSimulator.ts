/**
 * Simulador headless de combate — usa o motor real (CombatTurnPhase) tick a tick.
 * Determinismo via seed: monkey-patches Math.random de forma retrocompatível
 * (Node.js é single-thread; nenhum código de produção foi alterado).
 */
import { GameState } from '../entities/GameState';
import { CombatTurnPhase } from '../services/combat/CombatTurnPhase';
import { COMBAT_DELTA_SECONDS } from '../combat/CombatTimingConstants';
import type { PhaseId } from '../campaign/CampaignIds';
import type { EnemyRole } from '../campaign/WaveDefinition';
import {
  FALLBACK_PARTY,
  SENTINEL_PHASE,
  buildSimHero,
  buildPhaseState,
  buildAdHocState,
  countTotalEnemies,
  materializeSimDraftPhase,
  resolveSimTier,
} from './CombatSimulatorBuilders';
import { withLabSimDraftPhase } from './LabSimDraftPhase';
import type { SimHeroLoadoutSpec } from './SimHeroLoadout';
import {
  resolveSimProfileSpec,
  type SimReferenceProfile,
} from './SimReferenceProfiles';

// ── Tipos públicos ─────────────────────────────────────────────────────────────

/** Campos de loadout são opcionais: sem eles o herói é o piso "pelado". */
export interface SimPartyMember extends SimHeroLoadoutSpec {
  heroClass: string;
  level: number;
}

export interface SimAdHocSlot {
  enemyType: string;
  role: EnemyRole;
  count: number;
  level?: number;
  displayName?: string;
}

export interface SimDraftWave {
  id?: string;
  goldMultiplier?: number;
  slots: SimAdHocSlot[];
}

/** Composição de fase ainda não salva — usada pelo Balance Lab. */
export interface SimDraftPhase {
  displayName?: string;
  difficultyTier?: number;
  statMultiplier?: number;
  waves: SimDraftWave[];
}

export interface SimRequest {
  party?: SimPartyMember[];
  /** Preenche o loadout de quem não definiu campos próprios. Default: `naked`. */
  profile?: SimReferenceProfile;
  /** Fase completa (todas as waves) quando `waveIndex` omitido. */
  phaseId?: PhaseId;
  /** Wave específica; para ao limpar essa wave. */
  waveIndex?: number;
  /** Encontro ad-hoc sem fase de campanha. */
  slots?: SimAdHocSlot[];
  /**
   * Waves/stats do editor (sem Save). Exige `phaseId` para metadados/ID;
   * injeta override temporário em `resolvePhase` durante a simulação.
   */
  draftPhase?: SimDraftPhase;
  maxSeconds?: number;
  seed?: number;
  /** A cada quantos ticks gravar snapshot no playback (default 1). */
  snapshotEveryTicks?: number;
}

export interface HeroSimResult {
  heroClass: string;
  level: number;
  remainingHp: number;
  maxHp: number;
  hpPercent: number;
}

export type SimOutcome = 'victory' | 'wipe' | 'timeout';

export interface EncounterSimulationResult {
  outcome: SimOutcome;
  combatTime: number;
  ticks: number;
  wavesCleared: number;
  enemiesKilled: number;
  totalEnemies: number;
  heroes: HeroSimResult[];
  avgHpPercent: number;
}

export interface BatchSimulationResult {
  runs: number;
  winRate: number;
  wipeRate: number;
  timeoutRate: number;
  avgCombatTime: number;
  minCombatTime: number;
  maxCombatTime: number;
  avgHpPercent: number;
  avgWavesCleared: number;
  perRun: EncounterSimulationResult[];
}

export interface SimUnitSnapshot {
  id: string;
  name: string;
  kind: 'hero' | 'enemy';
  classOrType: string;
  role?: EnemyRole;
  level: number;
  hp: number;
  maxHp: number;
  alive: boolean;
}

export interface CombatSimSnapshot {
  tick: number;
  combatTime: number;
  waveIndex: number;
  waveCount: number;
  heroes: SimUnitSnapshot[];
  enemies: SimUnitSnapshot[];
  intermission: string | null;
}

export interface EncounterPlaybackResult {
  snapshots: CombatSimSnapshot[];
  result: EncounterSimulationResult;
}

// ── RNG semeável (mulberry32) ──────────────────────────────────────────────────

function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Substitui Math.random de forma síncrona e restaura no finally.
 * Seguro em Node.js single-thread; nenhum arquivo de produção foi alterado.
 */
function withSeededRng<T>(rng: (() => number) | undefined, fn: () => T): T {
  if (!rng) return fn();
  const saved = Math.random;
  (Math as { random: () => number }).random = rng;
  try {
    return fn();
  } finally {
    (Math as { random: () => number }).random = saved;
  }
}

// ── Construção de resultado ────────────────────────────────────────────────────

const DEFAULT_MAX_SECONDS = 600;

function buildResult(
  outcome: SimOutcome,
  state: GameState,
  ticks: number,
  wavesCleared: number,
  enemiesKilled: number,
  totalEnemies: number,
): EncounterSimulationResult {
  const heroes = state.activeHeroes().map((hero) => ({
    heroClass: hero.heroClass as string,
    level: hero.level,
    remainingHp: Math.max(0, hero.currentHealth),
    maxHp: Math.max(1, hero.maxHealth),
    hpPercent: Math.max(0, Math.min(1, hero.currentHealth / Math.max(1, hero.maxHealth))),
  }));
  const avgHpPercent = heroes.length > 0
    ? heroes.reduce((sum, h) => sum + h.hpPercent, 0) / heroes.length
    : 0;
  return { outcome, combatTime: ticks * COMBAT_DELTA_SECONDS, ticks, wavesCleared, enemiesKilled, totalEnemies, heroes, avgHpPercent };
}

function captureSnapshot(state: GameState, ticks: number): CombatSimSnapshot {
  const meta = state.combat?.encounterMeta;
  const heroes: SimUnitSnapshot[] = state.activeHeroes().map((hero) => ({
    id: hero.id,
    name: hero.name,
    kind: 'hero',
    classOrType: hero.heroClass as string,
    level: hero.level,
    hp: Math.max(0, hero.currentHealth),
    maxHp: Math.max(1, hero.maxHealth),
    alive: hero.currentHealth > 0,
  }));
  const enemies: SimUnitSnapshot[] = (state.combat?.enemies ?? []).map((enemy) => ({
    id: enemy.id,
    name: enemy.name,
    kind: 'enemy',
    classOrType: enemy.enemyType as string,
    role: enemy.role,
    level: enemy.level,
    hp: Math.max(0, enemy.stats.currentHealth),
    maxHp: Math.max(1, enemy.maxHealth),
    alive: enemy.isAlive(),
  }));

  return {
    tick: ticks,
    combatTime: ticks * COMBAT_DELTA_SECONDS,
    waveIndex: state.phaseRun?.waveIndex ?? meta?.waveIndex ?? 0,
    waveCount: meta?.waveCount ?? 1,
    heroes,
    enemies,
    intermission: state.combatIntermission?.variant ?? null,
  };
}

// ── Loop de simulação ──────────────────────────────────────────────────────────

interface RunSimOptions {
  recordSnapshots?: boolean;
  snapshotEveryTicks?: number;
}

interface RunSimOutput {
  result: EncounterSimulationResult;
  snapshots: CombatSimSnapshot[];
}

function runSingleSim(
  request: SimRequest,
  initialState: GameState,
  turnPhase: CombatTurnPhase,
  options: RunSimOptions = {},
): RunSimOutput {
  const maxSeconds = request.maxSeconds ?? DEFAULT_MAX_SECONDS;
  const maxTicks = Math.ceil(maxSeconds / COMBAT_DELTA_SECONDS);
  const totalEnemies = countTotalEnemies(request);
  const stopAfterFirstClear = request.waveIndex !== undefined && !request.slots;
  const every = Math.max(1, Math.floor(options.snapshotEveryTicks ?? request.snapshotEveryTicks ?? 1));
  const snapshots: CombatSimSnapshot[] = [];

  let state = initialState;
  let ticks = 0;
  let wavesCleared = 0;
  let enemiesKilled = 0;

  if (options.recordSnapshots) {
    snapshots.push(captureSnapshot(state, ticks));
  }

  while (ticks < maxTicks) {
    state = turnPhase.execute(state).state;
    ticks++;

    if (options.recordSnapshots && (ticks % every === 0 || state.combatIntermission)) {
      snapshots.push(captureSnapshot(state, ticks));
    }

    const intermission = state.combatIntermission;
    if (!intermission) continue;

    const { variant } = intermission;

    if (variant === 'defeat') {
      const result = buildResult('wipe', state, ticks, wavesCleared, enemiesKilled, totalEnemies);
      return { result, snapshots };
    }

    // wave-clear, boss-approach ou phase-clear
    wavesCleared += 1;
    const defeatedNow = state.combat?.enemies.length ?? 0;
    if (defeatedNow > 0) {
      enemiesKilled += defeatedNow;
    } else {
      // Vitória de boss / limpeza zera o combate — credita o restante da request
      enemiesKilled = Math.max(enemiesKilled, totalEnemies);
    }

    if (variant === 'phase-clear' || stopAfterFirstClear) {
      return {
        result: buildResult('victory', state, ticks, wavesCleared, enemiesKilled, totalEnemies),
        snapshots,
      };
    }

    state = state.withCombatIntermission(null);
  }

  const partialKills = state.combat?.enemies.filter((e) => !e.isAlive()).length ?? 0;
  const result = buildResult(
    'timeout',
    state,
    ticks,
    wavesCleared,
    enemiesKilled + partialKills,
    totalEnemies,
  );
  if (options.recordSnapshots) {
    snapshots.push(captureSnapshot(state, ticks));
  }
  return { result, snapshots };
}

/** O que o membro declarou vence o perfil; o perfil só preenche as lacunas. */
function withProfileDefaults(
  spec: SimPartyMember,
  profile: SimReferenceProfile | undefined,
  tier: number,
): SimPartyMember {
  if (!profile) return spec;
  return { ...resolveSimProfileSpec(profile, tier), ...spec };
}

function buildInitialState(request: SimRequest, party: SimPartyMember[]): GameState {
  const tier = resolveSimTier(request);
  const heroes = party.map((spec, i) =>
    buildSimHero(withProfileDefaults(spec, request.profile, tier), i, tier),
  );
  if (request.slots) return buildAdHocState(heroes, request.slots);
  if (request.phaseId || request.draftPhase) {
    return buildPhaseState(heroes, request.phaseId ?? SENTINEL_PHASE, request.waveIndex ?? 0);
  }
  return buildPhaseState(heroes, SENTINEL_PHASE, 0);
}

function withRequestDraft<T>(request: SimRequest, fn: () => T): T {
  if (!request.draftPhase || request.slots) return fn();
  const phaseId = (request.phaseId ?? SENTINEL_PHASE) as PhaseId;
  const phase = materializeSimDraftPhase(phaseId, request.draftPhase);
  return withLabSimDraftPhase(phase, fn);
}

function runSeededEncounter(
  request: SimRequest,
  party: SimPartyMember[],
  seed: number | undefined,
  options: RunSimOptions = {},
): RunSimOutput {
  const rng = seed !== undefined ? mulberry32(seed) : undefined;
  return withSeededRng(rng, () => {
    // Novo motor por run: SkillTargetResolver captura Math.random no construtor.
    const turnPhase = new CombatTurnPhase();
    return runSingleSim(request, buildInitialState(request, party), turnPhase, options);
  });
}

// ── API pública ────────────────────────────────────────────────────────────────

export function simulateEncounter(request: SimRequest): EncounterSimulationResult {
  return withRequestDraft(request, () => {
    const party = (request.party?.length ?? 0) > 0 ? request.party! : FALLBACK_PARTY;
    return runSeededEncounter(request, party, request.seed).result;
  });
}

export function simulateEncounterBatch(request: SimRequest, runs: number): BatchSimulationResult {
  return withRequestDraft(request, () => {
    const safeRuns = Math.max(1, Math.floor(runs));
    const party = (request.party?.length ?? 0) > 0 ? request.party! : FALLBACK_PARTY;
    const perRun: EncounterSimulationResult[] = [];

    for (let i = 0; i < safeRuns; i++) {
      const seed = request.seed !== undefined ? request.seed + i : undefined;
      perRun.push(runSeededEncounter(request, party, seed).result);
    }

    const victories = perRun.filter((r) => r.outcome === 'victory').length;
    const wipes = perRun.filter((r) => r.outcome === 'wipe').length;
    const times = perRun.map((r) => r.combatTime);

    return {
      runs: safeRuns,
      winRate: victories / safeRuns,
      wipeRate: wipes / safeRuns,
      timeoutRate: (safeRuns - victories - wipes) / safeRuns,
      avgCombatTime: times.reduce((a, b) => a + b, 0) / safeRuns,
      minCombatTime: Math.min(...times),
      maxCombatTime: Math.max(...times),
      avgHpPercent: perRun.reduce((a, r) => a + r.avgHpPercent, 0) / safeRuns,
      avgWavesCleared: perRun.reduce((a, r) => a + r.wavesCleared, 0) / safeRuns,
      perRun,
    };
  });
}

/** Simulação única com snapshots tick a tick para a arena visual do lab. */
export function simulateEncounterPlayback(request: SimRequest): EncounterPlaybackResult {
  return withRequestDraft(request, () => {
    const party = (request.party?.length ?? 0) > 0 ? request.party! : FALLBACK_PARTY;
    const { result, snapshots } = runSeededEncounter(request, party, request.seed, {
      recordSnapshots: true,
    });
    return { snapshots, result };
  });
}
