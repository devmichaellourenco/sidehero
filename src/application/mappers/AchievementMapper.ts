import { AchievementUpdate } from '../../domain/achievements/AchievementService';
import { AchievementUpdateDto } from '../dto/AchievementDto';

export function mapAchievementUpdates(updates: readonly AchievementUpdate[]): AchievementUpdateDto[] {
  return updates.map((update) => ({
    id: update.definition.id,
    title: update.definition.title,
    description: update.definition.description,
    previousProgress: update.previousProgress,
    currentProgress: update.currentProgress,
    target: update.definition.target,
    completed: update.currentProgress >= update.definition.target,
    justCompleted: update.justCompleted,
  }));
}
