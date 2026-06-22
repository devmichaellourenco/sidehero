import { FORGE_FUSE_REQUIRED_COUNT } from '../../domain/gear/GearRarityProgression';
import { calculateForgeSalvageGold } from '../../domain/forge/ForgeSalvageGoldCatalog';
import { GearDto } from '../../application/dto/GameStateDto';
import {
  getGearFrameSprite,
  getGearRaritySprite,
  getGearSlotSprite,
  imgTag,
} from '../assets/AssetCatalog';
import {
  formatGearBonuses,
  GEAR_RARITY_LABELS,
  GEAR_SLOT_LABELS,
  GearSlotKey,
} from './GearPresentation';

export const DIVINE_FORGE_FUSE_COUNT = FORGE_FUSE_REQUIRED_COUNT;

const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'] as const;

export type DivineForgeTab = 'create' | 'salvage';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getNextRarityLabel(rarity: string): string | null {
  const index = RARITY_ORDER.indexOf(rarity as (typeof RARITY_ORDER)[number]);
  if (index < 0 || index >= RARITY_ORDER.length - 1) {
    return null;
  }
  const next = RARITY_ORDER[index + 1];
  return GEAR_RARITY_LABELS[next] ?? next;
}

export interface ForgeSelectionStatus {
  count: number;
  requiredCount: number;
  rarity: string | null;
  canFuse: boolean;
  nextRarityLabel: string | null;
  mixedRarity: boolean;
}

export function evaluateForgeSelection(selectedIds: Set<string>, inventory: GearDto[]): ForgeSelectionStatus {
  const selected = inventory.filter((gear) => selectedIds.has(gear.id));
  const count = selected.length;
  const rarities = new Set(selected.map((gear) => gear.rarity));
  const rarity = rarities.size === 1 ? selected[0]?.rarity ?? null : null;
  const mixedRarity = count > 0 && rarities.size > 1;
  const nextRarityLabel = rarity ? getNextRarityLabel(rarity) : null;
  const canFuse =
    count === DIVINE_FORGE_FUSE_COUNT &&
    rarity !== null &&
    nextRarityLabel !== null &&
    !mixedRarity;

  return {
    count,
    requiredCount: DIVINE_FORGE_FUSE_COUNT,
    rarity,
    canFuse,
    nextRarityLabel,
    mixedRarity,
  };
}

function renderForgeSlot(
  gear: GearDto,
  options: { selected: boolean; tab: DivineForgeTab; stage: number },
): string {
  const frameUrl = getGearFrameSprite(gear.rarity);
  const slotLabel = GEAR_SLOT_LABELS[gear.slot as GearSlotKey] ?? gear.slot;
  const rarityLabel = GEAR_RARITY_LABELS[gear.rarity] ?? gear.rarity;

  return `
    <button
      type="button"
      class="inventory-grid-slot forge-grid-slot ${gear.rarity}${options.selected ? ' forge-grid-slot--selected' : ''}"
      data-forge-gear-id="${escapeHtml(gear.id)}"
      aria-pressed="${options.selected ? 'true' : 'false'}"
      aria-label="${escapeHtml(gear.name)} · ${slotLabel} · ${rarityLabel}"
      style="--gear-frame: url('${frameUrl}')"
    >
      <span class="inventory-grid-slot-icon-wrap">
        ${imgTag(getGearSlotSprite(gear.slot), slotLabel, 'inventory-grid-slot-icon')}
        ${imgTag(getGearRaritySprite(gear.rarity), rarityLabel, 'inventory-grid-slot-rarity')}
      </span>
      <span class="inventory-gear-tooltip-content hidden">
        <strong class="inventory-gear-tooltip-name">${escapeHtml(gear.name)}</strong>
        <span class="inventory-gear-tooltip-meta">${slotLabel} · ${rarityLabel} · Lv.${gear.requirements.minLevel}</span>
        <span class="inventory-gear-tooltip-stats">${formatGearBonuses(gear)}</span>
        ${
          options.tab === 'salvage'
            ? `<span class="forge-salvage-preview">+${calculateForgeSalvageGold(gear.rarity as GearDto['rarity'], options.stage)} ouro</span>`
            : ''
        }
      </span>
    </button>
  `;
}

