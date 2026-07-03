import { GearDto } from '../../application/dto/GameStateDto';
import {
  getGearFrameSprite,
  getGearRaritySprite,
  getGearSlotSprite,
  getGearSprite,
  imgTag,
} from '../assets/AssetCatalog';
import {
  renderGearBonusLines,
  GEAR_RARITY_LABELS,
  GEAR_SLOT_LABELS,
  GearSlotKey,
} from './GearPresentation';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderGearConfirmCard(gear: GearDto, compact = false): string {
  const frameUrl = getGearFrameSprite(gear.rarity);
  const slotLabel = GEAR_SLOT_LABELS[gear.slot as GearSlotKey] ?? gear.slot;
  const rarityLabel = GEAR_RARITY_LABELS[gear.rarity] ?? gear.rarity;
  const cardClass = compact ? 'destroy-confirm-gear destroy-confirm-gear--compact' : 'destroy-confirm-gear';

  return `
    <div class="${cardClass} ${gear.rarity}" style="--gear-frame: url('${frameUrl}')">
      <span class="destroy-confirm-gear-icon-wrap">
        ${imgTag(getGearSprite(gear), slotLabel, 'destroy-confirm-gear-icon')}
        ${imgTag(getGearRaritySprite(gear.rarity), rarityLabel, 'destroy-confirm-gear-rarity')}
      </span>
      <div class="destroy-confirm-gear-info">
        <strong class="destroy-confirm-gear-name">${escapeHtml(gear.name)}</strong>
        <span class="destroy-confirm-gear-meta">${slotLabel} · ${rarityLabel}</span>
        ${
          compact
            ? ''
            : `<span class="destroy-confirm-gear-stats">${renderGearBonusLines(gear)}</span>`
        }
      </div>
    </div>
  `;
}

export function renderForgeSalvageConfirmContent(gear: GearDto, goldPreview: number): string {
  return `
    ${renderGearConfirmCard(gear)}
    <p class="forge-confirm-reward">
      Receberá <strong>+${goldPreview} ouro</strong> ao destruir este item na Forja Divina.
    </p>
    <p class="destroy-confirm-warning">
      Este item será removido permanentemente. Esta ação não pode ser desfeita.
    </p>
  `;
}

export function renderForgeFuseConfirmContent(
  gears: GearDto[],
  nextRarityLabel: string,
): string {
  return `
    <p class="forge-confirm-intro">
      Fundir estes ${gears.length} itens em um item aleatório <strong>${escapeHtml(nextRarityLabel)}</strong>?
    </p>
    <div class="forge-confirm-grid">
      ${gears.map((gear) => renderGearConfirmCard(gear, true)).join('')}
    </div>
    <p class="destroy-confirm-warning">
      Os ${gears.length} itens serão consumidos permanentemente. Esta ação não pode ser desfeita.
    </p>
  `;
}
