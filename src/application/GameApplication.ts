import { CombatService } from '../domain/services/CombatService';
import { ChestService } from '../domain/services/ChestService';
import { ICombatService } from '../domain/services/ICombatService';
import { ILootService } from '../domain/services/ILootService';
import { LoadoutOptimizer } from '../domain/services/LoadoutOptimizer';
import { LootService } from '../domain/services/LootService';
import { IGameStateRepository } from '../domain/repositories/IGameStateRepository';
import { SkillService } from '../domain/progression/SkillService';
import { ShopService } from '../domain/services/ShopService';
import { UpgradeService } from '../domain/upgrades/UpgradeService';
import { GameStatePresenter } from './presenters/GameStatePresenter';
import { ActivateSkillUseCase } from './use-cases/ActivateSkillUseCase';
import { BuyShopOfferUseCase } from './use-cases/BuyShopOfferUseCase';
import { DeactivateSkillUseCase } from './use-cases/DeactivateSkillUseCase';
import { EquipBestLoadoutUseCase } from './use-cases/EquipBestLoadoutUseCase';
import { EquipGearUseCase } from './use-cases/EquipGearUseCase';
import { GetGameStateUseCase } from './use-cases/GetGameStateUseCase';
import { GetHeroSkillTreeUseCase } from './use-cases/GetHeroSkillTreeUseCase';
import { GetShopOffersUseCase } from './use-cases/GetShopOffersUseCase';
import { GetUpgradeTreeUseCase } from './use-cases/GetUpgradeTreeUseCase';
import { OpenAllChestsUseCase } from './use-cases/OpenAllChestsUseCase';
import { OpenChestUseCase } from './use-cases/OpenChestUseCase';
import { PurchaseUpgradeUseCase } from './use-cases/PurchaseUpgradeUseCase';
import { RefreshShopUseCase } from './use-cases/RefreshShopUseCase';
import { SpendImprovementPointUseCase } from './use-cases/SpendImprovementPointUseCase';
import { TickGameUseCase } from './use-cases/TickGameUseCase';
import { UnequipGearUseCase } from './use-cases/UnequipGearUseCase';

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
  readonly spendImprovementPoint: SpendImprovementPointUseCase;
  readonly getHeroSkillTree: GetHeroSkillTreeUseCase;
  readonly activateSkill: ActivateSkillUseCase;
  readonly deactivateSkill: DeactivateSkillUseCase;

  constructor(repository: IGameStateRepository) {
    const combatService: ICombatService = new CombatService();
    const lootService: ILootService = new LootService();
    const chestService = new ChestService(lootService);
    const shopService = new ShopService(lootService);
    const upgradeService = new UpgradeService();
    const skillService = new SkillService();
    const loadoutOptimizer = new LoadoutOptimizer();
    const presenter = new GameStatePresenter(upgradeService);

    this.getState = new GetGameStateUseCase(repository, presenter);
    this.tick = new TickGameUseCase(repository, combatService, presenter);
    this.openChest = new OpenChestUseCase(repository, chestService, presenter);
    this.openAllChests = new OpenAllChestsUseCase(repository, chestService, presenter);
    this.equipGear = new EquipGearUseCase(repository, presenter);
    this.equipBestLoadout = new EquipBestLoadoutUseCase(repository, loadoutOptimizer, presenter);
    this.unequipGear = new UnequipGearUseCase(repository, presenter);
    this.getShopOffers = new GetShopOffersUseCase(repository, shopService, presenter);
    this.buyShopOffer = new BuyShopOfferUseCase(repository, shopService, presenter);
    this.refreshShop = new RefreshShopUseCase(repository, shopService, presenter);
    this.getUpgradeTree = new GetUpgradeTreeUseCase(repository, upgradeService, presenter);
    this.purchaseUpgrade = new PurchaseUpgradeUseCase(repository, upgradeService, presenter);
    this.spendImprovementPoint = new SpendImprovementPointUseCase(
      repository,
      presenter,
      skillService,
    );
    this.getHeroSkillTree = new GetHeroSkillTreeUseCase(repository, presenter, skillService);
    this.activateSkill = new ActivateSkillUseCase(repository, presenter, skillService);
    this.deactivateSkill = new DeactivateSkillUseCase(repository, presenter, skillService);
  }
}
