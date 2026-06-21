import { HeroDto } from '../../application/dto/GameStateDto';
import { formatCombatResistTooltipLine } from '../../application/mappers/CombatResistMapper';
import {
  formatExperienceLabel,
  formatHealthLabel,
} from './HeroBarsPresentation';
import { renderBattleActorCard } from './BattleActorCardPresentation';
import { clampHealthPercent } from './BattleActorHealthPresentation';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderHeroTooltipContent(hero: HeroDto): string {
  const healthLabel = formatHealthLabel(hero);
  const xpLabel = formatExperienceLabel(hero);
  const resistLine = formatCombatResistTooltipLine(hero.combatResists);

  return `
    <strong class="hero-tooltip-name">${escapeHtml(hero.name)}</strong>
    <span class="hero-tooltip-line">Lv.${hero.level}</span>
    <span class="hero-tooltip-line">${healthLabel}</span>
    <span class="hero-tooltip-line">${xpLabel}</span>
    <span class="hero-tooltip-line">ATK ${hero.attack} · DEF ${hero.defense}</span>
    <span class="hero-tooltip-line">ASPD ${hero.attackSpeed.toFixed(2)}/s · Cast ${hero.castSpeed.toFixed(2)}×</span>
    <span class="hero-tooltip-line">Crít ${(hero.critChance * 100).toFixed(1)}% · Dmg ${(hero.critDamage * 100).toFixed(0)}%</span>
    ${resistLine ? `<span class="hero-tooltip-line hero-tooltip-resist">${escapeHtml(resistLine)}</span>` : ''}
  `;
}

function renderGearTooltipLine(label: string, gearName: string | null): string {
  return `<span class="hero-tooltip-line">${label}: ${gearName ? escapeHtml(gearName) : '—'}</span>`;
}

export function renderHeroFormationTooltipContent(hero: HeroDto): string {
  const skillNames =
    hero.activeSkills.length > 0
      ? hero.activeSkills.map((skill) => skill.name).join(', ')
      : '—';

  return `
    ${renderHeroTooltipContent(hero)}
    <span class="hero-tooltip-divider"></span>
    ${renderGearTooltipLine('Arma', hero.equipment.weapon?.name ?? null)}
    ${renderGearTooltipLine('Armadura', hero.equipment.armor?.name ?? null)}
    ${renderGearTooltipLine('Acessório', hero.equipment.accessory?.name ?? null)}
    <span class="hero-tooltip-line">Skills: ${escapeHtml(skillNames)}</span>
  `;
}

export function renderHeroBattleSprite(
  hero: HeroDto,
  glowHtml: string,
  spriteHtml: string,
  options: { isActiveTurn?: boolean } = {},
): string {
  return renderBattleActorCard({
    side: 'hero',
    id: hero.id,
    name: hero.name,
    isActiveTurn: options.isActiveTurn ?? false,
    spriteInnerHtml: `${glowHtml}${spriteHtml}`,
    tooltipHtml: renderHeroTooltipContent(hero),
    healthLabel: formatHealthLabel(hero),
    healthPercent: clampHealthPercent(hero.health, hero.maxHealth),
    statusEffects: hero.statusEffects,
    combatSkills: hero.combatSkills,
  });
}
