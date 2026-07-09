import { CombatFloatingEventDto } from '../../application/dto/CombatFloatingEventDto';
import { CombatSkillVfxDto } from '../../application/dto/CombatSkillVfxDto';
import { GameStateDto, GearDto } from '../../application/dto/GameStateDto';
import { IGameClient } from '../../application/ports/IGameClient';
import { getDefaultGameClient } from '../../infrastructure/messaging/defaultGameClient';
import { AutoBattleController } from '../controllers/AutoBattleController';
import { BattleLogPanelController } from '../controllers/BattleLogPanelController';
import { GearMutationQueue } from '../controllers/GearMutationQueue';
import { GameHudController } from '../controllers/GameHudController';
import { GamePreferencesController } from '../controllers/GamePreferencesController';
import { LootFlowController } from '../controllers/LootFlowController';
import { BattleVictoryFlow } from '../flows/BattleVictoryFlow';
import { CampaignFlow } from '../flows/CampaignFlow';
import { ChestLootFlow } from '../flows/ChestLootFlow';
import { GearEquipFlow } from '../flows/GearEquipFlow';
import { GearStorageFlow, bindGearStorageActions } from '../flows/GearStorageFlow';
import { HeroDetailFlow } from '../flows/HeroDetailFlow';
import { PartyFlow } from '../flows/PartyFlow';
import { ModalStackController } from '../flows/ModalStackController';
import { ModalView } from '../flows/ModalTypes';
import { ShopFlow } from '../flows/ShopFlow';
import { MetaLegacyFlow } from '../flows/MetaLegacyFlow';
import { getFeatureFlags } from '../helpers/FeatureFlagsHelper';
import { getHeroNavigation, listNavigableHeroIds } from '../helpers/HeroNavigationHelper';
import { WowCelebrationController } from '../wow/WowCelebrationController';
import { DonationPromptController } from '../support/DonationPromptController';
import { filterBattleLogMessages } from './BattleLogFilter';
import { BattleLogRenderer } from './BattleLogRenderer';
import { BattleFloatingTextController } from './BattleFloatingTextController';
import { BattleImpactFeedbackController } from './BattleImpactFeedbackController';
import { BattleSkillVfxController } from './BattleSkillVfxController';
import { bindCampaignTooltip } from './CampaignTooltipBinder';
import { mountNavArrowIcons } from '../assets/NavArrowPresentation';
import { hydratePanelIcons } from '../assets/PanelIconHydrator';
import { buildBattleIntermissionPayload } from './BattleVictoryDetector';
import { BattleVictoryOverlayRenderer } from './BattleVictoryOverlayRenderer';
import { BattleStripRenderer } from './BattleStripRenderer';
import { EquipPickerModalRenderer } from './EquipPickerModalRenderer';
import { GearSlotKey } from './GearPresentation';
import { HeroDetailModalRenderer, HeroDetailTab } from './HeroDetailModalRenderer';
import { shouldRenderHeroPanel } from './HeroPanelRenderPolicy';
import { InventoryModalHandlers, InventoryModalRenderer } from './InventoryModalRenderer';
import { resolveDefaultInventoryHeroId } from './InventoryGridPresentation';
import { StashModalRenderer } from './StashModalRenderer';
import { LootBatchModalRenderer } from './LootBatchModalRenderer';
import { LootModalRenderer } from './LootModalRenderer';
import { ModalController } from './ModalController';
import { SideDrawerController } from './SideDrawerController';
import {
  buildIdleSummary,
  loadPanelSnapshot,
  seedPanelSnapshotIfMissing,
  touchPanelSnapshot,
} from './PanelStateSnapshot';
import { GamePreferences } from './GamePreferences';
import { SettingsModalRenderer } from './SettingsModalRenderer';
import { ShopModalRenderer } from './ShopModalRenderer';
import { UpgradeTreeModalRenderer } from './UpgradeTreeModalRenderer';
import { MetaLegacyModalRenderer } from './MetaLegacyModalRenderer';
import { ToastController } from './ToastController';
import { RewardPresentationController } from '../delight/RewardPresentationController';
import { DestroyGearConfirmDialog } from './DestroyGearConfirmDialog';
import { AscendClassConfirmDialog } from './AscendClassConfirmDialog';
import { DivineForgeConfirmDialog } from './DivineForgeConfirmDialog';
import { DivineForgeModalRenderer } from './DivineForgeModalRenderer';
import { SkillCooldownDisplayAnimator } from './SkillCooldownDisplayAnimator';
import { DivineForgeFlow } from '../flows/DivineForgeFlow';
import { InlineEquipController, InlineEquipHandlers } from '../gear/InlineEquipController';
import { bindGearDragDrop } from '../gear/GearDragDropBinder';
import { OnboardingController } from '../onboarding/OnboardingController';
import { OnboardingStepId, resolveOnboardingStep } from '../onboarding/OnboardingPolicy';
import { bindBattleChromeLayout } from '../layout/BattleChromeLayout';

export class GameViewController {
  private state: GameStateDto | null = null;
  private readonly modalStack: ModalView[] = [];
  private readonly lootFlow = new LootFlowController();
  private readonly prefsController = new GamePreferencesController();
  private readonly autoBattleController = new AutoBattleController();
  private readonly gearMutations = new GearMutationQueue();
  private readonly client: IGameClient;
  private refreshTimer: number | null = null;
  private contextInvalidated = false;
  private idleSummaryShown = false;
  /** Bloqueia ticks em voo enquanto a pausa está sendo aplicada no servidor. */
  private pausingLoadout = false;
  private heroDrawerHeroId: string | null = null;

  private readonly campaignContextLabel: HTMLElement;
  private readonly goldLabel: HTMLElement;
  private readonly chestLabel: HTMLElement;
  private readonly chestProgressLabel: HTMLElement;
  private readonly battleLog: HTMLElement;
  private readonly pauseLoadoutBtn: HTMLButtonElement;
  private readonly continueLoadoutBtn: HTMLButtonElement;
  private readonly openChestBtn: HTMLButtonElement;
  private readonly openAllChestsBtn: HTMLButtonElement;
    private readonly openInventoryBtn: HTMLButtonElement;
    private readonly openStashBtn: HTMLButtonElement;
    private readonly openForgeBtn: HTMLButtonElement;
    private readonly optimizeLoadoutBtn: HTMLButtonElement;
  private readonly openSettingsBtn: HTMLButtonElement;
  private readonly openCampaignBtn: HTMLButtonElement;
  private readonly openShopBtn: HTMLButtonElement;
  private readonly openUpgradesBtn: HTMLButtonElement;
  private readonly battlePauseOverlay: HTMLElement;
  private readonly wowCelebrationRoot: HTMLElement;
  private readonly wowCelebrationStage: HTMLElement;
  private readonly wowInboxRoot: HTMLElement;
  private readonly wowInboxPanel: HTMLElement;
  private readonly openWowInboxBtn: HTMLButtonElement;
  private readonly battleLogOverlayEl: HTMLElement;
  private readonly openBattleLogBtn: HTMLButtonElement;
  private readonly openHeroesBtn: HTMLButtonElement;
  private readonly openFormationBtn: HTMLButtonElement;
  private readonly heroesContainerEl: HTMLElement;

