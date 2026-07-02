import { HeroDto } from '../../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getHeroSprite, imgTag } from '../../assets/AssetCatalog';
import { renderHeroBars } from '../HeroBarsPresentation';

export function renderHeroDetailHeader(hero: HeroDto): string {
  const glowUrl = getAssetUrl(ASSETS.characters.glow);
  const attackIcon = getAssetUrl(ASSETS.ui.attack);
  const defenseIcon = getAssetUrl(ASSETS.ui.defense);
  const healthIcon = getAssetUrl(ASSETS.ui.health);

  return `
    <div class="hero-detail">
      <div class="hero-detail-portrait">
        <img class="hero-detail-glow" src="${glowUrl}" alt="" aria-hidden="true" />
        ${imgTag(getHeroSprite(hero), hero.name, 'hero-detail-sprite')}
      </div>
      <div class="hero-detail-info">
        <div class="hero-detail-title">
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
  `;
}
