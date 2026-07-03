// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import { UpgradeTreeModalRenderer } from './UpgradeTreeModalRenderer';

function node(partial: Partial<UpgradeNodeDto> & Pick<UpgradeNodeDto, 'id' | 'branch'>): UpgradeNodeDto {
  return {
    feature: 'auto_battle',
    level: 1,
    name: partial.id,
    description: 'desc',
    cost: 100,
    status: 'locked',
    canAfford: false,
    requirements: [],
    ...partial,
  };
}

function minimalState(gold = 500): GameStateDto {
  return {
    gold,
  } as GameStateDto;
}

describe('UpgradeTreeModalRenderer', () => {
  const renderer = new UpgradeTreeModalRenderer();

  it('renderiza canvas único com viewport, legenda e nodos posicionados', () => {
    const container = document.createElement('div');
    const nodes = [
      node({ id: 'auto_battle_2', branch: 'combat', status: 'owned', name: 'Auto-batalha II' }),
      node({ id: 'auto_battle_3', branch: 'combat', status: 'available', name: 'Auto-batalha III' }),
      node({ id: 'log_filter_1', branch: 'qol', status: 'locked', name: 'Log resumido I' }),
    ];

    renderer.render(container, minimalState(), nodes, { onPurchase: vi.fn() });

    expect(container.querySelector('[data-upgrade-tree-viewport]')).not.toBeNull();
    expect(container.querySelector('.upgrade-tree-stage')).not.toBeNull();
    expect(container.querySelector('.upgrade-tree-legend')).not.toBeNull();
    expect(container.querySelector('[data-upgrade-focus-available]')).not.toBeNull();
    expect(container.querySelectorAll('[data-upgrade-node]')).toHaveLength(3);
    expect(container.querySelector('.upgrade-tree-edge')).not.toBeNull();
    expect(container.innerHTML).not.toContain('upgrade-branch-tab');
  });

  it('dispara onPurchase ao clicar em comprar no tooltip', () => {
    const container = document.createElement('div');
    const onPurchase = vi.fn();
    const nodes = [
      node({
        id: 'auto_open_chests_1',
        branch: 'chests',
        status: 'available',
        canAfford: true,
        cost: 60,
        name: 'Auto-abrir baús I',
      }),
    ];

    renderer.render(container, minimalState(200), nodes, { onPurchase });

    const upgradeNode = container.querySelector('[data-upgrade-node="auto_open_chests_1"]') as HTMLElement;
    upgradeNode.dispatchEvent(new Event('mouseenter'));

    const buyButton = document.querySelector('[data-upgrade-buy="auto_open_chests_1"]') as HTMLButtonElement;
    expect(buyButton).not.toBeNull();
    buyButton.click();

    expect(onPurchase).toHaveBeenCalledWith('auto_open_chests_1');
  });
});
