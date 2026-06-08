import { CombatSkillIntentDto } from '../../application/dto/GameStateDto';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderCombatSkillIntent(intent: CombatSkillIntentDto | null | undefined): string {
  if (!intent) return '';

  const statusClass =
    intent.status === 'ready'
      ? 'combat-skill-intent--ready'
      : 'combat-skill-intent--cooldown';

  const chargingHtml = intent.chargingSkills
    .map(
      (entry) =>
        `<span class="combat-skill-charge">${escapeHtml(entry.skillName)} · ${entry.turnsRemaining}t</span>`,
    )
    .join('');

  return `
    <div class="combat-skill-intent ${statusClass}" title="Próxima ação">
      <span class="combat-skill-intent-label">→ ${escapeHtml(intent.nextSkillName)}</span>
    </div>
    ${chargingHtml ? `<div class="combat-skill-charging">${chargingHtml}</div>` : ''}
  `;
}
