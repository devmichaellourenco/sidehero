import { describe, expect, it } from 'vitest';
import { buildPhaseId } from '../../campaign/CampaignIds';
import { PhaseRun } from '../../campaign/PhaseRun';
import { GameState } from '../../entities/GameState';
import { Hero } from '../../entities/Hero';
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

describe('CombatTurnPhase', () => {
  const phase = new CombatTurnPhase();

  it('inicia fase 1-1 no primeiro tick', () => {
    const sorcerer = Hero.createStarter('s1', 'sorcerer', 'Lyra');
    const state = stateWithPhase(buildPhaseId(1, 1), [sorcerer]);

    const result = phase.execute(state);

    expect(result.state.combat?.enemies.length).toBeGreaterThan(0);
    expect(result.state.combat?.encounterMeta?.phaseId).toBe(buildPhaseId(1, 1));
    expect(result.state.phaseRun?.waveIndex).toBe(0);
  });

  it('reinicia fase com cura completa ao perder', () => {
    let knight = Hero.createStarter('k1', 'knight', 'Arthos');
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
});
