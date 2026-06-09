import { GameStateDto } from '../../application/dto/GameStateDto';
import { resolvePhase } from '../../domain/campaign/CampaignCatalog';

export interface HeroVictoryReward {
  heroId: string;
  name: string;
  leveledUp: boolean;
  newLevel?: number;
}

export interface BattleVictoryPayload {
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
    clearedPhaseId,
    clearedPhaseName,
    nextPhaseId: nextPhaseName ? nextPhaseId : null,
    nextPhaseName,
    goldGained,
    xpGained,
    heroRewards,
    chestDropped: chestCount > 0,
    chestCount,
    tierReached,
    seasonCompleted: seasonJustCompleted,
  };
}
