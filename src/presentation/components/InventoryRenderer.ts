import { GameStateDto } from '../../application/dto/GameStateDto';

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
            (hero) =>
              `<button data-hero="${hero.id}" data-gear="${gear.id}">${hero.emoji}</button>`,
          )
          .join('');

        return `
          <div class="gear-item ${gear.rarity}">
            <strong>${gear.name}</strong>
            <span>+${gear.attackBonus} ATK · +${gear.defenseBonus} DEF · +${gear.healthBonus} HP</span>
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
