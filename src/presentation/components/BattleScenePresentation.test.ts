// @vitest-environment happy-dom

import { describe, expect, it } from 'vitest';
import { getCampaignScene, hasCampaignBanner, hasCampaignScene } from '../assets/CampaignSceneCatalog';
import { applyBattleScene } from './BattleScenePresentation';

describe('CampaignSceneCatalog', () => {
  it('expõe cena de Estrenda', () => {
    expect(hasCampaignScene('stendra')).toBe(true);
    expect(getCampaignScene('stendra')).toEqual({
      battleLeft: 'campaign/stendra/battle_stendra_left.png',
      battleRight: 'campaign/stendra/battle_stendra_right.png',
      banner: 'campaign/stendra/campaign_stendra_banner.png',
      floorTile: 'campaign/stendra/floor_stendra_tile.png',
    });
  });

  it('retorna null para mapas sem arte', () => {
    expect(hasCampaignScene('broken_sky')).toBe(false);
    expect(hasCampaignBanner('broken_sky')).toBe(false);
    expect(getCampaignScene('broken_sky')).toBeNull();
  });

  it('expõe banner de Gruftall sem painéis de batalha', () => {
    expect(hasCampaignScene('gruftall')).toBe(false);
    expect(hasCampaignBanner('gruftall')).toBe(true);
    expect(getCampaignScene('gruftall')).toEqual({
      banner: 'campaign/grutfall/campaign_grutfall_banner.png',
    });
  });

  it.each([
    ['valdris', 'campaign/valdris/campaign_valdris_banner.png'],
    ['morthaven', 'campaign/morthaven/campaign_morthaven_banner.png'],
  ] as const)('expõe banner de %s sem painéis de batalha', (mapId, bannerPath) => {
    expect(hasCampaignScene(mapId)).toBe(false);
    expect(hasCampaignBanner(mapId)).toBe(true);
    expect(getCampaignScene(mapId)).toEqual({ banner: bannerPath });
  });
});

function buildStripBg(): HTMLElement {
  const stripBg = document.createElement('div');
  stripBg.className = 'strip-bg';
  stripBg.innerHTML = `
    <div class="strip-bg__sky"></div>
    <div class="strip-bg__center"></div>
    <div class="strip-bg__left"></div>
    <div class="strip-bg__right"></div>
  `;
  return stripBg;
}

describe('applyBattleScene', () => {
  it('aplica painéis laterais e chão tiled quando há cena para o mapa', () => {
    const stripBg = buildStripBg();
    const stripFloor = document.createElement('div');
    stripFloor.className = 'strip-floor';

    applyBattleScene(stripBg, 'stendra', stripFloor);

    expect(stripBg.classList.contains('strip-bg--scenic')).toBe(true);
    expect(stripBg.dataset.mapId).toBe('stendra');
    const left = stripBg.querySelector('.strip-bg__left') as HTMLElement;
    expect(left.style.backgroundImage).toContain('battle_stendra_left.png');
    expect(
      stripBg.querySelector('.strip-bg__center')?.classList.contains('strip-bg__center--visible'),
    ).toBe(false);
    expect(stripFloor.classList.contains('strip-floor--tiled')).toBe(true);
    expect(stripFloor.style.getPropertyValue('--strip-floor-tile-image')).toContain(
      'floor_stendra_tile.png',
    );
  });

  it('remove modo cênico e chão tiled para mapas sem arte', () => {
    const stripBg = buildStripBg();
    stripBg.classList.add('strip-bg--scenic');
    stripBg.dataset.mapId = 'stendra';
    const left = stripBg.querySelector('.strip-bg__left') as HTMLElement;
    left.style.backgroundImage = 'url(test.png)';
    const stripFloor = document.createElement('div');
    stripFloor.className = 'strip-floor strip-floor--tiled';
    stripFloor.style.setProperty('--strip-floor-tile-image', "url('floor.png')");

    applyBattleScene(stripBg, 'gruftall', stripFloor);

    expect(stripBg.classList.contains('strip-bg--scenic')).toBe(false);
    expect(stripBg.dataset.mapId).toBeUndefined();
    expect(left.style.backgroundImage).toBe('');
    expect(stripFloor.classList.contains('strip-floor--tiled')).toBe(false);
    expect(stripFloor.style.getPropertyValue('--strip-floor-tile-image')).toBe('');
  });
});
