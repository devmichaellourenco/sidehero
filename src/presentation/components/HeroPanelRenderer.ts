import { GameStateDto } from '../../application/dto/GameStateDto';
import { bindBarTooltips } from './BarTooltipBinder';
import { bindEquipmentTooltips } from './EquipmentTooltipBinder';
import { bindSkillChipTooltips } from './SkillChipTooltipBinder';
import { patchHeroPanelCooldowns } from './HeroPanelCooldownPatcher';
import { renderPartyPanel } from './PartyPanelPresentation';

export class HeroPanelRenderer {
  constructor(private readonly container: HTMLElement) {}

  render(state: GameStateDto): void {
    this.container.innerHTML = renderPartyPanel(state);
    this.bindInteractions();
    patchHeroPanelCooldowns(this.container, state);
  }

  patchCombatCooldowns(state: GameStateDto): void {
    patchHeroPanelCooldowns(this.container, state);
  }

  private bindInteractions(): void {
    bindBarTooltips(this.container);
    bindEquipmentTooltips(this.container);
    bindSkillChipTooltips(this.container);
  }
}
