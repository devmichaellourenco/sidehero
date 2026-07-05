import { AscensionOptionDto } from '../../application/dto/AscensionOptionDto';
import { GameStateDto, HeroDto } from '../../application/dto/GameStateDto';
import { SkillNodeDto } from '../../application/dto/SkillNodeDto';
import { bindBarTooltips } from './BarTooltipBinder';
import { bindEquipmentTooltips } from './EquipmentTooltipBinder';
import { bindHeroStatTooltips } from './HeroStatTooltipBinder';
import { bindSkillChipTooltips } from './SkillChipTooltipBinder';
import { bindSkillSlotAssignment } from '../skills/SkillSlotAssignmentBinder';
import {
  captureHeroDetailScroll,
  restoreHeroDetailScroll,
  scrollHeroDetailSkillCardIntoView,
} from './hero-detail/HeroDetailScrollPresentation';
import { renderHeroAttributesTab } from './hero-detail/HeroAttributesTabRenderer';
import { renderHeroClassTab } from './hero-detail/HeroClassTabRenderer';
import { renderHeroDetailHeader } from './hero-detail/HeroDetailHeaderRenderer';
import { renderHeroSheetTab } from './hero-detail/HeroSheetTabRenderer';
import { renderHeroSkillsTab } from './hero-detail/HeroSkillsTabRenderer';
import { renderHeroLoadoutStrip } from './HeroLoadoutStripPresentation';

export type HeroDetailTab = 'sheet' | 'attributes' | 'skills' | 'class';

export type HeroDetailModalHandlers = {
  onSlotClick: (heroId: string, slot: string) => void;
  onSpendAttribute: (heroId: string, attr: 'str' | 'dex' | 'int') => void;
  onAllocateSkill: (heroId: string, skillId: string) => void;
  onAssignSkillSlot: (heroId: string, skillId: string, slotIndex: number) => void;
  onClearSkillSlot: (heroId: string, skillId: string) => void;
  onEquipSkillFirstAvailable: (heroId: string, skillId: string) => void;
  onAscendClass: (heroId: string, ascensionId: string) => void;
  onAllocateAscensionSkill: (heroId: string, skillId: string) => void;
  onTabChange: (heroId: string, tab: HeroDetailTab) => void;
  onMountInventory?: (host: HTMLElement) => void;
};

export class HeroDetailModalRenderer {
  private activeTab: HeroDetailTab = 'sheet';
  private skillNodes: SkillNodeDto[] = [];
  private ascensionOptions: AscensionOptionDto[] = [];
  private ascensionName: string | null = null;
  private ascensionSkillNodes: SkillNodeDto[] = [];
  private pendingScrollAnchorSkillId: string | null = null;

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

  getActiveTab(): HeroDetailTab {
    return this.activeTab;
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

    const showGearLoadout = this.activeTab === 'sheet';
    const showSkillsLoadout = this.activeTab === 'skills';
    const loadoutSection = showGearLoadout
      ? `
        <div class="hero-detail-loadout">
          ${renderHeroLoadoutStrip(hero, {
            variant: 'featured',
            skillSlotMode: 'skills-tab',
            heroId: hero.id,
            showSkills: false,
            showGear: true,
          })}
          <p class="hero-detail-hint hero-detail-loadout-hint">Toque em um slot de equipamento para trocar o item.</p>
          <div class="inline-equip-host hidden" data-inline-equip-host aria-live="polite"></div>
        </div>
      `
      : showSkillsLoadout
        ? `
        <div class="hero-detail-loadout">
          ${renderHeroLoadoutStrip(hero, {
            variant: 'featured',
            skillSlotMode: 'skills-tab',
            heroId: hero.id,
            showSkills: true,
            showGear: false,
          })}
          <p class="skill-slot-instruction" data-skill-slot-instruction hidden></p>
          <p class="hero-detail-hint hero-detail-loadout-hint">Toque em uma skill para equipar · arraste até um slot · × remove do slot</p>
        </div>
      `
        : '';

    const scrollState = captureHeroDetailScroll(container);
    const scrollAnchorSkillId = this.pendingScrollAnchorSkillId;

    container.innerHTML = `
      <div class="hero-detail-layout">
        <header class="hero-detail-header">${renderHeroDetailHeader(hero)}</header>
        <nav class="hero-detail-tabs">
          <button type="button" class="hero-tab ${this.activeTab === 'sheet' ? 'active' : ''}" data-hero-tab="sheet">Inventário</button>
          <button type="button" class="hero-tab ${this.activeTab === 'attributes' ? 'active' : ''}" data-hero-tab="attributes">Progressão${badge}</button>
          <button type="button" class="hero-tab ${this.activeTab === 'skills' ? 'active' : ''}" data-hero-tab="skills">Skills</button>
          <button type="button" class="hero-tab ${this.activeTab === 'class' ? 'active' : ''}" data-hero-tab="class">Classe</button>
        </nav>
        ${loadoutSection}
        <div class="hero-detail-panel game-scroll">${this.renderTabContent(hero)}</div>
      </div>
    `;

    this.bindInteractions(container, hero, handlers);
    bindBarTooltips(container);
    bindEquipmentTooltips(container);
    bindSkillChipTooltips(container);
    if (this.activeTab === 'attributes') {
      bindHeroStatTooltips(container);
    }
    if (this.activeTab === 'sheet' && handlers.onMountInventory) {
      const inventoryHost = container.querySelector('[data-hero-inventory-host]');
      if (inventoryHost) {
        handlers.onMountInventory(inventoryHost as HTMLElement);
      }
    }
    this.restoreScrollAfterRender(container, scrollState, scrollAnchorSkillId);
  }

  private restoreScrollAfterRender(
    container: HTMLElement,
    scrollState: ReturnType<typeof captureHeroDetailScroll>,
    anchorSkillId: string | null,
  ): void {
    requestAnimationFrame(() => {
      if (anchorSkillId && scrollHeroDetailSkillCardIntoView(container, anchorSkillId)) {
        this.pendingScrollAnchorSkillId = null;
        return;
      }

      restoreHeroDetailScroll(container, scrollState);
      this.pendingScrollAnchorSkillId = null;
    });
  }

  private renderTabContent(hero: HeroDto): string {
    switch (this.activeTab) {
      case 'attributes':
        return renderHeroAttributesTab(hero);
      case 'skills':
        return renderHeroSkillsTab(hero, this.skillNodes, hero.unspentImprovementPoints);
      case 'class':
        return renderHeroClassTab({
          hero,
          options: this.ascensionOptions,
          ascensionName: this.ascensionName,
          ascensionSkillNodes: this.ascensionSkillNodes,
        });
      default:
        return renderHeroSheetTab();
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
          this.pendingScrollAnchorSkillId = skillId;
          handlers.onAllocateSkill(hero.id, skillId);
        }
      });
    });

    if (this.activeTab === 'skills' || (this.activeTab === 'class' && this.ascensionSkillNodes.length > 0)) {
      bindSkillSlotAssignment(container, {
        onAssign: (skillId, slotIndex) => {
          handlers.onAssignSkillSlot(hero.id, skillId, slotIndex);
        },
        onClear: (skillId) => {
          handlers.onClearSkillSlot(hero.id, skillId);
        },
        onEquipFirstAvailable: (skillId) => {
          handlers.onEquipSkillFirstAvailable(hero.id, skillId);
        },
      });
    }

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
          this.pendingScrollAnchorSkillId = skillId;
          handlers.onAllocateAscensionSkill(hero.id, skillId);
        }
      });
    });
  }
}
