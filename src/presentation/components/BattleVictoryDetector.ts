import { GameStateDto } from '../../application/dto/GameStateDto';
import { resolvePhase } from '../../domain/campaign/CampaignCatalog';

export type BattleVictoryVariant = 'wave-clear' | 'boss-approach' | 'phase-clear';

export interface HeroVictoryReward {
  heroId: string;
  name: string;
  leveledUp: boolean;
  newLevel?: number;
}

export interface BattleVictoryPayload {
  variant: BattleVictoryVariant;
  clearedPhaseId: string;
  clearedPhaseName: string;
  nextPhaseId: string | null;
  nextPhaseName: string | null;
  goldGained: number;
  xpGained: number;
  heroRewards: HeroVictoryReward[];
  chestDropped: boolean;
  chestCount: number;
  tierReached: number | null;
  seasonCompleted: boolean;
}

export function detectBattleVictory(
  previous: GameStateDto,
  next: GameStateDto,
): BattleVictoryPayload | null {
  return detectPhaseVictory(previous, next) ?? detectWaveClearVictory(previous, next);
}

function detectWaveClearVictory(
  previous: GameStateDto,
  next: GameStateDto,
): BattleVictoryPayload | null {
  const previousRun = previous.phaseRun;
  const nextRun = next.phaseRun;

  if (!previousRun || !nextRun) return null;
  if (previousRun.phaseId !== nextRun.phaseId) return null;
  if (nextRun.waveIndex <= previousRun.waveIndex) return null;
  if (previousRun.isBossWave) return null;

  return buildVictoryPayload(previous, next, {
    variant: nextRun.isBossWave ? 'boss-approach' : 'wave-clear',
    clearedPhaseId: previousRun.phaseId,
    clearedPhaseName: previousRun.displayName,
    nextPhaseId: null,
    nextPhaseName: null,
    seasonCompleted: false,
  });
}

function detectPhaseVictory(
  previous: GameStateDto,
  next: GameStateDto,
): BattleVictoryPayload | null {
  const wasBossWave = previous.phaseRun?.isBossWave === true;
  const clearedNow = next.campaignProgress.clearedPhaseIds.filter(
    (phaseId) => !previous.campaignProgress.clearedPhaseIds.includes(phaseId),
  );
  const seasonJustCompleted = !previous.seasonCompleted && next.seasonCompleted;

  if (!wasBossWave || (clearedNow.length === 0 && !seasonJustCompleted)) {
    return null;
  }

  const clearedPhaseId =
    clearedNow[clearedNow.length - 1] ?? previous.phaseRun?.phaseId ?? next.phaseLabel;
  const clearedPhase = resolvePhase(clearedPhaseId);
  const clearedPhaseName =
    previous.phaseRun?.displayName ?? clearedPhase?.displayName ?? clearedPhaseId;

  const nextPhaseId = seasonJustCompleted ? null : next.campaignProgress.selectedPhaseId;
  const nextPhase = nextPhaseId ? resolvePhase(nextPhaseId) : null;
  const nextPhaseName =
    nextPhaseId && nextPhaseId !== clearedPhaseId
      ? (nextPhase?.displayName ?? nextPhaseId)
      : null;

  return buildVictoryPayload(previous, next, {
    variant: 'phase-clear',
    clearedPhaseId,
    clearedPhaseName,
    nextPhaseId: nextPhaseName ? nextPhaseId : null,
    nextPhaseName,
    seasonCompleted: seasonJustCompleted,
  });
}

function buildVictoryPayload(
  previous: GameStateDto,
  next: GameStateDto,
  context: {
    variant: BattleVictoryVariant;
    clearedPhaseId: string;
    clearedPhaseName: string;
    nextPhaseId: string | null;
    nextPhaseName: string | null;
    seasonCompleted: boolean;
  },
): BattleVictoryPayload {
  const goldGained = Math.max(0, next.gold - previous.gold);
  const xpGained = previous.enemies.reduce((sum, enemy) => sum + enemy.xpReward, 0);
  const chestCount = Math.max(0, next.pendingChestCount - previous.pendingChestCount);
  const tierReached = next.stage > previous.stage ? next.stage : null;

  const heroRewards = next.heroes
    .map((hero) => {
      const oldHero = previous.heroes.find((entry) => entry.id === hero.id);
      if (!oldHero || hero.level <= oldHero.level) {
        return null;
      }

      return {
        heroId: hero.id,
        name: hero.name,
        leveledUp: true,
        newLevel: hero.level,
      };
    })
    .filter((entry): entry is HeroVictoryReward => entry !== null);

  return {
    variant: context.variant,
    clearedPhaseId: context.clearedPhaseId,
    clearedPhaseName: context.clearedPhaseName,
    nextPhaseId: context.nextPhaseId,
    nextPhaseName: context.nextPhaseName,
    goldGained,
    xpGained,
    heroRewards,
    chestDropped: chestCount > 0,
    chestCount,
    tierReached,
    seasonCompleted: context.seasonCompleted,
  };
}
