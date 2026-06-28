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

function baseState(overrides: Partial<GameStateDto> = {}): GameStateDto {
  return {
    pendingChestCount: 0,
    purchasableUpgradeCount: 0,
    seasonCompleted: false,
    chestProgress: { current: 1, target: 3, ratio: 1 / 3 },
    heroes: [],
    inventory: [],
    ...overrides,
  } as GameStateDto;
}

describe('WowBannerBuilder', () => {
  it('sempre retorna ao menos o banner de progresso do baú', () => {
    const banners = buildPersistentWowBanners(baseState(), handlers);
    expect(banners.length).toBeGreaterThan(0);
    expect(banners.some((banner) => banner.kind === 'chest-progress')).toBe(true);
  });

  it('prioriza baú pendente acima do fallback', () => {
    const banners = buildPersistentWowBanners(baseState({ pendingChestCount: 2 }), handlers);
    expect(banners[0].kind).toBe('chest');
  });
});

describe('WowMomentMapper', () => {
  it('ignora fase concluída para não duplicar Clear na battle strip', () => {
    const banner = mapRewardMomentToWowBanner({
      id: 'x',
      kind: 'phase_cleared',
      tier: 'meso',
      priority: 50,
      title: 'Fase 1',
      tone: 'victory',
    });

    expect(banner).toBeNull();
  });
});
