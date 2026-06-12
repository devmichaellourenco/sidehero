import { GameStateDto } from '../../application/dto/GameStateDto';
import { countUpgradeItems } from '../components/GearComparison';

export type PendingActionKind = 'chest' | 'inventory-upgrade' | 'upgrade-tree' | 'hero-points';

export interface PendingActionItem {
  kind: PendingActionKind;
  label: string;
}

export function buildPendingActions(state: GameStateDto): PendingActionItem[] {
  const actions: PendingActionItem[] = [];

  if (state.pendingChestCount > 0) {
    const label =
      state.pendingChestCount === 1
        ? '1 baú para abrir'
        : `${state.pendingChestCount} baús para abrir`;
    actions.push({ kind: 'chest', label });
  }

  const upgradeCount = countUpgradeItems(state);
  if (upgradeCount > 0) {
    actions.push({
      kind: 'inventory-upgrade',
      label: upgradeCount === 1 ? '1 upgrade no inventário' : `${upgradeCount} upgrades no inventário`,
    });
  }

  if (state.purchasableUpgradeCount > 0) {
    actions.push({
      kind: 'upgrade-tree',
      label:
        state.purchasableUpgradeCount === 1
          ? '1 melhoria disponível'
          : `${state.purchasableUpgradeCount} melhorias disponíveis`,
    });
  }

  const heroesWithPoints = state.heroes.filter((hero) => hero.hasUnspentPoints);
  if (heroesWithPoints.length > 0) {
    const names = heroesWithPoints.map((hero) => hero.name).join(', ');
    actions.push({ kind: 'hero-points', label: `Pontos pendentes: ${names}` });
  }

  return actions;
}
