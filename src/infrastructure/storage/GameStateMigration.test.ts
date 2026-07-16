import { describe, expect, it } from 'vitest';
import { buildPhaseId } from '../../domain/campaign/CampaignIds';
import { migrateEnemy, migrateGear, migrateHero } from './GameStateMigration';
import { IGNUS_IX_TEMPLATE_ID } from '../../domain/gear/UniqueGearCatalog';
import { getGearCatalogItem } from '../../domain/gear/GearItemCatalog';

describe('migrateGear', () => {
  it('reespelha stats atuais do catálogo preservando o id da instância', () => {
    const catalog = getGearCatalogItem('arcanist_staff')!;
    const migrated = migrateGear({
      id: 'inst-arcanist',
      catalogItemId: 'arcanist_staff',
      name: 'Cajado antigo',
      templateId: 'arcanist_staff',
      slot: 'weapon',
      rarity: 'rare',
      attackBonus: 999,
      defenseBonus: 0,
      healthBonus: 0,
      castSpeedBonus: 0,
      requirements: { minLevel: 1, str: 99 },
    });

    expect(migrated.id).toBe('inst-arcanist');
    expect(migrated.attackBonus).toBe(catalog.attackBonus);
    expect(migrated.castSpeedBonus).toBe(catalog.castSpeedBonus);
    expect(migrated.allElementalDamageBonus).toBe(catalog.allElementalDamageBonus);
    expect(migrated.requirements).toEqual(catalog.requirements);
  });

  it('migra equipamento equipado no herói com stats do catálogo', () => {
    const catalog = getGearCatalogItem('oracle_staff')!;
    const hero = migrateHero({
      id: 'h1',
      name: 'Ora',
      heroClass: 'priest',
      equipment: {
        weapon: {
          id: 'eq-oracle',
          catalogItemId: 'oracle_staff',
          name: 'Oráculo velho',
          templateId: 'oracle_staff',
          slot: 'weapon',
          rarity: 'legendary',
          attackBonus: 1,
          defenseBonus: 0,
          healthBonus: 0,
        },
      },
    });

    const weapon = hero.toProps().equipment?.weapon;
    expect(weapon?.id).toBe('eq-oracle');
    expect(weapon?.cooldownReductionBonus).toBe(catalog.cooldownReductionBonus);
    expect(weapon?.castSpeedBonus).toBe(catalog.castSpeedBonus);
  });
});

describe('migrateEnemy', () => {
  it('preserva role de boss ao recarregar combate do storage', () => {
    const migrated = migrateEnemy({
      id: 'boss-1',
      name: 'Saci',
      enemyType: 'saci',
      stage: 50,
      role: 'boss',
      stats: {
        attack: 20,
        defense: 8,
        maxHealth: 1,
        currentHealth: 1,
      },
      goldReward: 100,
      xpReward: 50,
    });

    expect(migrated?.role).toBe('boss');
    expect(migrated?.enemyType).toBe('saci');
  });
});

describe('migrateHero — progressão', () => {
  it('funde unspentAscensionPoints antigos em unspentImprovementPoints', () => {
    const hero = migrateHero({
      id: 'h1',
      name: 'Galneon',
      heroClass: 'knight',
      unspentImprovementPoints: 3,
      unspentAscensionPoints: 2,
      ascensionId: 'knight_military_guerreiro',
    });

    expect(hero.toProps().unspentImprovementPoints).toBe(5);
    expect(hero.toProps().unspentAscensionPoints).toBe(0);
    expect(hero.toProps().ascensionId).toBe('knight_military_guerreiro');
  });
});

describe('PhaseCombatHandlers — lendários de marco', () => {
  it('concede Ignus Ix ao concluir fase 1-50', async () => {
    const { PhaseCombatHandlers } = await import('../../domain/campaign/PhaseCombatHandlers');
    const { EncounterResolver } = await import('../../domain/campaign/EncounterResolver');
    const { GameState } = await import('../../domain/entities/GameState');
    const { PhaseRun } = await import('../../domain/campaign/PhaseRun');

    const handlers = new PhaseCombatHandlers();
    const resolver = new EncounterResolver();
    const phaseId = buildPhaseId(1, 50);
    const phaseRun = PhaseRun.start(phaseId);
    let state = GameState.initial()
      .withCampaignProgress(GameState.initial().campaignProgress.withSelectedPhase(phaseId))
      .withPhaseRun(phaseRun);
    state = handlers.startPhaseRun(state, phaseRun).state;

    const bossWave = resolver.resolve(phaseId, 3);
    const victory = handlers.onBossDefeated(state, bossWave!.enemies, state.heroes, bossWave!.meta);

    expect(victory.state.inventory.some((gear) => gear.templateId === IGNUS_IX_TEMPLATE_ID)).toBe(
      true,
    );
  });
});
