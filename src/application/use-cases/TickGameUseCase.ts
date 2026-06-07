import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { CombatService } from '../../domain/services/CombatService';
import { mapGameStateToDto, GameStateDto } from '../dto/GameStateDto';

export class TickGameUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly combatService: CombatService,
  ) {}

  async execute(ticks = 1): Promise<GameStateDto> {
    let state = await this.repository.load();

    for (let i = 0; i < ticks; i++) {
      const result = this.combatService.executeTick(state);
      state = result.state;
    }

    await this.repository.save(state);
    return mapGameStateToDto(state);
  }
}
