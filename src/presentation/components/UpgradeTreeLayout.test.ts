import { describe, expect, it } from 'vitest';
import { UPGRADE_CATALOG } from '../../domain/upgrades/UpgradeCatalog';
import {
  getUpgradeNodePosition,
  listUpgradeLayoutEntries,
  UPGRADE_TREE_MIN_NODE_DISTANCE,
} from './UpgradeTreeLayout';
import { isStraightBranchEdge, resolveUpgradeParentIds } from './UpgradeTreeGraphPresentation';

describe('UpgradeTreeLayout', () => {
  it('mantém distância mínima entre centros dos nodos', () => {
    const entries = listUpgradeLayoutEntries();

    for (let left = 0; left < entries.length; left += 1) {
      for (let right = left + 1; right < entries.length; right += 1) {
        const a = entries[left];
        const b = entries[right];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);

        expect(
          distance,
          `sobreposição entre ${a.id} e ${b.id} (${distance.toFixed(1)}px)`,
        ).toBeGreaterThanOrEqual(UPGRADE_TREE_MIN_NODE_DISTANCE);
      }
    }
  });

  it('cada aresta do catálogo segue uma linha reta (horizontal, vertical ou diagonal 45°)', () => {
    for (const entry of UPGRADE_CATALOG) {
      const child = getUpgradeNodePosition(entry.id);
      expect(child, `layout ausente: ${entry.id}`).toBeDefined();
      if (!child) continue;

      for (const parentId of resolveUpgradeParentIds(entry.id)) {
        const parent = getUpgradeNodePosition(parentId);
        expect(parent, `layout ausente: ${parentId}`).toBeDefined();
        if (!parent) continue;

        expect(
          isStraightBranchEdge(parent, child),
          `aresta torta: ${parentId} -> ${entry.id}`,
        ).toBe(true);
      }
    }
  });
});
