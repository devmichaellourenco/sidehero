import { chestProgress } from '../../domain/constants/CombatRules';
import { GameStateDto } from '../../application/dto/GameStateDto';
import { isExtensionContextValid } from '../../infrastructure/messaging/ExtensionContext';
import { sendGameMessage } from '../../infrastructure/messaging/GameMessageBus';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import { filterBattleLogMessages } from './BattleLogFilter';
import { BattleStripRenderer } from './BattleStripRenderer';
import { EquipPickerModalRenderer, EquipPickerMode } from './EquipPickerModalRenderer';
import { GameStateChangeDetector } from './GameStateChangeDetector';
import { countUpgradeItems } from './GearComparison';
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
import {
  GamePreferences,
  loadGamePreferences,
  saveGamePreferences,
  updateGamePreference,
} from './GamePreferences';
import { SettingsModalRenderer } from './SettingsModalRenderer';
import { UpgradeTreeModalRenderer } from './UpgradeTreeModalRenderer';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import { FeatureGate } from './FeatureGate';
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

const AUTO_BATTLE_BASE_INTERVAL_MS = 2500;

export class GameViewController {
  private state: GameStateDto | null = null;
  private readonly modalStack: ModalView[] = [];
  private readonly lootQueue: string[] = [];
  private lootTotal = 0;
  private refreshTimer: number | null = null;
  private autoBattleTimer: number | null = null;
  private preferences: GamePreferences = loadGamePreferences();
  private autoBattleEnabled = false;
  private autoOpenChests = false;
  private autoEquipLoot = false;
  private autoBattleSpeed = 1;
  private logFilterImportant = false;
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

    this.battleStrip = new BattleStripRenderer(
      root.querySelector('#heroes-container')!,
      root.querySelector('#enemy-container')!,
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

    this.applyPreferences(loadGamePreferences());

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

    if (this.autoBattleEnabled) {
      this.startAutoBattle();
    }

    this.refreshTimer = window.setInterval(() => {
      void this.refresh();
    }, 5000);
  }

  private applyPreferences(preferences: GamePreferences): void {
    const clamped = this.clampPreferencesToGates(preferences);
    const wasAutoBattle = this.autoBattleEnabled;
    const wasSpeed = this.autoBattleSpeed;

    this.preferences = clamped;
    this.autoBattleEnabled =
      clamped.autoBattle && FeatureGate.canUseAutoBattle(this.state);
    this.autoOpenChests =
      clamped.autoOpenChests && FeatureGate.canUseAutoOpenChests(this.state);
    this.autoEquipLoot =
      clamped.autoEquipLoot && FeatureGate.canUseAutoEquipLoot(this.state);
    this.autoBattleSpeed = Math.min(
      clamped.autoBattleSpeed,
      FeatureGate.maxAutoBattleSpeed(this.state),
    ) as GamePreferences['autoBattleSpeed'];
    this.logFilterImportant =
      clamped.logFilterImportant && FeatureGate.canUseLogFilter(this.state);
    this.updateAutoBattleUi();

    const autoBattleChanged =
      wasAutoBattle !== this.autoBattleEnabled || wasSpeed !== this.autoBattleSpeed;

    if (autoBattleChanged) {
      if (this.autoBattleEnabled) {
        this.stopAutoBattle();
        this.startAutoBattle();
      } else {
        this.stopAutoBattle();
      }
    }
  }

  private clampPreferencesToGates(preferences: GamePreferences): GamePreferences {
    const maxSpeed = FeatureGate.maxAutoBattleSpeed(this.state);
    return {
      autoBattle: FeatureGate.canUseAutoBattle(this.state) ? preferences.autoBattle : false,
      autoOpenChests: FeatureGate.canUseAutoOpenChests(this.state)
        ? preferences.autoOpenChests
        : false,
      autoEquipLoot: FeatureGate.canUseAutoEquipLoot(this.state)
        ? preferences.autoEquipLoot
        : false,
      autoBattleSpeed: Math.min(preferences.autoBattleSpeed, maxSpeed) as 1 | 2 | 3,
      logFilterImportant: FeatureGate.canUseLogFilter(this.state)
        ? preferences.logFilterImportant
        : false,
    };
  }

  private enforceUpgradeGates(): void {
    const clamped = this.clampPreferencesToGates(this.preferences);
    if (JSON.stringify(clamped) === JSON.stringify(this.preferences)) return;
    saveGamePreferences(clamped);
    this.applyPreferences(clamped);
  }

  private handlePreferenceChange<K extends keyof GamePreferences>(
    key: K,
    value: GamePreferences[K],
  ): void {
    if (!this.canChangePreference(key)) {
      this.toasts.show('Desbloqueie esta automação em Melhorias', 'info');
      if (this.modal.isOpen() && this.modalStack[this.modalStack.length - 1]?.type === 'settings') {
        this.renderModalTop();
      }
      return;
    }

    const wasAutoBattle = this.autoBattleEnabled;
    const next = updateGamePreference(key, value);
    this.applyPreferences(next);

    if (key === 'autoOpenChests' && value === true) {
      this.scheduleAutoOpenChests();
    }

    if (key === 'autoBattleSpeed' && wasAutoBattle && this.autoBattleEnabled) {
      this.stopAutoBattle();
      this.startAutoBattle();
    }

    if (this.state) {
      this.render(this.state);
    }

    if (this.modal.isOpen() && this.modalStack[this.modalStack.length - 1]?.type === 'settings') {
      this.renderModalTop();
    }
  }

