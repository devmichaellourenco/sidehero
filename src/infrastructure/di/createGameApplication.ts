import { GameApplication } from '../../application/GameApplication';
import { GameApplicationDependencies } from '../../application/GameApplicationDependencies';
import { ClassAscensionService } from '../../domain/progression/ClassAscensionService';
import { SkillService } from '../../domain/progression/SkillService';
import { CombatService } from '../../domain/services/CombatService';
import { ChestService } from '../../domain/services/ChestService';
import { DivineForgeService } from '../../domain/services/DivineForgeService';
import { LoadoutOptimizer } from '../../domain/services/LoadoutOptimizer';
import { LootService } from '../../domain/services/LootService';
import { ShopService } from '../../domain/services/ShopService';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { PartyService } from '../../domain/party/PartyService';
import { GameStatePresenter } from '../../application/presenters/GameStatePresenter';
import { ChromeStorageGameRepository } from '../storage/ChromeStorageGameRepository';
import { ChromeStorageMetaRepository } from '../storage/ChromeStorageMetaRepository';
import { ChromeStorageAchievementRepository } from '../storage/ChromeStorageAchievementRepository';
import { ChromeSaveBackupStore } from '../storage/ChromeSaveBackupStore';
import { MetaService } from '../../domain/meta/MetaService';
import { AchievementService } from '../../domain/achievements/AchievementService';

let appInstance: GameApplication | null = null;

function createDependencies(): GameApplicationDependencies {
  const lootService = new LootService();
  const upgradeService = new UpgradeService();

  const metaService = new MetaService();
  const achievementService = new AchievementService();

  return {
    combatService: new CombatService(),
    lootService,
    chestService: new ChestService(lootService),
    shopService: new ShopService(lootService),
    upgradeService,
    skillService: new SkillService(),
    ascensionService: new ClassAscensionService(),
    loadoutOptimizer: new LoadoutOptimizer(),
    partyService: new PartyService(),
    divineForgeService: new DivineForgeService(lootService),
    presenter: new GameStatePresenter(upgradeService),
    metaService,
    achievementService,
  };
}

export function createGameApplication(): GameApplication {
  if (!appInstance) {
    const repository = new ChromeStorageGameRepository();
    const metaRepository = new ChromeStorageMetaRepository();
    const achievementRepository = new ChromeStorageAchievementRepository();
    const backupStore = new ChromeSaveBackupStore();
    appInstance = new GameApplication(
      repository,
      metaRepository,
      achievementRepository,
      backupStore,
      createDependencies(),
    );
  }
  return appInstance;
}
