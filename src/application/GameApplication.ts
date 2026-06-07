import { CombatService } from '../domain/services/CombatService';
import { LootService } from '../domain/services/LootService';
import { IGameStateRepository } from '../domain/repositories/IGameStateRepository';
import { EquipBestLoadoutUseCase } from './use-cases/EquipBestLoadoutUseCase';
import { EquipGearUseCase } from './use-cases/EquipGearUseCase';
import { UnequipGearUseCase } from './use-cases/UnequipGearUseCase';
import { GetGameStateUseCase } from './use-cases/GetGameStateUseCase';
import { OpenAllChestsUseCase } from './use-cases/OpenAllChestsUseCase';
import { OpenChestUseCase } from './use-cases/OpenChestUseCase';
import { TickGameUseCase } from './use-cases/TickGameUseCase';

export class GameApplication {
  readonly getState: GetGameStateUseCase;
  readonly tick: TickGameUseCase;
  readonly openChest: OpenChestUseCase;
  readonly openAllChests: OpenAllChestsUseCase;
  readonly equipGear: EquipGearUseCase;
  readonly equipBestLoadout: EquipBestLoadoutUseCase;
  readonly unequipGear: UnequipGearUseCase;

  constructor(repository: IGameStateRepository) {
    const combatService = new CombatService();
    const lootService = new LootService();

    this.getState = new GetGameStateUseCase(repository);
    this.tick = new TickGameUseCase(repository, combatService);
    this.openChest = new OpenChestUseCase(repository, lootService);
    this.openAllChests = new OpenAllChestsUseCase(repository, lootService);
    this.equipGear = new EquipGearUseCase(repository);
    this.equipBestLoadout = new EquipBestLoadoutUseCase(repository);
    this.unequipGear = new UnequipGearUseCase(repository);
  }
}
