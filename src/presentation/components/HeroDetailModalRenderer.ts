import { GameStateDto, HeroDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getHeroSprite, imgTag } from '../assets/AssetCatalog';
import { bindBarTooltips } from './BarTooltipBinder';
import { bindEquipmentTooltips } from './EquipmentTooltipBinder';
import { renderHeroBars } from './HeroBarsPresentation';
import { renderHeroEquipmentRow } from './GearPresentation';

export type HeroDetailModalHandlers = {
  onSlotClick: (heroId: string, slot: string) => void;
};

export class HeroDetailModalRenderer {
  render(
    container: HTMLElement,
    state: GameStateDto,
    heroId: string,
    handlers: HeroDetailModalHandlers,
  ): void {
    const hero = state.heroes.find((entry) => entry.id === heroId);
    if (!hero) {
      container.innerHTML = '<p class="empty-state">Herói não encontrado.</p>';
      return;
    }

    const glowUrl = getAssetUrl(ASSETS.characters.glow);
    const attackIcon = getAssetUrl(ASSETS.ui.attack);
    const defenseIcon = getAssetUrl(ASSETS.ui.defense);
    const healthIcon = getAssetUrl(ASSETS.ui.health);
    container.innerHTML = `
      <div class="hero-detail">
        <div class="hero-detail-portrait">
          <img class="hero-detail-glow" src="${glowUrl}" alt="" aria-hidden="true" />
          ${imgTag(getHeroSprite(hero.heroClass), hero.name, 'hero-detail-sprite')}
        </div>
        <div class="hero-detail-info">
          <div class="hero-detail-title">
            <h3>${hero.name}</h3>
            <span class="hero-level">Lv.${hero.level}</span>
          </div>
          <div class="hero-stats hero-detail-stats">
            ${imgTag(attackIcon, 'Ataque', 'stat-icon')} ${hero.attack}
            ${imgTag(defenseIcon, 'Defesa', 'stat-icon')} ${hero.defense}
            ${imgTag(healthIcon, 'Vida', 'stat-icon')} ${hero.health}/${hero.maxHealth}
          </div>
          ${renderHeroBars(hero)}
        </div>
      </div>
      <section class="hero-detail-equipment">
        <h4>Equipamento</h4>
        <p class="hero-detail-hint">Toque em um slot para equipar ou trocar o item.</p>
        ${renderHeroEquipmentRow(hero, false)}
      </section>
    `;

    this.bindSlots(container, hero, handlers);
    bindBarTooltips(container);
    bindEquipmentTooltips(container);
  }

  private bindSlots(
    container: HTMLElement,
    hero: HeroDto,
    handlers: HeroDetailModalHandlers,
  ): void {
    container.querySelectorAll('.equipment-slot-clickable').forEach((button) => {
      button.addEventListener('click', () => {
        const slot = button.getAttribute('data-slot');
        if (slot) handlers.onSlotClick(hero.id, slot);
      });
    });
  }
}
