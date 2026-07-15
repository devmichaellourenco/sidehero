import { AchievementProgress } from '../../domain/achievements/AchievementProgress';
import { IAchievementProgressRepository } from '../../domain/repositories/IAchievementProgressRepository';

const STORAGE_KEY = 'side_hero_achievements';

export class ChromeStorageAchievementRepository implements IAchievementProgressRepository {
  async load(): Promise<AchievementProgress> {
    const raw = await chrome.storage.local.get(STORAGE_KEY);
    const payload = raw[STORAGE_KEY];
    if (!payload || typeof payload !== 'object') {
      return AchievementProgress.initial();
    }
    return AchievementProgress.restore(payload as Parameters<typeof AchievementProgress.restore>[0]);
  }

  async save(progress: AchievementProgress): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: progress.toProps() });
  }
}