  private canChangePreference(key: keyof GamePreferences): boolean {
    switch (key) {
      case 'autoBattle':
        return FeatureGate.canUseAutoBattle(this.state);
      case 'autoOpenChests':
        return FeatureGate.canUseAutoOpenChests(this.state);
      case 'autoEquipLoot':
        return FeatureGate.canUseAutoEquipLoot(this.state);
      case 'logFilterImportant':
        return FeatureGate.canUseLogFilter(this.state);
      case 'autoBattleSpeed':
        return FeatureGate.canUseAutoBattle(this.state);
      default:
        return true;
    }
  }

  private getAutoBattleIntervalMs(): number {
    const speed = Math.min(
      this.autoBattleSpeed,
      FeatureGate.maxAutoBattleSpeed(this.state),
    );
    return Math.floor(AUTO_BATTLE_BASE_INTERVAL_MS / speed);
  }

  private shouldIgnoreKeyboardShortcut(): boolean {
    if (this.contextInvalidated || this.autoBattleEnabled || this.openingChests) return true;
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

  private startAutoBattle(): void {
    if (this.autoBattleTimer !== null || this.contextInvalidated) return;

    this.autoBattleTimer = window.setInterval(() => {
      void this.tick();
    }, this.getAutoBattleIntervalMs());
  }

  private stopAutoBattle(): void {
    if (this.autoBattleTimer === null) return;
    window.clearInterval(this.autoBattleTimer);
    this.autoBattleTimer = null;
  }

  private updateAutoBattleUi(): void {
    this.tickBtn.classList.toggle('auto-battle-active', this.autoBattleEnabled);
    this.tickBtn.disabled = this.autoBattleEnabled;
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
    }
  }

  private handleContextInvalidated(): void {
    if (this.contextInvalidated) return;
    this.contextInvalidated = true;
    this.modalStack.length = 0;
    this.lootQueue.length = 0;

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
    if (!FeatureGate.canUseOpenAllChests(this.state)) return;
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
    this.lootTotal = gearIds.length;
    this.lootQueue.length = 0;
    this.modalStack.length = 0;

    if (gearIds.length > 1) {
      this.pushModal({ type: 'loot-batch', gearIds: [...gearIds] });
      return;
    }

    if (gearIds.length === 1) {
      this.lootQueue.push(gearIds[0]);
      this.pushModal({ type: 'loot-reveal', gearId: gearIds[0] });
    }
  }

  private showNextLootModal(): void {
    const gearId = this.lootQueue[0];
    if (!gearId) return;

    this.modalStack.length = 0;
    this.pushModal({ type: 'loot-reveal', gearId });
  }

  private advanceLootQueue(): void {
    if (this.lootQueue.length > 0) {
      this.lootQueue.shift();
    }

    if (this.lootQueue.length > 0) {
      this.showNextLootModal();
      return;
    }

    if (this.modalStack.length === 0) {
      this.modal.close('action');
    }
  }

  private async equipGear(heroId: string, gearId: string): Promise<void> {
    const response = await sendGameMessage({ type: 'EQUIP_GEAR', heroId, gearId });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }

