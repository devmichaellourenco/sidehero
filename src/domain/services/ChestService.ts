import { GameState } from '../entities/GameState';
import { Gear } from '../entities/Gear';
import { FeatureAccessPolicy } from '../policies/FeatureAccessPolicy';
import { ILootService } from './ILootService';

export interface OpenChestResult {
  state: GameState;
  loot: Gear;
}

export interface OpenAllChestsResult {
  state: GameState;
  loots: Gear[];
}

export class ChestService {
  constructor(private readonly lootService: ILootService) {}

  openOne(state: GameState, chestId: string): OpenChestResult {
    const chest = state.chests.find((entry) => entry.id === chestId);

    if (!chest) {
      throw new Error('Baú não encontrado');
    }

    if (chest.opened) {
      throw new Error('Baú já foi aberto');
    }

    const loot = this.lootService.generateGear(chest.stageEarned);
    const updatedChests = state.chests.map((entry) =>
      entry.id === chestId ? entry.open(loot) : entry,
    );

    const nextState = state
      .withChests(updatedChests)
      .withInventory([...state.inventory, loot])
      .addLog(`Abriu baú: ${loot.name}`);

    return { state: nextState, loot };
  }

  openAll(state: GameState): OpenAllChestsResult {
    if (!FeatureAccessPolicy.canUse(state.upgradeLevels, 'openAllChests')) {
      throw new Error('Abrir todos os baús não desbloqueado');
    }

    const pendingChests = state.chests.filter((chest) => !chest.opened);
    if (pendingChests.length === 0) {
      return { state, loots: [] };
    }

    const loots: Gear[] = [];
    let updatedChests = [...state.chests];
    let inventory = [...state.inventory];
    const logs: string[] = [];

    for (const chest of pendingChests) {
      const loot = this.lootService.generateGear(chest.stageEarned);
      updatedChests = updatedChests.map((entry) =>
        entry.id === chest.id ? entry.open(loot) : entry,
      );
      inventory = [...inventory, loot];
      loots.push(loot);
      logs.push(loot.name);
    }

    const nextState = state
      .withChests(updatedChests)
      .withInventory(inventory)
      .addLog(`Abriu ${loots.length} baús: ${logs.join(', ')}`);

    return { state: nextState, loots };
  }
}
