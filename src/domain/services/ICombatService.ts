import { GameState } from '../entities/GameState';
import { CombatFloatingEvent } from './combat/CombatFloatingEvent';

export interface CombatTickResult {
  state: GameState;
  events: string[];
  floatingEvents: CombatFloatingEvent[];
}

export interface ICombatService {
  executeTick(state: GameState): CombatTickResult;
}
