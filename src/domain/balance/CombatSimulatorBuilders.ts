/**
 * Helpers de construção de estado para o CombatEncounterSimulator.
 * Separa a lógica de criação de heróis, GameState e contagem de inimigos.
 */
import { Hero } from '../entities/Hero';
import { GameState } from '../entities/GameState';
import { CombatState } from '../entities/CombatState';
import { CampaignProgress } from '../campaign/CampaignProgress';
import { ActionTimerService } from '../services/combat/ActionTimerService';
import { getHeroCombatIdentity } from '../combat/HeroCombatIdentityCatalog';
import { getHeroBaseStats } from '../combat/HeroBaseStatsCatalog';
import { Experience } from '../value-objects/Experience';
import { STARTER_HERO_PROGRESSION } from '../entities/HeroProgression';
import { resolvePhase } from '../campaign/CampaignCatalog';
import { createEnemyFromSlot } from '../campaign/WaveEnemyFactory';
import { emptyBattleSessionStats } from '../combat/BattleSessionStats';
import { applySimHeroLoadout } from './SimHeroLoadout';
import type { PhaseId } from '../campaign/CampaignIds';
import type { HeroClass } from '../entities/HeroClass';
import type { SimPartyMember, SimAdHocSlot, SimRequest } from './CombatEncounterSimulator';
import type { EnemyType } from '../entities/EnemyType';

export const SENTINEL_PHASE: PhaseId = '1-1';

export const FALLBACK_PARTY: SimPartyMember[] = [
  { heroClass: 'sorcerer', level: 10 },
  { heroClass: 'knight', level: 10 },
  { heroClass: 'priest', level: 10 },
];

/**
 * Tier usado para escolher gear e perfil de referência: a fase manda, e no encontro
 * ad-hoc o maior level dos slots serve de proxy.
 */
export function resolveSimTier(request: SimRequest): number {
  if (request.slots?.length) {
    return Math.max(1, ...request.slots.map((slot) => slot.level ?? 1));
  }
  return resolvePhase(request.phaseId ?? SENTINEL_PHASE)?.difficultyTier ?? 1;
}

export function buildSimHero(spec: SimPartyMember, index: number, tier = 1): Hero {
  const heroClass = spec.heroClass as HeroClass;
  const level = Math.max(1, Math.floor(spec.level));
  const identity = getHeroCombatIdentity(heroClass);
  const base = getHeroBaseStats(heroClass);
  const baseAttack = base.attack + (level - 1) * identity.levelUpAttackGain;
  const baseDefense = base.defense + (level - 1) * identity.levelUpDefenseGain;
  const baseMaxHealth = base.health + (level - 1) * identity.levelUpHealthGain;
  const hero = Hero.restore({
    id: `sim-hero-${index}`,
    name: `${heroClass} Lv${level}`,
    heroClass,
    baseAttack,
    baseDefense,
    baseMaxHealth,
    currentHealth: baseMaxHealth,
    experience: Experience.restore(0, 0, level),
    equipment: {},
    ...STARTER_HERO_PROGRESSION,
  });

  return applySimHeroLoadout(hero, spec, tier);
}

function baseStateProps(heroes: Hero[], stage: number) {
  return {
    roster: heroes,
    activePartyIds: heroes.map((h) => h.id),
    campaignProgress: CampaignProgress.initial().toProps(),
    stage,
    gold: 0,
    chests: [],
    inventory: [],
    stash: [],
    battleLog: [],
    totalBattlesWon: 0,
    totalChestsOpened: 0,
    lastTickAt: 0,
    shopRefreshSeed: 0,
    shopStocks: {},
    upgradeLevels: {},
    shopRefreshUses: 0,
    loadoutEditOpen: false,
    phaseRestartOnResume: false,
    combatIntermission: null,
    battlePaused: false,
    battleSessionStats: emptyBattleSessionStats(),
  };
}

export function buildPhaseState(heroes: Hero[], phaseId: PhaseId, waveIndex: number): GameState {
  const phase = resolvePhase(phaseId);
  return GameState.restore({
    ...baseStateProps(heroes, phase?.difficultyTier ?? 1),
    phaseRun: { phaseId, waveIndex },
    combat: null,
  });
}

export function buildAdHocState(heroes: Hero[], slots: SimAdHocSlot[]): GameState {
  const difficultyTier = Math.max(1, ...slots.map((s) => s.level ?? 1));
  const actionTimers = new ActionTimerService();
  let slotIdx = 0;
  const enemies = slots.flatMap((slot) => {
    const base = slotIdx;
    slotIdx += slot.count;
    return Array.from({ length: slot.count }, (_, copy) =>
      createEnemyFromSlot(
        { enemyType: slot.enemyType as EnemyType, role: slot.role, count: slot.count, level: slot.level },
        { phaseId: SENTINEL_PHASE, waveIndex: 0, difficultyTier, isBossWave: true, statMultiplier: 1, milestoneGoldScale: 1, slotIndex: base + copy, goldMultiplier: 1 },
      ),
    );
  });
  const encounterMeta = { phaseId: SENTINEL_PHASE, waveIndex: 0, waveCount: 1, isBossWave: true };
  const combat = CombatState.start(heroes, enemies, actionTimers, encounterMeta);
  return GameState.restore({
    ...baseStateProps(heroes, difficultyTier),
    phaseRun: { phaseId: SENTINEL_PHASE, waveIndex: 0 },
    combat,
  });
}

export function countTotalEnemies(request: SimRequest): number {
  if (request.slots) return request.slots.reduce((s, sl) => s + sl.count, 0);
  if (!request.phaseId) return 0;
  const phase = resolvePhase(request.phaseId);
  if (!phase) return 0;
  const waves = request.waveIndex !== undefined
    ? [phase.waves[request.waveIndex]].filter(Boolean)
    : phase.waves;
  return waves.reduce((sum, w) => sum + w.slots.reduce((s, sl) => s + sl.count, 0), 0);
}
