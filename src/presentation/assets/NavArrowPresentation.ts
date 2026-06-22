import { ASSETS, getAssetUrl, imgTag } from './AssetCatalog';

export type NavArrowDirection = 'prev' | 'next';

export function getNavArrowIconUrl(direction: NavArrowDirection): string {
  const path = direction === 'prev' ? ASSETS.ui.arrowPrev : ASSETS.ui.arrowNext;
  return getAssetUrl(path);
}

export function navArrowIconHtml(direction: NavArrowDirection, className = 'nav-arrow-icon'): string {
  return imgTag(getNavArrowIconUrl(direction), '', className);
}

/** Preenche botões estáticos do HTML com ícones de seta. */
export function mountNavArrowIcons(root: ParentNode): void {
  root.querySelectorAll<HTMLButtonElement>('[data-nav-arrow]').forEach((button) => {
    const direction = button.dataset.navArrow;
    if (direction !== 'prev' && direction !== 'next') return;
    button.innerHTML = navArrowIconHtml(direction);
  });
}
