import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { mapGameStateToDto, GameStateDto } from '../dto/GameStateDto';

export class GetGameStateUseCase {
  constructor(private readonly repository: IGameStateRepository) {}

  async execute(): Promise<GameStateDto> {
    const state = await this.repository.load();
    return mapGameStateToDto(state);
  }
}
