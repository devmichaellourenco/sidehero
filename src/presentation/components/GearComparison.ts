import { GameStateDto, GearDto, HeroDto } from '../../application/dto/GameStateDto';
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

function gearPower(gear: Pick<GearDto, 'attackBonus' | 'defenseBonus' | 'healthBonus'>): number {
  return gear.attackBonus + gear.defenseBonus + gear.healthBonus;
}

export type GearUpgradeStatus = 'upgrade' | 'downgrade' | 'equal';

export interface GearUpgradeInfo {
  status: GearUpgradeStatus;
  gain: number;
  recommendation: BestHeroRecommendation | null;
}

export function getGearUpgradeInfo(state: GameStateDto, gear: GearDto): GearUpgradeInfo {
  const recommendation = findBestHeroForGear(state, gear);
  if (!recommendation) {
    return { status: 'equal', gain: 0, recommendation: null };
  }

  if (recommendation.totalGain > 0) {
    return { status: 'upgrade', gain: recommendation.totalGain, recommendation };
  }

  if (recommendation.totalGain < 0) {
    return { status: 'downgrade', gain: recommendation.totalGain, recommendation };
  }

  return { status: 'equal', gain: 0, recommendation };
}

export function renderUpgradeBadge(status: GearUpgradeStatus): string {
  const labels: Record<GearUpgradeStatus, string> = {
    upgrade: '↑ upgrade',
    downgrade: '↓ pior',
    equal: '= igual',
  };

  return `<span class="gear-upgrade-badge gear-upgrade-${status}">${labels[status]}</span>`;
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
  if (state.heroes.length === 0) return null;

  let best: BestHeroRecommendation | null = null;

  for (const hero of state.heroes) {
    const equipped = hero.equipment[gear.slot] ?? null;
    const currentPower = equipped ? gearPower(equipped) : 0;
    const totalGain = gearPower(gear) - currentPower;

    if (!best || totalGain > best.totalGain) {
      best = {
        heroId: hero.id,
        heroName: hero.name,
        equipped,
        totalGain,
      };
    }
  }

  return best;
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
