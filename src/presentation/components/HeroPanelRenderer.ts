import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getHeroSprite, imgTag } from '../assets/AssetCatalog';
import { bindEquipmentTooltips } from './EquipmentTooltipBinder';
import { renderHeroEquipmentRow } from './GearPresentation';

export type HeroPanelHandlers = {
  onHeroClick: (heroId: string) => void;
  onSlotClick: (heroId: string, slot: string) => void;
};

export class HeroPanelRenderer {
  constructor(private readonly container: HTMLElement) {}

  render(state: GameStateDto, handlers: HeroPanelHandlers): void {
    const attackIcon = getAssetUrl(ASSETS.ui.attack);
    const defenseIcon = getAssetUrl(ASSETS.ui.defense);
    const healthIcon = getAssetUrl(ASSETS.ui.health);

    this.container.innerHTML = state.heroes
      .map((hero) => {
        const healthPercent = Math.max(0, (hero.health / hero.maxHealth) * 100);

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
              <div class="health-bar hero">
                <div class="health-fill hero" style="width: ${healthPercent}%"></div>
              </div>
            </button>
            ${renderHeroEquipmentRow(hero, true)}
          </article>
        `;
      })
      .join('');

    this.container.querySelectorAll('[data-hero-open]').forEach((button) => {
      button.addEventListener('click', () => {
        const heroId = button.getAttribute('data-hero-open');
        if (heroId) handlers.onHeroClick(heroId);
      });
    });

    this.container.querySelectorAll('.equipment-slot-clickable').forEach((button) => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const heroId = button.getAttribute('data-hero');
        const slot = button.getAttribute('data-slot');
        if (heroId && slot) handlers.onSlotClick(heroId, slot);
      });
    });

    bindEquipmentTooltips(this.container);
  }
}
