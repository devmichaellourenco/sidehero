import { GameStateDto } from '../../application/dto/GameStateDto';
import { bindBarTooltips } from './BarTooltipBinder';
import { bindEquipmentTooltips } from './EquipmentTooltipBinder';
import { bindSkillChipTooltips } from './SkillChipTooltipBinder';
import { patchHeroPanelCooldowns } from './HeroPanelCooldownPatcher';
import {
  bindHeroesPanelInteractions,
  clampBattlingIndex,
  HeroesPanelTab,
  renderHeroesPanel,
} from './HeroesPanelPresentation';

const TAB_KEY = 'sidehero_heroes_panel_tab';

export class HeroPanelRenderer {
  private activeTab: HeroesPanelTab = this.readTabPreference();
  private battlingHeroIndex = 0;
  private lastState: GameStateDto | null = null;

  constructor(private readonly container: HTMLElement) {}

  render(state: GameStateDto): void {
    this.lastState = state;
    this.battlingHeroIndex = clampBattlingIndex(
      state.activeParty.length,
      this.battlingHeroIndex,
    );
    this.container.innerHTML = renderHeroesPanel(
      state,
      this.activeTab,
      this.battlingHeroIndex,
    );
    this.bindTabButtons();
    this.bindBattlingNav();
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

  private bindBattlingNav(): void {
    const prev = this.container.querySelector('[data-battling-hero-prev]');
    const next = this.container.querySelector('[data-battling-hero-next]');

    prev?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.lastState || this.battlingHeroIndex <= 0) return;
      this.battlingHeroIndex -= 1;
      this.render(this.lastState);
    });

    next?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.lastState) return;
      const maxIndex = this.lastState.activeParty.length - 1;
      if (this.battlingHeroIndex >= maxIndex) return;
      this.battlingHeroIndex += 1;
      this.render(this.lastState);
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
