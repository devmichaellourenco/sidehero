import { CombatStatusEffectDto } from '../../application/dto/GameStateDto';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderCombatStatusEffects(effects: CombatStatusEffectDto[]): string {
  if (effects.length === 0) return '';

  const chips = effects
    .map((effect) => {
      const polarityClass =
        effect.polarity === 'buff'
          ? 'combat-status-effect--buff'
          : 'combat-status-effect--debuff';
      return `<span class="combat-status-effect ${polarityClass}">${escapeHtml(effect.label)} · ${effect.turnsRemaining}t</span>`;
    })
    .join('');

  return `<div class="combat-status-effects">${chips}</div>`;
}
