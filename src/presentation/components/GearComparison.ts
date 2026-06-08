import { GameStateDto, GearDto, HeroDto } from '../../application/dto/GameStateDto';
import { GearUpgradeHintDto } from '../../application/dto/GearUpgradeHintDto';
import { EquippedGearDto, GEAR_SLOT_LABELS, GearSlotKey } from './GearPresentation';

export interface GearStatComparison {
  attack: string;
  defense: string;
  health: string;
}

export interface BestHeroRecommendation {
  heroId: string;
  heroName: string;
  equipped: EquippedGearDto | null;
  totalGain: number;
}

export type GearUpgradeStatus = GearUpgradeHintDto['status'];

export interface GearUpgradeInfo {
  status: GearUpgradeStatus;
  gain: number;
  recommendation: BestHeroRecommendation | null;
}

function toRecommendation(hint: GearUpgradeHintDto): BestHeroRecommendation {
  return {
    heroId: hint.heroId,
    heroName: hint.heroName,
    equipped: hint.equipped,
    totalGain: hint.gain,
  };
}

export function getGearUpgradeInfo(state: GameStateDto, gear: GearDto): GearUpgradeInfo {
  const hint = state.gearUpgradeHints[gear.id];
  if (!hint) {
    return { status: 'equal', gain: 0, recommendation: null };
  }

  return {
    status: hint.status,
    gain: hint.gain,
    recommendation: toRecommendation(hint),
  };
}

export function renderUpgradeBadge(status: GearUpgradeStatus): string {
  const labels: Record<GearUpgradeStatus, string> = {
    upgrade: '↑ upgrade',
    downgrade: '↓ pior',
    equal: '= igual',
  };

  return `<span class="gear-upgrade-badge gear-upgrade-${status}">${labels[status]}</span>`;
}

export function countUpgradeItems(state: GameStateDto): number {
  return state.inventory.filter((gear) => getGearUpgradeInfo(state, gear).status === 'upgrade').length;
}

export function countRecommendedFromLoot(state: GameStateDto, gearIds: string[]): number {
  return gearIds.filter((gearId) => {
    const gear = state.inventory.find((entry) => entry.id === gearId);
    if (!gear) return false;
    return getGearUpgradeInfo(state, gear).gain > 0;
  }).length;
}

export function sortGearByBestGain(state: GameStateDto, gears: GearDto[]): GearDto[] {
  return [...gears].sort((left, right) => {
    const leftGain = getGearUpgradeInfo(state, left).gain;
    const rightGain = getGearUpgradeInfo(state, right).gain;
    if (rightGain !== leftGain) return rightGain - leftGain;
    return left.name.localeCompare(right.name, 'pt-BR');
  });
}

export function findBestHeroForGear(state: GameStateDto, gear: GearDto): BestHeroRecommendation | null {
  const hint = state.gearUpgradeHints[gear.id];
  return hint ? toRecommendation(hint) : null;
}

function formatDelta(current: number, next: number, label: string): string {
  const delta = next - current;
  if (delta === 0) {
    return `${label}: ${next} (igual)`;
  }

  const sign = delta > 0 ? '+' : '';
  const cssClass = delta > 0 ? 'stat-better' : 'stat-worse';
  return `<span class="${cssClass}">${label}: ${current} → ${next} (${sign}${delta})</span>`;
}

export function compareGearWithEquipped(
  gear: GearDto,
  equipped: EquippedGearDto | null,
): GearStatComparison {
  const currentAtk = equipped?.attackBonus ?? 0;
  const currentDef = equipped?.defenseBonus ?? 0;
  const currentHp = equipped?.healthBonus ?? 0;

  return {
    attack: formatDelta(currentAtk, gear.attackBonus, 'ATK'),
    defense: formatDelta(currentDef, gear.defenseBonus, 'DEF'),
    health: formatDelta(currentHp, gear.healthBonus, 'HP'),
  };
}

export function renderInlineComparison(
  gear: GearDto,
  equipped: EquippedGearDto | null,
): string {
  const comparison = compareGearWithEquipped(gear, equipped);

  return `
    <div class="gear-inline-comparison">
      <span>${comparison.attack}</span>
      <span>${comparison.defense}</span>
      <span>${comparison.health}</span>
    </div>
  `;
}

export function renderComparisonBlock(
  gear: GearDto,
  hero: HeroDto,
  equipped: EquippedGearDto | null,
): string {
  const comparison = compareGearWithEquipped(gear, equipped);
  const slotLabel = GEAR_SLOT_LABELS[gear.slot as GearSlotKey] ?? gear.slot;
  const equippedLabel = equipped ? equipped.name : 'Nenhum';

  return `
    <div class="loot-comparison">
      <p class="loot-comparison-hero">Melhor para <strong>${hero.name}</strong> · ${slotLabel}</p>
      <p class="loot-comparison-equipped">Equipado: ${equippedLabel}</p>
      <div class="loot-comparison-stats">
        <span>${comparison.attack}</span>
        <span>${comparison.defense}</span>
        <span>${comparison.health}</span>
      </div>
    </div>
  `;
}
