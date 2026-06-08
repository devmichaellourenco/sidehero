import { ICombatService } from '../../domain/services/ICombatService';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { GameStateDto } from '../dto/GameStateDto';

export class TickGameUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly combatService: ICombatService,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(ticks = 1): Promise<GameStateDto> {
    let state = await this.repository.load();

    for (let i = 0; i < ticks; i++) {
      const result = this.combatService.executeTick(state);
      state = result.state;
    }

    await this.repository.save(state);
    return this.presenter.present(state);
  }
}
