import { CombatSkillIntentDto } from '../../application/dto/GameStateDto';
import { getSkillDisplayName, getSkillIconUrl } from '../assets/SkillIconCatalog';
import { imgTag } from '../assets/AssetCatalog';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSkillIcon(
  skillId: string,
  skillName: string,
  options: { turnsRemaining?: number; compact?: boolean } = {},
): string {
  const label = getSkillDisplayName(skillId, skillName);
  const iconUrl = getSkillIconUrl(skillId);
  const turnsBadge =
    options.turnsRemaining && options.turnsRemaining > 0
      ? `<span class="combat-skill-turns">${options.turnsRemaining}</span>`
      : '';

  return `
    <span
      class="combat-skill-icon-wrap${options.compact ? ' combat-skill-icon-wrap--compact' : ''}"
      title="${escapeHtml(label)}"
      aria-label="${escapeHtml(label)}"
    >
      ${imgTag(iconUrl, label, 'combat-skill-icon')}
      ${turnsBadge}
    </span>
  `;
}

export function renderCombatSkillIntent(intent: CombatSkillIntentDto | null | undefined): string {
  if (!intent) return '';

  const statusClass =
    intent.status === 'ready'
      ? 'combat-skill-intent--ready'
      : 'combat-skill-intent--cooldown';

  const chargingHtml = intent.chargingSkills
    .map((entry) =>
      renderSkillIcon(entry.skillId, entry.skillName, {
        turnsRemaining: entry.turnsRemaining,
        compact: true,
      }),
    )
    .join('');

  const nextSkillLabel = getSkillDisplayName(intent.nextSkillId, intent.nextSkillName);

  return `
    <div class="combat-skill-floor-slot">
      <div class="combat-skill-intent ${statusClass}" title="Próxima ação: ${escapeHtml(nextSkillLabel)}">
        ${renderSkillIcon(intent.nextSkillId, intent.nextSkillName)}
      </div>
      ${chargingHtml ? `<div class="combat-skill-charging">${chargingHtml}</div>` : ''}
    </div>
  `;
}
