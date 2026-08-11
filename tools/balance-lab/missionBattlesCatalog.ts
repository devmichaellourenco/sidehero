/**
 * Snapshot de missões + fases para o Balance Lab (Node / browser).
 */
import { resolvePhase } from '../../src/domain/campaign/CampaignCatalog';
import {
  applyPhaseBattleOverride,
  getEmbeddedPhaseBattleOverride,
  type PhaseBattleOverride,
} from '../../src/domain/campaign/PhaseBattleOverrides';
import { listMissionCatalog } from '../../src/domain/campaign/missions/MissionCatalog';
import type { MissionDefinition } from '../../src/domain/campaign/missions/MissionDefinition';
import { ENEMY_ROSTER } from '../../src/domain/enemies/EnemyRosterCatalog';
import type { PhaseDefinition } from '../../src/domain/campaign/PhaseDefinition';
import { HANDCRAFTED_PHASES } from '../../src/domain/campaign/HandcraftedPhaseCatalog';

export interface MissionBattleListEntry {
  missionId: string;
  kind: MissionDefinition['kind'];
  mapId: string;
  name: string;
  phaseTemplateId: string;
  stars: number | null;
  hasOverride: boolean;
  waveCount: number;
}

export interface MissionBattleDetail {
  mission: MissionBattleListEntry;
  /** Fase efetiva (base + override embutido). */
  phase: PhaseDefinition;
  /** Override puro, se existir. */
  override: PhaseBattleOverride | null;
  /** Fase gerada sem override (baseline do catálogo). */
  baselinePhase: PhaseDefinition;
}

export function listEnemyOptionsForLab(): Array<{
  id: string;
  name: string;
  powerTier: number;
  rosterRole: string;
}> {
  return ENEMY_ROSTER.map((entry) => ({
    id: entry.id,
    name: entry.name,
    powerTier: entry.powerTier,
    rosterRole: entry.rosterRole,
  }));
}

/** Quando `diskOverrides` é passado, não cai no JSON embutido (evita stale após DELETE no lab). */
function resolveOverrideForLab(
  phaseTemplateId: string,
  diskOverrides?: Record<string, PhaseBattleOverride>,
): PhaseBattleOverride | null {
  if (diskOverrides !== undefined) {
    return diskOverrides[phaseTemplateId] ?? null;
  }
  return getEmbeddedPhaseBattleOverride(phaseTemplateId);
}

export function listMissionBattleEntries(
  overrides?: Record<string, PhaseBattleOverride>,
): MissionBattleListEntry[] {
  return listMissionCatalog().map((mission) => {
    const baseline =
      HANDCRAFTED_PHASES.find((phase) => phase.id === mission.phaseTemplateId) ?? null;
    const override = resolveOverrideForLab(mission.phaseTemplateId, overrides);
    const phase = baseline
      ? applyPhaseBattleOverride(baseline, override)
      : resolvePhase(mission.phaseTemplateId);
    return {
      missionId: mission.id,
      kind: mission.kind,
      mapId: mission.mapId,
      name: mission.name,
      phaseTemplateId: mission.phaseTemplateId,
      stars: mission.stars ?? null,
      hasOverride: Boolean(override),
      waveCount: phase?.waves.length ?? 0,
    };
  });
}

export function getMissionBattleDetail(
  missionId: string,
  diskOverrides?: Record<string, PhaseBattleOverride>,
): MissionBattleDetail | null {
  const mission = listMissionCatalog().find((entry) => entry.id === missionId);
  if (!mission) return null;

  const baselinePhase =
    HANDCRAFTED_PHASES.find((phase) => phase.id === mission.phaseTemplateId) ?? null;
  if (!baselinePhase) return null;

  const override = resolveOverrideForLab(mission.phaseTemplateId, diskOverrides);
  const phase = applyPhaseBattleOverride(baselinePhase, override);

  return {
    mission: {
      missionId: mission.id,
      kind: mission.kind,
      mapId: mission.mapId,
      name: mission.name,
      phaseTemplateId: mission.phaseTemplateId,
      stars: mission.stars ?? null,
      hasOverride: Boolean(override),
      waveCount: phase.waves.length,
    },
    phase,
    override,
    baselinePhase,
  };
}

export function buildMissionBattleLabPayload(
  diskOverrides?: Record<string, PhaseBattleOverride>,
): {
  missions: MissionBattleListEntry[];
  enemies: ReturnType<typeof listEnemyOptionsForLab>;
} {
  return {
    missions: listMissionBattleEntries(diskOverrides),
    enemies: listEnemyOptionsForLab(),
  };
}
