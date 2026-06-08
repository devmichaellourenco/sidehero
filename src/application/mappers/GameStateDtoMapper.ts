import { GameState } from '../../domain/entities/GameState';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto } from '../dto/GameStateDto';

/** @deprecated Prefer GameStatePresenter.present() directly */
export function mapPersistedGameState(
  state: GameState,
  presenter: GameStatePresenter,
): GameStateDto {
  return presenter.present(state);
}
