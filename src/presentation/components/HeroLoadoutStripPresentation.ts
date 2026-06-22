import { HeroDto } from '../../application/dto/GameStateDto';
import { renderHeroActiveSkillSlots } from './HeroActiveSkillsPresentation';
import { renderHeroEquipmentLoadout } from './GearPresentation';

export type HeroLoadoutStripVariant = 'default' | 'featured';

export function renderHeroLoadoutStrip(
  hero: HeroDto,
  options: { variant?: HeroLoadoutStripVariant } = {},
): string {
  const variantClass =
    options.variant === 'featured' ? ' hero-loadout-strip--featured' : '';

  return `
    <div
      class="hero-loadout-strip${variantClass}"
      aria-label="Loadout de batalha: ${hero.activeSkills.length}/${hero.maxActiveSkills} skills"
    >
      <div class="hero-loadout-group hero-loadout-skills">
        ${renderHeroActiveSkillSlots(hero)}
      </div>
      <div class="hero-loadout-divider" aria-hidden="true"></div>
      <div class="hero-loadout-group hero-loadout-gear">
        ${renderHeroEquipmentLoadout(hero)}
      </div>
    </div>
  `;
}
