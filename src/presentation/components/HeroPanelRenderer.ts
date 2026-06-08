import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getHeroSprite, imgTag } from '../assets/AssetCatalog';
import { bindBarTooltips } from './BarTooltipBinder';
import { bindEquipmentTooltips } from './EquipmentTooltipBinder';
import { renderHeroActiveSkills } from './HeroActiveSkillsPresentation';
import { renderHeroBars } from './HeroBarsPresentation';
import { renderHeroEquipmentRow } from './GearPresentation';

export class HeroPanelRenderer {
  constructor(private readonly container: HTMLElement) {}

  render(state: GameStateDto): void {
    const attackIcon = getAssetUrl(ASSETS.ui.attack);
    const defenseIcon = getAssetUrl(ASSETS.ui.defense);
    const healthIcon = getAssetUrl(ASSETS.ui.health);

    this.container.innerHTML = state.heroes
      .map((hero) => {
        return `
          <article class="hero-card" data-hero-card="${hero.id}">
            <button type="button" class="hero-card-main" data-hero-open="${hero.id}">
              <div class="hero-card-header">
                <strong class="hero-card-title">
                  ${imgTag(getHeroSprite(hero.heroClass), hero.name, 'hero-card-icon')}
                  <span>${hero.name}</span>
                </strong>
                <span class="hero-level">Lv.${hero.level}</span>
              </div>
              <div class="hero-stats">
                ${imgTag(attackIcon, 'Ataque', 'stat-icon')} ${hero.attack}
                ${imgTag(defenseIcon, 'Defesa', 'stat-icon')} ${hero.defense}
                ${imgTag(healthIcon, 'Vida', 'stat-icon')} ${hero.health}/${hero.maxHealth}
              </div>
              ${renderHeroBars(hero, { compact: true })}
              ${renderHeroActiveSkills(hero)}
            </button>
            ${renderHeroEquipmentRow(hero, true)}
          </article>
        `;
      })
      .join('');

    bindBarTooltips(this.container);
    bindEquipmentTooltips(this.container);
  }
}
