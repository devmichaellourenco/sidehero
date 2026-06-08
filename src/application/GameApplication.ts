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
import { RefreshShopUseCase } from './use-cases/RefreshShopUseCase';
import { TickGameUseCase } from './use-cases/TickGameUseCase';
import { ShopService } from '../domain/services/ShopService';
import { UpgradeService } from '../domain/upgrades/UpgradeService';
import { GetUpgradeTreeUseCase } from './use-cases/GetUpgradeTreeUseCase';
import { PurchaseUpgradeUseCase } from './use-cases/PurchaseUpgradeUseCase';

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
  readonly refreshShop: RefreshShopUseCase;
  readonly getUpgradeTree: GetUpgradeTreeUseCase;
  readonly purchaseUpgrade: PurchaseUpgradeUseCase;

  constructor(repository: IGameStateRepository) {
    const combatService = new CombatService();
    const lootService = new LootService();
    const shopService = new ShopService(lootService);
    const upgradeService = new UpgradeService();

    this.getState = new GetGameStateUseCase(repository, upgradeService);
    this.tick = new TickGameUseCase(repository, combatService, upgradeService);
    this.openChest = new OpenChestUseCase(repository, lootService, upgradeService);
    this.openAllChests = new OpenAllChestsUseCase(repository, lootService, upgradeService);
    this.equipGear = new EquipGearUseCase(repository, upgradeService);
    this.equipBestLoadout = new EquipBestLoadoutUseCase(repository, upgradeService);
    this.unequipGear = new UnequipGearUseCase(repository, upgradeService);
    this.getShopOffers = new GetShopOffersUseCase(repository, shopService, upgradeService);
    this.buyShopOffer = new BuyShopOfferUseCase(repository, shopService, upgradeService);
    this.refreshShop = new RefreshShopUseCase(repository, shopService, upgradeService);
    this.getUpgradeTree = new GetUpgradeTreeUseCase(repository, upgradeService);
    this.purchaseUpgrade = new PurchaseUpgradeUseCase(repository, upgradeService);
  }
}
