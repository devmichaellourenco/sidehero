import { MetaProgress } from '../../domain/meta/MetaProgress';
import { IMetaProgressRepository } from '../../domain/repositories/IMetaProgressRepository';
import { chromeStorageGet, chromeStorageSet } from './ChromeStorageLocal';

const STORAGE_KEY = 'side_hero_meta_progress';

export class ChromeStorageMetaRepository implements IMetaProgressRepository {
  async load(): Promise<MetaProgress> {
    const result = await chromeStorageGet(STORAGE_KEY);
    const raw = result[STORAGE_KEY];

    if (!raw || typeof raw !== 'object') {
      return MetaProgress.initial();
    }

    return MetaProgress.restore(raw as Record<string, unknown>);
  }

  async save(progress: MetaProgress): Promise<void> {
    await chromeStorageSet({ [STORAGE_KEY]: progress.toProps() });
  }
}
