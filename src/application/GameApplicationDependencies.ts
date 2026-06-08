import { IClassAscensionService } from '../domain/progression/IClassAscensionService';
import { ISkillService } from '../domain/progression/ISkillService';
import { ICombatService } from '../domain/services/ICombatService';
import { ILootService } from '../domain/services/ILootService';
import { LoadoutOptimizer } from '../domain/services/LoadoutOptimizer';
import { ChestService } from '../domain/services/ChestService';
import { ShopService } from '../domain/services/ShopService';
import { UpgradeService } from '../domain/upgrades/UpgradeService';
import { GameStatePresenter } from './presenters/GameStatePresenter';

export interface GameApplicationDependencies {
  combatService: ICombatService;
  lootService: ILootService;
  chestService: ChestService;
  shopService: ShopService;
  upgradeService: UpgradeService;
  skillService: ISkillService;
  ascensionService: IClassAscensionService;
  loadoutOptimizer: LoadoutOptimizer;
  presenter: GameStatePresenter;
}
