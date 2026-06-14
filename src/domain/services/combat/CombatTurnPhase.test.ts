import { describe, expect, it } from 'vitest';
import { buildPhaseId } from '../../campaign/CampaignIds';
import { PhaseCombatHandlers } from '../../campaign/PhaseCombatHandlers';
import { PhaseRun } from '../../campaign/PhaseRun';
import { EncounterResolver } from '../../campaign/EncounterResolver';
import { CombatState } from '../../entities/CombatState';
import { Enemy } from '../../entities/Enemy';
import { GameState } from '../../entities/GameState';
import { Hero } from '../../entities/Hero';
import { Stats } from '../../value-objects/Stats';
import { ActionTimerService } from './ActionTimerService';
import { CombatTurnPhase } from './CombatTurnPhase';

function stateWithPhase(phaseId: string, heroes: Hero[]): GameState {
  return GameState.restore({
    ...GameState.initial().toProps(),
    heroes,
    campaignProgress: {
      ...GameState.initial().campaignProgress.toProps(),
      selectedPhaseId: phaseId,
    },
    phaseRun: PhaseRun.start(phaseId).toProps(),
    combat: null,
  });
}

function createCombat(
  heroes: Hero[],
  enemies: Enemy[],
  encounterMeta: NonNullable<CombatState['encounterMeta']>,
): CombatState {
  const timers = new ActionTimerService().createInitial(heroes, enemies);

  return CombatState.restore({
    enemies: enemies.map((enemy) => enemy.toProps()),
    actionTimers: timers,
    combatTime: 0,
    skillCooldowns: {},
    statusEffects: {},
    encounterMeta,
  });
}

describe('CombatTurnPhase', () => {
  const phase = new CombatTurnPhase();

  it('inicia fase 1-1 no primeiro tick', () => {
    const sorcerer = Hero.createStarter('s1', 'sorcerer', 'Nix');
    const state = stateWithPhase(buildPhaseId(1, 1), [sorcerer]);

    const result = phase.execute(state);

    expect(result.state.combat?.enemies.length).toBeGreaterThan(0);
    expect(result.state.combat?.encounterMeta?.phaseId).toBe(buildPhaseId(1, 1));
    expect(result.state.phaseRun?.waveIndex).toBe(0);
  });

  it('reinicia fase com cura completa ao perder', () => {
    let knight = Hero.createStarter('k1', 'knight', 'Galneon');
    knight = Hero.restore({ ...knight.toProps(), currentHealth: 1 });

    let state = stateWithPhase(buildPhaseId(1, 1), [knight]);

    for (let tick = 0; tick < 40; tick++) {
      const result = phase.execute(state);
      state = result.state;
      if (result.events.some((event) => event.includes('Reiniciando'))) break;
    }

    expect(state.heroes[0].currentHealth).toBe(state.heroes[0].maxHealth);
    expect(state.phaseRun?.waveIndex).toBe(0);
  });

  it('ignora herói derrotado na timeline e deixa outro combatente agir', () => {
    const knight = Hero.createStarter('k1', 'knight', 'Galneon');
    const priest = Hero.createStarter('p1', 'priest', 'Elara');
    const deadKnight = Hero.restore({ ...knight.toProps(), currentHealth: 0 });
    const enemy = Enemy.restore({
      id: 'e1',
      name: 'Slime',
      enemyType: 'giant_rat',
      stage: 1,
      stats: Stats.fromBase(8, 2, 40),
      goldReward: 5,
      xpReward: 10,
    });

    const combat = createCombat([deadKnight, priest], [enemy], {
      phaseId: buildPhaseId(1, 1),
      waveIndex: 0,
      waveCount: 1,
      isBossWave: true,
    });

    let state = GameState.restore({
      ...GameState.initial().toProps(),
      heroes: [deadKnight, priest],
      campaignProgress: {
        ...GameState.initial().campaignProgress.toProps(),
        selectedPhaseId: buildPhaseId(1, 1),
      },
      phaseRun: PhaseRun.start(buildPhaseId(1, 1)).toProps(),
      combat,
    });

    const beforeActor = state.combat?.peekNextActor([deadKnight, priest], [enemy]);
    expect(beforeActor?.id).not.toBe('k1');

    const result = phase.execute(state);
    const eventLog = result.events.join(' ');

    expect(eventLog).not.toContain('Galneon');
    expect(result.events.length).toBeGreaterThan(0);
  });

  it('deixa o inimigo agir quando só restam heróis derrotados', () => {
    const knight = Hero.createStarter('k1', 'knight', 'Galneon');
    const deadKnight = Hero.restore({ ...knight.toProps(), currentHealth: 0 });
    const enemy = Enemy.restore({
      id: 'e1',
      name: 'Slime',
      enemyType: 'giant_rat',
      stage: 1,
      stats: Stats.fromBase(8, 2, 40),
      goldReward: 5,
      xpReward: 10,
    });

    const combat = createCombat([deadKnight], [enemy], {
      phaseId: buildPhaseId(1, 1),
      waveIndex: 0,
      waveCount: 1,
      isBossWave: true,
    });

    let state = GameState.restore({
      ...GameState.initial().toProps(),
      heroes: [deadKnight],
      campaignProgress: {
        ...GameState.initial().campaignProgress.toProps(),
        selectedPhaseId: buildPhaseId(1, 1),
      },
      phaseRun: PhaseRun.start(buildPhaseId(1, 1)).toProps(),
      combat,
    });

    const result = phase.execute(state);
    const eventLog = result.events.join(' ');

    expect(eventLog.includes('Slime') || eventLog.includes('Reiniciando')).toBe(true);
    expect(result.events.length).toBeGreaterThan(0);
  });

  it('inicia fase 1-3 após derrotar boss da 1-2 no tick seguinte', () => {
    const phaseHandlers = new PhaseCombatHandlers();
    const resolver = new EncounterResolver();
    const phaseId = buildPhaseId(1, 2);
    const phaseRun = PhaseRun.start(phaseId).advanceWave();

    let state = GameState.restore({
      ...GameState.initial().toProps(),
      campaignProgress: {
        ...GameState.initial().campaignProgress.toProps(),
        selectedPhaseId: phaseId,
      },
      phaseRun: phaseRun.toProps(),
      combat: null,
    });

    state = phaseHandlers.startPhaseRun(state, phaseRun).state;

    const boss = resolver.resolve(phaseId, 1);
    expect(boss).not.toBeNull();

    const victory = phaseHandlers.onBossDefeated(
      state,
      boss!.enemies,
      state.heroes,
      boss!.meta,
    );
    state = victory.state;

    expect(state.campaignProgress.selectedPhaseId).toBe(buildPhaseId(1, 3));
    expect(state.phaseRun).toBeNull();
    expect(state.loadoutEditOpen).toBe(false);

    const nextTick = phase.execute(state);

    expect(nextTick.state.phaseRun?.phaseId).toBe(buildPhaseId(1, 3));
    expect(nextTick.state.phaseRun?.waveIndex).toBe(0);
    expect(nextTick.state.combat?.encounterMeta?.phaseId).toBe(buildPhaseId(1, 3));
  });
});