export function renderForgeGrid(
  inventory: GearDto[],
  options: {
    tab: DivineForgeTab;
    selectedIds: Set<string>;
    stage: number;
  },
): string {
  if (inventory.length === 0) {
    return '<p class="empty-state modal-empty">Inventário vazio — obtenha itens nos baús.</p>';
  }

  const sorted = [...inventory].sort((left, right) => {
    const leftRank = RARITY_ORDER.indexOf(left.rarity as (typeof RARITY_ORDER)[number]);
    const rightRank = RARITY_ORDER.indexOf(right.rarity as (typeof RARITY_ORDER)[number]);
    if (rightRank !== leftRank) return rightRank - leftRank;
    return left.name.localeCompare(right.name, 'pt-BR');
  });

  return `
    <div class="inventory-grid forge-grid">
      ${sorted
        .map((gear) =>
          renderForgeSlot(gear, {
            selected: options.selectedIds.has(gear.id),
            tab: options.tab,
            stage: options.stage,
          }),
        )
        .join('')}
    </div>
  `;
}

export function renderCreateTabPanel(
  status: ForgeSelectionStatus,
): string {
  const rarityHint =
    status.mixedRarity
      ? '<p class="forge-hint forge-hint--warn">Selecione itens da mesma raridade.</p>'
      : status.rarity
        ? `<p class="forge-hint">Raridade selecionada: <strong>${GEAR_RARITY_LABELS[status.rarity] ?? status.rarity}</strong></p>`
        : '<p class="forge-hint">Selecione 9 itens da mesma raridade no inventário.</p>';

  const resultHint =
    status.canFuse && status.nextRarityLabel
      ? `<p class="forge-result-hint">Resultado: item aleatório <strong>${status.nextRarityLabel}</strong></p>`
      : status.count === status.requiredCount && !status.canFuse
        ? '<p class="forge-hint forge-hint--warn">Não é possível fundir esta combinação (raridade máxima ou mista).</p>'
        : '';

  return `
    <div class="forge-action-panel">
      <p class="forge-selection-count">${status.count}/${status.requiredCount} selecionados</p>
      ${rarityHint}
      ${resultHint}
      <button
        type="button"
        class="primary-btn forge-fuse-btn"
        data-forge-fuse
        ${status.canFuse ? '' : 'disabled'}
      >
        Criar item
      </button>
    </div>
  `;
}

export function renderSalvageTabPanel(
  selectedGear: GearDto | null,
  stage: number,
): string {
  const goldPreview = selectedGear
    ? calculateForgeSalvageGold(selectedGear.rarity as GearDto['rarity'], stage)
    : 0;

  return `
    <div class="forge-action-panel">
      <p class="forge-hint">Selecione um item do inventário para destruir e receber ouro.</p>
      ${
        selectedGear
          ? `<p class="forge-result-hint">${escapeHtml(selectedGear.name)} → <strong>+${goldPreview} ouro</strong></p>`
          : '<p class="forge-selection-count">Nenhum item selecionado</p>'
      }
      <button
        type="button"
        class="primary-btn forge-salvage-btn"
        data-forge-salvage
        ${selectedGear ? '' : 'disabled'}
      >
        Destruir por ouro${selectedGear ? ` (+${goldPreview})` : ''}
      </button>
    </div>
  `;
}

export function renderForgeTabs(activeTab: DivineForgeTab): string {
  return `
    <div class="forge-tabs" role="tablist" aria-label="Modos da Forja Divina">
      <button
        type="button"
        class="forge-tab ${activeTab === 'create' ? 'forge-tab--active' : ''}"
        data-forge-tab="create"
        role="tab"
        aria-selected="${activeTab === 'create' ? 'true' : 'false'}"
      >
        Criar item
      </button>
      <button
        type="button"
        class="forge-tab ${activeTab === 'salvage' ? 'forge-tab--active' : ''}"
        data-forge-tab="salvage"
        role="tab"
        aria-selected="${activeTab === 'salvage' ? 'true' : 'false'}"
      >
        Destruir por ouro
      </button>
    </div>
  `;
}
