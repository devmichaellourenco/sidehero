import { AscensionOptionDto } from '../../application/dto/AscensionOptionDto';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { SkillNodeDto } from '../../application/dto/SkillNodeDto';
import { HeroDetailTab } from './HeroDetailModalRenderer';
import { AutoBattleController } from '../controllers/AutoBattleController';
import { GameHudController } from '../controllers/GameHudController';
import { GamePreferencesController } from '../controllers/GamePreferencesController';
import { LootFlowController } from '../controllers/LootFlowController';
import { getFeatureFlags } from '../helpers/FeatureFlagsHelper';
import { isExtensionContextValid } from '../../infrastructure/messaging/ExtensionContext';
import { sendGameMessage } from '../../infrastructure/messaging/GameMessageBus';
import { filterBattleLogMessages } from './BattleLogFilter';
import { CombatFloatingEventDto } from '../../application/dto/CombatFloatingEventDto';
import { BattleFloatingTextController } from './BattleFloatingTextController';
import { BattleStripRenderer } from './BattleStripRenderer';
import { EquipPickerModalRenderer, EquipPickerMode } from './EquipPickerModalRenderer';
import { GameStateChangeDetector } from './GameStateChangeDetector';
import { GearSlotKey } from './GearPresentation';
import { LootBatchModalRenderer } from './LootBatchModalRenderer';
import { HeroDetailModalRenderer } from './HeroDetailModalRenderer';
import { HeroPanelRenderer } from './HeroPanelRenderer';
import { InventoryModalRenderer } from './InventoryModalRenderer';
import { LootModalRenderer } from './LootModalRenderer';
import { ShopModalRenderer } from './ShopModalRenderer';
import { ShopOfferDto } from '../../application/dto/ShopOfferDto';
import { ModalController } from './ModalController';
import {
  buildIdleSummary,
  loadPanelSnapshot,
  seedPanelSnapshotIfMissing,
  touchPanelSnapshot,
} from './PanelStateSnapshot';
import { GamePreferences } from './GamePreferences';
import { SettingsModalRenderer } from './SettingsModalRenderer';
import { UpgradeTreeModalRenderer } from './UpgradeTreeModalRenderer';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import { ToastController } from './ToastController';

type ModalView =
  | { type: 'inventory' }
  | { type: 'hero-detail'; heroId: string }
  | { type: 'equip-picker'; mode: EquipPickerMode }
  | { type: 'loot-reveal'; gearId: string }
  | { type: 'loot-batch'; gearIds: string[] }
  | { type: 'settings' }
  | { type: 'shop' }
  | { type: 'upgrades' };

export class GameViewController {
  private state: GameStateDto | null = null;
  private readonly modalStack: ModalView[] = [];
  private readonly lootFlow = new LootFlowController();
  private readonly prefsController = new GamePreferencesController();
  private readonly autoBattleController = new AutoBattleController();
  private refreshTimer: number | null = null;
  private heroSkillNodes: SkillNodeDto[] = [];
  private heroAscensionOptions: AscensionOptionDto[] = [];
  private heroAscensionName: string | null = null;
  private heroAscensionSkillNodes: SkillNodeDto[] = [];
  private contextInvalidated = false;
  private idleSummaryShown = false;
  private openingChests = false;
  private autoOpenChestPending = false;

  private readonly stageLabel: HTMLElement;
  private readonly goldLabel: HTMLElement;
  private readonly chestLabel: HTMLElement;
  private readonly chestProgressLabel: HTMLElement;
  private readonly battleLog: HTMLElement;
  private readonly tickBtn: HTMLButtonElement;
  private readonly openChestBtn: HTMLButtonElement;
  private readonly openAllChestsBtn: HTMLButtonElement;
  private readonly openInventoryBtn: HTMLButtonElement;
  private readonly optimizeLoadoutBtn: HTMLButtonElement;
  private readonly openSettingsBtn: HTMLButtonElement;
  private readonly openShopBtn: HTMLButtonElement;
  private readonly openUpgradesBtn: HTMLButtonElement;
  private shopOffers: ShopOfferDto[] = [];
  private shopRefreshCost = 0;
  private canAffordShopRefresh = false;
  private shopRefreshUnlocked = false;
  private shopRefreshRemaining = 0;
  private upgradeNodes: UpgradeNodeDto[] = [];