  private readonly battleStripEl: HTMLElement;
  private readonly battleStrip: BattleStripRenderer;
  private readonly battleFloats: BattleFloatingTextController;
  private readonly battleImpacts: BattleImpactFeedbackController;
  private readonly battleSkillVfx: BattleSkillVfxController;
  private readonly victoryFlow: BattleVictoryFlow;
  private readonly modal: ModalController;
  private readonly heroDrawer: SideDrawerController;
  private readonly inventoryModal: InventoryModalRenderer;
  private readonly stashModal: StashModalRenderer;
  private readonly heroDetailModal: HeroDetailModalRenderer;
  private readonly equipPickerModal: EquipPickerModalRenderer;
  private readonly lootModal: LootModalRenderer;
  private readonly lootBatchModal: LootBatchModalRenderer;
  private readonly settingsModal: SettingsModalRenderer;
  private readonly shopModal: ShopModalRenderer;
  private readonly upgradeTreeModal: UpgradeTreeModalRenderer;
  private readonly metaLegacyModal: MetaLegacyModalRenderer;
  private readonly divineForgeModal: DivineForgeModalRenderer;
  private readonly toasts: ToastController;
  private readonly rewards: RewardPresentationController;
  private readonly destroyGearConfirmDialog: DestroyGearConfirmDialog;
  private readonly ascendClassConfirmDialog: AscendClassConfirmDialog;
  private readonly forgeConfirmDialog: DivineForgeConfirmDialog;
  private readonly donationPrompt: DonationPromptController;
  private readonly hud: GameHudController;
  private readonly wowCelebration: WowCelebrationController;
  private readonly battleLogPanel: BattleLogPanelController;
  private readonly battleLogRenderer = new BattleLogRenderer();
  private readonly skillCooldownAnimator = new SkillCooldownDisplayAnimator();

  private readonly heroDetailFlow: HeroDetailFlow;
  private readonly shopFlow: ShopFlow;
  private readonly metaLegacyFlow: MetaLegacyFlow;
  private readonly gearEquipFlow: GearEquipFlow;
  private readonly gearStorageFlow: GearStorageFlow;
  private readonly divineForgeFlow: DivineForgeFlow;
  private readonly chestLootFlow: ChestLootFlow;
  private readonly campaignFlow: CampaignFlow;
  private readonly partyFlow: PartyFlow;
  private readonly modalStackController: ModalStackController;
  private readonly inlineEquip = new InlineEquipController();
  private readonly onboarding = new OnboardingController();

  private shownIntermissionKey: string | null = null;
  private intermissionResuming = false;
  private deferredRewardBaseline: GameStateDto | null = null;

