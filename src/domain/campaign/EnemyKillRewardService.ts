import { Chest } from '../entities/Chest';
import { CombatState } from '../entities/CombatState';
import { Enemy } from '../entities/Enemy';
import { GameState } from '../entities/GameState';
import { MetaBonusScope } from '../meta/MetaBonusScope';
import { BenchXpPolicy } from '../party/BenchXpPolicy';
import { LootService } from '../services/LootService';
import { resolvePhase } from './CampaignCatalog';
import { parsePhaseId } from './CampaignIds';
import { EncounterMeta } from './EncounterResolver';
import { LootDropResult, rollEnemyLoot } from './EnemyLootTable';
import { isNamedChapterBossKill, tryCreateUniqueBossGearDrop } from './UniqueGearLootService';
import {
  grantsPhaseChests,
  isPhaseReplay,
  scalePhaseGold,
  scalePhaseXp,
} from './PhaseLootPolicy';

export interface KillRewardBatchResult {
  state: GameState;
  combat: CombatState;
  events: string[];
}

export class EnemyKillRewardService {
  constructor(private readonly lootService = new LootService()) {}

  applyKillRewards(
    state: GameState,
    combat: CombatState,
    beforeEnemies: Enemy[],
    afterEnemies: Enemy[],
  ): KillRewardBatchResult {
    const meta = combat.encounterMeta;
    if (!meta) {
      return { state, combat, events: [] };
    }

    const newlyDefeated = this.findNewlyDefeated(beforeEnemies, afterEnemies, combat);
    let nextState = state;
    let nextCombat = combat;
    const events: string[] = [];

    for (const enemy of newlyDefeated) {
      const result = this.applySingleKill(nextState, nextCombat, enemy, meta);
      nextState = result.state;
      nextCombat = result.combat;
      events.push(...result.events);
    }

    return { state: nextState, combat: nextCombat, events };
  }

  private findNewlyDefeated(
    beforeEnemies: Enemy[],
    afterEnemies: Enemy[],
    combat: CombatState,
  ): Enemy[] {
    const afterById = new Map(afterEnemies.map((enemy) => [enemy.id, enemy]));

    return beforeEnemies.filter((before) => {
      if (!before.isAlive()) {
        return false;
      }
      if (combat.hasRewardedEnemy(before.id)) {
        return false;
      }
      const after = afterById.get(before.id);
      return after !== undefined && !after.isAlive();
    });
  }

  private applySingleKill(
    state: GameState,
    combat: CombatState,
    enemy: Enemy,
    meta: EncounterMeta,
  ): KillRewardBatchResult {
    const phaseId = meta.phaseId;
    const phase = resolvePhase(phaseId);
    const { mapIndex } = parsePhaseId(phaseId);
    const replay = isPhaseReplay(state.campaignProgress, phaseId);
    const legacyBonuses = MetaBonusScope.get();
    const isPhaseBoss = isNamedChapterBossKill({
      phaseId,
      mapIndex,
      enemyType: enemy.enemyType,
      role: enemy.role,
      isPhaseBoss: meta.isBossWave,
    });
    const firstClearBoss = isPhaseBoss && grantsPhaseChests(state.campaignProgress, phaseId);

    const gold = Math.floor(
      scalePhaseGold(enemy.goldReward, state.campaignProgress, phaseId) *
        legacyBonuses.goldMultiplier,
    );
    const xp = Math.floor(
      scalePhaseXp(enemy.xpReward, state.campaignProgress, phaseId) * legacyBonuses.xpMultiplier,
    );

    let nextState = state;
    const rewardParts: string[] = [];

    if (gold > 0) {
      nextState = nextState.withGold(nextState.gold.add(gold));
      rewardParts.push(replay ? `+${gold} ouro (50%)` : `+${gold} ouro`);
    }

    if (xp > 0) {
      const activeUpdates = nextState.activeHeroes().map((hero) => hero.gainExperience(xp));
      const benchXp = BenchXpPolicy.benchExperience(xp);
      const benchUpdates =
        benchXp > 0 ? nextState.benchHeroes().map((hero) => hero.gainExperience(benchXp)) : [];
      nextState = nextState.withRosterHeroes([...activeUpdates, ...benchUpdates]);
      rewardParts.push(replay ? `+${xp} XP (75%)` : `+${xp} XP`);
    }

    const lootDrop = rollEnemyLoot({
      mapIndex,
      enemyType: enemy.enemyType,
      role: enemy.role,
      isPhaseBoss: meta.isBossWave && enemy.role === 'boss',
      firstClearBoss,
      seasonFinale: phase?.seasonFinale ?? false,
    });

    if (lootDrop) {
      const lootApplied = this.applyLootDrop(
        nextState,
        lootDrop,
        phase?.difficultyTier ?? enemy.stage,
      );
      nextState = lootApplied.state;
      rewardParts.push(lootApplied.label);
    }

    const uniqueGear = tryCreateUniqueBossGearDrop(
      nextState,
      {
        phaseId,
        mapIndex,
        enemyType: enemy.enemyType,
        role: enemy.role,
        isPhaseBoss,
      },
      this.lootService,
    );
    if (uniqueGear) {
      nextState = nextState.withInventory([...nextState.inventory, uniqueGear]);
      rewardParts.push(uniqueGear.name);
    }

    const replayTag = replay && rewardParts.length > 0 ? '' : '';
    const message =
      rewardParts.length > 0
        ? `${enemy.name} derrotado! ${rewardParts.join(' · ')}${replayTag}`
        : `${enemy.name} derrotado!`;

    nextState = nextState.addLog(message);

    return {
      state: nextState,
      combat: combat.withRewardedEnemy(enemy.id),
      events: rewardParts,
    };
  }

  private applyLootDrop(
    state: GameState,
    drop: LootDropResult,
    difficultyTier: number,
  ): { state: GameState; label: string } {
    if (drop.kind === 'gear') {
      const gear = this.lootService.generateGear(difficultyTier);
      return {
        state: state.withInventory([...state.inventory, gear]),
        label: gear.name,
      };
    }

    if (!drop.chestType) {
      return { state, label: 'baú' };
    }

    const chest = Chest.create(difficultyTier, drop.chestType);
    return {
      state: state.withChests([...state.chests, chest]),
      label: drop.chestType === 'act_boss' ? 'baú de ato' : 'baú',
    };
  }
}
