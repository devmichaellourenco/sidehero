import { ASSETS, getAssetUrl } from './AssetCatalog';

const PANEL_ICON_TARGETS: Array<{ selector: string; assetPath: string }> = [
  { selector: '#open-campaign-btn .btn-icon', assetPath: ASSETS.ui.campaign },
  { selector: '#open-shop-btn .btn-icon', assetPath: ASSETS.ui.shop },
  { selector: '#open-inventory-btn .btn-icon', assetPath: ASSETS.ui.inventory },
  { selector: '#open-stash-btn .btn-icon', assetPath: ASSETS.ui.chestOpen },
  { selector: '#open-forge-btn .btn-icon', assetPath: ASSETS.ui.forge },
  { selector: '#optimize-loadout-btn .btn-icon', assetPath: ASSETS.ui.attack },
  { selector: '#open-upgrades-btn .btn-icon', assetPath: ASSETS.ui.stage },
  { selector: '#open-chest-btn .btn-icon', assetPath: ASSETS.ui.chest },
  { selector: '#open-all-chests-btn .btn-icon', assetPath: ASSETS.ui.chestOpen },
];

function hydrateImage(img: HTMLImageElement, assetPath: string): void {
  const nextSrc = getAssetUrl(assetPath);
  img.loading = 'eager';
  img.decoding = 'async';
  if (img.src !== nextSrc) {
    img.src = nextSrc;
  }
}

/** Resolve ícones estáticos do painel uma vez, sem recriar o DOM a cada tick. */
export function hydratePanelIcons(root: ParentNode): void {
  for (const { selector, assetPath } of PANEL_ICON_TARGETS) {
    const img = root.querySelector<HTMLImageElement>(selector);
    if (img) hydrateImage(img, assetPath);
  }
}
