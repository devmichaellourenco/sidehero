import { IGameStateRepository } from '../../domain/repositories/IGameStateRepository';
import { LootService } from '../../domain/services/LootService';
import { mapGameStateToDto, mapGearToDto, GameStateDto, GearDto } from '../dto/GameStateDto';

export interface OpenAllChestsResult {
  state: GameStateDto;
  openedGears: GearDto[];
}

export class OpenAllChestsUseCase {
  constructor(
    private readonly repository: IGameStateRepository,
    private readonly lootService: LootService,
  ) {}

  async execute(): Promise<OpenAllChestsResult> {
    let state = await this.repository.load();
    const pendingChests = state.chests.filter((chest) => !chest.opened);

    if (pendingChests.length === 0) {
      return {
        state: mapGameStateToDto(state),
        openedGears: [],
      };
    }

    const openedGears: GearDto[] = [];
    let updatedChests = [...state.chests];
    let inventory = [...state.inventory];
    const logs: string[] = [];

    for (const chest of pendingChests) {
      const loot = this.lootService.generateGear(chest.stageEarned);
      updatedChests = updatedChests.map((entry) =>
        entry.id === chest.id ? entry.open(loot) : entry,
      );
      inventory = [...inventory, loot];
      openedGears.push(mapGearToDto(loot));
      logs.push(loot.name);
    }

    state = state
      .withChests(updatedChests)
      .withInventory(inventory)
      .addLog(`Abriu ${openedGears.length} baús: ${logs.join(', ')}`);

    await this.repository.save(state);

    return {
      state: mapGameStateToDto(state),
      openedGears,
    };
  }
}