  private readonly battleStrip: BattleStripRenderer;
  private readonly battleFloats: BattleFloatingTextController;
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

  constructor(root: HTMLElement) {
    this.stageLabel = root.querySelector('#stage-label')!;
    this.goldLabel = root.querySelector('#gold-label')!;
    this.chestLabel = root.querySelector('#chest-label')!;
    this.chestProgressLabel = root.querySelector('#chest-progress-label')!;
    this.battleLog = root.querySelector('#battle-log')!;
    this.tickBtn = root.querySelector('#tick-btn') as HTMLButtonElement;
    this.openChestBtn = root.querySelector('#open-chest-btn') as HTMLButtonElement;
    this.openAllChestsBtn = root.querySelector('#open-all-chests-btn') as HTMLButtonElement;
    this.openInventoryBtn = root.querySelector('#open-inventory-btn') as HTMLButtonElement;
    this.optimizeLoadoutBtn = root.querySelector('#optimize-loadout-btn') as HTMLButtonElement;
    this.openSettingsBtn = root.querySelector('#open-settings-btn') as HTMLButtonElement;
    this.openShopBtn = root.querySelector('#open-shop-btn') as HTMLButtonElement;
    this.openUpgradesBtn = root.querySelector('#open-upgrades-btn') as HTMLButtonElement;

    const battleStripEl = root.querySelector('.battle-strip') as HTMLElement;

    this.battleStrip = new BattleStripRenderer(
      root.querySelector('#heroes-container')!,
      root.querySelector('#enemy-container')!,
    );
    this.battleFloats = new BattleFloatingTextController(
      root.querySelector('#battle-float-layer')!,
      battleStripEl,
    );

    this.heroPanel = new HeroPanelRenderer(root.querySelector('#hero-panels')!);

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
    this.hud = new GameHudController(
      this.stageLabel,
      this.goldLabel,
      this.chestLabel,
      this.chestProgressLabel,
      this.openInventoryBtn,
      this.optimizeLoadoutBtn,
      this.openAllChestsBtn,
      this.openUpgradesBtn,
      this.openChestBtn,
      this.tickBtn,
    );

    this.prefsController.apply(this.state);
    this.bindModalActionDelegation();

    this.tickBtn.addEventListener('click', () => this.tick());
    this.openChestBtn.addEventListener('click', () => this.openNextChest());
    this.openAllChestsBtn.addEventListener('click', () => this.openAllChests());
    this.openInventoryBtn.addEventListener('click', () => this.openInventoryModal());
    this.optimizeLoadoutBtn.addEventListener('click', () => this.optimizeLoadout());
    this.openSettingsBtn.addEventListener('click', () => this.openSettingsModal());
    this.openShopBtn.addEventListener('click', () => {
      void this.openShopModal();
    });
    this.openUpgradesBtn.addEventListener('click', () => {
      void this.openUpgradesModal();
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
      this.scheduleAutoOpenChests();
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

  private shouldIgnoreKeyboardShortcut(): boolean {
    if (this.contextInvalidated || this.prefsController.autoBattleEnabled || this.openingChests) {
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

  private async openShopModal(): Promise<void> {
    if (this.contextInvalidated) return;

    const response = await sendGameMessage({ type: 'GET_SHOP_OFFERS' });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }

    this.applyShopPayload(response);
    this.state = response.state;
    this.modalStack.length = 0;
    this.pushModal({ type: 'shop' });
  }

  private async openUpgradesModal(): Promise<void> {
    if (this.contextInvalidated) return;

    const response = await sendGameMessage({ type: 'GET_UPGRADE_TREE' });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }

    this.upgradeNodes = response.upgradeNodes ?? [];
    this.state = response.state;
    this.modalStack.length = 0;
    this.pushModal({ type: 'upgrades' });
  }

  private async purchaseUpgrade(upgradeId: string): Promise<void> {
    const response = await sendGameMessage({ type: 'PURCHASE_UPGRADE', upgradeId });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha na compra', 'info');
      return;
    }

    this.upgradeNodes = response.upgradeNodes ?? [];
    this.render(response.state);
    this.enforceUpgradeGates();
    this.toasts.show('Melhoria desbloqueada!', 'loot');

    if (this.modal.isOpen() && this.modalStack[this.modalStack.length - 1]?.type === 'upgrades') {
      this.renderModalTop();
    }
  }

  private applyShopPayload(response: {
    shopOffers?: ShopOfferDto[];
    shopRefreshCost?: number;
    canAffordShopRefresh?: boolean;
    shopRefreshUnlocked?: boolean;
    shopRefreshRemaining?: number;
  }): void {
    if (response.shopOffers) {
      this.shopOffers = response.shopOffers;
    }
    if (typeof response.shopRefreshCost === 'number') {
      this.shopRefreshCost = response.shopRefreshCost;
    }
    if (typeof response.canAffordShopRefresh === 'boolean') {
      this.canAffordShopRefresh = response.canAffordShopRefresh;
    }
    if (typeof response.shopRefreshUnlocked === 'boolean') {
      this.shopRefreshUnlocked = response.shopRefreshUnlocked;
    }
    if (typeof response.shopRefreshRemaining === 'number') {
      this.shopRefreshRemaining = response.shopRefreshRemaining;
    }
  }

  private async refreshShop(): Promise<void> {
    const response = await sendGameMessage({ type: 'REFRESH_SHOP' });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha ao renovar loja', 'info');
      return;
    }

    this.applyShopPayload(response);
    this.render(response.state);
    this.toasts.show('Loja renovada', 'info');

    if (this.modal.isOpen() && this.modalStack[this.modalStack.length - 1]?.type === 'shop') {
      this.renderModalTop();
    }
  }

  private async buyShopOffer(offerId: string): Promise<void> {
    const response = await sendGameMessage({ type: 'BUY_SHOP_OFFER', offerId });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha na compra', 'info');
      return;
    }

    this.shopOffers = this.shopOffers.map((offer) => ({
      ...offer,
      canAfford: response.state.gold >= offer.price,
    }));
    this.canAffordShopRefresh = response.state.gold >= this.shopRefreshCost;
    this.shopRefreshRemaining = Math.max(
      0,
      response.state.shopRefreshLimit - response.state.shopRefreshUses,
    );

    this.render(response.state);

    if (response.purchasedGear) {
      this.toasts.show(`Comprou ${response.purchasedGear.name}`, 'loot');
    }

    if (this.modal.isOpen() && this.modalStack[this.modalStack.length - 1]?.type === 'shop') {
      this.renderModalTop();
    }
  }

