import { CombatService } from '../domain/services/CombatService';
import { LootService } from '../domain/services/LootService';
import { IGameStateRepository } from '../domain/repositories/IGameStateRepository';
import { EquipGearUseCase } from './use-cases/EquipGearUseCase';
import { GetGameStateUseCase } from './use-cases/GetGameStateUseCase';
import { OpenChestUseCase } from './use-cases/OpenChestUseCase';
import { TickGameUseCase } from './use-cases/TickGameUseCase';

export class GameApplication {
  readonly getState: GetGameStateUseCase;
  readonly tick: TickGameUseCase;
  readonly openChest: OpenChestUseCase;
  readonly equipGear: EquipGearUseCase;

  constructor(repository: IGameStateRepository) {
    const combatService = new CombatService();
    const lootService = new LootService();

    this.getState = new GetGameStateUseCase(repository);
    this.tick = new TickGameUseCase(repository, combatService);
    this.openChest = new OpenChestUseCase(repository, lootService);
    this.equipGear = new EquipGearUseCase(repository);
  }
}
