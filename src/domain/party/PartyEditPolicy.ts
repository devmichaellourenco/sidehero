import { GameState } from '../entities/GameState';

export class PartyEditPolicy {
  static canEdit(state: GameState): boolean {
    return state.combat === null && state.phaseRun === null;
  }

  static assertEditable(state: GameState): void {
    if (!this.canEdit(state)) {
      throw new Error('Party só pode ser editada fora de combate');
    }
  }
}