  private syncAutoBattleTimer(): void {
    if (this.prefsController.autoBattleEnabled) {
      this.stopAutoBattle();
      this.startAutoBattle();
      return;
    }
    this.stopAutoBattle();
  }

  private startAutoBattle(): void {
    if (this.contextInvalidated) return;
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

    const response = await sendGameMessage({ type: 'GET_STATE' });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }

    this.render(response.state, { checkIdleSummary: options.checkIdleSummary });
  }

  private handleFailedResponse(error?: string): void {
    if (error?.includes('Extension context invalidated') || !isExtensionContextValid()) {
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

  private async tick(): Promise<void> {
    if (this.openingChests) return;

    const response = await sendGameMessage({ type: 'TICK', ticks: 1 });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }
    this.render(response.state);
    this.showCombatFloats(response.combatFloats);
  }

  private showCombatFloats(combatFloats?: CombatFloatingEventDto[]): void {
    if (!combatFloats?.length) return;
    this.battleFloats.show(combatFloats);
  }

  private async openNextChest(): Promise<void> {
    if (!this.state || this.openingChests) return;
    const pending = this.state.chests.find((c) => !c.opened);
    if (!pending) return;

    this.openingChests = true;

    try {
      const response = await sendGameMessage({ type: 'OPEN_CHEST', chestId: pending.id });
      if (!response.ok) {
        this.handleFailedResponse(response.error);
        return;
      }

      this.render(response.state, { skipChestToast: true });

      if (response.openedGear) {
        void this.handleLootReceived([response.openedGear.id], [response.openedGear.name]);
      }
    } finally {
      this.openingChests = false;
    }
  }

  private async openAllChests(): Promise<void> {
    if (!getFeatureFlags(this.state).openAllChests) return;
    if (!this.state || this.openingChests || this.state.pendingChestCount === 0) return;

    this.openingChests = true;

    try {
      const response = await sendGameMessage({ type: 'OPEN_ALL_CHESTS' });
      if (!response.ok) {
        this.handleFailedResponse(response.error);
        return;
      }

      const openedGears = response.openedGears ?? [];
      this.render(response.state, { skipChestToast: true });

      if (openedGears.length > 0) {
        void this.handleLootReceived(openedGears.map((gear) => gear.id));
      }
    } finally {
      this.openingChests = false;
    }
  }

  private enqueueLootModals(gearIds: string[]): void {
    this.modalStack.length = 0;
    const view = this.lootFlow.enqueue(gearIds);
    if (view) {
      this.pushModal(view);
    }
  }

  private showNextLootModal(): void {
    const gearId = this.lootFlow.queue[0];
    if (!gearId) return;

    this.modalStack.length = 0;
    this.pushModal({ type: 'loot-reveal', gearId });
  }

  private advanceLootQueue(): void {
    this.lootFlow.shift();

    if (this.lootFlow.hasQueued()) {
      this.showNextLootModal();
      return;
    }

    if (this.modalStack.length === 0) {
      this.modal.close('action');
    }
  }

  private equippingGear = false;

  private async equipGear(heroId: string, gearId: string): Promise<void> {
    if (this.equippingGear) return;

    this.equippingGear = true;
    try {
      const response = await sendGameMessage({ type: 'EQUIP_GEAR', heroId, gearId });
      if (!response.ok) {
        this.handleFailedResponse(response.error);
        return;
      }

      const gearName = this.state?.inventory.find((entry) => entry.id === gearId)?.name;
      this.afterGearMutation(response.state);
      if (gearName) {
        this.toasts.show(`${gearName} equipado!`, 'loot');
      }
    } finally {
      this.equippingGear = false;
    }
  }

  private async handleLootReceived(gearIds: string[], gearNames: string[] = []): Promise<void> {
    if (gearIds.length === 1 && gearNames[0]) {
      this.stateChanges.showLootReceived(gearNames[0]);
    } else if (gearIds.length > 1) {
      this.toasts.show(`${gearIds.length} itens recebidos dos baús`, 'loot');
    }

    const flags = getFeatureFlags(this.state);
    if (this.prefsController.autoEquipLoot && flags.autoEquipLoot) {
      await this.optimizeLoadout(gearIds, {
        fromLoot: true,
        silent: flags.autoEquipSilent,
      });
      return;
    }

    this.lootFlow.reset();
    this.enqueueLootModals(gearIds);
  }

  private async optimizeLoadout(
    gearIds?: string[],
    options: { fromLoot?: boolean; silent?: boolean } = {},
  ): Promise<void> {
    if (!getFeatureFlags(this.state).optimizeLoadout) {
      this.toasts.show('Desbloqueie Otimizar equipe em Melhorias', 'info');
      return;
    }

    const response = await sendGameMessage({
      type: 'EQUIP_BEST_LOADOUT',
      gearIds,
    });

    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }

    const equippedCount = response.equippedCount ?? 0;
    this.render(response.state);

    if (equippedCount > 0 && !options.silent) {
      const label = equippedCount === 1 ? '1 item equipado' : `${equippedCount} itens equipados`;
      const message = options.fromLoot ? `Loot auto-equipado: ${label}` : `Equipe otimizada: ${label}`;
      this.toasts.show(message, options.fromLoot ? 'loot' : 'info');
    } else if (!options.fromLoot && !options.silent) {
      this.toasts.show('Nenhum upgrade disponível no momento', 'info');
    }

    if (this.modal.isOpen() && this.modalStack.length > 0) {
      this.renderModalTop();
    }
  }

  private async equipRecommendedLoot(gearIds: string[]): Promise<void> {
    await this.optimizeLoadout(gearIds);
    this.closeLootBatchModal();
  }

  private closeLootBatchModal(): void {
    const topView = this.modalStack[this.modalStack.length - 1];
    if (topView?.type !== 'loot-batch') return;

    this.modalStack.pop();
    this.lootFlow.reset();
    this.modal.close('action');
  }

  private scheduleAutoOpenChests(): void {
    if (this.autoOpenChestPending) return;
    if (!this.prefsController.autoOpenChests || !getFeatureFlags(this.state).autoOpenChests) return;
    if (!this.state || this.openingChests) return;
    if (this.modal.isOpen() || this.state.pendingChestCount === 0) return;

    this.autoOpenChestPending = true;
    window.setTimeout(() => {
      this.autoOpenChestPending = false;

      if (!this.prefsController.autoOpenChests || this.openingChests || this.modal.isOpen()) return;
      if (!this.state || this.state.pendingChestCount === 0) return;

      if (
        this.state.pendingChestCount >= 2 &&
        getFeatureFlags(this.state).openAllChests &&
        getFeatureFlags(this.state).autoOpenAllChests
      ) {
        void this.openAllChests();
        return;
      }

      void this.openNextChest();
    }, 450);
  }

  private async unequipGear(heroId: string, slot: GearSlotKey): Promise<void> {
    const response = await sendGameMessage({ type: 'UNEQUIP_GEAR', heroId, slot });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }

    this.afterGearMutation(response.state);
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

    this.render(state);
    this.refreshModalIfOpen();

    if (topView?.type === 'loot-reveal' && this.lootFlow.hasQueued()) {
      this.advanceLootQueue();
      return;
    }

    if (this.modalStack.length === 0) {
      this.modal.close('action');
    }
  }

  /** Delegação no body do modal — sobrevive a re-renders e não quebra com ticks. */
  private bindModalActionDelegation(): void {
    this.modal.getBody().addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest(
        '[data-equip-gear], [data-pick-gear], [data-pick-hero], [data-unequip-hero], [data-loot-equip-hero]',
      ) as HTMLElement | null;

      if (!target || !this.modal.isOpen()) return;

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
        void this.unequipGear(unequipHeroId, unequipSlot);
        return;
      }

      const lootHeroId = target.getAttribute('data-loot-equip-hero');
      const lootGearId = target.getAttribute('data-loot-equip-gear');
      if (lootHeroId && lootGearId) {
        event.preventDefault();
        void this.equipGear(lootHeroId, lootGearId);
        return;
      }

      const heroId = target.getAttribute('data-pick-hero');
      const gearId = target.getAttribute('data-pick-gear');
      if (heroId && gearId) {
        event.preventDefault();
        void this.equipGear(heroId, gearId);
      }
    });
  }

  private refreshModalIfOpen(): void {
    if (this.modal.isOpen() && this.modalStack.length > 0) {
      this.renderModalTop();
    }
  }

  private closeLootModal(): void {
    const topView = this.modalStack[this.modalStack.length - 1];
    if (topView?.type !== 'loot-reveal') return;

    this.modalStack.pop();

    if (this.lootFlow.hasQueued()) {
      this.advanceLootQueue();
      return;
    }

    if (this.modalStack.length === 0) {
      this.modal.close('action');
      return;
    }

    this.renderModalTop();
  }

  private openInventoryModal(): void {
    if (this.contextInvalidated) return;
    this.modalStack.length = 0;
    this.pushModal({ type: 'inventory' });
  }

  private openHeroDetailModal(heroId: string): void {
    this.modalStack.length = 0;
    this.heroDetailModal.setActiveTab('sheet');
    void this.loadHeroSkillTree(heroId).then(() => {
      this.pushModal({ type: 'hero-detail', heroId });
    });
  }

  private async loadHeroSkillTree(heroId: string): Promise<void> {
    const response = await sendGameMessage({ type: 'GET_HERO_SKILL_TREE', heroId });
    if (response.ok && response.skillNodes) {
      this.heroSkillNodes = response.skillNodes;
    }
  }

  private async loadHeroAscensionTree(heroId: string): Promise<void> {
    const response = await sendGameMessage({ type: 'GET_HERO_ASCENSION_TREE', heroId });
    if (!response.ok) return;

    this.heroAscensionOptions = response.ascensionOptions ?? [];
    this.heroAscensionName = response.ascensionName ?? null;
    this.heroAscensionSkillNodes = response.ascensionSkillNodes ?? [];
  }

  private async changeHeroDetailTab(heroId: string, tab: HeroDetailTab): Promise<void> {
    this.heroDetailModal.setActiveTab(tab);
    if (tab === 'skills') {
      await this.loadHeroSkillTree(heroId);
    }
    if (tab === 'class') {
      await this.loadHeroAscensionTree(heroId);
    }
    this.renderModalTop();
  }

  private async spendAttributePoint(heroId: string, attr: 'str' | 'dex' | 'int'): Promise<void> {
    const response = await sendGameMessage({
      type: 'SPEND_IMPROVEMENT_POINT',
      heroId,
      target: { type: 'attribute', key: attr },
    });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha ao investir ponto', 'info');
      return;
    }
    this.render(response.state);
    this.toasts.show(`+1 ${attr.toUpperCase()}`, 'info');
  }

  private async allocateSkillPoint(heroId: string, skillId: string): Promise<void> {
    const response = await sendGameMessage({
      type: 'SPEND_IMPROVEMENT_POINT',
      heroId,
      target: { type: 'skill', skillId },
    });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha na skill', 'info');
      return;
    }
    await this.loadHeroSkillTree(heroId);
    this.render(response.state);
  }

  private async activateSkill(heroId: string, skillId: string): Promise<void> {
    const response = await sendGameMessage({ type: 'ACTIVATE_SKILL', heroId, skillId });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha ao ativar', 'info');
      return;
    }
    await Promise.all([this.loadHeroSkillTree(heroId), this.loadHeroAscensionTree(heroId)]);
    this.render(response.state);
  }

  private async deactivateSkill(heroId: string, skillId: string): Promise<void> {
    const response = await sendGameMessage({ type: 'DEACTIVATE_SKILL', heroId, skillId });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha ao desativar', 'info');
      return;
    }
    await Promise.all([this.loadHeroSkillTree(heroId), this.loadHeroAscensionTree(heroId)]);
    this.render(response.state);
  }

  private async ascendClass(heroId: string, ascensionId: string): Promise<void> {
    const response = await sendGameMessage({ type: 'ASCEND_CLASS', heroId, ascensionId });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha na ascensão', 'info');
      return;
    }
    await this.loadHeroAscensionTree(heroId);
    this.heroDetailModal.setActiveTab('class');
    this.render(response.state);
    this.toasts.show('Ascensão realizada!', 'info');
  }

  private async allocateAscensionSkill(heroId: string, skillId: string): Promise<void> {
    const response = await sendGameMessage({
      type: 'SPEND_ASCENSION_POINT',
      heroId,
      skillId,
    });
    if (!response.ok) {
      this.toasts.show(response.error ?? 'Falha na skill de ascensão', 'info');
      return;
    }
    await this.loadHeroAscensionTree(heroId);
    this.render(response.state);
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

  private popModal(): void {
    if (this.modalStack.length <= 1) {
      this.modalStack.length = 0;
      this.modal.close('button');
      return;
    }

    this.modalStack.pop();
    this.renderModalTop();
  }

  private renderModalTop(): void {
    if (!this.state || this.modalStack.length === 0) return;

    const view = this.modalStack[this.modalStack.length - 1];
    const title = this.getModalTitle(view);
    const container = this.modal.prepare(title, (reason) => {
      if (reason !== 'action') {
        this.modalStack.length = 0;
        this.lootFlow.reset();
      }
    });

    this.modal.setBackVisible(this.modalStack.length > 1);
    this.modal.setOnBack(() => this.popModal());

    switch (view.type) {
      case 'inventory':
        this.inventoryModal.render(
          container,
          this.state,
          {
            onEquipGear: (gearId) => this.openEquipPickerFromGear(gearId),
            onFilterChange: () => this.renderModalTop(),
            onSortChange: () => this.renderModalTop(),
            onOptimizeLoadout: () => this.optimizeLoadout(),
          },
          { showOptimize: this.state.featureFlags.optimizeLoadout },
        );
        break;
      case 'hero-detail':
        this.heroDetailModal.setSkillNodes(this.heroSkillNodes);
        this.heroDetailModal.setAscensionData(
          this.heroAscensionOptions,
          this.heroAscensionName,
          this.heroAscensionSkillNodes,
        );
        this.heroDetailModal.render(container, this.state, view.heroId, {
          onSlotClick: (heroId, slot) => this.openEquipPickerFromSlot(heroId, slot),
          onSpendAttribute: (heroId, attr) => {
            void this.spendAttributePoint(heroId, attr);
          },
          onAllocateSkill: (heroId, skillId) => {
            void this.allocateSkillPoint(heroId, skillId);
          },
          onActivateSkill: (heroId, skillId) => {
            void this.activateSkill(heroId, skillId);
          },
          onDeactivateSkill: (heroId, skillId) => {
            void this.deactivateSkill(heroId, skillId);
          },
          onAscendClass: (heroId, ascensionId) => {
            void this.ascendClass(heroId, ascensionId);
          },
          onAllocateAscensionSkill: (heroId, skillId) => {
            void this.allocateAscensionSkill(heroId, skillId);
          },
          onTabChange: (heroId, tab) => {
            void this.changeHeroDetailTab(heroId, tab);
          },
        });
        break;
      case 'equip-picker':
        this.equipPickerModal.render(container, this.state, view.mode, {
          onSelectGear: (heroId, gearId) => this.equipGear(heroId, gearId),
          onSelectHero: (heroId, gearId) => this.equipGear(heroId, gearId),
          onUnequip: (heroId, slot) => this.unequipGear(heroId, slot),
        });
        break;
      case 'loot-reveal':
        this.lootModal.render(container, this.state, view.gearId, {
          onEquipBest: (heroId, gearId) => this.equipGear(heroId, gearId),
          onKeepInInventory: () => this.closeLootModal(),
        });
        break;
      case 'loot-batch':
        this.lootBatchModal.render(
          container,
          this.state,
          view.gearIds,
          {
            onEquipRecommended: () => {
              void this.equipRecommendedLoot(view.gearIds);
            },
            onKeepAll: () => this.closeLootBatchModal(),
          },
          { canOptimize: this.state.featureFlags.optimizeInLootBatch },
        );
        break;
      case 'settings':
        this.settingsModal.render(container, this.state, this.prefsController.preferences, {
          onPreferenceChange: (key, value) => this.handlePreferenceChange(key, value),
          onOpenUpgrades: () => {
            void this.openUpgradesModal();
          },
        });
        break;
      case 'upgrades':
        this.upgradeTreeModal.render(container, this.state, this.upgradeNodes, {
          onPurchase: (upgradeId) => {
            void this.purchaseUpgrade(upgradeId);
          },
        });
        break;
      case 'shop':
        this.shopModal.render(
          container,
          this.state,
          {
            offers: this.shopOffers,
            refreshCost: this.shopRefreshCost,
            canAffordRefresh: this.canAffordShopRefresh,
            shopRefreshUnlocked: this.shopRefreshUnlocked,
            shopRefreshRemaining: this.shopRefreshRemaining,
          },
          {
            onBuyOffer: (offerId) => {
              void this.buyShopOffer(offerId);
            },
            onRefreshShop: () => {
              void this.refreshShop();
            },
          },
        );
        break;
    }
  }

  private getModalTitle(view: ModalView): string {
    if (!this.state) return 'Side Hero';

    switch (view.type) {
      case 'inventory':
        return `Inventário (${this.state.inventory.length})`;
      case 'hero-detail': {
        const hero = this.state.heroes.find((entry) => entry.id === view.heroId);
        return hero ? hero.name : 'Herói';
      }
      case 'settings':
        return 'Configurações';
      case 'shop':
        return 'Loja';
      case 'upgrades':
        return 'Melhorias';
      case 'loot-batch':
        return `Loot dos baús (${view.gearIds.length})`;
      case 'loot-reveal': {
        const current = this.lootFlow.total - this.lootFlow.queue.length + 1;
        const queueLabel = this.lootFlow.total > 1 ? ` (${current} de ${this.lootFlow.total})` : '';
        return `Loot do baú${queueLabel}`;
      }
      case 'equip-picker':
        if (view.mode.type === 'gear') {
          const gear = this.state.inventory.find((entry) => entry.id === view.mode.gearId);
          return gear ? `Equipar ${gear.name}` : 'Equipar item';
        }
        {
          const hero = this.state.heroes.find((entry) => entry.id === view.mode.heroId);
          const slotLabels: Record<string, string> = {
            weapon: 'arma',
            armor: 'armadura',
            accessory: 'acessório',
          };
          const slotLabel = slotLabels[view.mode.slot] ?? view.mode.slot;
          return hero ? `Equipar ${slotLabel} — ${hero.name}` : 'Equipar item';
        }
    }
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

  private render(
    state: GameStateDto,
    options: { skipChestToast?: boolean; checkIdleSummary?: boolean } = {},
  ): void {
    if (this.contextInvalidated || !isExtensionContextValid()) {
      this.handleContextInvalidated();
      return;
    }

    if (options.checkIdleSummary) {
      seedPanelSnapshotIfMissing(state);
      this.maybeShowIdleSummary(state);
    }

    const previous = this.state;
    if (previous && !options.skipChestToast) {
      this.stateChanges.detect(previous, state, {
        onChestAvailable: () => {
          void this.openNextChest();
        },
      });
    }

    this.state = state;

    this.hud.render(state, {
      openingChests: this.openingChests,
      autoBattleEnabled: this.prefsController.autoBattleEnabled,
    });

    this.battleStrip.render(state);
    this.heroPanel.render(state, {
      onHeroClick: (heroId) => this.openHeroDetailModal(heroId),
      onSlotClick: (heroId, slot) => this.openEquipPickerFromSlot(heroId, slot),
    });

    this.shopRefreshUnlocked = state.featureFlags.shopRefresh;
    this.shopRefreshRemaining = Math.max(0, state.shopRefreshLimit - state.shopRefreshUses);

    const logMessages = filterBattleLogMessages(
      state.battleLog.map((entry) => entry.message),
      this.prefsController.logFilterImportant,
    );

    this.battleLog.innerHTML = [...logMessages]
      .reverse()
      .map((message) => `<li>${message}</li>`)
      .join('');

    this.enforceUpgradeGates();
    this.scheduleAutoOpenChests();
  }
}