    this.afterGearMutation(response.state);
  }

  private async handleLootReceived(gearIds: string[], gearNames: string[] = []): Promise<void> {
    if (gearIds.length === 1 && gearNames[0]) {
      this.stateChanges.showLootReceived(gearNames[0]);
    } else if (gearIds.length > 1) {
      this.toasts.show(`${gearIds.length} itens recebidos dos baús`, 'loot');
    }

    if (this.autoEquipLoot && FeatureGate.canUseAutoEquipLoot(this.state)) {
      await this.optimizeLoadout(gearIds, {
        fromLoot: true,
        silent: FeatureGate.isAutoEquipSilent(this.state),
      });
      return;
    }

    this.lootQueue.length = 0;
    this.enqueueLootModals(gearIds);
  }

  private async optimizeLoadout(
    gearIds?: string[],
    options: { fromLoot?: boolean; silent?: boolean } = {},
  ): Promise<void> {
    if (!FeatureGate.canUseOptimizeLoadout(this.state)) {
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
    this.lootQueue.length = 0;
    this.modal.close('action');
  }

  private scheduleAutoOpenChests(): void {
    if (this.autoOpenChestPending) return;
    if (!this.autoOpenChests || !FeatureGate.canUseAutoOpenChests(this.state)) return;
    if (!this.state || this.openingChests) return;
    if (this.modal.isOpen() || this.state.pendingChestCount === 0) return;

    this.autoOpenChestPending = true;
    window.setTimeout(() => {
      this.autoOpenChestPending = false;

      if (!this.autoOpenChests || this.openingChests || this.modal.isOpen()) return;
      if (!this.state || this.state.pendingChestCount === 0) return;

      if (
        this.state.pendingChestCount >= 2 &&
        FeatureGate.canUseOpenAllChests(this.state) &&
        FeatureGate.shouldAutoOpenAllChests(this.state)
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

    if (topView?.type === 'loot-reveal' && this.lootQueue.length > 0) {
      this.advanceLootQueue();
      return;
    }

    if (this.modalStack.length === 0) {
      this.modal.close('action');
    }
  }

  private closeLootModal(): void {
    const topView = this.modalStack[this.modalStack.length - 1];
    if (topView?.type !== 'loot-reveal') return;

    this.modalStack.pop();

    if (this.lootQueue.length > 0) {
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
    this.pushModal({ type: 'hero-detail', heroId });
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
    const container = this.modal.open(title, (reason) => {
      if (reason !== 'action') {
        this.modalStack.length = 0;
        this.lootQueue.length = 0;
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
          { showOptimize: FeatureGate.canUseOptimizeLoadout(this.state) },
        );
        break;
      case 'hero-detail':
        this.heroDetailModal.render(container, this.state, view.heroId, {
          onSlotClick: (heroId, slot) => this.openEquipPickerFromSlot(heroId, slot),
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
          { canOptimize: FeatureGate.canUseOptimizeInLootBatch(this.state) },
        );
        break;
      case 'settings':
        this.settingsModal.render(container, this.state, this.preferences, {
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
        const current = this.lootTotal - this.lootQueue.length + 1;
        const queueLabel = this.lootTotal > 1 ? ` (${current} de ${this.lootTotal})` : '';
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

    this.stageLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.stage), 'Stage', 'stat-icon')} Stage ${state.stage}`;
    this.goldLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.gold), 'Ouro', 'stat-icon')} ${state.gold}`;
    this.chestLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.chest), 'Baús', 'stat-icon')} ${state.pendingChestCount}`;

    const progress = chestProgress(state.totalBattlesWon);
    this.chestProgressLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.chest), 'Próximo baú', 'stat-icon')} ${progress.current}/${progress.target}`;
    this.chestProgressLabel.title = 'Vitórias até o próximo baú';

    this.battleStrip.render(state);
    this.heroPanel.render(state, {
      onHeroClick: (heroId) => this.openHeroDetailModal(heroId),
      onSlotClick: (heroId, slot) => this.openEquipPickerFromSlot(heroId, slot),
    });

    const upgradeCount = countUpgradeItems(state);
    const upgradeBadge =
      upgradeCount > 0
        ? `<span class="inventory-upgrade-badge">↑${upgradeCount}</span>`
        : '';

    this.openInventoryBtn.innerHTML = `
      ${imgTag(getAssetUrl(ASSETS.ui.inventory), 'Inventário', 'btn-icon')}
      Inventário (${state.inventory.length})
      ${upgradeBadge}
    `;

    const canOptimize = FeatureGate.canUseOptimizeLoadout(state);
    this.optimizeLoadoutBtn.classList.toggle('hidden', !canOptimize);
    this.optimizeLoadoutBtn.disabled = !canOptimize || upgradeCount === 0;
    this.optimizeLoadoutBtn.innerHTML = upgradeCount > 0
      ? `Otimizar (↑${upgradeCount})`
      : 'Otimizar equipe';

    const canOpenAll = FeatureGate.canUseOpenAllChests(state);
    this.openAllChestsBtn.classList.toggle('hidden', !canOpenAll || state.pendingChestCount < 2);

    const purchasableBadge =
      state.purchasableUpgradeCount > 0
        ? `<span class="inventory-upgrade-badge">↑${state.purchasableUpgradeCount}</span>`
        : '';
    this.openUpgradesBtn.innerHTML = `Melhorias${purchasableBadge}`;

    this.shopRefreshUnlocked = FeatureGate.canUseShopRefresh(state);
    this.shopRefreshRemaining = Math.max(0, state.shopRefreshLimit - state.shopRefreshUses);

    const logMessages = filterBattleLogMessages(
      state.battleLog.map((entry) => entry.message),
      this.logFilterImportant,
    );

    this.battleLog.innerHTML = [...logMessages]
      .reverse()
      .map((message) => `<li>${message}</li>`)
      .join('');

    const hasChests = state.pendingChestCount > 0;
    this.openChestBtn.disabled = !hasChests || this.openingChests;
    this.openAllChestsBtn.disabled =
      !canOpenAll || state.pendingChestCount < 2 || this.openingChests;
    this.openChestBtn.classList.toggle('chest-available', hasChests);

    this.enforceUpgradeGates();

    if (this.modal.isOpen() && this.modalStack.length > 0) {
      this.renderModalTop();
    }

    this.scheduleAutoOpenChests();
  }
}
