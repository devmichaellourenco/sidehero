import { HeroDto } from '../../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, getHeroSprite, imgTag } from '../../assets/AssetCatalog';
import { renderHeroBars } from '../HeroBarsPresentation';
import { formatHeroLevelClassLine } from './HeroClassLinePresentation';
import { renderHeroImprovementStat } from './HeroImprovementPointsPresentation';

export function renderHeroDetailHeader(hero: HeroDto, ascensionName: string | null = null): string {
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
          <span class="hero-level hero-level-class-line">${formatHeroLevelClassLine(hero, ascensionName)}</span>
        </div>
        <div class="hero-stats hero-detail-stats">
          <span class="hero-detail-stat" title="Ataque">${imgTag(attackIcon, 'Ataque', 'stat-icon')} ${hero.attack}</span>
          <span class="hero-detail-stat" title="Defesa">${imgTag(defenseIcon, 'Defesa', 'stat-icon')} ${hero.defense}</span>
          <span class="hero-detail-stat" title="Vida">${imgTag(healthIcon, 'Vida', 'stat-icon')} ${hero.health}/${hero.maxHealth}</span>
          ${renderHeroImprovementStat(hero)}
        </div>
        ${renderHeroBars(hero, { showHealth: false })}
      </div>
    </div>
  `;
}
