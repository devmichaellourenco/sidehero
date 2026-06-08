import { CombatService } from '../domain/services/CombatService';
import { LootService } from '../domain/services/LootService';
import { IGameStateRepository } from '../domain/repositories/IGameStateRepository';
import { EquipBestLoadoutUseCase } from './use-cases/EquipBestLoadoutUseCase';
import { EquipGearUseCase } from './use-cases/EquipGearUseCase';
import { UnequipGearUseCase } from './use-cases/UnequipGearUseCase';
import { GetGameStateUseCase } from './use-cases/GetGameStateUseCase';
import { OpenAllChestsUseCase } from './use-cases/OpenAllChestsUseCase';
import { OpenChestUseCase } from './use-cases/OpenChestUseCase';
import { BuyShopOfferUseCase } from './use-cases/BuyShopOfferUseCase';
import { GetShopOffersUseCase } from './use-cases/GetShopOffersUseCase';
import { TickGameUseCase } from './use-cases/TickGameUseCase';
import { ShopService } from '../domain/services/ShopService';

export class GameApplication {
  readonly getState: GetGameStateUseCase;
  readonly tick: TickGameUseCase;
  readonly openChest: OpenChestUseCase;
  readonly openAllChests: OpenAllChestsUseCase;
  readonly equipGear: EquipGearUseCase;
  readonly equipBestLoadout: EquipBestLoadoutUseCase;
  readonly unequipGear: UnequipGearUseCase;
  readonly getShopOffers: GetShopOffersUseCase;
  readonly buyShopOffer: BuyShopOfferUseCase;

  constructor(repository: IGameStateRepository) {
    const combatService = new CombatService();
    const lootService = new LootService();
    const shopService = new ShopService(lootService);

    this.getState = new GetGameStateUseCase(repository);
    this.tick = new TickGameUseCase(repository, combatService);
    this.openChest = new OpenChestUseCase(repository, lootService);
    this.openAllChests = new OpenAllChestsUseCase(repository, lootService);
    this.equipGear = new EquipGearUseCase(repository);
    this.equipBestLoadout = new EquipBestLoadoutUseCase(repository);
    this.unequipGear = new UnequipGearUseCase(repository);
    this.getShopOffers = new GetShopOffersUseCase(repository, shopService);
    this.buyShopOffer = new BuyShopOfferUseCase(repository, shopService);
  }
}
