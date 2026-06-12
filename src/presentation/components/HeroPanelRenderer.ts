import { GameStateDto } from '../../application/dto/GameStateDto';
import { bindBarTooltips } from './BarTooltipBinder';
import { bindEquipmentTooltips } from './EquipmentTooltipBinder';
import { bindSkillChipTooltips } from './SkillChipTooltipBinder';
import { patchHeroPanelCooldowns } from './HeroPanelCooldownPatcher';
import {
  bindHeroesPanelInteractions,
  HeroesPanelTab,
  renderHeroesPanel,
} from './HeroesPanelPresentation';

const TAB_KEY = 'sidehero_heroes_panel_tab';

export class HeroPanelRenderer {
  private activeTab: HeroesPanelTab = this.readTabPreference();
  private lastState: GameStateDto | null = null;

  constructor(private readonly container: HTMLElement) {}

  render(state: GameStateDto): void {
    this.lastState = state;
    this.container.innerHTML = renderHeroesPanel(state, this.activeTab);
    this.bindTabButtons();
    this.bindInteractions();
    patchHeroPanelCooldowns(this.container, state);
  }

  patchCombatCooldowns(state: GameStateDto): void {
    patchHeroPanelCooldowns(this.container, state);
  }

  private bindTabButtons(): void {
    this.container.querySelectorAll('[data-heroes-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        const tab = button.getAttribute('data-heroes-tab') as HeroesPanelTab | null;
        if (!tab || tab === this.activeTab || !this.lastState) return;

        this.activeTab = tab;
        this.writeTabPreference(tab);
        this.render(this.lastState);
      });
    });
  }

  private bindInteractions(): void {
    bindBarTooltips(this.container);
    bindEquipmentTooltips(this.container);
    bindSkillChipTooltips(this.container);
    bindHeroesPanelInteractions(this.container);
  }

  private readTabPreference(): HeroesPanelTab {
    try {
      return sessionStorage.getItem(TAB_KEY) === 'formation' ? 'formation' : 'battling';
    } catch {
      return 'battling';
    }
  }

  private writeTabPreference(tab: HeroesPanelTab): void {
    try {
      sessionStorage.setItem(TAB_KEY, tab);
    } catch {
      // sessionStorage indisponível
    }
  }
}
