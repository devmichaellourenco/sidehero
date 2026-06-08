import { GameState } from '../../domain/entities/GameState';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto } from '../dto/GameStateDto';

export class NewGameUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(): Promise<GameStateDto> {
    const initial = GameState.initial();
    await this.repository.save(initial);
    return this.presenter.present(initial);
  }
}
