import { describe, expect, it } from 'vitest';
import { GameState } from '../../entities/GameState';
import { Hero } from '../../entities/Hero';
import { Enemy } from '../../entities/Enemy';
import { CombatState } from '../../entities/CombatState';
import { TurnOrderService } from './TurnOrderService';
import { CombatTurnPhase } from './CombatTurnPhase';

describe('CombatTurnPhase', () => {
  const phase = new CombatTurnPhase();
  const turnOrder = new TurnOrderService();

  it('executa um turno de herói com dano em alvo único', () => {
    let sorcerer = Hero.createStarter('s1', 'sorcerer', 'Lyra');
    sorcerer = Hero.restore({
      ...sorcerer.toProps(),
      skillRanks: { arcane_bolt: 1 },
      equippedSkillIds: ['basic_attack', 'arcane_bolt'],
    });

    const enemy = Enemy.forStage(1);
    const combat = CombatState.start([sorcerer], [enemy], turnOrder);
    const state = GameState.restore({
      ...GameState.initial().toProps(),
      heroes: [sorcerer],
      combat,
      stage: 1,
    });

    const result = phase.execute(state);
    const nextEnemy = result.state.combat?.enemies[0];

    expect(nextEnemy?.stats.currentHealth).toBeLessThan(enemy.stats.currentHealth);
    expect(result.floatingEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ target: 'enemy', kind: 'damage', amount: expect.any(Number) }),
      ]),
    );
  });

  it('inimigo usa skill single-target em um herói', () => {
    const knight = Hero.createStarter('k1', 'knight', 'Arthos');
    const enemy = Enemy.forStage(1);
    const combat = CombatState.restore({
      enemies: [enemy.toProps()],
      turnQueue: [{ side: 'enemy', id: enemy.id }],
      turnIndex: 0,
      round: 1,
      skillCooldowns: {},
      statusEffects: {},
    });
    const state = GameState.restore({
      ...GameState.initial().toProps(),
      heroes: [knight],
      combat,
      stage: 1,
    });

    const result = phase.execute(state);
    const damagedKnight = result.state.heroes[0];

    expect(damagedKnight.currentHealth).toBeLessThan(knight.currentHealth);
    expect(result.floatingEvents).toEqual([
      expect.objectContaining({ target: 'hero', targetId: 'k1', kind: 'damage', amount: expect.any(Number) }),
    ]);
  });

  it('sacerdotisa aplica Bênção com efeito persistido no combate', () => {
    let priest = Hero.createStarter('p1', 'priest', 'Elara');
    priest = Hero.restore({
      ...priest.toProps(),
      skillRanks: { blessing: 1 },
      equippedSkillIds: ['basic_attack', 'blessing'],
    });

    const enemy = Enemy.forStage(2);
    const combat = CombatState.restore({
      ...CombatState.start([priest], [enemy], turnOrder).toProps(),
      skillCooldowns: {},
    });
    const state = GameState.restore({
      ...GameState.initial().toProps(),
      heroes: [priest],
      combat,
      stage: 2,
    });

    const result = phase.execute(state);
    const effects = result.state.combat?.statusEffects['hero:p1'] ?? [];

    expect(result.events.join(' ')).toContain('Bênção');
    expect(effects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'buff_attack', skillId: 'blessing' }),
      ]),
    );
  });
});
