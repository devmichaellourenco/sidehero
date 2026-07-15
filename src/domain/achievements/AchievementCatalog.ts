import { AchievementDefinition } from './AchievementDefinition';

export const HERO_OUT_OF_THE_SIDE_ID = 'hero_out_of_the_side';

const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: HERO_OUT_OF_THE_SIDE_ID,
    title: 'Hero - Out of the Side',
    description: 'Clear stage 1-1 for the first time.',
    target: 1,
    event: 'phase_cleared',
    phaseId: '1-1',
  },
];

const BY_ID = new Map(ACHIEVEMENTS.map((entry) => [entry.id, entry]));

export function listAchievements(): readonly AchievementDefinition[] {
  return ACHIEVEMENTS;
}

export function getAchievementById(id: string): AchievementDefinition | undefined {
  return BY_ID.get(id);
}

export function listAchievementsForPhaseCleared(phaseId: string): AchievementDefinition[] {
  return ACHIEVEMENTS.filter(
    (entry) => entry.event === 'phase_cleared' && entry.phaseId === phaseId,
  );
}
