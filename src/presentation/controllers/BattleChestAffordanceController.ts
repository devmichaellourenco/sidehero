import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';

export class BattleChestAffordanceController {
  constructor(
    private readonly button: HTMLButtonElement,
    private readonly badgeEl: HTMLElement,
    private readonly footerChestBtn: HTMLButtonElement,
    onOpen: () => void,
  ) {
    this.button.innerHTML = imgTag(getAssetUrl(ASSETS.ui.chest), 'Baú', 'battle-chest-affordance-icon');
    this.button.addEventListener('click', onOpen);
  }

  render(state: GameStateDto, options: { openingChests: boolean }): void {
    const hasChests = state.pendingChestCount > 0;
    this.button.classList.toggle('hidden', !hasChests);
    this.button.disabled = !hasChests || options.openingChests;
    this.badgeEl.textContent = String(state.pendingChestCount);
    this.badgeEl.classList.toggle('hidden', state.pendingChestCount <= 1);

    this.footerChestBtn.classList.toggle('hidden', hasChests);
  }
}
