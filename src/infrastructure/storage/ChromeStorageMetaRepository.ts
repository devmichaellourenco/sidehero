import { MetaProgress } from '../../domain/meta/MetaProgress';
import { IMetaProgressRepository } from '../../domain/repositories/IMetaProgressRepository';

const STORAGE_KEY = 'side_hero_meta_progress';

export class ChromeStorageMetaRepository implements IMetaProgressRepository {
  async load(): Promise<MetaProgress> {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const raw = result[STORAGE_KEY];

    if (!raw || typeof raw !== 'object') {
      return MetaProgress.initial();
    }

    return MetaProgress.restore(raw as Record<string, unknown>);
  }

  async save(progress: MetaProgress): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: progress.toProps() });
  }
}
