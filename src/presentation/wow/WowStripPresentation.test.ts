import { describe, expect, it } from 'vitest';
import { isCelebrationMoment } from './WowCelebrationPolicy';
import { mapRewardMomentToWowBanner } from './WowMomentMapper';

describe('WowCelebrationPolicy', () => {
  it('celebra momentos macro e meso relevantes', () => {
    expect(
      isCelebrationMoment({
        id: 'lvl-1',
        kind: 'level_up',
        tier: 'meso',
        priority: 35,
        title: 'Lv.5',
        tone: 'level',
      }),
    ).toBe(true);

    expect(
      isCelebrationMoment({
        id: 'idle-1',
        kind: 'idle_report',
        tier: 'macro',
        priority: 65,
        title: 'Progresso Offline',
        tone: 'idle',
      }),
    ).toBe(true);
  });

  it('ignora eventos rotineiros', () => {
    expect(
      isCelebrationMoment({
        id: 'shop-1',
        kind: 'shop_purchase',
        tier: 'meso',
        priority: 45,
        title: 'Espada',
        tone: 'loot',
      }),
    ).toBe(false);

    expect(
      isCelebrationMoment({
        id: 'chest-1',
        kind: 'chest_available',
        tier: 'meso',
        priority: 30,
        title: 'Baú',
        tone: 'chest',
      }),
    ).toBe(false);
  });
});

describe('WowStripPresentation', () => {
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
    expect(mapped?.cta).toEqual({ label: 'Entendi', action: 'dismiss' });
  });
});
