import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { LootService } from '../../domain/services/LootService';
import { mapGameStateToDto, GameStateDto } from '../dto/GameStateDto';

export class OpenChestUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly lootService: LootService,
  ) {}

  async execute(chestId: string): Promise<GameStateDto> {
    const state = await this.repository.load();
    const chest = state.chests.find((c) => c.id === chestId);

    if (!chest) {
      throw new Error('Baú não encontrado');
    }

    if (chest.opened) {
      throw new Error('Baú já foi aberto');
    }

    const loot = this.lootService.generateGear(chest.stageEarned);
    const updatedChests = state.chests.map((c) =>
      c.id === chestId ? c.open(loot) : c,
    );

    const nextState = state
      .withChests(updatedChests)
      .withInventory([...state.inventory, loot])
      .addLog(`Abriu baú: ${loot.name}`);

    await this.repository.save(nextState);
    return mapGameStateToDto(nextState);
  }
}