  constructor(root: HTMLElement, client: IGameClient = getDefaultGameClient()) {
    this.client = client;

    this.campaignContextLabel = root.querySelector('#campaign-context-label')!;
    this.goldLabel = root.querySelector('#gold-label')!;
    this.chestLabel = root.querySelector('#chest-label')!;
    this.chestProgressLabel = root.querySelector('#chest-progress-label')!;
    this.battleLog = document.querySelector('#battle-log')!;
    this.openBattleLogBtn = root.querySelector('#open-battle-log-btn') as HTMLButtonElement;
    this.openHeroesBtn = root.querySelector('#open-heroes-btn') as HTMLButtonElement;
    this.openFormationBtn = root.querySelector('#open-formation-btn') as HTMLButtonElement;
    this.pauseLoadoutBtn = root.querySelector('#pause-loadout-btn') as HTMLButtonElement;
    this.continueLoadoutBtn = root.querySelector('#continue-loadout-btn') as HTMLButtonElement;
    this.openChestBtn = root.querySelector('#open-chest-btn') as HTMLButtonElement;
    this.openAllChestsBtn = root.querySelector('#open-all-chests-btn') as HTMLButtonElement;
    this.openInventoryBtn = root.querySelector('#open-inventory-btn') as HTMLButtonElement;
    this.openStashBtn = root.querySelector('#open-stash-btn') as HTMLButtonElement;
    this.openForgeBtn = root.querySelector('#open-forge-btn') as HTMLButtonElement;
    this.optimizeLoadoutBtn = root.querySelector('#optimize-loadout-btn') as HTMLButtonElement;
    this.openSettingsBtn = root.querySelector('#open-settings-btn') as HTMLButtonElement;
    this.openCampaignBtn = root.querySelector('#open-campaign-btn') as HTMLButtonElement;
    this.openShopBtn = root.querySelector('#open-shop-btn') as HTMLButtonElement;
    this.openUpgradesBtn = root.querySelector('#open-upgrades-btn') as HTMLButtonElement;
    this.battlePauseOverlay = root.querySelector('#battle-pause-overlay') as HTMLElement;
    this.wowCelebrationRoot = root.querySelector('#wow-celebration-root') as HTMLElement;
    this.wowCelebrationStage = root.querySelector('#wow-celebration-stage') as HTMLElement;
    this.wowInboxRoot = root.querySelector('#wow-inbox-root') as HTMLElement;
    this.wowInboxPanel = root.querySelector('#wow-inbox-panel') as HTMLElement;
    this.openWowInboxBtn = root.querySelector('#open-wow-inbox-btn') as HTMLButtonElement;
    this.battleLogOverlayEl = document.querySelector('#battle-log-overlay') as HTMLElement;
    this.heroesContainerEl = root.querySelector('#heroes-container') as HTMLElement;

    this.battleStripEl = root.querySelector('.battle-strip') as HTMLElement;

    this.battleStrip = new BattleStripRenderer(
      this.heroesContainerEl,
      root.querySelector('#enemy-container')!,
      this.battleStripEl,
      root.querySelector('[data-strip-bg]')!,
      this.battleStripEl.querySelector('.strip-floor')!,
    );
    this.battleFloats = new BattleFloatingTextController(
      root.querySelector('#battle-float-layer')!,
      this.battleStripEl,
    );
    this.battleImpacts = new BattleImpactFeedbackController(
      root.querySelector('#battle-float-layer')!,
      this.battleStripEl,
    );
    this.battleSkillVfx = new BattleSkillVfxController(
      root.querySelector('#battle-float-layer')!,
      this.battleStripEl,
    );
    this.victoryFlow = new BattleVictoryFlow(
      root.querySelector('#battle-victory-overlay')!,
      this.battleStripEl,
      new BattleVictoryOverlayRenderer(),
    );

    this.modal = new ModalController(
      root.querySelector('#modal-root')!,
      root.querySelector('#modal-title')!,
      root.querySelector('#modal-body')!,
    );

    this.heroDrawer = new SideDrawerController(
      root.querySelector('#hero-drawer-root')!,
      root.querySelector('#hero-drawer-title')!,
      root.querySelector('#hero-drawer-body')!,
    );

    this.inventoryModal = new InventoryModalRenderer();
    this.stashModal = new StashModalRenderer();
    this.heroDetailModal = new HeroDetailModalRenderer();
    this.equipPickerModal = new EquipPickerModalRenderer();
    this.lootModal = new LootModalRenderer();
    this.lootBatchModal = new LootBatchModalRenderer();
    this.settingsModal = new SettingsModalRenderer();
    this.shopModal = new ShopModalRenderer();
    this.upgradeTreeModal = new UpgradeTreeModalRenderer();
    this.metaLegacyModal = new MetaLegacyModalRenderer();
    this.divineForgeModal = new DivineForgeModalRenderer();
    this.toasts = new ToastController(root.querySelector('#toast-root')!);
    this.wowCelebration = new WowCelebrationController(
      this.wowCelebrationRoot,
      this.wowCelebrationStage,
      this.wowInboxRoot,
      this.wowInboxPanel,
      this.openWowInboxBtn,
    );
    this.rewards = new RewardPresentationController(this.wowCelebration);
    this.destroyGearConfirmDialog = new DestroyGearConfirmDialog(
      root.querySelector('#destroy-gear-confirm-root')!,
      root.querySelector('#destroy-confirm-body')!,
      root.querySelector('[data-destroy-confirm-accept]') as HTMLButtonElement,
    );
    this.forgeConfirmDialog = new DivineForgeConfirmDialog(
      root.querySelector('#forge-confirm-root')!,
      root.querySelector('#forge-confirm-title')!,
      root.querySelector('#forge-confirm-body')!,
      root.querySelector('[data-forge-confirm-accept]') as HTMLButtonElement,
    );
    this.ascendClassConfirmDialog = new AscendClassConfirmDialog(
      root.querySelector('#ascend-confirm-root')!,
      root.querySelector('#ascend-confirm-title')!,
      root.querySelector('#ascend-confirm-body')!,
      root.querySelector('[data-ascend-confirm-accept]') as HTMLButtonElement,
    );
    this.donationPrompt = new DonationPromptController(
      root.querySelector('#donation-prompt-root')!,
      root.querySelector('#donation-card-body')!,
      root.querySelector('#support-btn') as HTMLButtonElement,
    );
    mountNavArrowIcons(root);
    hydratePanelIcons(root);
    bindCampaignTooltip(this.campaignContextLabel);
    bindBattleChromeLayout(
      root.querySelector('.battle-combat-bar') as HTMLElement,
      root.querySelector('#app'),
    );

    this.hud = new GameHudController(
      this.campaignContextLabel,
      this.goldLabel,
      this.chestLabel,
      this.chestProgressLabel,
      this.openHeroesBtn,
      this.openFormationBtn,
      this.openInventoryBtn,
      this.openStashBtn,
      this.openForgeBtn,
      this.optimizeLoadoutBtn,
      this.openAllChestsBtn,
      this.openUpgradesBtn,
      this.openChestBtn,
      this.pauseLoadoutBtn,
      this.continueLoadoutBtn,
    );

    this.battleLogPanel = new BattleLogPanelController(
      this.battleLogOverlayEl,
      this.openBattleLogBtn,
      document.querySelector('#battle-log-close') as HTMLButtonElement,
    );

    this.heroDetailFlow = new HeroDetailFlow(
      this.client,
      this.heroDetailModal,
      this.toasts,
      this.rewards,
      this.ascendClassConfirmDialog,
      (state) => this.afterHeroProgressionMutation(state),
      () => this.refreshHeroDetailViews(),
    );
    this.heroDetailFlow.setTabWillChangeListener((tab) => {
      if (tab !== 'sheet') {
        this.inlineEquip.close();
      }
    });

    this.shopFlow = new ShopFlow(
      this.client,
      this.toasts,
      this.rewards,
      (state) => this.render(state),
      () => this.refreshModalIfOpen(),
      () => this.enforceUpgradeGates(),
    );

    this.metaLegacyFlow = new MetaLegacyFlow(
      this.client,
      this.toasts,
      (state) => this.render(state),
      () => this.refreshModalIfOpen(),
    );

    this.gearEquipFlow = new GearEquipFlow(
      this.client,
      this.gearMutations,
      this.toasts,
      () => this.state,
      (state) => this.afterGearMutation(state),
      (error) => this.onGearMutationFailed(error),
    );

    this.gearStorageFlow = new GearStorageFlow(
      this.client,
      this.gearMutations,
      this.toasts,
      this.destroyGearConfirmDialog,
      (state) => this.afterStorageMutation(state),
      (error) => this.onGearMutationFailed(error),
    );

    this.divineForgeFlow = new DivineForgeFlow(
      this.client,
      this.gearMutations,
      this.forgeConfirmDialog,
      this.toasts,
      this.rewards,
      (state) => this.afterForgeMutation(state),
      (error) => this.onGearMutationFailed(error),
    );

    this.campaignFlow = new CampaignFlow(this.client, this.modal);
    this.partyFlow = new PartyFlow(this.client);

    this.chestLootFlow = new ChestLootFlow(
      this.client,
      this.lootFlow,
      () => this.state,
      () => this.modal.isOpen(),
      (error) => this.handleFailedResponse(error),
      (state, options) => this.render(state, options),
      (gears) => this.handleLootReceived(gears),
      (view) => this.pushModal(view),
      () => this.modal.close('action'),
      () => this.modalStack,
      () => this.modalStack.pop(),
      () => this.refreshModalIfOpen(),
      () => this.prefsController.autoOpenChests,
    );

    this.modalStackController = new ModalStackController(
      this.modal,
      this.inventoryModal,
      this.stashModal,
      this.heroDetailFlow,
      this.equipPickerModal,
      this.lootModal,
      this.lootBatchModal,
      this.settingsModal,
      this.shopModal,
      this.upgradeTreeModal,
      this.metaLegacyModal,
      this.divineForgeModal,
      this.shopFlow,
      this.metaLegacyFlow,
      this.divineForgeFlow,
      this.gearEquipFlow,
      this.gearStorageFlow,
      this.chestLootFlow,
      this.lootFlow,
      () => this.prefsController.preferences,
      (key, value) => this.handlePreferenceChange(key, value),
      () => {
        void this.openUpgradesModal();
      },
      () => {
        void this.openMetaLegacyModal();
      },
      (heroId, slot) => this.openEquipPickerFromSlot(heroId, slot),
      (gearId) => this.openEquipPickerFromGear(gearId),
      (gearIds) => {
        void this.equipRecommendedLoot(gearIds);
      },
      () => this.openStashModal(),
      () => this.openInventoryModal(),
      (heroId) => {
        const active = this.inlineEquip.getActiveSlot();
        if (active && active.heroId !== heroId) {
          this.inlineEquip.close();
        }
      },
    );

    bindGearStorageActions(document, this.gearStorageFlow, () => this.state);

    bindGearDragDrop(root, {
      canEditGear: () => this.canEditGear(),
      canEditParty: () => this.canEditParty(),
      onEquip: (heroId, gearId) => {
        void this.gearEquipFlow.equip(heroId, gearId, { fromInventory: true });
      },
      onUnequip: (heroId, slot) => {
        void this.gearEquipFlow.unequip(heroId, slot, { fromInventory: true });
      },
      onMoveToStash: (gearId) => {
        void this.gearStorageFlow.moveToStash(gearId);
      },
      onMoveFromStashThenEquip: (gearId, heroId) => {
        void (async () => {
          await this.gearStorageFlow.moveFromStash(gearId);
          await this.gearEquipFlow.equip(heroId, gearId, { fromInventory: true });
        })();
      },
      onEquippedToStash: (heroId, slot, gearId) => {
        void (async () => {
          await this.gearEquipFlow.unequip(heroId, slot, { fromInventory: true });
          await this.gearStorageFlow.moveToStash(gearId);
        })();
      },
      onMoveEquippedGear: (source, target) => {
        void (async () => {
          await this.gearEquipFlow.unequip(source.heroId, source.slot, { fromInventory: true });
          await this.gearEquipFlow.equip(target.heroId, source.gearId, { fromInventory: true });
        })();
      },
      onPartySlotDrop: (heroId, targetIndex) => {
        void this.handlePartySlotDrop(heroId, targetIndex);
      },
      onPartyActiveToBench: (heroId) => {
        void this.handlePartyActiveToBench(heroId);
      },
      onPartyReorder: (fromIndex, toIndex) => {
        void this.handlePartyReorder(fromIndex, toIndex);
      },
    });

    this.prefsController.apply(this.state);
    this.bindHeroPanelDelegation();
    this.bindBattleStripDelegation();
    this.bindHeroDrawerNavigation();
    this.bindGearActionDelegation(this.modal.getBody(), () => this.modal.isOpen());
    this.bindGearActionDelegation(this.heroDrawer.getBody(), () => this.heroDrawer.isOpen());
    document.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest('[data-inventory-equip]') as HTMLElement | null;
      if (!target) return;
      const gearId = target.getAttribute('data-inventory-equip');
      const heroId = target.getAttribute('data-inventory-equip-hero');
      if (!gearId || !heroId) return;
      this.markGearActionPending(target);
      void this.gearEquipFlow.equip(heroId, gearId, { fromInventory: true });
    });

    this.pauseLoadoutBtn.addEventListener('click', () => {
      this.dismissOnboardingStep('pause-loadout');
      this.stopAutoBattle();
      void this.pauseForLoadout();
    });
    this.continueLoadoutBtn.addEventListener('click', () => {
      void this.continueFromLoadoutPause();
    });
    this.openChestBtn.addEventListener('click', () => {
      this.dismissOnboardingStep('first-chest');
      void this.chestLootFlow.openNextChest();
    });
    this.openAllChestsBtn.addEventListener('click', () => {
      void this.chestLootFlow.openAllChests();
    });
    this.openInventoryBtn.addEventListener('click', () => this.openInventoryModal());
    this.openStashBtn.addEventListener('click', () => this.openStashModal());
    this.openForgeBtn.addEventListener('click', () => this.openForgeModal());
    this.optimizeLoadoutBtn.addEventListener('click', () => {
      void this.gearEquipFlow.optimizeLoadout();
    });
    this.openSettingsBtn.addEventListener('click', () => this.openSettingsModal());
    this.openHeroesBtn.addEventListener('click', () => {
      this.dismissOnboardingStep('hero-points');
      this.openHeroesModal();
    });
    this.openFormationBtn.addEventListener('click', () => {
      this.openFormationModal();
    });
    this.openCampaignBtn.addEventListener('click', () => {
      void this.openCampaignModal();
    });
    this.openShopBtn.addEventListener('click', () => {
      void this.openShopModal();
    });
    this.openUpgradesBtn.addEventListener('click', () => {
      this.dismissOnboardingStep('first-upgrade');
      void this.openUpgradesModal();
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state) {
        touchPanelSnapshot(this.state);
        this.idleSummaryShown = false;
        return;
      }

      if (!document.hidden && this.state) {
        this.maybeShowIdleSummary(this.state);
      }
    });
  }

  async init(): Promise<void> {
    try {
      await this.refresh({ checkIdleSummary: true });
    } catch {
      this.handleContextInvalidated();
      return;
    }

    if (this.contextInvalidated) return;

    if (this.isManualLoadoutPause(this.state)) {
      this.syncLoadoutPauseBanner(this.state);
    }

    this.syncAutoBattleTimer();

    this.refreshTimer = window.setInterval(() => {
      void this.refresh();
    }, 5000);
  }

  private enforceUpgradeGates(): void {
    const wasAutoBattle = this.prefsController.autoBattleEnabled;
    this.prefsController.enforceGates(this.state);
    if (wasAutoBattle !== this.prefsController.autoBattleEnabled) {
      this.syncAutoBattleTimer();
    }
  }

  private handlePreferenceChange<K extends keyof GamePreferences>(
    key: K,
    value: GamePreferences[K],
  ): void {
    const result = this.prefsController.update(key, value, this.state);
    if (!result.applied) {
      this.toasts.show('Desbloqueie esta automação em Melhorias', 'info');
      if (this.modal.isOpen() && this.modalStack[this.modalStack.length - 1]?.type === 'settings') {
        this.renderModalTop();
      }
      return;
    }

    if (key === 'autoOpenChests' && value === true) {
      this.chestLootFlow.scheduleAutoOpenChests();
    }

    if (key === 'logFilterImportant') {
      this.battleLogRenderer.reset();
    }

    if (result.autoBattleChanged) {
      this.syncAutoBattleTimer();
    }

    if (this.state) {
      this.render(this.state);
    }

    if (this.modal.isOpen() && this.modalStack[this.modalStack.length - 1]?.type === 'settings') {
      this.renderModalTop();
    }
  }

  private isManualLoadoutPause(state: GameStateDto | null = this.state): boolean {
    return Boolean(state?.loadoutEditOpen && state?.phaseRestartOnResume);
  }

  private isAdvanceBlocked(state: GameStateDto | null = this.state): boolean {
    if (this.onboarding.isActive()) return true;
    if (this.victoryFlow.isBlockingAdvance()) return true;
    if (this.pausingLoadout) return true;
    return this.isManualLoadoutPause(state);
  }

  private openSettingsModal(): void {
    if (this.contextInvalidated) return;
    this.modalStack.length = 0;
    this.pushModal({ type: 'settings' });
  }

  private async startNewGame(): Promise<void> {
    if (this.contextInvalidated) return;

    const confirmed = window.confirm(
      'Iniciar um novo jogo? O progresso da temporada será apagado, mas seus selos de legado permanecem.',
    );
    if (!confirmed) return;

    const response = await this.client.send({ type: 'NEW_GAME' });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha ao iniciar novo jogo', 'idle');
      return;
    }

    this.modal.close('action');
    this.render(response.state);
    this.toasts.show('Novo jogo iniciado!', 'victory');
  }

  private async openCampaignModal(): Promise<void> {
    if (this.contextInvalidated) return;

    this.closeHeroDrawer();
    const modalBody = this.modal.open('Campanha');
    await this.campaignFlow.open((state) => this.render(state), modalBody);
  }

  private async openShopModal(): Promise<void> {
    if (this.contextInvalidated) return;

    this.closeHeroDrawer();
    const response = await this.client.send({ type: 'GET_SHOP_OFFERS' });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }
    this.shopFlow.state.offers = response.shopOffers ?? [];
    if (typeof response.shopRefreshCost === 'number') {
      this.shopFlow.state.refreshCost = response.shopRefreshCost;
    }
    if (typeof response.canAffordShopRefresh === 'boolean') {
      this.shopFlow.state.canAffordRefresh = response.canAffordShopRefresh;
    }
    if (typeof response.shopRefreshUnlocked === 'boolean') {
      this.shopFlow.state.shopRefreshUnlocked = response.shopRefreshUnlocked;
    }
    if (typeof response.shopRefreshRemaining === 'number') {
      this.shopFlow.state.shopRefreshRemaining = response.shopRefreshRemaining;
    }
    const state = response.state;

    this.state = state;
    this.modalStack.length = 0;
    this.pushModal({ type: 'shop' });
  }

  private async openUpgradesModal(): Promise<void> {
    if (this.contextInvalidated) return;

    this.dismissOnboardingStep('first-upgrade');
    this.closeHeroDrawer();
    const response = await this.client.send({ type: 'GET_UPGRADE_TREE' });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }
    this.shopFlow.state.upgradeNodes = response.upgradeNodes ?? [];
    const state = response.state;

    this.state = state;
    this.upgradeTreeModal.beginSession();
    this.modalStack.length = 0;
    this.pushModal({ type: 'upgrades' });
  }

  private async openMetaLegacyModal(): Promise<void> {
    if (this.contextInvalidated) return;

    this.closeHeroDrawer();
    const state = await this.metaLegacyFlow.loadTree();
    if (!state) return;

    this.state = state;
    this.modalStack.length = 0;
    this.pushModal({ type: 'meta-legacy' });
  }

  private syncAutoBattleTimer(): void {
    if (this.prefsController.autoBattleEnabled && !this.isAdvanceBlocked()) {
      this.stopAutoBattle();
      this.startAutoBattle();
      return;
    }
    this.stopAutoBattle();
  }

  private startAutoBattle(): void {
    if (this.contextInvalidated || this.isAdvanceBlocked()) return;
    this.autoBattleController.restart(
      this.prefsController.getAutoBattleIntervalMs(this.state),
      () => {
        void this.tick();
      },
    );
  }

  private stopAutoBattle(): void {
    this.autoBattleController.stop();
  }

  private async refresh(options: { checkIdleSummary?: boolean } = {}): Promise<void> {
    if (this.contextInvalidated) return;
    if (this.pausingLoadout) return;
    if (this.state && !this.state.canEditParty && !this.isManualLoadoutPause(this.state)) return;
    if (this.modal.isOpen() && this.isManualLoadoutPause(this.state)) return;

    const response = await this.client.send({ type: 'GET_STATE' });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }

    this.render(response.state, { checkIdleSummary: options.checkIdleSummary });
  }

  private handleFailedResponse(error?: string): void {
    if (error?.includes('Extension context invalidated') || !this.client.isContextValid()) {
      this.handleContextInvalidated();
      return;
    }

    if (error) {
      this.toasts.show(error, 'info');
    }
  }

  private handleContextInvalidated(): void {
    if (this.contextInvalidated) return;
    this.contextInvalidated = true;
    this.modalStack.length = 0;
    this.lootFlow.reset();

    if (this.refreshTimer !== null) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.stopAutoBattle();

    try {
      this.closeHeroDrawer();
      this.modal.close('action');
    } catch {
      // painel já desconectado
    }

    const app = document.getElementById('app');
    if (!app || app.querySelector('.context-invalid-banner')) return;

    const banner = document.createElement('div');
    banner.className = 'context-invalid-banner';
    banner.innerHTML = `
      <strong>Extensão recarregada</strong>
      <p>Recarregue a página do site para reconectar o Side Hero.</p>
      <button type="button" class="context-reload-btn">Recarregar página</button>
    `;
    banner.querySelector('.context-reload-btn')?.addEventListener('click', () => {
      window.top?.location.reload();
    });
    app.prepend(banner);
  }

  private async pauseForLoadout(): Promise<void> {
    if (this.contextInvalidated || this.isAdvanceBlocked()) return;

    this.stopAutoBattle();
    this.pausingLoadout = true;

    try {
      const response = await this.client.send({ type: 'PAUSE_FOR_LOADOUT' });
      if (!response.ok) {
        this.handleFailedResponse(response.error);
        return;
      }

      this.render(response.state);
      this.toasts.show('No acampamento — ajuste sua equipe', 'info');
    } finally {
      this.pausingLoadout = false;
    }
  }

  private async continueFromLoadoutPause(): Promise<void> {
    if (!this.isManualLoadoutPause(this.state)) return;

    const response = await this.client.send({ type: 'TICK', restartCurrentPhase: true });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }

    this.render(response.state);
    this.showCombatFloats(response.combatFloats, response.combatSkillVfx);
    this.syncAutoBattleTimer();
  }

  private async resumeCombatIntermission(): Promise<void> {
    if (this.intermissionResuming) return;
    this.intermissionResuming = true;

    try {
      const response = await this.client.send({ type: 'RESUME_COMBAT_INTERMISSION' });
      if (!response.ok) {
        this.handleFailedResponse(response.error);
        return;
      }

      this.shownIntermissionKey = null;
      this.render(response.state);
      this.showCombatFloats(response.combatFloats, response.combatSkillVfx);
      this.flushDeferredVictoryRewards();
      this.syncAutoBattleTimer();
    } finally {
      this.intermissionResuming = false;
    }
  }

  private flushDeferredVictoryRewards(): void {
    const baseline = this.deferredRewardBaseline;
    this.deferredRewardBaseline = null;
    if (!baseline || !this.state) return;

    this.rewards.celebratePhaseMilestoneRewards(baseline, this.state);
  }

  private buildIntermissionKey(state: GameStateDto): string | null {
    if (!state.combatIntermission) return null;
    const wave = state.phaseRun?.waveIndex ?? 'none';
    return `${state.combatIntermission.variant}:${state.combatIntermission.clearedPhaseId}:${wave}`;
  }

  private showCombatIntermissionOverlay(
    previous: GameStateDto | null,
    state: GameStateDto,
  ): void {
    if (!state.combatIntermission || this.victoryFlow.isActive() || this.intermissionResuming) {
      return;
    }

    const key = this.buildIntermissionKey(state);
    if (!key || key === this.shownIntermissionKey) {
      return;
    }

    this.shownIntermissionKey = key;
    const payload = buildBattleIntermissionPayload(state.combatIntermission, state, previous);
    if (
      payload.variant === 'phase-clear' &&
      previous &&
      payload.milestoneVictory?.isMilestone
    ) {
      this.deferredRewardBaseline = previous;
    }
    this.stopAutoBattle();
    this.victoryFlow.show(payload, () => {
      void this.resumeCombatIntermission();
    });
  }

  private async tick(
    options: { restartCurrentPhase?: boolean } = {},
  ): Promise<void> {
    if (this.chestLootFlow.openingChests) return;
    if (!options.restartCurrentPhase && this.isAdvanceBlocked()) return;

    const response = await this.client.send({
      type: 'TICK',
      ticks: 1,
      restartCurrentPhase: options.restartCurrentPhase,
    });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }

    if (!options.restartCurrentPhase && this.isAdvanceBlocked(response.state)) {
      return;
    }

    if (
      !options.restartCurrentPhase &&
      this.isManualLoadoutPause(this.state) &&
      !this.isManualLoadoutPause(response.state)
    ) {
      return;
    }

    this.render(response.state, { previousState: this.state });
    this.showCombatFloats(response.combatFloats, response.combatSkillVfx);

    if (response.sigilsAwarded && response.sigilsAwarded > 0) {
      this.toasts.show(`+${response.sigilsAwarded} selos de legado!`, 'victory');
    }
  }

  private showCombatFloats(
    combatFloats?: CombatFloatingEventDto[],
    combatSkillVfx?: CombatSkillVfxDto[],
  ): void {
    if (!combatFloats?.length && !combatSkillVfx?.length) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (combatSkillVfx?.length) {
          this.battleSkillVfx.show(combatSkillVfx);
        }
        if (combatFloats?.length) {
          this.battleFloats.show(combatFloats);
          this.battleImpacts.show(combatFloats);
        }
      });
    });
  }

  private async handleLootReceived(gears: GearDto[]): Promise<void> {
    if (gears.length === 1) {
      await this.rewards.celebrateLoot(gears[0]);
    } else if (gears.length > 1) {
      this.rewards.celebrateBatchLoot(gears);
    }

    if (!this.state?.canEditParty) {
      return;
    }

    const flags = getFeatureFlags(this.state);
    if (this.prefsController.autoEquipLoot && flags.autoEquipLoot) {
      await this.gearEquipFlow.optimizeLoadout(
        gears.map((gear) => gear.id),
        {
          fromLoot: true,
          silent: flags.autoEquipSilent,
        },
      );
    }
  }

  private async equipRecommendedLoot(gearIds: string[]): Promise<void> {
    await this.gearEquipFlow.optimizeLoadout(gearIds);
    this.chestLootFlow.closeLootBatchModal();
  }

  private afterStorageMutation(state: GameStateDto): void {
    this.render(state);
    this.refreshHeroDrawerIfOpen();
    this.refreshModalIfOpen();
  }

  private afterForgeMutation(state: GameStateDto): void {
    this.divineForgeModal.clearAfterFuse();
    this.divineForgeModal.clearAfterSalvage();
    this.afterStorageMutation(state);
  }

  private canEditGear(): boolean {
    return this.canEditParty();
  }

  private canEditParty(): boolean {
    return Boolean(this.state?.canEditParty || this.isManualLoadoutPause(this.state));
  }

  private syncInlineEquipHosts(): void {
    if (!this.state) return;

    const handlers: InlineEquipHandlers = {
      onSelectGear: (heroId, gearId) => {
        void this.gearEquipFlow.equip(heroId, gearId, { fromInventory: true });
      },
      onSelectHero: (heroId, gearId) => {
        void this.gearEquipFlow.equip(heroId, gearId, { fromInventory: true });
      },
      onUnequip: (heroId, slot) => {
        void this.gearEquipFlow.unequip(heroId, slot, { fromInventory: true });
      },
      onSortChange: () => this.refreshInlineEquipViews(),
      onUpgradesOnlyChange: () => this.refreshInlineEquipViews(),
      onClose: () => {
        this.inlineEquip.close();
        this.refreshInlineEquipViews();
      },
    };

    document.querySelectorAll('[data-inline-equip-host]').forEach((host) => {
      if (
        this.heroDrawer.isOpen() &&
        this.heroDrawer.getBody().contains(host) &&
        this.heroDetailModal.getActiveTab() !== 'sheet'
      ) {
        return;
      }

      this.inlineEquip.render(host as HTMLElement, this.state!, handlers);
    });
  }

  private buildInventoryHandlers(onRefresh: () => void): InventoryModalHandlers {
    return {
      onEquipGear: (gearId, heroId) => {
        void this.gearEquipFlow.equip(heroId, gearId, { fromInventory: true });
      },
      onUnequipGear: (heroId, slot) => {
        void this.gearEquipFlow.unequip(heroId, slot, { fromInventory: true });
      },
      onSlotClick: (heroId, slot) => {
        this.openEquipPickerFromSlot(heroId, slot);
      },
      onSortChange: onRefresh,
      onHeroChange: () => {},
      onUpgradesOnlyChange: onRefresh,
      onOptimizeLoadout: () => {
        void this.gearEquipFlow.optimizeLoadout(undefined, { fromInventory: true });
      },
      onOpenStash: () => this.openStashModal(),
    };
  }

  private mountHeroEmbeddedInventory(host: HTMLElement, heroId: string): void {
    if (!this.state || this.heroDetailModal.getActiveTab() !== 'sheet') return;

    this.inventoryModal.renderEmbedded(
      host,
      this.state,
      heroId,
      this.buildInventoryHandlers(() => this.refreshHeroDrawerIfOpen()),
      {
        showOptimize: this.state.featureFlags.optimizeLoadout,
        inlineActiveSlot: this.inlineEquip.getActiveSlot(),
        canEditGear: this.canEditGear(),
      },
    );
  }

  private bindHeroDetailDrawer(container: HTMLElement, heroId: string): void {
    const activeSlot = this.inlineEquip.getActiveSlot();
    this.heroDetailModal.setInlineActiveSlot(
      activeSlot?.heroId === heroId ? activeSlot : null,
    );
    this.heroDetailFlow.bindToModal(container, this.state!, heroId, {
      onSlotClick: (id, slot) => this.openEquipPickerFromSlot(id, slot),
      mountInventory: (host) => this.mountHeroEmbeddedInventory(host, heroId),
    });
  }

  private refreshInlineEquipViews(): void {
    this.refreshHeroDrawerIfOpen();
    this.refreshModalIfOpen();
  }

  private afterGearMutation(state: GameStateDto): void {
    const topView = this.modalStack[this.modalStack.length - 1];
    if (
      topView?.type === 'loot-reveal' ||
      topView?.type === 'loot-batch'
    ) {
      this.modalStack.pop();
    }

    const lootRevealPending =
      topView?.type === 'loot-reveal' && this.lootFlow.hasQueued();
    const shouldCloseModal = this.modalStack.length === 0;
    const previousState = this.state;

    this.inlineEquip.close();
    this.render(state, { previousState });
    this.refreshHeroDrawerIfOpen();
    this.refreshModalIfOpen();

    if (lootRevealPending) {
      this.chestLootFlow.advanceLootQueue();
      return;
    }

    if (shouldCloseModal) {
      this.modal.close('action');
    }
  }

  private onGearMutationFailed(error?: string): void {
    this.handleFailedResponse(error);
    this.refreshHeroDrawerIfOpen();
    this.refreshModalIfOpen();
  }

  private afterHeroProgressionMutation(state: GameStateDto): void {
    this.render(state);
    this.refreshHeroDetailViews();
  }

  private bindBattleStripDelegation(): void {
    this.heroesContainerEl.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest('[data-hero-battle-open]') as HTMLElement | null;
      if (!target) return;
      event.preventDefault();
      event.stopPropagation();
      const heroId = target.getAttribute('data-hero-battle-open');
      if (heroId) {
        this.openHeroDrawer(heroId);
      }
    });
  }

  private bindHeroDrawerNavigation(): void {
    const root = this.heroDrawer.getBody().closest('#hero-drawer-root');
    if (!root) return;

    root.querySelector('[data-hero-drawer-prev]')?.addEventListener('click', (event) => {
      event.preventDefault();
      this.navigateHeroDrawer(-1);
    });

    root.querySelector('[data-hero-drawer-next]')?.addEventListener('click', (event) => {
      event.preventDefault();
      this.navigateHeroDrawer(1);
    });
  }

  private navigateHeroDrawer(direction: -1 | 1): void {
    if (!this.state || !this.heroDrawerHeroId) return;
    const navigation = getHeroNavigation(this.state, this.heroDrawerHeroId);
    const nextId = direction < 0 ? navigation.prevId : navigation.nextId;
    if (!nextId) return;
    this.openHeroDrawer(nextId, this.heroDetailModal.getActiveTab());
  }

  private openHeroDrawer(heroId: string, tab: HeroDetailTab = 'sheet'): void {
    if (this.modal.isOpen()) {
      this.modalStack.length = 0;
      this.modal.close('action');
    }

    if (this.heroDrawerHeroId !== heroId) {
      this.inlineEquip.close();
    }

    const hero = this.state?.heroes.find((entry) => entry.id === heroId);
    if (hero?.hasUnspentPoints) {
      this.dismissOnboardingStep('hero-points');
    }

    this.heroDrawerHeroId = heroId;

    void this.heroDetailFlow.prepareOpen(heroId, tab).then(() => {
      if (!this.state) return;
      const hero = this.state.heroes.find((entry) => entry.id === heroId);
      const navigation = getHeroNavigation(this.state, heroId);
      const container = this.heroDrawer.prepare(hero?.name ?? 'Herói', (reason) => {
        if (reason !== 'action') {
          this.heroDrawerHeroId = null;
        }
      });

      this.heroDrawer.setNavVisible({
        prev: navigation.prevId !== null,
        next: navigation.nextId !== null,
      });

      this.bindHeroDetailDrawer(container, heroId);
      this.syncInlineEquipHosts();
    });
  }

  private closeHeroDrawer(): void {
    this.heroDrawerHeroId = null;
    this.heroDrawer.close('action');
  }

  private refreshHeroDrawerIfOpen(): void {
    if (!this.heroDrawer.isOpen() || !this.heroDrawerHeroId || !this.state) return;

    const heroId = this.heroDrawerHeroId;
    const hero = this.state.heroes.find((entry) => entry.id === heroId);
    if (!hero) {
      this.closeHeroDrawer();
      return;
    }

    const navigation = getHeroNavigation(this.state, heroId);
    this.heroDrawer.prepare(hero.name);
    this.heroDrawer.setNavVisible({
      prev: navigation.prevId !== null,
      next: navigation.nextId !== null,
    });

    this.bindHeroDetailDrawer(this.heroDrawer.getBody(), heroId);
    this.syncInlineEquipHosts();
  }

  private async handlePartySlotDrop(heroId: string, targetIndex: number): Promise<void> {
    if (!this.canEditParty()) {
      this.toasts.show('Volte ao acampamento para ajustar party e loadout', 'info');
      return;
    }

    try {
      const next = await this.partyFlow.setPartySlot(targetIndex, heroId);
      if (next) this.render(next);
    } catch (error) {
      this.handleFailedResponse(error instanceof Error ? error.message : 'Erro ao editar party');
    }
  }

  private async handlePartyActiveToBench(heroId: string): Promise<void> {
    if (!this.canEditParty()) {
      this.toasts.show('Volte ao acampamento para ajustar party e loadout', 'info');
      return;
    }

    try {
      const next = await this.partyFlow.removeFromParty(heroId);
      if (next) this.render(next);
    } catch (error) {
      this.handleFailedResponse(error instanceof Error ? error.message : 'Erro ao editar party');
    }
  }

  private async handlePartyReorder(fromIndex: number, toIndex: number): Promise<void> {
    if (!this.canEditParty()) {
      this.toasts.show('Volte ao acampamento para ajustar party e loadout', 'info');
      return;
    }

    try {
      const next = await this.partyFlow.movePartyMember(fromIndex, toIndex);
      if (next) this.render(next);
    } catch (error) {
      this.handleFailedResponse(error instanceof Error ? error.message : 'Erro ao editar party');
    }
  }

  private bindHeroPanelDelegation(): void {
    this.modal.getBody().addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const topView = this.modalStack[this.modalStack.length - 1];

      const partyTarget = target.closest(
        '[data-party-add], [data-party-remove], [data-party-swap]',
      ) as HTMLElement | null;

      if (partyTarget && topView?.type === 'formation') {
        event.preventDefault();
        event.stopPropagation();
        if (partyTarget instanceof HTMLButtonElement && partyTarget.disabled) return;
        void this.handlePartyPanelAction(partyTarget);
        return;
      }

      if (topView?.type !== 'heroes') return;

      const heroPanelTarget = target.closest(
        '.equipment-slot-clickable, [data-hero-skills-open], [data-open-upgrades], [data-hero-open]',
      ) as HTMLElement | null;

      if (!heroPanelTarget) return;

      if (heroPanelTarget.hasAttribute('data-open-upgrades')) {
        event.preventDefault();
        event.stopPropagation();
        void this.openUpgradesModal();
        return;
      }

      const skillsHeroId = heroPanelTarget.getAttribute('data-hero-skills-open');
      if (skillsHeroId) {
        event.preventDefault();
        event.stopPropagation();
        this.openHeroDetailModal(skillsHeroId, 'skills');
        return;
      }

      if (heroPanelTarget.classList.contains('equipment-slot-clickable')) {
        event.preventDefault();
        event.stopPropagation();
        const heroId = heroPanelTarget.getAttribute('data-hero');
        const slot = heroPanelTarget.getAttribute('data-slot');
        if (heroId && slot) {
          this.openEquipPickerFromSlot(heroId, slot);
        }
        return;
      }

      const heroId = heroPanelTarget.getAttribute('data-hero-open');
      if (heroId) {
        this.openHeroDetailModal(heroId);
      }
    });
  }

  private openHeroesModal(): void {
    if (!this.state) return;

    const heroIds = listNavigableHeroIds(this.state);
    const firstId = heroIds[0] ?? this.state.heroes[0]?.id;
    if (!firstId) {
      this.toasts.show('Nenhum herói disponível', 'info');
      return;
    }

    this.openHeroDrawer(firstId, 'sheet');
  }

  private openFormationModal(): void {
    if (
      this.modal.isOpen() &&
      this.modalStack[this.modalStack.length - 1]?.type === 'formation'
    ) {
      return;
    }

    this.modalStack.length = 0;
    this.pushModal({ type: 'formation' });
  }

  private async handlePartyPanelAction(target: HTMLElement): Promise<void> {
    if (!this.state?.canEditParty && !this.isManualLoadoutPause(this.state)) {
      this.toasts.show('Volte ao acampamento para ajustar party e loadout', 'info');
      return;
    }

    try {
      const addId = target.getAttribute('data-party-add');
      if (addId) {
        const next = await this.partyFlow.addToParty(addId);
        if (next) this.render(next);
        return;
      }

      const removeId = target.getAttribute('data-party-remove');
      if (removeId) {
        const next = await this.partyFlow.removeFromParty(removeId);
        if (next) this.render(next);
        return;
      }

      const swapIndexRaw = target.getAttribute('data-party-swap');
      if (swapIndexRaw !== null && this.state) {
        const fromIndex = Number.parseInt(swapIndexRaw, 10);
        if (
          fromIndex >= 0 &&
          fromIndex < this.state.activePartyIds.length - 1
        ) {
          const next = await this.partyFlow.movePartyMember(fromIndex, fromIndex + 1);
          if (next) this.render(next);
        }
      }
    } catch (error) {
      this.handleFailedResponse(error instanceof Error ? error.message : 'Erro ao editar party');
    }
  }

  private bindGearActionDelegation(
    container: HTMLElement,
    isContainerActive: () => boolean,
  ): void {
    container.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest(
        [
          '.equipment-slot-clickable',
          '[data-equip-gear]',
          '[data-pick-gear]',
          '[data-pick-hero]',
          '[data-unequip-hero]',
          '[data-loot-equip-hero]',
          '[data-optimize-loadout]',
          '[data-loot-keep]',
          '[data-loot-batch-equip]',
          '[data-loot-batch-keep]',
        ].join(', '),
      ) as HTMLElement | null;

      if (!target || !isContainerActive()) return;
      if (target instanceof HTMLButtonElement && target.disabled) return;

      this.handleGearActionClick(target);
    });
  }

  private handleGearActionClick(target: HTMLElement): void {
    const equipSlot = target.classList.contains('equipment-slot-clickable') ? target : null;
    if (equipSlot) {
      const heroId = equipSlot.getAttribute('data-hero');
      const slot = equipSlot.getAttribute('data-slot');
      if (heroId && slot) {
        this.openEquipPickerFromSlot(heroId, slot);
      }
      return;
    }

    if (target.hasAttribute('data-optimize-loadout')) {
      this.markGearActionPending(target);
      void this.gearEquipFlow.optimizeLoadout();
      return;
    }

    if (target.hasAttribute('data-loot-keep')) {
      this.chestLootFlow.closeLootModal();
      return;
    }

    if (target.hasAttribute('data-loot-batch-keep')) {
      this.chestLootFlow.closeLootBatchModal();
      return;
    }

    if (target.hasAttribute('data-loot-batch-equip')) {
      const topView = this.modalStack[this.modalStack.length - 1];
      if (topView?.type === 'loot-batch') {
        this.markGearActionPending(target);
        void this.equipRecommendedLoot(topView.gearIds);
      }
      return;
    }

    const equipFromInventory = target.getAttribute('data-equip-gear');
    if (equipFromInventory) {
      this.openEquipPickerFromGear(equipFromInventory);
      return;
    }

    const unequipHeroId = target.getAttribute('data-unequip-hero');
    const unequipSlot = target.getAttribute('data-unequip-slot') as GearSlotKey | null;
    if (unequipHeroId && unequipSlot) {
      this.markGearActionPending(target);
      void this.gearEquipFlow.unequip(unequipHeroId, unequipSlot);
      return;
    }

    const lootHeroId = target.getAttribute('data-loot-equip-hero');
    const lootGearId = target.getAttribute('data-loot-equip-gear');
    if (lootHeroId && lootGearId) {
      this.markGearActionPending(target);
      void this.gearEquipFlow.equip(lootHeroId, lootGearId);
      return;
    }

    const heroId = target.getAttribute('data-pick-hero');
    const gearId = target.getAttribute('data-pick-gear');
    if (heroId && gearId) {
      this.markGearActionPending(target);
      void this.gearEquipFlow.equip(heroId, gearId);
    }
  }

  private markGearActionPending(target: HTMLElement): void {
    const button = target.closest('button') as HTMLButtonElement | null;
    if (!button || button.disabled) return;
    button.disabled = true;
    button.classList.add('gear-action-pending');
  }

  private refreshHeroDetailViews(): void {
    this.refreshHeroDrawerIfOpen();
    this.refreshModalIfOpen();
  }

  private refreshModalIfOpen(): void {
    if (this.modal.isOpen() && this.modalStack.length > 0) {
      this.renderModalTop();
    }
  }

  private openInventoryModal(): void {
    if (this.contextInvalidated || !this.state) return;
    const heroId = resolveDefaultInventoryHeroId(this.state);
    this.openHeroDrawer(heroId, 'sheet');
  }

  private openStashModal(): void {
    if (this.contextInvalidated) return;
    if (!this.state?.storageCapacity.stashUnlocked) {
      this.toasts.show('Desbloqueie Baú de itens em Melhorias', 'info');
      return;
    }
    this.closeHeroDrawer();
    if (this.modal.isOpen() && this.modalStack.length > 0) {
      this.pushModal({ type: 'stash' });
      return;
    }
    this.modalStack.length = 0;
    this.pushModal({ type: 'stash' });
  }

  private openForgeModal(): void {
    if (this.contextInvalidated) return;
    if (!this.state?.featureFlags.divineForge) {
      this.toasts.show('Desbloqueie Forja Divina em Melhorias', 'info');
      return;
    }
    this.closeHeroDrawer();
    this.divineForgeModal.resetSelection();
    if (this.modal.isOpen() && this.modalStack.length > 0) {
      this.pushModal({ type: 'divine-forge' });
      return;
    }
    this.modalStack.length = 0;
    this.pushModal({ type: 'divine-forge' });
  }

  private openHeroDetailModal(heroId: string, tab: HeroDetailTab = 'sheet'): void {
    this.openHeroDrawer(heroId, tab);
  }

  private openEquipPickerFromSlot(heroId: string, slot: string): void {
    const slotKey = slot as GearSlotKey;

    if (this.heroDrawer.isOpen() && !this.modal.isOpen()) {
      this.inlineEquip.toggleSlot(heroId, slotKey);
      this.refreshHeroDrawerIfOpen();
      return;
    }

    const topView = this.modalStack[this.modalStack.length - 1];
    if (topView?.type === 'hero-detail') {
      this.inlineEquip.toggleSlot(heroId, slotKey);
      this.renderModalTop();
      return;
    }

    if (topView?.type === 'inventory') {
      this.inlineEquip.toggleSlot(heroId, slotKey);
      this.renderModalTop();
      return;
    }

    const view: ModalView = {
      type: 'equip-picker',
      mode: { type: 'slot', heroId, slot: slotKey },
    };

    if (this.modal.isOpen() && this.modalStack.length > 0) {
      this.pushModal(view);
      return;
    }

    if (this.heroDrawer.isOpen()) {
      this.inlineEquip.toggleSlot(heroId, slotKey);
      this.refreshHeroDrawerIfOpen();
      return;
    }

    this.modalStack.length = 0;
    this.pushModal(view);
  }

  private openEquipPickerFromGear(gearId: string): void {
    if (this.heroDrawer.isOpen() && !this.modal.isOpen()) {
      this.inlineEquip.openGear(gearId);
      this.refreshHeroDrawerIfOpen();
      return;
    }

    const topView = this.modalStack[this.modalStack.length - 1];
    if (topView?.type === 'inventory') {
      this.inlineEquip.openGear(gearId);
      this.renderModalTop();
      return;
    }

    this.pushModal({
      type: 'equip-picker',
      mode: { type: 'gear', gearId },
    });
  }

  private pushModal(view: ModalView): void {
    this.modalStack.push(view);
    this.renderModalTop();
  }

  private renderModalTop(): void {
    if (!this.state || this.modalStack.length === 0) return;
    this.modalStackController.renderTop(this.modalStack, this.state, {
      inlineActiveSlot: this.inlineEquip.getActiveSlot(),
      canEditGear: this.canEditGear(),
    });
    this.syncInlineEquipHosts();
  }

  private maybeShowIdleSummary(state: GameStateDto): void {
    if (this.idleSummaryShown) return;

    const snapshot = loadPanelSnapshot();
    if (!snapshot) return;

    const summary = buildIdleSummary(snapshot, state);
    if (!summary) return;

    this.rewards.showIdleReport(snapshot, state);
    this.idleSummaryShown = true;
    touchPanelSnapshot(state);
  }

  private syncLoadoutPauseBanner(state: GameStateDto): void {
    if (!this.isManualLoadoutPause(state)) {
      this.hideBattlePauseOverlay();
      return;
    }

    this.battlePauseOverlay.classList.remove('hidden');
    this.stopAutoBattle();
  }

  private hideBattlePauseOverlay(): void {
    this.battlePauseOverlay.classList.add('hidden');
  }

  private render(
    state: GameStateDto,
    options: {
      skipChestToast?: boolean;
      checkIdleSummary?: boolean;
      previousState?: GameStateDto | null;
    } = {},
  ): void {
    if (this.contextInvalidated || !this.client.isContextValid()) {
      this.handleContextInvalidated();
      return;
    }

    if (options.checkIdleSummary) {
      seedPanelSnapshotIfMissing(state);
      this.maybeShowIdleSummary(state);
    }

    const previous =
      options.previousState !== undefined ? options.previousState : this.state;

    const mergedState =
      !state.meta && previous?.meta ? { ...state, meta: previous.meta } : state;

    this.showCombatIntermissionOverlay(previous, mergedState);

    if (!mergedState.combatIntermission) {
      this.shownIntermissionKey = null;
    }

    if (previous && !options.skipChestToast) {
      this.rewards.detectStateChange(
        previous,
        mergedState,
        {
          onChestAvailable: () => {
            if (this.isAdvanceBlocked()) return;
            void this.chestLootFlow.openNextChest();
          },
        },
        { skipVictoryRewards: Boolean(mergedState.combatIntermission) },
      );
    }

    this.state = mergedState;

    this.syncLoadoutPauseBanner(mergedState);

    this.hud.render(mergedState, {
      openingChests: this.chestLootFlow.openingChests,
      loadoutPauseActive: this.isManualLoadoutPause(mergedState),
    });

    this.battleStrip.render(mergedState);
    this.skillCooldownAnimator.setCombatActive(
      Boolean(mergedState.phaseRun && !mergedState.canEditParty),
    );

    this.shopFlow.state.shopRefreshUnlocked = mergedState.featureFlags.shopRefresh;
    this.shopFlow.state.shopRefreshRemaining = Math.max(
      0,
      mergedState.shopRefreshLimit - mergedState.shopRefreshUses,
    );

    const logMessages = filterBattleLogMessages(
      mergedState.battleLog.map((entry) => entry.message),
      this.prefsController.logFilterImportant,
    );

    this.battleLogRenderer.render(this.battleLog, logMessages);

    this.enforceUpgradeGates();
    if (!this.onboarding.isActive()) {
      this.chestLootFlow.scheduleAutoOpenChests();
    }
    if (
      this.modal.isOpen() &&
      this.modalStack[this.modalStack.length - 1]?.type === 'shop'
    ) {
      void this.shopFlow.ensureFreshOffers(mergedState);
    }
    if (
      this.modal.isOpen() &&
      this.modalStack[this.modalStack.length - 1]?.type === 'formation'
    ) {
      this.renderModalTop();
    }
    if (
      this.modal.isOpen() &&
      (this.modalStack[this.modalStack.length - 1]?.type === 'heroes' ||
        this.modalStack[this.modalStack.length - 1]?.type === 'hero-detail') &&
      shouldRenderHeroPanel(previous, mergedState)
    ) {
      this.renderModalTop();
    }
    this.syncOnboarding(mergedState);
  }

  private dismissOnboardingStep(stepId: OnboardingStepId): void {
    this.onboarding.dismissStep(stepId);
  }

  private syncOnboarding(state: GameStateDto): void {
    const step = resolveOnboardingStep(state, this.onboarding.getDismissedSteps());
    if (!step) {
      this.onboarding.hide();
      this.syncAutoBattleTimer();
      return;
    }

    this.onboarding.show(step, {
      onDismissStep: (stepId) => {
        this.dismissOnboardingStep(stepId);
        if (this.state) {
          this.syncOnboarding(this.state);
        }
        this.syncAutoBattleTimer();
      },
      onSkipAll: () => {
        this.onboarding.skipAll();
        this.onboarding.hide();
        this.syncAutoBattleTimer();
      },
    });

    if (this.onboarding.isActive()) {
      this.stopAutoBattle();
    }
  }
}
