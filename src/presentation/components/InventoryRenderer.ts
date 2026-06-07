import { GameStateDto } from '../../application/dto/GameStateDto';
import {
  getGearFrameSprite,
  getGearRaritySprite,
  getGearSlotSprite,
  getHeroSprite,
  imgTag,
} from '../assets/AssetCatalog';

export type EquipHandler = (heroId: string, gearId: string) => void;

export class InventoryRenderer {
  constructor(
    private readonly container: HTMLElement,
    private readonly onEquip: EquipHandler,
  ) {}

  render(state: GameStateDto): void {
    if (state.inventory.length === 0) {
      this.container.innerHTML = '<p class="empty-state">Nenhum item ainda</p>';
      return;
    }

    this.container.innerHTML = state.inventory
      .map((gear) => {
        const heroButtons = state.heroes
          .map(
            (hero) => `
              <button data-hero="${hero.id}" data-gear="${gear.id}" title="Equipar em ${hero.name}">
                ${imgTag(getHeroSprite(hero.heroClass), hero.name, 'equip-hero-icon')}
              </button>
            `,
          )
          .join('');

        const frameUrl = getGearFrameSprite(gear.rarity);

        return `
          <div class="gear-item ${gear.rarity}" style="--gear-frame: url('${frameUrl}')">
            <div class="gear-item-main">
              <div class="gear-icon-wrap">
                ${imgTag(getGearSlotSprite(gear.slot), gear.slot, 'gear-slot-icon')}
                ${imgTag(getGearRaritySprite(gear.rarity), gear.rarity, 'gear-rarity-icon')}
              </div>
              <div class="gear-item-info">
                <strong>${gear.name}</strong>
                <span>+${gear.attackBonus} ATK · +${gear.defenseBonus} DEF · +${gear.healthBonus} HP</span>
              </div>
            </div>
            <div class="gear-actions">${heroButtons}</div>
          </div>
        `;
      })
      .join('');

    this.container.querySelectorAll('button[data-hero]').forEach((button) => {
      button.addEventListener('click', () => {
        const heroId = button.getAttribute('data-hero');
        const gearId = button.getAttribute('data-gear');
        if (heroId && gearId) {
          this.onEquip(heroId, gearId);
        }
      });
    });
  }
}
