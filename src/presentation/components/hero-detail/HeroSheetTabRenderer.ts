import { HeroDto } from '../../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getHeroSprite, imgTag } from '../../assets/AssetCatalog';
import { renderHeroBars } from '../HeroBarsPresentation';
import { renderHeroEquipmentRow } from '../GearPresentation';

export function renderHeroSheetTab(hero: HeroDto): string {
  const glowUrl = getAssetUrl(ASSETS.characters.glow);
  const attackIcon = getAssetUrl(ASSETS.ui.attack);
  const defenseIcon = getAssetUrl(ASSETS.ui.defense);
  const healthIcon = getAssetUrl(ASSETS.ui.health);

  return `
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
}
