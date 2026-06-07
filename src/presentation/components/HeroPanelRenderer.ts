import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getHeroSprite, imgTag } from '../assets/AssetCatalog';

export class HeroPanelRenderer {
  constructor(private readonly container: HTMLElement) {}

  render(state: GameStateDto): void {
    const attackIcon = getAssetUrl(ASSETS.ui.attack);
    const defenseIcon = getAssetUrl(ASSETS.ui.defense);
    const healthIcon = getAssetUrl(ASSETS.ui.health);
    const inventoryIcon = getAssetUrl(ASSETS.ui.inventory);

    this.container.innerHTML = state.heroes
      .map((hero) => {
        const healthPercent = Math.max(0, (hero.health / hero.maxHealth) * 100);
        const equipment = Object.entries(hero.equipment)
          .filter(([, gear]) => gear)
          .map(([, gear]) => gear!.name)
          .join(', ');

        return `
          <div class="hero-card">
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
            ${equipment ? `<div class="hero-stats">${imgTag(inventoryIcon, 'Equipamento', 'stat-icon')} ${equipment}</div>` : ''}
          </div>
        `;
      })
      .join('');
  }
}
