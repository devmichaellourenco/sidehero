import { getAssetUrl } from '../assets/AssetCatalog';
import { getCampaignScene, hasCampaignScene } from '../assets/CampaignSceneCatalog';

function clearSceneLayer(el: HTMLElement | null): void {
  el?.style.removeProperty('background-image');
}

function applyBattleFloor(stripFloor: HTMLElement | null | undefined, mapId: string): void {
  if (!stripFloor) return;

  const scene = hasCampaignScene(mapId) ? getCampaignScene(mapId) : null;
  if (scene?.floorTile) {
    stripFloor.classList.add('strip-floor--tiled');
    stripFloor.dataset.mapId = mapId;
    stripFloor.style.setProperty(
      '--strip-floor-tile-image',
      `url('${getAssetUrl(scene.floorTile)}')`,
    );
    return;
  }

  stripFloor.classList.remove('strip-floor--tiled');
  stripFloor.removeAttribute('data-map-id');
  stripFloor.style.removeProperty('--strip-floor-tile-image');
}

export function applyBattleScene(
  stripBg: HTMLElement,
  mapId: string,
  stripFloor?: HTMLElement | null,
): void {
  const skyEl = stripBg.querySelector<HTMLElement>('.strip-bg__sky');
  const centerEl = stripBg.querySelector<HTMLElement>('.strip-bg__center');
  const leftEl = stripBg.querySelector<HTMLElement>('.strip-bg__left');
  const rightEl = stripBg.querySelector<HTMLElement>('.strip-bg__right');
  if (!leftEl || !rightEl) return;

  if (!hasCampaignScene(mapId)) {
    stripBg.classList.remove('strip-bg--scenic');
    stripBg.removeAttribute('data-map-id');
    clearSceneLayer(skyEl);
    clearSceneLayer(centerEl);
    clearSceneLayer(leftEl);
    clearSceneLayer(rightEl);
    centerEl?.classList.remove('strip-bg__center--visible');
    applyBattleFloor(stripFloor, mapId);
    return;
  }

  const scene = getCampaignScene(mapId)!;
  stripBg.classList.add('strip-bg--scenic');
  stripBg.dataset.mapId = mapId;
  leftEl.style.backgroundImage = `url('${getAssetUrl(scene.battleLeft)}')`;
  rightEl.style.backgroundImage = `url('${getAssetUrl(scene.battleRight)}')`;

  if (scene.battleBackdrop && skyEl) {
    skyEl.style.backgroundImage = `url('${getAssetUrl(scene.battleBackdrop)}')`;
  } else {
    clearSceneLayer(skyEl);
  }

  if (scene.battleCenter && centerEl) {
    centerEl.style.backgroundImage = `url('${getAssetUrl(scene.battleCenter)}')`;
    centerEl.classList.add('strip-bg__center--visible');
  } else {
    clearSceneLayer(centerEl);
    centerEl?.classList.remove('strip-bg__center--visible');
  }

  applyBattleFloor(stripFloor, mapId);
}
