/**
 * Snapshot da árvore de melhorias para o Balance Lab.
 */
import { UPGRADE_CATALOG } from '../../src/domain/upgrades/UpgradeCatalog';
import {
  applyUpgradeOverride,
  getEmbeddedUpgradeOverrides,
  normalizeUpgradeOverride,
  normalizeUpgradeOverridesFile,
  setRuntimeUpgradeOverrides,
  type UpgradeDefinitionOverride,
  type UpgradeOverridesFile,
} from '../../src/domain/upgrades/UpgradeOverrides';

export const UPGRADE_EDIT_FIELDS = [
  { key: 'cost', label: 'Custo (ouro)', step: 50 },
] as const;

export const UPGRADE_TEXT_FIELDS = [
  { key: 'name', label: 'Nome' },
  { key: 'description', label: 'Descrição' },
] as const;

export interface UpgradeLabRow {
  id: string;
  branch: string;
  feature: string;
  level: number;
  parents: string[];
  baseline: { name: string; description: string; cost: number };
  effective: { name: string; description: string; cost: number };
  hasOverride: boolean;
}

export interface UpgradeTreeLabPayload {
  upgrades: UpgradeLabRow[];
  editFields: typeof UPGRADE_EDIT_FIELDS;
  textFields: typeof UPGRADE_TEXT_FIELDS;
  updatedAt: string | null;
}

export function buildUpgradeTreeLabPayload(filters?: {
  diskOverrides?: UpgradeOverridesFile | null;
  updatedAt?: string | null;
}): UpgradeTreeLabPayload {
  const disk = filters?.diskOverrides ?? getEmbeddedUpgradeOverrides();

  setRuntimeUpgradeOverrides(null);

  const upgrades: UpgradeLabRow[] = UPGRADE_CATALOG.map((baseline) => {
    const override = disk.upgrades[baseline.id];
    const effective = applyUpgradeOverride(baseline, override ?? null);
    return {
      id: baseline.id,
      branch: baseline.branch,
      feature: String(baseline.feature),
      level: baseline.level,
      parents: baseline.parents,
      baseline: {
        name: baseline.name,
        description: baseline.description,
        cost: baseline.cost,
      },
      effective: {
        name: effective.name,
        description: effective.description,
        cost: effective.cost,
      },
      hasOverride: Boolean(normalizeUpgradeOverride(override)),
    };
  });

  return {
    upgrades,
    editFields: UPGRADE_EDIT_FIELDS,
    textFields: UPGRADE_TEXT_FIELDS,
    updatedAt: filters?.updatedAt ?? disk.updatedAt ?? null,
  };
}

export {
  normalizeUpgradeOverride,
  normalizeUpgradeOverridesFile,
  setRuntimeUpgradeOverrides,
};
export type { UpgradeDefinitionOverride, UpgradeOverridesFile };
