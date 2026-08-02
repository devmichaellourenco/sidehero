import { EnemyDto } from '../../application/dto/GameStateDto';
import { renderCombatResistPips } from './ElementPipPresentation';
import { renderBattleActorCard } from './BattleActorCardPresentation';
import { clampHealthPercent, formatStripHealthCurrent } from './BattleActorHealthPresentation';

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
  const elementalPips = renderCombatResistPips(enemy.combatResists);

  return `
    <strong class="enemy-tooltip-name">${escapeHtml(enemy.name)}</strong>
    <span class="enemy-tooltip-line">Stage ${stage}</span>
    <span class="enemy-tooltip-line">${healthLabel}</span>
    <span class="enemy-tooltip-line">ATK ${enemy.attack} · DEF ${enemy.defense}</span>
    <span class="enemy-tooltip-line">ASPD ${enemy.attackSpeed.toFixed(2)}/s · TTA ${(1 / Math.max(enemy.attackSpeed, 0.01)).toFixed(2)}s</span>
    <span class="enemy-tooltip-line">+${enemy.goldReward} ouro · +${enemy.xpReward} XP</span>
    ${elementalPips ? `<span class="enemy-tooltip-line enemy-tooltip-elements">${elementalPips}</span>` : ''}
    ${skillLines}
  `;
}

export function renderEnemyBattleCard(
  enemy: EnemyDto,
  stage: number,
  spriteHtml: string,
  options: { isActiveTurn?: boolean } = {},
): string {
  return renderBattleActorCard({
    side: 'enemy',
    id: enemy.id,
    name: enemy.name,
    isActiveTurn: options.isActiveTurn ?? false,
    isBoss: enemy.role === 'boss',
    spriteInnerHtml: spriteHtml,
    tooltipHtml: renderEnemyTooltipContent(enemy, stage),
    healthLabel: formatEnemyHealthLabel(enemy),
    healthCurrent: formatStripHealthCurrent(enemy.health),
    healthPercent: clampHealthPercent(enemy.health, enemy.maxHealth),
    actionTimeRatio: enemy.actionTimeRatio,
    actionTimeRemaining: enemy.actionTimeRemaining,
    actionTimeTotal: enemy.actionTimeTotal,
    attackSpeed: enemy.attackSpeed,
    statusEffects: enemy.statusEffects,
    combatSkills: enemy.combatSkills,
  });
}
