import { IGameStateRepository } from '../domain/repositories/IGameStateRepository';
import { AssignSkillSlotUseCase } from './use-cases/AssignSkillSlotUseCase';
import { AscendClassUseCase } from './use-cases/AscendClassUseCase';
import { BuyShopOfferUseCase } from './use-cases/BuyShopOfferUseCase';
import { DeactivateSkillUseCase } from './use-cases/DeactivateSkillUseCase';
import { EquipBestLoadoutUseCase } from './use-cases/EquipBestLoadoutUseCase';
import { EquipGearUseCase } from './use-cases/EquipGearUseCase';
import { GetCampaignOverviewUseCase } from './use-cases/GetCampaignOverviewUseCase';
import { NewGameUseCase } from './use-cases/NewGameUseCase';
import { GetGameStateUseCase } from './use-cases/GetGameStateUseCase';
import { SelectPhaseUseCase } from './use-cases/SelectPhaseUseCase';
import { GetHeroAscensionTreeUseCase } from './use-cases/GetHeroAscensionTreeUseCase';
import { GetHeroSkillTreeUseCase } from './use-cases/GetHeroSkillTreeUseCase';
import { GetShopOffersUseCase } from './use-cases/GetShopOffersUseCase';
import { GetUpgradeTreeUseCase } from './use-cases/GetUpgradeTreeUseCase';
import { OpenAllChestsUseCase } from './use-cases/OpenAllChestsUseCase';
import { OpenChestUseCase } from './use-cases/OpenChestUseCase';
import { PauseForLoadoutUseCase } from './use-cases/PauseForLoadoutUseCase';
import { PurchaseUpgradeUseCase } from './use-cases/PurchaseUpgradeUseCase';
import { RefreshShopUseCase } from './use-cases/RefreshShopUseCase';
import { SpendAscensionPointUseCase } from './use-cases/SpendAscensionPointUseCase';
import { SpendImprovementPointUseCase } from './use-cases/SpendImprovementPointUseCase';
import { RefundImprovementPointUseCase } from './use-cases/RefundImprovementPointUseCase';
import { MassRefundImprovementPointsUseCase, PreviewMassRefundImprovementPointsUseCase } from './use-cases/MassRefundImprovementPointsUseCase';
import { TickGameUseCase } from './use-cases/TickGameUseCase';
import { ResumeCombatIntermissionUseCase } from './use-cases/ResumeCombatIntermissionUseCase';
import { UnequipGearUseCase } from './use-cases/UnequipGearUseCase';
import { AddToPartyUseCase } from './use-cases/AddToPartyUseCase';
import { RemoveFromPartyUseCase } from './use-cases/RemoveFromPartyUseCase';
import { MovePartyMemberUseCase } from './use-cases/MovePartyMemberUseCase';
import { SetPartySlotUseCase } from './use-cases/SetPartySlotUseCase';
import { MoveGearToStashUseCase } from './use-cases/MoveGearToStashUseCase';
import { MoveGearFromStashUseCase } from './use-cases/MoveGearFromStashUseCase';
import { DestroyGearUseCase } from './use-cases/DestroyGearUseCase';
import { FuseGearInForgeUseCase } from './use-cases/FuseGearInForgeUseCase';
import { SalvageGearInForgeUseCase } from './use-cases/SalvageGearInForgeUseCase';
import { GameApplicationDependencies } from './GameApplicationDependencies';
import { GetMetaTreeUseCase } from './use-cases/GetMetaTreeUseCase';
import { PurchaseMetaUpgradeUseCase } from './use-cases/PurchaseMetaUpgradeUseCase';
import { MarkActSceneViewedUseCase } from './use-cases/MarkActSceneViewedUseCase';
import { GetAchievementsUseCase } from './use-cases/GetAchievementsUseCase';
import { IMetaProgressRepository } from '../domain/repositories/IMetaProgressRepository';
import { IAchievementProgressRepository } from '../domain/repositories/IAchievementProgressRepository';

