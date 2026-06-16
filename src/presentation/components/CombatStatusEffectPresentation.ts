import { CombatStatusEffectDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function statusIconAsset(kind: CombatStatusEffectDto['kind']): string {
  return kind === 'buff_attack' ? ASSETS.skills.buff : ASSETS.skills.debuff;
}

export function renderCombatStatusEffects(effects: CombatStatusEffectDto[]): string {
  if (effects.length === 0) return '';

  const badges = effects
    .map((effect) => {
      const polarityClass =
        effect.polarity === 'buff'
          ? 'combat-status-badge--buff'
          : 'combat-status-badge--debuff';
      const iconUrl = getAssetUrl(statusIconAsset(effect.kind));
      const iconAlt = effect.polarity === 'buff' ? 'Buff' : 'Debuff';

      return `
        <span
          class="combat-status-badge ${polarityClass}"
          title="${escapeHtml(effect.tooltip)}"
          tabindex="0"
          role="img"
          aria-label="${escapeHtml(effect.tooltip)}"
        >
          ${imgTag(iconUrl, iconAlt, 'combat-status-badge-icon')}
          <span class="combat-status-badge-turns" aria-hidden="true">${effect.turnsRemaining}</span>
        </span>
      `;
    })
    .join('');

  return `<div class="combat-status-badges">${badges}</div>`;
}
