import { GameState } from '../entities/GameState';

export interface CombatTickResult {
  state: GameState;
  events: string[];
}

export interface ICombatService {
  executeTick(state: GameState): CombatTickResult;
}
