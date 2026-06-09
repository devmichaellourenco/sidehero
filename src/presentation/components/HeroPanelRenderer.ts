import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getHeroSprite, imgTag } from '../assets/AssetCatalog';
import { bindBarTooltips } from './BarTooltipBinder';
import { bindEquipmentTooltips } from './EquipmentTooltipBinder';
import { bindSkillChipTooltips } from './SkillChipTooltipBinder';
import { renderHeroBars } from './HeroBarsPresentation';
import { renderHeroLoadoutStrip } from './HeroLoadoutStripPresentation';

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
                <div class="hero-card-meta">
                  <span class="hero-level">Lv.${hero.level}</span>
                  <span class="hero-inline-stats">
                    ${imgTag(attackIcon, 'Ataque', 'stat-icon')}
                    <span>${hero.attack}</span>
                    ${imgTag(defenseIcon, 'Defesa', 'stat-icon')}
                    <span>${hero.defense}</span>
                    ${imgTag(healthIcon, 'Vida', 'stat-icon')}
                    <span>${hero.health}/${hero.maxHealth}</span>
                  </span>
                </div>
              </div>
              ${renderHeroBars(hero, { compact: true })}
            </button>
            ${renderHeroLoadoutStrip(hero)}
          </article>
        `;
      })
      .join('');

    bindBarTooltips(this.container);
    bindEquipmentTooltips(this.container);
    bindSkillChipTooltips(this.container);
  }
}