export class GameApplication {
  readonly getState: GetGameStateUseCase;
  readonly getCampaignOverview: GetCampaignOverviewUseCase;
  readonly selectPhase: SelectPhaseUseCase;
  readonly newGame: NewGameUseCase;
  readonly tick: TickGameUseCase;
  readonly resumeCombatIntermission: ResumeCombatIntermissionUseCase;
  readonly pauseForLoadout: PauseForLoadoutUseCase;
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
  readonly refundImprovementPoint: RefundImprovementPointUseCase;
  readonly massRefundImprovementPoints: MassRefundImprovementPointsUseCase;
  readonly previewMassRefundImprovementPoints: PreviewMassRefundImprovementPointsUseCase;
  readonly getHeroSkillTree: GetHeroSkillTreeUseCase;
  readonly assignSkillSlot: AssignSkillSlotUseCase;
  readonly deactivateSkill: DeactivateSkillUseCase;
  readonly ascendClass: AscendClassUseCase;
  readonly getHeroAscensionTree: GetHeroAscensionTreeUseCase;
  readonly spendAscensionPoint: SpendAscensionPointUseCase;
  readonly addToParty: AddToPartyUseCase;
  readonly removeFromParty: RemoveFromPartyUseCase;
  readonly movePartyMember: MovePartyMemberUseCase;
  readonly setPartySlot: SetPartySlotUseCase;
  readonly moveGearToStash: MoveGearToStashUseCase;
  readonly moveGearFromStash: MoveGearFromStashUseCase;
  readonly destroyGear: DestroyGearUseCase;
  readonly fuseGearInForge: FuseGearInForgeUseCase;
  readonly salvageGearInForge: SalvageGearInForgeUseCase;
  readonly getMetaTree: GetMetaTreeUseCase;
  readonly purchaseMetaUpgrade: PurchaseMetaUpgradeUseCase;
  readonly markActSceneViewed: MarkActSceneViewedUseCase;
  readonly getAchievements: GetAchievementsUseCase;

  constructor(
    repository: IGameStateRepository,
    metaRepository: IMetaProgressRepository,
    achievementRepository: IAchievementProgressRepository,
    deps: GameApplicationDependencies,
  ) {
    const {
      combatService,
      chestService,
      shopService,
      upgradeService,
      skillService,
      ascensionService,
      loadoutOptimizer,
      partyService,
      divineForgeService,
      presenter,
      metaService,
      achievementService,
    } = deps;

    this.getState = new GetGameStateUseCase(repository, metaRepository, metaService, presenter);
    this.getCampaignOverview = new GetCampaignOverviewUseCase(repository, presenter);
    this.selectPhase = new SelectPhaseUseCase(repository, presenter);
    this.newGame = new NewGameUseCase(repository, metaRepository, metaService, presenter);
    this.tick = new TickGameUseCase(
      repository,
      metaRepository,
      metaService,
      combatService,
      presenter,
      achievementRepository,
      achievementService,
    );
    this.resumeCombatIntermission = new ResumeCombatIntermissionUseCase(repository, presenter);
    this.pauseForLoadout = new PauseForLoadoutUseCase(repository, presenter);
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
    this.refundImprovementPoint = new RefundImprovementPointUseCase(repository, presenter);
    this.massRefundImprovementPoints = new MassRefundImprovementPointsUseCase(
      repository,
      presenter,
    );
    this.previewMassRefundImprovementPoints = new PreviewMassRefundImprovementPointsUseCase(
      repository,
    );
    this.getHeroSkillTree = new GetHeroSkillTreeUseCase(repository, presenter, skillService);
    this.assignSkillSlot = new AssignSkillSlotUseCase(repository, presenter, skillService);
    this.deactivateSkill = new DeactivateSkillUseCase(repository, presenter, skillService);
    this.ascendClass = new AscendClassUseCase(repository, presenter, ascensionService);
    this.getHeroAscensionTree = new GetHeroAscensionTreeUseCase(
      repository,
      presenter,
      ascensionService,
      skillService,
    );
    this.spendAscensionPoint = new SpendAscensionPointUseCase(repository, presenter, skillService);
    this.addToParty = new AddToPartyUseCase(repository, partyService, presenter);
    this.removeFromParty = new RemoveFromPartyUseCase(repository, partyService, presenter);
    this.movePartyMember = new MovePartyMemberUseCase(repository, partyService, presenter);
    this.setPartySlot = new SetPartySlotUseCase(repository, partyService, presenter);
    this.moveGearToStash = new MoveGearToStashUseCase(repository, presenter);
    this.moveGearFromStash = new MoveGearFromStashUseCase(repository, presenter);
    this.destroyGear = new DestroyGearUseCase(repository, presenter);
    this.fuseGearInForge = new FuseGearInForgeUseCase(repository, presenter, divineForgeService);
    this.salvageGearInForge = new SalvageGearInForgeUseCase(
      repository,
      presenter,
      divineForgeService,
    );
    this.getMetaTree = new GetMetaTreeUseCase(
      repository,
      metaRepository,
      metaService,
      presenter,
    );
    this.purchaseMetaUpgrade = new PurchaseMetaUpgradeUseCase(
      repository,
      metaRepository,
      metaService,
      presenter,
    );
    this.markActSceneViewed = new MarkActSceneViewedUseCase(repository, presenter);
    this.getAchievements = new GetAchievementsUseCase(
      repository,
      achievementRepository,
      achievementService,
      presenter,
    );
  }
}
