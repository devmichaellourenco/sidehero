import { describe, expect, it } from 'vitest';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { buildPersistentWowBanners } from './WowBannerBuilder';
import { mapRewardMomentToWowBanner } from './WowMomentMapper';

const noop = () => undefined;

const handlers = {
  onChestOpen: noop,
  onInventoryOpen: noop,
  onUpgradesOpen: noop,
  onHeroPointsOpen: noop,
  onNewGame: noop,
};

describe('WowStripPresentation', () => {
  it('prioriza pendências acima do progresso de baú', () => {
    const state = {
      pendingChestCount: 1,
      purchasableUpgradeCount: 2,
      heroes: [{ hasUnspentPoints: true } as GameStateDto['heroes'][number]],
      inventory: [],
      activeParty: [],
      chestProgress: { current: 1, target: 3, ratio: 1 / 3 },
    } as GameStateDto;

    const banners = buildPersistentWowBanners(state, handlers);

    expect(banners[0]?.kind).toBe('chest');
    expect(banners.some((entry) => entry.kind === 'upgrade-tree')).toBe(true);
    expect(banners.some((entry) => entry.kind === 'hero-points')).toBe(true);
  });

  it('mapeia loot épico com gear para destaque de raridade', () => {
    const mapped = mapRewardMomentToWowBanner({
      id: 'loot-1',
      kind: 'loot_received',
      tier: 'meso',
      priority: 80,
      title: 'Item épico!',
      tone: 'loot',
      gear: {
        id: 'g1',
        name: 'Armadura',
        rarity: 'epic',
        slot: 'armor',
      } as NonNullable<ReturnType<typeof mapRewardMomentToWowBanner>>['gear'],
    });

    expect(mapped?.kind).toBe('loot-received');
    expect(mapped?.gear?.rarity).toBe('epic');
    expect(mapped?.eyebrow).toBe('Novo Item');
  });
});
