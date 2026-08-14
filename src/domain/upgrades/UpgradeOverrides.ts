import type { UpgradeDefinition } from './UpgradeDefinition';
import type { UpgradeRequirement } from './UpgradeRequirement';
import staticOverrides from './data/upgrade-overrides.json';

export interface UpgradeDefinitionOverride {
  name?: string;
  description?: string;
  cost?: number;
  parents?: string[];
  requirements?: UpgradeRequirement[];
}

export interface UpgradeOverridesFile {
  version: number;
  updatedAt: string | null;
  upgrades: Record<string, UpgradeDefinitionOverride>;
}

const embedded = staticOverrides as UpgradeOverridesFile;
let runtime: UpgradeOverridesFile | null = null;

function emptyFile(): UpgradeOverridesFile {
  return { version: 1, updatedAt: null, upgrades: {} };
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function getEmbeddedUpgradeOverrides(): UpgradeOverridesFile {
  return {
    version: embedded.version ?? 1,
    updatedAt: embedded.updatedAt ?? null,
    upgrades: { ...(embedded.upgrades ?? {}) },
  };
}

export function setRuntimeUpgradeOverrides(file: UpgradeOverridesFile | null): void {
  runtime = file;
}

function activeFile(): UpgradeOverridesFile {
  return runtime ?? {
    version: embedded.version ?? 1,
    updatedAt: embedded.updatedAt ?? null,
    upgrades: embedded.upgrades ?? {},
  };
}

export function normalizeUpgradeOverride(
  input: UpgradeDefinitionOverride | null | undefined,
): UpgradeDefinitionOverride | null {
  if (!input || typeof input !== 'object') return null;
  const next: UpgradeDefinitionOverride = {};
  if (typeof input.name === 'string' && input.name.trim()) next.name = input.name.trim();
  if (typeof input.description === 'string' && input.description.trim()) {
    next.description = input.description.trim();
  }
  const cost = finiteNumber(input.cost);
  if (cost !== undefined) next.cost = Math.max(0, Math.floor(cost));
  if (Array.isArray(input.parents)) {
    next.parents = input.parents
      .filter((parent): parent is string => typeof parent === 'string' && parent.trim().length > 0)
      .map((parent) => parent.trim());
  }
  if (Array.isArray(input.requirements)) {
    next.requirements = input.requirements.filter(
      (requirement): requirement is UpgradeRequirement =>
        !!requirement && typeof requirement === 'object' && 'type' in requirement,
    );
  }
  return Object.keys(next).length > 0 ? next : null;
}

export function getUpgradeOverride(id: string): UpgradeDefinitionOverride | null {
  return normalizeUpgradeOverride(activeFile().upgrades[id]);
}

export function applyUpgradeOverride(
  definition: UpgradeDefinition,
  override?: UpgradeDefinitionOverride | null,
): UpgradeDefinition {
  const patch =
    arguments.length >= 2
      ? normalizeUpgradeOverride(override)
      : getUpgradeOverride(definition.id);
  if (!patch) return definition;
  return {
    ...definition,
    name: patch.name ?? definition.name,
    description: patch.description ?? definition.description,
    cost: patch.cost ?? definition.cost,
    parents: patch.parents ?? definition.parents,
    requirements: patch.requirements ?? definition.requirements,
  };
}

export function normalizeUpgradeOverridesFile(input: unknown): UpgradeOverridesFile {
  const empty = emptyFile();
  if (!input || typeof input !== 'object') return empty;
  const raw = input as Record<string, unknown>;
  const upgrades: Record<string, UpgradeDefinitionOverride> = {};
  if (raw.upgrades && typeof raw.upgrades === 'object') {
    for (const [id, value] of Object.entries(raw.upgrades as Record<string, unknown>)) {
      const normalized = normalizeUpgradeOverride(value as UpgradeDefinitionOverride);
      if (normalized) upgrades[id] = normalized;
    }
  }
  return {
    version: typeof raw.version === 'number' ? raw.version : 1,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
    upgrades,
  };
}
