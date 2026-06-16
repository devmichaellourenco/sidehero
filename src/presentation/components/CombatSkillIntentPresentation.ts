import { CombatBattleSkillDto } from '../../application/dto/GameStateDto';
import { getSkillDisplayName, getSkillIconUrl } from '../assets/SkillIconCatalog';
import { imgTag } from '../assets/AssetCatalog';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSkillCooldownOverlay(skill: CombatBattleSkillDto): string {
  if (skill.ready) {
    return `
      <span class="combat-skill-cooldown combat-skill-cooldown--ready" aria-hidden="true">
        <span class="combat-skill-cooldown-shade"></span>
      </span>
    `;
  }

  return `
    <span class="combat-skill-cooldown" aria-hidden="true" data-remaining-label="${escapeHtml(skill.cooldownLabel)}">
      <span class="combat-skill-cooldown-shade" style="--cooldown-ratio: ${skill.cooldownRatio}"></span>
      <span class="combat-skill-cooldown-fill"></span>
      <span class="combat-skill-cooldown-label">${escapeHtml(skill.cooldownLabel)}</span>
    </span>
  `;
}

function renderSkillSlot(skill: CombatBattleSkillDto): string {
  const label = getSkillDisplayName(skill.skillId, skill.skillName);
  const iconUrl = getSkillIconUrl(skill.skillId);
  const highlightClass =
    skill.highlight === 'next'
      ? ' combat-skill-slot--next'
      : skill.highlight === 'queued'
        ? ' combat-skill-slot--queued'
        : skill.ready
          ? ' combat-skill-slot--ready'
          : ' combat-skill-slot--cooldown';

  return `
    <div
      class="combat-skill-slot${highlightClass}"
      data-skill-id="${escapeHtml(skill.skillId)}"
      title="${escapeHtml(label)}"
      aria-label="${escapeHtml(label)}"
    >
      <span class="combat-skill-icon-wrap">
        ${imgTag(iconUrl, label, 'combat-skill-icon')}
        ${renderSkillCooldownOverlay(skill)}
      </span>
    </div>
  `;
}

export function renderCombatSkillBar(skills: CombatBattleSkillDto[] | null | undefined): string {
  if (!skills || skills.length === 0) return '';

  return `
    <div class="combat-skill-bar combat-skill-floor-slot" data-combat-skill-bar data-skill-count="${skills.length}">
      ${skills.map(renderSkillSlot).join('')}
    </div>
  `;
}

/** @deprecated Use renderCombatSkillBar */
export function renderCombatSkillIntent(
  intent: { nextSkillId: string; nextSkillName: string; status: 'ready' | 'cooldown' } | null | undefined,
): string {
  if (!intent) return '';

  return renderCombatSkillBar([
    {
      skillId: intent.nextSkillId,
      skillName: intent.nextSkillName,
      secondsRemaining: 0,
      cooldownTotal: 0,
      ready: intent.status === 'ready',
      highlight: 'next',
      cooldownLabel: '',
      cooldownRatio: 0,
    },
  ]);
}

export function combatSkillBarKey(skills: CombatBattleSkillDto[] | null | undefined): string {
  if (!skills || skills.length === 0) return '';

  return JSON.stringify(
    skills.map((skill) => ({
      id: skill.skillId,
      r: Math.round(skill.secondsRemaining * 10) / 10,
      h: skill.highlight,
    })),
  );
}

export function patchCombatSkillBar(
  card: HTMLElement,
  skills: CombatBattleSkillDto[] | null | undefined,
): void {
  if (!skills || skills.length === 0) {
    card.querySelector('[data-combat-skill-bar]')?.remove();
    return;
  }

  const structureKey = skills.map((skill) => `${skill.skillId}:${skill.highlight}`).join('|');
  const bar = card.querySelector<HTMLElement>('[data-combat-skill-bar]');

  if (!bar || bar.dataset.structureKey !== structureKey) {
    const html = renderCombatSkillBar(skills);
    if (bar) {
      bar.outerHTML = html;
    } else {
      card.insertAdjacentHTML('beforeend', html);
    }
    card.querySelector<HTMLElement>('[data-combat-skill-bar]')?.setAttribute(
      'data-structure-key',
      structureKey,
    );
  }

  patchCombatSkillCooldowns(card, skills);
}

export function patchCombatSkillCooldowns(
  card: HTMLElement,
  skills: CombatBattleSkillDto[] | null | undefined,
): void {
  if (!skills || skills.length === 0) return;

  for (const skill of skills) {
    const slot = card.querySelector<HTMLElement>(`[data-skill-id="${skill.skillId}"]`);
    if (!slot) continue;

    slot.classList.remove(
      'combat-skill-slot--next',
      'combat-skill-slot--queued',
      'combat-skill-slot--ready',
      'combat-skill-slot--cooldown',
    );

    if (skill.highlight === 'next') slot.classList.add('combat-skill-slot--next');
    else if (skill.highlight === 'queued') slot.classList.add('combat-skill-slot--queued');
    else if (skill.ready) slot.classList.add('combat-skill-slot--ready');
    else slot.classList.add('combat-skill-slot--cooldown');

    const overlay = slot.querySelector<HTMLElement>('.combat-skill-cooldown');
    const shade = slot.querySelector<HTMLElement>('.combat-skill-cooldown-shade');
    const label = slot.querySelector<HTMLElement>('.combat-skill-cooldown-label');
    if (!overlay || !shade || !label) continue;

    if (skill.ready) {
      overlay.classList.add('combat-skill-cooldown--ready');
      shade.style.setProperty('--cooldown-ratio', '0');
      label.textContent = '';
      overlay.removeAttribute('data-remaining-label');
      continue;
    }

    overlay.classList.remove('combat-skill-cooldown--ready');
    shade.style.setProperty('--cooldown-ratio', String(skill.cooldownRatio));
    label.textContent = skill.cooldownLabel;
    overlay.setAttribute('data-remaining-label', skill.cooldownLabel);
  }
}
