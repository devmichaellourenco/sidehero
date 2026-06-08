import { AscensionOptionDto } from '../../application/dto/AscensionOptionDto';
import { GameStateDto, HeroDto } from '../../application/dto/GameStateDto';
import { SkillNodeDto } from '../../application/dto/SkillNodeDto';
import { bindBarTooltips } from './BarTooltipBinder';
import { bindEquipmentTooltips } from './EquipmentTooltipBinder';
import { renderHeroAttributesTab } from './hero-detail/HeroAttributesTabRenderer';
import { renderHeroClassTab } from './hero-detail/HeroClassTabRenderer';
import { renderHeroSheetTab } from './hero-detail/HeroSheetTabRenderer';
import { renderHeroSkillsTab } from './hero-detail/HeroSkillsTabRenderer';

export type HeroDetailTab = 'sheet' | 'attributes' | 'skills' | 'class';

export type HeroDetailModalHandlers = {
  onSlotClick: (heroId: string, slot: string) => void;
  onSpendAttribute: (heroId: string, attr: 'str' | 'dex' | 'int') => void;
  onAllocateSkill: (heroId: string, skillId: string) => void;
  onActivateSkill: (heroId: string, skillId: string) => void;
  onDeactivateSkill: (heroId: string, skillId: string) => void;
  onAscendClass: (heroId: string, ascensionId: string) => void;
  onAllocateAscensionSkill: (heroId: string, skillId: string) => void;
  onTabChange: (heroId: string, tab: HeroDetailTab) => void;
};

export class HeroDetailModalRenderer {
  private activeTab: HeroDetailTab = 'sheet';
  private skillNodes: SkillNodeDto[] = [];
  private ascensionOptions: AscensionOptionDto[] = [];
  private ascensionName: string | null = null;
  private ascensionSkillNodes: SkillNodeDto[] = [];

  setSkillNodes(nodes: SkillNodeDto[]): void {
    this.skillNodes = nodes;
  }

  setAscensionData(
    options: AscensionOptionDto[],
    ascensionName: string | null,
    ascensionSkillNodes: SkillNodeDto[],
  ): void {
    this.ascensionOptions = options;
    this.ascensionName = ascensionName;
    this.ascensionSkillNodes = ascensionSkillNodes;
  }

  setActiveTab(tab: HeroDetailTab): void {
    this.activeTab = tab;
  }

  render(
    container: HTMLElement,
    state: GameStateDto,
    heroId: string,
    handlers: HeroDetailModalHandlers,
  ): void {
    const hero = state.heroes.find((entry) => entry.id === heroId);
    if (!hero) {
      container.innerHTML = '<p class="empty-state">Herói não encontrado.</p>';
      return;
    }

    const badge = hero.hasUnspentPoints
      ? '<span class="inventory-upgrade-badge">!</span>'
      : '';

    container.innerHTML = `
      <nav class="hero-detail-tabs">
        <button type="button" class="hero-tab ${this.activeTab === 'sheet' ? 'active' : ''}" data-hero-tab="sheet">Ficha</button>
        <button type="button" class="hero-tab ${this.activeTab === 'attributes' ? 'active' : ''}" data-hero-tab="attributes">Atributos${badge}</button>
        <button type="button" class="hero-tab ${this.activeTab === 'skills' ? 'active' : ''}" data-hero-tab="skills">Skills</button>
        <button type="button" class="hero-tab ${this.activeTab === 'class' ? 'active' : ''}" data-hero-tab="class">Classe</button>
      </nav>
      <div class="hero-detail-panel">${this.renderTabContent(hero)}</div>
    `;

    this.bindInteractions(container, hero, handlers);
    bindBarTooltips(container);
    bindEquipmentTooltips(container);
  }

  private renderTabContent(hero: HeroDto): string {
    switch (this.activeTab) {
      case 'attributes':
        return renderHeroAttributesTab(hero);
      case 'skills':
        return renderHeroSkillsTab(this.skillNodes, hero.unspentImprovementPoints);
      case 'class':
        return renderHeroClassTab({
          hero,
          options: this.ascensionOptions,
          ascensionName: this.ascensionName,
          ascensionSkillNodes: this.ascensionSkillNodes,
        });
      default:
        return renderHeroSheetTab(hero);
    }
  }

  private bindInteractions(
    container: HTMLElement,
    hero: HeroDto,
    handlers: HeroDetailModalHandlers,
  ): void {
    container.querySelectorAll('[data-hero-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        const tab = button.getAttribute('data-hero-tab') as HeroDetailTab;
        if (tab) handlers.onTabChange(hero.id, tab);
      });
    });

    container.querySelectorAll('.equipment-slot-clickable').forEach((button) => {
      button.addEventListener('click', () => {
        const slot = button.getAttribute('data-slot');
        if (slot) handlers.onSlotClick(hero.id, slot);
      });
    });

    container.querySelectorAll('[data-attr-spend]').forEach((button) => {
      button.addEventListener('click', () => {
        const attr = button.getAttribute('data-attr-spend') as 'str' | 'dex' | 'int';
        if (attr && !(button as HTMLButtonElement).disabled) {
          handlers.onSpendAttribute(hero.id, attr);
        }
      });
    });

    container.querySelectorAll('[data-skill-allocate]').forEach((button) => {
      button.addEventListener('click', () => {
        const skillId = button.getAttribute('data-skill-allocate');
        if (skillId && !(button as HTMLButtonElement).disabled) {
          handlers.onAllocateSkill(hero.id, skillId);
        }
      });
    });

    container.querySelectorAll('[data-skill-activate]').forEach((button) => {
      button.addEventListener('click', () => {
        const skillId = button.getAttribute('data-skill-activate');
        if (skillId && !(button as HTMLButtonElement).disabled) {
          handlers.onActivateSkill(hero.id, skillId);
        }
      });
    });

    container.querySelectorAll('[data-skill-deactivate]').forEach((button) => {
      button.addEventListener('click', () => {
        const skillId = button.getAttribute('data-skill-deactivate');
        if (skillId && !(button as HTMLButtonElement).disabled) {
          handlers.onDeactivateSkill(hero.id, skillId);
        }
      });
    });

    container.querySelectorAll('[data-ascend]').forEach((button) => {
      button.addEventListener('click', () => {
        const ascensionId = button.getAttribute('data-ascend');
        if (ascensionId && !(button as HTMLButtonElement).disabled) {
          handlers.onAscendClass(hero.id, ascensionId);
        }
      });
    });

    container.querySelectorAll('[data-ascension-allocate]').forEach((button) => {
      button.addEventListener('click', () => {
        const skillId = button.getAttribute('data-ascension-allocate');
        if (skillId && !(button as HTMLButtonElement).disabled) {
          handlers.onAllocateAscensionSkill(hero.id, skillId);
        }
      });
    });
  }
}
