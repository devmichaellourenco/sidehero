import { EnemyDto } from '../../application/dto/GameStateDto';
import { renderCombatSkillIntent } from './CombatSkillIntentPresentation';
import { renderCombatStatusEffects } from './CombatStatusEffectPresentation';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatEnemyHealthLabel(enemy: Pick<EnemyDto, 'health' | 'maxHealth'>): string {
  return `${enemy.health}/${enemy.maxHealth}`;
}

function renderEnemySkillLines(enemy: EnemyDto): string {
  if (enemy.signatureSkills.length === 0) return '';

  return enemy.signatureSkills
    .map(
      (skill) =>
        `<span class="enemy-tooltip-line enemy-tooltip-skill">${escapeHtml(skill.name)} — ${escapeHtml(skill.description)}</span>`,
    )
    .join('');
}

export function renderEnemyTooltipContent(enemy: EnemyDto, stage: number): string {
  const healthLabel = formatEnemyHealthLabel(enemy);
  const skillLines = renderEnemySkillLines(enemy);

  return `
    <strong class="enemy-tooltip-name">${escapeHtml(enemy.name)}</strong>
    <span class="enemy-tooltip-line">Stage ${stage}</span>
    <span class="enemy-tooltip-line">${healthLabel}</span>
    <span class="enemy-tooltip-line">ATK ${enemy.attack} · DEF ${enemy.defense}</span>
    <span class="enemy-tooltip-line">+${enemy.goldReward} ouro · +${enemy.xpReward} XP</span>
    ${skillLines}
  `;
}

export function renderEnemyBattleCard(
  enemy: EnemyDto,
  stage: number,
  spriteHtml: string,
  options: { isActiveTurn?: boolean; isBossWave?: boolean } = {},
): string {
  const healthPercent = Math.max(0, (enemy.health / enemy.maxHealth) * 100);
  const healthLabel = formatEnemyHealthLabel(enemy);
  const activeClass = options.isActiveTurn ? ' enemy-battle-card--active-turn' : '';
  const bossClass = options.isBossWave ? ' enemy-battle-card--boss' : '';

  return `
    <div class="enemy-battle-card${activeClass}${bossClass}" data-enemy-id="${escapeHtml(enemy.id)}">
      <div
        class="enemy-battle-hitbox"
        data-float-anchor="enemy"
        data-enemy-tooltip
        tabindex="0"
        aria-label="${escapeHtml(enemy.name)}"
      >
        ${spriteHtml}
        <div class="enemy-name">${escapeHtml(enemy.name)}</div>
        <span class="enemy-tooltip-content hidden">${renderEnemyTooltipContent(enemy, stage)}</span>
      </div>
      ${renderCombatStatusEffects(enemy.statusEffects)}
      <div
        class="stat-bar health-bar enemy strip-bar"
        data-bar-label="${healthLabel}"
        tabindex="0"
        aria-label="Vida ${healthLabel}"
      >
        <div class="stat-bar-track">
          <div class="health-fill enemy" style="width: ${healthPercent}%"></div>
        </div>
      </div>
      ${renderCombatSkillIntent(options.isActiveTurn ? enemy.combatIntent : null)}
    </div>
  `;
}
