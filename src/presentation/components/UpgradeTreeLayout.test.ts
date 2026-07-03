import { describe, expect, it } from 'vitest';
import {
  listUpgradeLayoutEntries,
  UPGRADE_TREE_MIN_NODE_DISTANCE,
} from './UpgradeTreeLayout';

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
});
