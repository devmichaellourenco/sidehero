import { GameState } from '../entities/GameState';
import { getFeatureLevel, UpgradeLevels } from './FeatureKey';
import { HeroUnlockService } from '../party/HeroUnlockService';
import { UpgradeRequirementEvaluator } from '../requirements/UpgradeRequirementEvaluator';
import { getUpgradeById, UPGRADE_CATALOG } from './UpgradeCatalog';
import { UpgradeDefinition } from './UpgradeDefinition';

export type UpgradeNodeStatus = 'locked' | 'ready' | 'available' | 'owned';

export interface UpgradeNodeView {
  definition: UpgradeDefinition;
  status: UpgradeNodeStatus;
  canAfford: boolean;
  requirements: { label: string; met: boolean }[];
}

export class UpgradeService {
  private readonly evaluator = new UpgradeRequirementEvaluator();

  getLevel(levels: UpgradeLevels, feature: UpgradeDefinition['feature']): number {
    return getFeatureLevel(levels, feature);
  }

  buildTree(state: GameState): UpgradeNodeView[] {
    return UPGRADE_CATALOG.map((definition) => {
      const status = this.getStatus(state, definition);
      return {
        definition,
        status,
        canAfford: state.gold.canAfford(definition.cost),
        requirements: this.evaluator.evaluateAll(state, definition.requirements),
      };
    });
  }

  countAvailable(state: GameState): number {
    return this.buildTree(state).filter((node) => node.status === 'available').length;
  }

  purchase(state: GameState, upgradeId: string): GameState {
    const definition = getUpgradeById(upgradeId);
    if (!definition) {
      throw new Error('Melhoria não encontrada');
    }

    const status = this.getStatus(state, definition);
    if (status !== 'available') {
      if (status === 'ready') {
        throw new Error('Ouro insuficiente');
      }
      throw new Error('Melhoria indisponível para compra');
    }

    const nextLevels: UpgradeLevels = {
      ...state.upgradeLevels,
      [definition.feature]: definition.level,
    };

    let nextState = state
      .withGold(state.gold.spend(definition.cost))
      .withUpgradeLevels(nextLevels)
      .addLog(`Comprou melhoria: ${definition.name}`);

    if (definition.unlockHeroClass) {
      nextState = HeroUnlockService.applyUnlock(nextState, definition.unlockHeroClass);
    }

    return nextState;
  }

  private getStatus(state: GameState, definition: UpgradeDefinition): UpgradeNodeStatus {
    const currentLevel = getFeatureLevel(state.upgradeLevels, definition.feature);

    if (currentLevel >= definition.level) {
      return 'owned';
    }

    if (currentLevel !== definition.level - 1) {
      return 'locked';
    }

    if (!this.evaluator.allMet(state, definition.requirements)) {
      return 'locked';
    }

    if (!state.gold.canAfford(definition.cost)) {
      return 'ready';
    }

    return 'available';
  }
}
