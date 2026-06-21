import { EnemyDto } from '../../application/dto/GameStateDto';
import { formatCombatResistTooltipLine } from '../../application/mappers/CombatResistMapper';
import { renderBattleActorCard } from './BattleActorCardPresentation';
import { clampHealthPercent } from './BattleActorHealthPresentation';

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
  const resistLine = formatCombatResistTooltipLine(enemy.combatResists);

  return `
    <strong class="enemy-tooltip-name">${escapeHtml(enemy.name)}</strong>
    <span class="enemy-tooltip-line">Stage ${stage}</span>
    <span class="enemy-tooltip-line">${healthLabel}</span>
    <span class="enemy-tooltip-line">ATK ${enemy.attack} · DEF ${enemy.defense}</span>
    <span class="enemy-tooltip-line">+${enemy.goldReward} ouro · +${enemy.xpReward} XP</span>
    ${resistLine ? `<span class="enemy-tooltip-line enemy-tooltip-resist">${escapeHtml(resistLine)}</span>` : ''}
    ${skillLines}
  `;
}

export function renderEnemyBattleCard(
  enemy: EnemyDto,
  stage: number,
  spriteHtml: string,
  options: { isActiveTurn?: boolean; isBossWave?: boolean } = {},
): string {
  return renderBattleActorCard({
    side: 'enemy',
    id: enemy.id,
    name: enemy.name,
    isActiveTurn: options.isActiveTurn ?? false,
    isBoss: options.isBossWave,
    spriteInnerHtml: spriteHtml,
    tooltipHtml: renderEnemyTooltipContent(enemy, stage),
    healthLabel: formatEnemyHealthLabel(enemy),
    healthPercent: clampHealthPercent(enemy.health, enemy.maxHealth),
    statusEffects: enemy.statusEffects,
    combatSkills: enemy.combatSkills,
  });
}
