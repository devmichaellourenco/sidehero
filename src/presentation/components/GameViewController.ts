import { CombatFloatingEventDto } from '../../application/dto/CombatFloatingEventDto';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { IGameClient } from '../../application/ports/IGameClient';
import { getDefaultGameClient } from '../../infrastructure/messaging/defaultGameClient';
import { AutoBattleController } from '../controllers/AutoBattleController';
import { GearMutationQueue } from '../controllers/GearMutationQueue';
import { GameHudController } from '../controllers/GameHudController';
import { GamePreferencesController } from '../controllers/GamePreferencesController';
import { LootFlowController } from '../controllers/LootFlowController';
import { BattleVictoryFlow } from '../flows/BattleVictoryFlow';
import { CampaignFlow } from '../flows/CampaignFlow';
import { ChestLootFlow } from '../flows/ChestLootFlow';
import { GearEquipFlow } from '../flows/GearEquipFlow';
import { HeroDetailFlow } from '../flows/HeroDetailFlow';
import { PartyFlow } from '../flows/PartyFlow';
import { ModalStackController } from '../flows/ModalStackController';
import { ModalView } from '../flows/ModalTypes';
import { ShopFlow } from '../flows/ShopFlow';
import { getFeatureFlags } from '../helpers/FeatureFlagsHelper';
import { filterBattleLogMessages } from './BattleLogFilter';
import { BattleFloatingTextController } from './BattleFloatingTextController';
import { bindCampaignTooltip } from './CampaignTooltipBinder';
import { detectBattleVictory } from './BattleVictoryDetector';
import { BattleVictoryOverlayRenderer } from './BattleVictoryOverlayRenderer';
import { BattleStripRenderer } from './BattleStripRenderer';
import { EquipPickerModalRenderer } from './EquipPickerModalRenderer';
import { GameStateChangeDetector } from './GameStateChangeDetector';
import { GearSlotKey } from './GearPresentation';
import { HeroDetailModalRenderer, HeroDetailTab } from './HeroDetailModalRenderer';
import { HeroPanelRenderer } from './HeroPanelRenderer';
import { shouldRenderHeroPanel } from './HeroPanelRenderPolicy';
import { InventoryModalRenderer } from './InventoryModalRenderer';
import { LootBatchModalRenderer } from './LootBatchModalRenderer';
import { LootModalRenderer } from './LootModalRenderer';
import { ModalController } from './ModalController';
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
import { ToastController } from './ToastController';

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

  private readonly campaignContextLabel: HTMLElement;
  private readonly goldLabel: HTMLElement;
  private readonly chestLabel: HTMLElement;
  private readonly chestProgressLabel: HTMLElement;
  private readonly battleLog: HTMLElement;
  private readonly tickBtn: HTMLButtonElement;
  private readonly pauseLoadoutBtn: HTMLButtonElement;
  private readonly openChestBtn: HTMLButtonElement;
  private readonly openAllChestsBtn: HTMLButtonElement;
  private readonly openInventoryBtn: HTMLButtonElement;
  private readonly optimizeLoadoutBtn: HTMLButtonElement;
  private readonly openSettingsBtn: HTMLButtonElement;
  private readonly openCampaignBtn: HTMLButtonElement;
  private readonly openShopBtn: HTMLButtonElement;
  private readonly openUpgradesBtn: HTMLButtonElement;
  private readonly seasonCompleteBanner: HTMLElement;
  private readonly phaseIntermissionBanner: HTMLElement;
  private readonly phaseIntermissionTitle: HTMLElement;
  private readonly phaseIntermissionDescription: HTMLElement;
  private readonly phaseIntermissionContinueBtn: HTMLButtonElement;
  private readonly newGameBtn: HTMLButtonElement;

  private readonly battleStripEl: HTMLElement;
  private readonly battleStrip: BattleStripRenderer;
  private readonly battleFloats: BattleFloatingTextController;
  private readonly victoryFlow: BattleVictoryFlow;
  private readonly heroPanelsEl: HTMLElement;
  private readonly heroPanel: HeroPanelRenderer;
  private readonly modal: ModalController;
  private readonly inventoryModal: InventoryModalRenderer;
  private readonly heroDetailModal: HeroDetailModalRenderer;
  private readonly equipPickerModal: EquipPickerModalRenderer;
  private readonly lootModal: LootModalRenderer;
  private readonly lootBatchModal: LootBatchModalRenderer;
  private readonly settingsModal: SettingsModalRenderer;
  private readonly shopModal: ShopModalRenderer;
  private readonly upgradeTreeModal: UpgradeTreeModalRenderer;
  private readonly toasts: ToastController;
  private readonly stateChanges: GameStateChangeDetector;
  private readonly hud: GameHudController;

  private readonly heroDetailFlow: HeroDetailFlow;
  private readonly shopFlow: ShopFlow;
  private readonly gearEquipFlow: GearEquipFlow;
  private readonly chestLootFlow: ChestLootFlow;
  private readonly campaignFlow: CampaignFlow;
  private readonly partyFlow: PartyFlow;
  private readonly modalStackController: ModalStackController;

  constructor(root: HTMLElement, client: IGameClient = getDefaultGameClient()) {
    this.client = client;

    this.campaignContextLabel = root.querySelector('#campaign-context-label')!;
    this.goldLabel = root.querySelector('#gold-label')!;
    this.chestLabel = root.querySelector('#chest-label')!;
    this.chestProgressLabel = root.querySelector('#chest-progress-label')!;
    this.battleLog = root.querySelector('#battle-log')!;
    this.tickBtn = root.querySelector('#tick-btn') as HTMLButtonElement;
    this.pauseLoadoutBtn = root.querySelector('#pause-loadout-btn') as HTMLButtonElement;
    this.openChestBtn = root.querySelector('#open-chest-btn') as HTMLButtonElement;
    this.openAllChestsBtn = root.querySelector('#open-all-chests-btn') as HTMLButtonElement;
    this.openInventoryBtn = root.querySelector('#open-inventory-btn') as HTMLButtonElement;
    this.optimizeLoadoutBtn = root.querySelector('#optimize-loadout-btn') as HTMLButtonElement;
    this.openSettingsBtn = root.querySelector('#open-settings-btn') as HTMLButtonElement;
    this.openCampaignBtn = root.querySelector('#open-campaign-btn') as HTMLButtonElement;
    this.openShopBtn = root.querySelector('#open-shop-btn') as HTMLButtonElement;
    this.openUpgradesBtn = root.querySelector('#open-upgrades-btn') as HTMLButtonElement;
    this.seasonCompleteBanner = root.querySelector('#season-complete-banner') as HTMLElement;
    this.phaseIntermissionBanner = root.querySelector('#phase-intermission-banner') as HTMLElement;
    this.phaseIntermissionTitle = root.querySelector('#phase-intermission-title') as HTMLElement;
    this.phaseIntermissionDescription = root.querySelector(
      '#phase-intermission-description',
    ) as HTMLElement;
    this.phaseIntermissionContinueBtn = root.querySelector(
      '#phase-intermission-continue',
    ) as HTMLButtonElement;
    this.newGameBtn = root.querySelector('#new-game-btn') as HTMLButtonElement;

    this.battleStripEl = root.querySelector('.battle-strip') as HTMLElement;

    this.battleStrip = new BattleStripRenderer(
      root.querySelector('#heroes-container')!,
      root.querySelector('#enemy-container')!,
    );
    this.battleFloats = new BattleFloatingTextController(
      root.querySelector('#battle-float-layer')!,
      this.battleStripEl,
    );
    this.victoryFlow = new BattleVictoryFlow(
      root.querySelector('#battle-victory-overlay')!,
      this.battleStripEl,
      new BattleVictoryOverlayRenderer(),
    );

    this.heroPanelsEl = root.querySelector('#hero-panels')!;
    this.heroPanel = new HeroPanelRenderer(this.heroPanelsEl);

    this.modal = new ModalController(
      root.querySelector('#modal-root')!,
      root.querySelector('#modal-title')!,
      root.querySelector('#modal-body')!,
    );

    this.inventoryModal = new InventoryModalRenderer();
    this.heroDetailModal = new HeroDetailModalRenderer();
    this.equipPickerModal = new EquipPickerModalRenderer();
    this.lootModal = new LootModalRenderer();
    this.lootBatchModal = new LootBatchModalRenderer();
    this.settingsModal = new SettingsModalRenderer();
    this.shopModal = new ShopModalRenderer();
    this.upgradeTreeModal = new UpgradeTreeModalRenderer();
    this.toasts = new ToastController(root.querySelector('#toast-root')!);
    this.stateChanges = new GameStateChangeDetector(this.toasts);
    bindCampaignTooltip(this.campaignContextLabel);

    this.hud = new GameHudController(
      this.campaignContextLabel,
      this.goldLabel,
      this.chestLabel,
      this.chestProgressLabel,
      this.openInventoryBtn,
      this.optimizeLoadoutBtn,
      this.openAllChestsBtn,
      this.openUpgradesBtn,
      this.openChestBtn,
      this.tickBtn,
      this.pauseLoadoutBtn,
    );

    this.heroDetailFlow = new HeroDetailFlow(
      this.client,
      this.heroDetailModal,
      this.toasts,
      (state) => this.afterHeroProgressionMutation(state),
      () => this.refreshModalIfOpen(),
    );

    this.shopFlow = new ShopFlow(
      this.client,
      this.toasts,
      (state) => this.render(state),
      () => this.refreshModalIfOpen(),
      () => this.enforceUpgradeGates(),
    );

    this.gearEquipFlow = new GearEquipFlow(
      this.client,
      this.gearMutations,
      this.toasts,
      () => this.state,
      (state) => this.afterGearMutation(state),
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
      (gearIds, gearNames) => this.handleLootReceived(gearIds, gearNames),
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
      this.heroDetailFlow,
      this.equipPickerModal,
      this.lootModal,
      this.lootBatchModal,
      this.settingsModal,
      this.shopModal,
      this.upgradeTreeModal,
      this.shopFlow,
      this.gearEquipFlow,
      this.chestLootFlow,
      this.lootFlow,
      () => this.prefsController.preferences,
      (key, value) => this.handlePreferenceChange(key, value),
      () => {
        void this.openUpgradesModal();
      },
      (heroId, slot) => this.openEquipPickerFromSlot(heroId, slot),
      (gearId) => this.openEquipPickerFromGear(gearId),
      (gearIds) => {
        void this.equipRecommendedLoot(gearIds);
      },
    );

    this.prefsController.apply(this.state);
    this.bindHeroPanelDelegation();
    this.bindModalActionDelegation();

    this.tickBtn.addEventListener('click', () => this.tick());
    this.pauseLoadoutBtn.addEventListener('click', () => {
      this.stopAutoBattle();
      void this.pauseForLoadout();
    });
    this.openChestBtn.addEventListener('click', () => {
      void this.chestLootFlow.openNextChest();
    });
    this.openAllChestsBtn.addEventListener('click', () => {
      void this.chestLootFlow.openAllChests();
    });
    this.openInventoryBtn.addEventListener('click', () => this.openInventoryModal());
    this.optimizeLoadoutBtn.addEventListener('click', () => {
      void this.gearEquipFlow.optimizeLoadout();
    });
    this.openSettingsBtn.addEventListener('click', () => this.openSettingsModal());
    this.openCampaignBtn.addEventListener('click', () => {
      void this.openCampaignModal();
    });
    this.openShopBtn.addEventListener('click', () => {
      void this.openShopModal();
    });
    this.openUpgradesBtn.addEventListener('click', () => {
      void this.openUpgradesModal();
    });
    this.newGameBtn.addEventListener('click', () => {
      void this.startNewGame();
    });
    this.phaseIntermissionContinueBtn.addEventListener('click', () => {
      void this.continueFromLoadoutPause();
    });

    document.addEventListener('keydown', (event) => {
      if (event.code !== 'Space' || event.repeat) return;
      if (this.shouldIgnoreKeyboardShortcut()) return;
      event.preventDefault();
      void this.tick();
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
    if (this.pausingLoadout) return true;
    return this.isManualLoadoutPause(state);
  }

  private shouldIgnoreKeyboardShortcut(): boolean {
    if (
      this.contextInvalidated ||
      this.prefsController.autoBattleEnabled ||
      this.chestLootFlow.openingChests ||
      this.isAdvanceBlocked()
    ) {
      return true;
    }
    if (this.modal.isOpen()) return true;

    const target = document.activeElement;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    ) {
      return true;
    }

    return false;
  }

  private openSettingsModal(): void {
    if (this.contextInvalidated) return;
    this.modalStack.length = 0;
    this.pushModal({ type: 'settings' });
  }

  private async startNewGame(): Promise<void> {
    if (this.contextInvalidated) return;

    const confirmed = window.confirm(
      'Iniciar um novo jogo? Todo o progresso atual será apagado.',
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

    const modalBody = this.modal.open('Campanha');
    await this.campaignFlow.open((state) => this.render(state), modalBody);
  }

  private async openShopModal(): Promise<void> {
    if (this.contextInvalidated) return;

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

    const response = await this.client.send({ type: 'GET_UPGRADE_TREE' });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }
    this.shopFlow.state.upgradeNodes = response.upgradeNodes ?? [];
    const state = response.state;

    this.state = state;
    this.modalStack.length = 0;
    this.pushModal({ type: 'upgrades' });
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
      this.toasts.show('Pausa ativa — ajuste sua equipe', 'info');
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
    this.showCombatFloats(response.combatFloats);
    this.syncAutoBattleTimer();
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

    this.render(response.state);
    this.showCombatFloats(response.combatFloats);
  }

  private showCombatFloats(combatFloats?: CombatFloatingEventDto[]): void {
    if (!combatFloats?.length) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.battleFloats.show(combatFloats);
      });
    });
  }

  private async handleLootReceived(gearIds: string[], gearNames: string[] = []): Promise<void> {
    if (gearIds.length === 1 && gearNames[0]) {
      this.stateChanges.showLootReceived(gearNames[0]);
    } else if (gearIds.length > 1) {
      this.toasts.show(`${gearIds.length} itens recebidos dos baús`, 'loot');
    }

    const flags = getFeatureFlags(this.state);
    if (this.prefsController.autoEquipLoot && flags.autoEquipLoot) {
      await this.gearEquipFlow.optimizeLoadout(gearIds, {
        fromLoot: true,
        silent: flags.autoEquipSilent,
      });
      return;
    }

    this.lootFlow.reset();
    this.modalStack.length = 0;
    this.chestLootFlow.enqueueLootModals(gearIds);
  }

  private async equipRecommendedLoot(gearIds: string[]): Promise<void> {
    await this.gearEquipFlow.optimizeLoadout(gearIds);
    this.chestLootFlow.closeLootBatchModal();
  }

  private afterGearMutation(state: GameStateDto): void {
    const topView = this.modalStack[this.modalStack.length - 1];
    if (
      topView?.type === 'equip-picker' ||
      topView?.type === 'loot-reveal' ||
      topView?.type === 'loot-batch'
    ) {
      this.modalStack.pop();
    }

    const lootRevealPending =
      topView?.type === 'loot-reveal' && this.lootFlow.hasQueued();
    const shouldCloseModal = this.modalStack.length === 0;
    const previousState = this.state;

    this.render(state, { previousState });
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
    this.refreshModalIfOpen();
  }

  private afterHeroProgressionMutation(state: GameStateDto): void {
    this.render(state);
    this.refreshModalIfOpen();
  }

  private bindHeroPanelDelegation(): void {
    this.heroPanelsEl.addEventListener('click', (event) => {
      const partyTarget = (event.target as HTMLElement).closest(
        '[data-party-add], [data-party-remove], [data-party-move-up], [data-party-move-down]',
      ) as HTMLElement | null;

      if (partyTarget) {
        event.preventDefault();
        event.stopPropagation();
        if (partyTarget instanceof HTMLButtonElement && partyTarget.disabled) return;
        void this.handlePartyPanelAction(partyTarget);
        return;
      }

      const target = (event.target as HTMLElement).closest(
        '.equipment-slot-clickable, [data-hero-skills-open], [data-open-upgrades], [data-hero-open]',
      ) as HTMLElement | null;

      if (!target) return;

      if (target.hasAttribute('data-open-upgrades')) {
        event.preventDefault();
        event.stopPropagation();
        void this.openUpgradesModal();
        return;
      }

      const skillsHeroId = target.getAttribute('data-hero-skills-open');
      if (skillsHeroId) {
        event.preventDefault();
        event.stopPropagation();
        this.openHeroDetailModal(skillsHeroId, 'skills');
        return;
      }

      if (target.classList.contains('equipment-slot-clickable')) {
        event.preventDefault();
        event.stopPropagation();
        const heroId = target.getAttribute('data-hero');
        const slot = target.getAttribute('data-slot');
        if (heroId && slot) {
          this.openEquipPickerFromSlot(heroId, slot);
        }
        return;
      }

      const heroId = target.getAttribute('data-hero-open');
      if (heroId) {
        this.openHeroDetailModal(heroId);
      }
    });
  }

  private async handlePartyPanelAction(target: HTMLElement): Promise<void> {
    if (!this.state?.canEditParty) {
      this.toasts.show('Pause o jogo para ajustar party e loadout', 'info');
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

      const moveUpId = target.getAttribute('data-party-move-up');
      if (moveUpId && this.state) {
        const fromIndex = this.state.activePartyIds.indexOf(moveUpId);
        if (fromIndex > 0) {
          const next = await this.partyFlow.movePartyMember(fromIndex, fromIndex - 1);
          if (next) this.render(next);
        }
        return;
      }

      const moveDownId = target.getAttribute('data-party-move-down');
      if (moveDownId && this.state) {
        const fromIndex = this.state.activePartyIds.indexOf(moveDownId);
        if (fromIndex >= 0 && fromIndex < this.state.activePartyIds.length - 1) {
          const next = await this.partyFlow.movePartyMember(fromIndex, fromIndex + 1);
          if (next) this.render(next);
        }
      }
    } catch (error) {
      this.handleFailedResponse(error instanceof Error ? error.message : 'Erro ao editar party');
    }
  }

  private bindModalActionDelegation(): void {
    this.modal.getBody().addEventListener('click', (event) => {
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

      if (!target || !this.modal.isOpen()) return;
      if (target instanceof HTMLButtonElement && target.disabled) return;

      const equipSlot = target.classList.contains('equipment-slot-clickable') ? target : null;
      if (equipSlot) {
        event.preventDefault();
        const heroId = equipSlot.getAttribute('data-hero');
        const slot = equipSlot.getAttribute('data-slot');
        if (heroId && slot) {
          this.openEquipPickerFromSlot(heroId, slot);
        }
        return;
      }

      if (target.hasAttribute('data-optimize-loadout')) {
        event.preventDefault();
        this.markGearActionPending(target);
        void this.gearEquipFlow.optimizeLoadout();
        return;
      }

      if (target.hasAttribute('data-loot-keep')) {
        event.preventDefault();
        this.chestLootFlow.closeLootModal();
        return;
      }

      if (target.hasAttribute('data-loot-batch-keep')) {
        event.preventDefault();
        this.chestLootFlow.closeLootBatchModal();
        return;
      }

      if (target.hasAttribute('data-loot-batch-equip')) {
        event.preventDefault();
        const topView = this.modalStack[this.modalStack.length - 1];
        if (topView?.type === 'loot-batch') {
          this.markGearActionPending(target);
          void this.equipRecommendedLoot(topView.gearIds);
        }
        return;
      }

      const equipFromInventory = target.getAttribute('data-equip-gear');
      if (equipFromInventory) {
        event.preventDefault();
        this.openEquipPickerFromGear(equipFromInventory);
        return;
      }

      const unequipHeroId = target.getAttribute('data-unequip-hero');
      const unequipSlot = target.getAttribute('data-unequip-slot') as GearSlotKey | null;
      if (unequipHeroId && unequipSlot) {
        event.preventDefault();
        this.markGearActionPending(target);
        void this.gearEquipFlow.unequip(unequipHeroId, unequipSlot);
        return;
      }

      const lootHeroId = target.getAttribute('data-loot-equip-hero');
      const lootGearId = target.getAttribute('data-loot-equip-gear');
      if (lootHeroId && lootGearId) {
        event.preventDefault();
        this.markGearActionPending(target);
        void this.gearEquipFlow.equip(lootHeroId, lootGearId);
        return;
      }

      const heroId = target.getAttribute('data-pick-hero');
      const gearId = target.getAttribute('data-pick-gear');
      if (heroId && gearId) {
        event.preventDefault();
        this.markGearActionPending(target);
        void this.gearEquipFlow.equip(heroId, gearId);
      }
    });
  }

  private markGearActionPending(target: HTMLElement): void {
    const button = target.closest('button') as HTMLButtonElement | null;
    if (!button || button.disabled) return;
    button.disabled = true;
    button.classList.add('gear-action-pending');
  }

  private refreshModalIfOpen(): void {
    if (this.modal.isOpen() && this.modalStack.length > 0) {
      this.renderModalTop();
    }
  }

  private openInventoryModal(): void {
    if (this.contextInvalidated) return;
    this.modalStack.length = 0;
    this.pushModal({ type: 'inventory' });
  }

  private openHeroDetailModal(heroId: string, tab: HeroDetailTab = 'sheet'): void {
    this.modalStack.length = 0;

    void this.heroDetailFlow.prepareOpen(heroId, tab).then(() => {
      this.pushModal({ type: 'hero-detail', heroId });
    });
  }

  private openEquipPickerFromSlot(heroId: string, slot: string): void {
    const view: ModalView = {
      type: 'equip-picker',
      mode: { type: 'slot', heroId, slot: slot as GearSlotKey },
    };

    if (this.modal.isOpen() && this.modalStack.length > 0) {
      this.pushModal(view);
      return;
    }

    this.modalStack.length = 0;
    this.pushModal(view);
  }

  private openEquipPickerFromGear(gearId: string): void {
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
    this.modalStackController.renderTop(this.modalStack, this.state);
  }

  private maybeShowIdleSummary(state: GameStateDto): void {
    if (this.idleSummaryShown) return;

    const snapshot = loadPanelSnapshot();
    if (!snapshot) return;

    const summary = buildIdleSummary(snapshot, state);
    if (!summary) return;

    this.stateChanges.showIdleSummary(summary);
    this.idleSummaryShown = true;
    touchPanelSnapshot(state);
  }

  private syncLoadoutPauseBanner(state: GameStateDto): void {
    if (!this.isManualLoadoutPause(state)) {
      this.hidePhaseIntermissionBanner();
      return;
    }

    this.phaseIntermissionTitle.textContent = 'Pausa para ajustes';
    this.phaseIntermissionDescription.textContent =
      'Ajuste party, equipamentos e skills. A fase atual reiniciará do início ao continuar.';

    this.phaseIntermissionBanner.classList.remove('hidden');
    this.stopAutoBattle();
  }

  private hidePhaseIntermissionBanner(): void {
    this.phaseIntermissionBanner.classList.add('hidden');
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
    const victoryPayload = previous ? detectBattleVictory(previous, state) : null;

    if (victoryPayload) {
      this.victoryFlow.show(victoryPayload, () => {
        void this.chestLootFlow.openNextChest();
      });
    }

    if (previous && !options.skipChestToast) {
      this.stateChanges.detect(
        previous,
        state,
        {
          onChestAvailable: () => {
            if (this.isAdvanceBlocked()) return;
            void this.chestLootFlow.openNextChest();
          },
        },
        { skipVictoryOverlayRewards: Boolean(victoryPayload) },
      );
    }

    this.state = state;

    this.seasonCompleteBanner.classList.toggle('hidden', !state.seasonCompleted);
    this.syncLoadoutPauseBanner(state);

    this.hud.render(state, {
      openingChests: this.chestLootFlow.openingChests,
      autoBattleEnabled: this.prefsController.autoBattleEnabled,
      loadoutPauseActive: this.isManualLoadoutPause(state),
    });

    this.battleStrip.render(state);
    if (shouldRenderHeroPanel(previous, state)) {
      this.heroPanel.render(state);
    } else if (!state.canEditParty) {
      this.heroPanel.patchCombatCooldowns(state);
    }

    this.shopFlow.state.shopRefreshUnlocked = state.featureFlags.shopRefresh;
    this.shopFlow.state.shopRefreshRemaining = Math.max(
      0,
      state.shopRefreshLimit - state.shopRefreshUses,
    );

    const logMessages = filterBattleLogMessages(
      state.battleLog.map((entry) => entry.message),
      this.prefsController.logFilterImportant,
    );

    this.battleLog.innerHTML = [...logMessages]
      .reverse()
      .map((message) => `<li>${message}</li>`)
      .join('');

    this.enforceUpgradeGates();
    this.chestLootFlow.scheduleAutoOpenChests();
  }
}
