import { AscensionOptionDto } from '../../application/dto/AscensionOptionDto';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { IGameClient } from '../../application/ports/IGameClient';
import { SkillNodeDto } from '../../application/dto/SkillNodeDto';
import { HeroDetailModalRenderer, HeroDetailTab } from '../components/HeroDetailModalRenderer';
import { ToastController } from '../components/ToastController';
import { RewardCelebrationPort } from '../delight/RewardCelebrationPort';

export class HeroDetailFlow {
  skillNodes: SkillNodeDto[] = [];
  ascensionOptions: AscensionOptionDto[] = [];
  ascensionName: string | null = null;
  ascensionSkillNodes: SkillNodeDto[] = [];

  constructor(
    private readonly client: IGameClient,
    private readonly heroDetailModal: HeroDetailModalRenderer,
    private readonly toasts: ToastController,
    private readonly rewards: RewardCelebrationPort,
    private readonly onStateUpdated: (state: GameStateDto) => void,
    private readonly refreshModal: () => void,
  ) {}

  private onTabWillChange: ((tab: HeroDetailTab) => void) | null = null;

  setTabWillChangeListener(listener: (tab: HeroDetailTab) => void): void {
    this.onTabWillChange = listener;
  }

  async prepareOpen(heroId: string, tab: HeroDetailTab): Promise<void> {
    this.heroDetailModal.setActiveTab(tab);

    if (tab === 'skills' || tab === 'sheet') {
      await this.loadSkillTree(heroId);
    }
    if (tab === 'class') {
      await this.loadAscensionTree(heroId);
    }
  }

  async loadSkillTree(heroId: string): Promise<void> {
    const response = await this.client.send({ type: 'GET_HERO_SKILL_TREE', heroId });
    if (response.ok && response.skillNodes) {
      this.skillNodes = response.skillNodes;
    }
  }

  async loadAscensionTree(heroId: string): Promise<void> {
    const response = await this.client.send({ type: 'GET_HERO_ASCENSION_TREE', heroId });
    if (!response.ok) return;

    this.ascensionOptions = response.ascensionOptions ?? [];
    this.ascensionName = response.ascensionName ?? null;
    this.ascensionSkillNodes = response.ascensionSkillNodes ?? [];
  }

  async changeTab(heroId: string, tab: HeroDetailTab): Promise<void> {
    this.onTabWillChange?.(tab);
    this.heroDetailModal.setActiveTab(tab);
    if (tab === 'skills') {
      await this.loadSkillTree(heroId);
    }
    if (tab === 'class') {
      await this.loadAscensionTree(heroId);
    }
    this.refreshModal();
  }

  bindToModal(
    container: HTMLElement,
    state: GameStateDto,
    heroId: string,
    handlers: {
      onSlotClick: (heroId: string, slot: string) => void;
      mountInventory?: (host: HTMLElement) => void;
    },
  ): void {
    this.heroDetailModal.setSkillNodes(this.skillNodes);
    this.heroDetailModal.setAscensionData(
      this.ascensionOptions,
      this.ascensionName,
      this.ascensionSkillNodes,
    );

    this.heroDetailModal.render(container, state, heroId, {
      onSlotClick: handlers.onSlotClick,
      onSpendAttribute: (id, attr) => {
        void this.spendAttributePoint(id, attr);
      },
      onAllocateSkill: (id, skillId) => {
        void this.allocateSkillPoint(id, skillId);
      },
      onAssignSkillSlot: (id, skillId, slotIndex) => {
        void this.assignSkillSlot(id, skillId, slotIndex);
      },
      onClearSkillSlot: (id, skillId) => {
        void this.clearSkillSlot(id, skillId);
      },
      onEquipSkillFirstAvailable: (id, skillId) => {
        void this.equipSkillFirstAvailable(id, skillId);
      },
      onAscendClass: (id, ascensionId) => {
        void this.ascendClass(id, ascensionId);
      },
      onAllocateAscensionSkill: (id, skillId) => {
        void this.allocateAscensionSkill(id, skillId);
      },
      onTabChange: (id, tab) => {
        void this.changeTab(id, tab);
      },
      onMountInventory: handlers.mountInventory,
    });
  }

  private afterMutation(state: GameStateDto): void {
    this.onStateUpdated(state);
  }

  private async spendAttributePoint(heroId: string, attr: 'str' | 'dex' | 'int'): Promise<void> {
    const response = await this.client.send({
      type: 'SPEND_IMPROVEMENT_POINT',
      heroId,
      target: { type: 'attribute', key: attr },
    });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha ao gastar Aprimoramento', 'info');
      return;
    }
    this.afterMutation(response.state);
    this.toasts.show(`+1 ${attr.toUpperCase()}`, 'info');
  }

  private async allocateSkillPoint(heroId: string, skillId: string): Promise<void> {
    const response = await this.client.send({
      type: 'SPEND_IMPROVEMENT_POINT',
      heroId,
      target: { type: 'skill', skillId },
    });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha na skill', 'info');
      return;
    }
    await this.loadSkillTree(heroId);
    this.afterMutation(response.state);
  }

  private async assignSkillSlot(heroId: string, skillId: string, slotIndex: number): Promise<void> {
    const response = await this.client.send({
      type: 'ASSIGN_SKILL_SLOT',
      heroId,
      skillId,
      slotIndex,
    });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha ao alocar skill', 'info');
      return;
    }
    await Promise.all([this.loadSkillTree(heroId), this.loadAscensionTree(heroId)]);
    this.afterMutation(response.state);
  }

  private async clearSkillSlot(heroId: string, skillId: string): Promise<void> {
    const response = await this.client.send({ type: 'DEACTIVATE_SKILL', heroId, skillId });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha ao remover skill', 'info');
      return;
    }
    await Promise.all([this.loadSkillTree(heroId), this.loadAscensionTree(heroId)]);
    this.afterMutation(response.state);
  }

  private async equipSkillFirstAvailable(heroId: string, skillId: string): Promise<void> {
    const response = await this.client.send({
      type: 'ASSIGN_SKILL_SLOT',
      heroId,
      skillId,
      slotIndex: -1,
    });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha ao equipar skill', 'info');
      return;
    }
    await Promise.all([this.loadSkillTree(heroId), this.loadAscensionTree(heroId)]);
    this.afterMutation(response.state);
  }

  private async ascendClass(heroId: string, ascensionId: string): Promise<void> {
    const response = await this.client.send({ type: 'ASCEND_CLASS', heroId, ascensionId });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha na ascensão', 'info');
      return;
    }
    await this.loadAscensionTree(heroId);
    this.heroDetailModal.setActiveTab('class');
    this.afterMutation(response.state);
    const hero = response.state.heroes.find((entry) => entry.id === heroId);
    if (hero) {
      this.rewards.celebrateAscension(hero.name, hero.emoji);
    }
  }

  private async allocateAscensionSkill(heroId: string, skillId: string): Promise<void> {
    const response = await this.client.send({
      type: 'SPEND_ASCENSION_POINT',
      heroId,
      skillId,
    });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha na skill de ascensão', 'info');
      return;
    }
    await this.loadAscensionTree(heroId);
    this.afterMutation(response.state);
  }
}
