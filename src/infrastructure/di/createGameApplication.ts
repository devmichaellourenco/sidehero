import { GameApplication } from '../../application/GameApplication';
import { GameApplicationDependencies } from '../../application/GameApplicationDependencies';
import { ClassAscensionService } from '../../domain/progression/ClassAscensionService';
import { SkillService } from '../../domain/progression/SkillService';
import { CombatService } from '../../domain/services/CombatService';
import { ChestService } from '../../domain/services/ChestService';
import { LoadoutOptimizer } from '../../domain/services/LoadoutOptimizer';
import { LootService } from '../../domain/services/LootService';
import { ShopService } from '../../domain/services/ShopService';
import { UpgradeService } from '../../domain/upgrades/UpgradeService';
import { GameStatePresenter } from '../../application/presenters/GameStatePresenter';
import { ChromeStorageGameRepository } from '../storage/ChromeStorageGameRepository';

let appInstance: GameApplication | null = null;

function createDependencies(): GameApplicationDependencies {
  const lootService = new LootService();
  const upgradeService = new UpgradeService();

  return {
    combatService: new CombatService(),
    lootService,
    chestService: new ChestService(lootService),
    shopService: new ShopService(lootService),
    upgradeService,
    skillService: new SkillService(),
    ascensionService: new ClassAscensionService(),
    loadoutOptimizer: new LoadoutOptimizer(),
    presenter: new GameStatePresenter(upgradeService),
  };
}

export function createGameApplication(): GameApplication {
  if (!appInstance) {
    const repository = new ChromeStorageGameRepository();
    appInstance = new GameApplication(repository, createDependencies());
  }
  return appInstance;
}
