import { ICombatService } from '../../domain/services/ICombatService';
import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { GameStatePresenter } from '../presenters/GameStatePresenter';
import { CombatFloatingEventDto } from '../dto/CombatFloatingEventDto';
import { GameStateDto } from '../dto/GameStateDto';

export interface TickGameResult {
  state: GameStateDto;
  combatFloats: CombatFloatingEventDto[];
}

export class TickGameUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly combatService: ICombatService,
    private readonly presenter: GameStatePresenter,
  ) {}

  async execute(ticks = 1): Promise<TickGameResult> {
    let state = await this.repository.load();
    const combatFloats: CombatFloatingEventDto[] = [];

    for (let i = 0; i < ticks; i++) {
      const result = this.combatService.executeTick(state);
      state = result.state;
      combatFloats.push(...result.floatingEvents);
    }

    await this.repository.save(state);
    return {
      state: this.presenter.present(state),
      combatFloats,
    };
  }
}
