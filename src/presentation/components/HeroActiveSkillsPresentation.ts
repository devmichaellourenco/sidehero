import { HeroDto } from '../../application/dto/GameStateDto';
import { imgTag, getGearFrameSprite } from '../assets/AssetCatalog';
import { getSkillBranchFrameUrl, getSkillIconUrl } from '../assets/SkillIconCatalog';
import { renderSkillRankLabel, renderSkillTooltipContent } from './SkillTooltipPresentation';

const LOCKED_SLOT_UPGRADE_NAMES: Record<number, string> = {
  2: 'Slot de skill II',
  3: 'Slot de skill III',
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSkillChip(skill: HeroDto['activeSkills'][number], heroId: string): string {
  const rankLabel = renderSkillRankLabel(skill.currentRank, skill.maxRank);
  const frameUrl = getSkillBranchFrameUrl(skill.branch);

  return `
    <button
      type="button"
      class="loadout-slot loadout-slot--skill hero-skill-chip hero-skill-chip--${skill.branch}"
      data-hero-skills-open="${heroId}"
      data-skill-tooltip
      aria-label="${escapeHtml(skill.name)} — ${escapeHtml(rankLabel)}"
      title="${escapeHtml(skill.name)}"
      style="--slot-frame: url('${frameUrl}')"
    >
      ${imgTag(getSkillIconUrl(skill.id), skill.name, 'loadout-slot-icon hero-skill-chip-icon')}
      ${renderSkillTooltipContent(skill)}
    </button>
  `;
}

function renderEmptySkillSlot(heroId: string): string {
  const frameUrl = getGearFrameSprite('common');
  const title = 'Slot de skill vazio — clique para gerenciar skills';

  return `
    <button
      type="button"
      class="loadout-slot loadout-slot--skill loadout-slot--empty hero-skill-chip hero-skill-chip--empty"
      data-hero-skills-open="${heroId}"
      style="--slot-frame: url('${frameUrl}')"
      title="${title}"
      aria-label="${title}"
    ></button>
  `;
}

function renderLockedSkillSlot(slotNumber: number): string {
  const frameUrl = getGearFrameSprite('common');
  const upgradeName = LOCKED_SLOT_UPGRADE_NAMES[slotNumber] ?? 'Melhorias';
  const title = `Slot bloqueado — desbloqueie em Melhorias (${upgradeName})`;

  return `
    <button
      type="button"
      class="loadout-slot loadout-slot--skill loadout-slot--locked"
      data-open-upgrades
      style="--slot-frame: url('${frameUrl}')"
      title="${title}"
      aria-label="${title}"
    >
      <span class="loadout-slot-lock" aria-hidden="true">🔒</span>
    </button>
  `;
}

export function renderHeroActiveSkillSlots(hero: HeroDto): string {
  return Array.from({ length: hero.maxActiveSkills }, (_, index) => {
    const slotNumber = index + 1;

    if (slotNumber > hero.unlockedActiveSkillSlots) {
      return renderLockedSkillSlot(slotNumber);
    }

    const skill = hero.activeSkills[index] ?? null;
    return skill ? renderSkillChip(skill, hero.id) : renderEmptySkillSlot(hero.id);
  }).join('');
}
