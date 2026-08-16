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
} from './CombatSimulatorBuilders';

// ── Tipos públicos ─────────────────────────────────────────────────────────────

export interface SimPartyMember {
  heroClass: string;
  level: number;
}

export interface SimAdHocSlot {
  enemyType: string;
  role: EnemyRole;
  count: number;
  level?: number;
}

export interface SimRequest {
  party?: SimPartyMember[];
  /** Fase completa (todas as waves) quando `waveIndex` omitido. */
  phaseId?: PhaseId;
  /** Wave específica; para ao limpar essa wave. */
  waveIndex?: number;
  /** Encontro ad-hoc sem fase de campanha. */
  slots?: SimAdHocSlot[];
  maxSeconds?: number;
  seed?: number;
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
const turnPhase = new CombatTurnPhase();

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

// ── Loop de simulação ──────────────────────────────────────────────────────────

function runSingleSim(request: SimRequest, initialState: GameState, seed: number | undefined): EncounterSimulationResult {
  const maxSeconds = request.maxSeconds ?? DEFAULT_MAX_SECONDS;
  const maxTicks = Math.ceil(maxSeconds / COMBAT_DELTA_SECONDS);
  const totalEnemies = countTotalEnemies(request);
  const stopAfterFirstClear = request.waveIndex !== undefined && !request.slots;
  const rng = seed !== undefined ? mulberry32(seed) : undefined;

  let state = initialState;
  let ticks = 0;
  let wavesCleared = 0;
  let enemiesKilled = 0;

  while (ticks < maxTicks) {
    state = withSeededRng(rng, () => turnPhase.execute(state)).state;
    ticks++;

    const intermission = state.combatIntermission;
    if (!intermission) continue;

    const { variant } = intermission;

    if (variant === 'defeat') {
      return buildResult('wipe', state, ticks, wavesCleared, enemiesKilled, totalEnemies);
    }

    // wave-clear, boss-approach ou phase-clear
    wavesCleared += 1;
    enemiesKilled += state.combat?.enemies.length ?? 0;

    if (variant === 'phase-clear' || stopAfterFirstClear) {
      return buildResult('victory', state, ticks, wavesCleared, enemiesKilled, totalEnemies);
    }

    state = state.withCombatIntermission(null);
  }

  const partialKills = state.combat?.enemies.filter((e) => !e.isAlive()).length ?? 0;
  return buildResult('timeout', state, ticks, wavesCleared, enemiesKilled + partialKills, totalEnemies);
}

function buildInitialState(request: SimRequest, party: SimPartyMember[]): GameState {
  const heroes = party.map((spec, i) => buildSimHero(spec, i));
  if (request.slots) return buildAdHocState(heroes, request.slots);
  if (request.phaseId) return buildPhaseState(heroes, request.phaseId, request.waveIndex ?? 0);
  return buildPhaseState(heroes, SENTINEL_PHASE, 0);
}

// ── API pública ────────────────────────────────────────────────────────────────

export function simulateEncounter(request: SimRequest): EncounterSimulationResult {
  const party = (request.party?.length ?? 0) > 0 ? request.party! : FALLBACK_PARTY;
  return runSingleSim(request, buildInitialState(request, party), request.seed);
}

export function simulateEncounterBatch(request: SimRequest, runs: number): BatchSimulationResult {
  const safeRuns = Math.max(1, Math.floor(runs));
  const party = (request.party?.length ?? 0) > 0 ? request.party! : FALLBACK_PARTY;
  const perRun: EncounterSimulationResult[] = [];

  for (let i = 0; i < safeRuns; i++) {
    const seed = request.seed !== undefined ? request.seed + i : undefined;
    perRun.push(runSingleSim(request, buildInitialState(request, party), seed));
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
}
