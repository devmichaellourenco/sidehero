import { GameStateDto } from '../../application/dto/GameStateDto';
import { isExtensionContextValid } from '../../infrastructure/messaging/ExtensionContext';
import { sendGameMessage } from '../../infrastructure/messaging/GameMessageBus';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
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
import { ModalController } from './ModalController';
import {
  buildIdleSummary,
  loadPanelSnapshot,
  seedPanelSnapshotIfMissing,
  touchPanelSnapshot,
} from './PanelStateSnapshot';
import { ToastController } from './ToastController';

type ModalView =
  | { type: 'inventory' }
  | { type: 'hero-detail'; heroId: string }
  | { type: 'equip-picker'; mode: EquipPickerMode }
  | { type: 'loot-reveal'; gearId: string }
  | { type: 'loot-batch'; gearIds: string[] };

const AUTO_BATTLE_STORAGE_KEY = 'sidehero_auto_battle';
const AUTO_OPEN_CHEST_STORAGE_KEY = 'sidehero_auto_open_chest';
const AUTO_BATTLE_SPEED_STORAGE_KEY = 'sidehero_auto_battle_speed';
const AUTO_BATTLE_BASE_INTERVAL_MS = 2500;

export class GameViewController {
  private state: GameStateDto | null = null;
  private readonly modalStack: ModalView[] = [];
  private readonly lootQueue: string[] = [];
  private lootTotal = 0;
  private refreshTimer: number | null = null;
  private autoBattleTimer: number | null = null;
  private autoBattleEnabled = false;
  private autoOpenChests = false;
  private autoBattleSpeed = 1;
  private contextInvalidated = false;
  private idleSummaryShown = false;
  private openingChests = false;
  private autoOpenChestPending = false;

  private readonly stageLabel: HTMLElement;
  private readonly goldLabel: HTMLElement;
  private readonly chestLabel: HTMLElement;
  private readonly battleLog: HTMLElement;
  private readonly tickBtn: HTMLButtonElement;
  private readonly openChestBtn: HTMLButtonElement;
  private readonly openAllChestsBtn: HTMLButtonElement;
  private readonly openInventoryBtn: HTMLButtonElement;
  private readonly optimizeLoadoutBtn: HTMLButtonElement;
  private readonly autoBattleToggle: HTMLInputElement;
  private readonly autoChestToggle: HTMLInputElement;
  private readonly autoBattleSpeedSelect: HTMLSelectElement;

  private readonly battleStrip: BattleStripRenderer;
  private readonly heroPanel: HeroPanelRenderer;
  private readonly modal: ModalController;
  private readonly inventoryModal: InventoryModalRenderer;
  private readonly heroDetailModal: HeroDetailModalRenderer;
  private readonly equipPickerModal: EquipPickerModalRenderer;
  private readonly lootModal: LootModalRenderer;
  private readonly lootBatchModal: LootBatchModalRenderer;
  private readonly toasts: ToastController;
  private readonly stateChanges: GameStateChangeDetector;

  constructor(root: HTMLElement) {
    this.stageLabel = root.querySelector('#stage-label')!;
    this.goldLabel = root.querySelector('#gold-label')!;
    this.chestLabel = root.querySelector('#chest-label')!;
    this.battleLog = root.querySelector('#battle-log')!;
    this.tickBtn = root.querySelector('#tick-btn') as HTMLButtonElement;
    this.openChestBtn = root.querySelector('#open-chest-btn') as HTMLButtonElement;
    this.openAllChestsBtn = root.querySelector('#open-all-chests-btn') as HTMLButtonElement;
    this.openInventoryBtn = root.querySelector('#open-inventory-btn') as HTMLButtonElement;
    this.optimizeLoadoutBtn = root.querySelector('#optimize-loadout-btn') as HTMLButtonElement;
    this.autoBattleToggle = root.querySelector('#auto-battle-toggle') as HTMLInputElement;
    this.autoChestToggle = root.querySelector('#auto-chest-toggle') as HTMLInputElement;
    this.autoBattleSpeedSelect = root.querySelector('#auto-battle-speed') as HTMLSelectElement;

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
    this.toasts = new ToastController(root.querySelector('#toast-root')!);
    this.stateChanges = new GameStateChangeDetector(this.toasts);

    this.autoBattleEnabled = this.loadAutoBattlePreference();
    this.autoOpenChests = this.loadAutoOpenChestPreference();
    this.autoBattleSpeed = this.loadAutoBattleSpeedPreference();
    this.autoBattleToggle.checked = this.autoBattleEnabled;
    this.autoChestToggle.checked = this.autoOpenChests;
    this.autoBattleSpeedSelect.value = String(this.autoBattleSpeed);
    this.updateAutoBattleUi();

    this.tickBtn.addEventListener('click', () => this.tick());
    this.openChestBtn.addEventListener('click', () => this.openNextChest());
    this.openAllChestsBtn.addEventListener('click', () => this.openAllChests());
    this.openInventoryBtn.addEventListener('click', () => this.openInventoryModal());
    this.optimizeLoadoutBtn.addEventListener('click', () => this.optimizeLoadout());
    this.autoBattleToggle.addEventListener('change', () => this.setAutoBattle(this.autoBattleToggle.checked));
    this.autoChestToggle.addEventListener('change', () => this.setAutoOpenChests(this.autoChestToggle.checked));
    this.autoBattleSpeedSelect.addEventListener('change', () => {
      this.setAutoBattleSpeed(Number(this.autoBattleSpeedSelect.value));
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

  private loadAutoBattlePreference(): boolean {
    try {
      return sessionStorage.getItem(AUTO_BATTLE_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  private saveAutoBattlePreference(enabled: boolean): void {
    try {
      sessionStorage.setItem(AUTO_BATTLE_STORAGE_KEY, enabled ? '1' : '0');
    } catch {
      // sessionStorage indisponível
    }
  }

  private loadAutoOpenChestPreference(): boolean {
    try {
      return sessionStorage.getItem(AUTO_OPEN_CHEST_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  private saveAutoOpenChestPreference(enabled: boolean): void {
    try {
      sessionStorage.setItem(AUTO_OPEN_CHEST_STORAGE_KEY, enabled ? '1' : '0');
    } catch {
      // sessionStorage indisponível
    }
  }

  private loadAutoBattleSpeedPreference(): number {
    try {
      const raw = sessionStorage.getItem(AUTO_BATTLE_SPEED_STORAGE_KEY);
      return raw === '2' ? 2 : 1;
    } catch {
      return 1;
    }
  }

  private saveAutoBattleSpeedPreference(speed: number): void {
    try {
      sessionStorage.setItem(AUTO_BATTLE_SPEED_STORAGE_KEY, String(speed));
    } catch {
      // sessionStorage indisponível
    }
  }

  private getAutoBattleIntervalMs(): number {
    return Math.floor(AUTO_BATTLE_BASE_INTERVAL_MS / this.autoBattleSpeed);
  }

  private setAutoOpenChests(enabled: boolean): void {
    this.autoOpenChests = enabled;
    this.saveAutoOpenChestPreference(enabled);
    if (enabled) {
      this.scheduleAutoOpenChests();
    }
  }

  private setAutoBattleSpeed(speed: number): void {
    this.autoBattleSpeed = speed === 2 ? 2 : 1;
    this.autoBattleSpeedSelect.value = String(this.autoBattleSpeed);
    this.saveAutoBattleSpeedPreference(this.autoBattleSpeed);

    if (this.autoBattleEnabled) {
      this.stopAutoBattle();
      this.startAutoBattle();
    }
  }

  private setAutoBattle(enabled: boolean): void {
    this.autoBattleEnabled = enabled;
    this.saveAutoBattlePreference(enabled);
    this.updateAutoBattleUi();

    if (enabled) {
      this.startAutoBattle();
      return;
    }

    this.stopAutoBattle();
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
        this.stateChanges.showLootReceived(response.openedGear.name);
        this.lootQueue.length = 0;
        this.enqueueLootModals([response.openedGear.id]);
      }
    } finally {
      this.openingChests = false;
    }
  }

  private async openAllChests(): Promise<void> {
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
        this.toasts.show(`${openedGears.length} itens recebidos dos baús`, 'loot');
        this.enqueueLootModals(openedGears.map((gear) => gear.id));
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

  private async optimizeLoadout(gearIds?: string[]): Promise<void> {
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

    if (equippedCount > 0) {
      const label = equippedCount === 1 ? '1 item equipado' : `${equippedCount} itens equipados`;
      this.toasts.show(`Equipe otimizada: ${label}`, 'info');
    } else {
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
    if (!this.autoOpenChests || !this.state || this.openingChests) return;
    if (this.modal.isOpen() || this.state.pendingChestCount === 0) return;

    this.autoOpenChestPending = true;
    window.setTimeout(() => {
      this.autoOpenChestPending = false;

      if (!this.autoOpenChests || this.openingChests || this.modal.isOpen()) return;
      if (!this.state || this.state.pendingChestCount === 0) return;

      if (this.state.pendingChestCount >= 2) {
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
        this.inventoryModal.render(container, this.state, {
          onEquipGear: (gearId) => this.openEquipPickerFromGear(gearId),
          onFilterChange: () => this.renderModalTop(),
          onSortChange: () => this.renderModalTop(),
          onOptimizeLoadout: () => this.optimizeLoadout(),
        });
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
        this.lootBatchModal.render(container, this.state, view.gearIds, {
          onEquipRecommended: () => {
            void this.equipRecommendedLoot(view.gearIds);
          },
          onKeepAll: () => this.closeLootBatchModal(),
        });
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

    this.optimizeLoadoutBtn.disabled = upgradeCount === 0;
    this.optimizeLoadoutBtn.innerHTML = upgradeCount > 0
      ? `Otimizar (↑${upgradeCount})`
      : 'Otimizar equipe';

    this.battleLog.innerHTML = [...state.battleLog]
      .reverse()
      .map((entry) => `<li>${entry.message}</li>`)
      .join('');

    const hasChests = state.pendingChestCount > 0;
    this.openChestBtn.disabled = !hasChests || this.openingChests;
    this.openAllChestsBtn.disabled = state.pendingChestCount < 2 || this.openingChests;
    this.openChestBtn.classList.toggle('chest-available', hasChests);
    this.openAllChestsBtn.classList.toggle('hidden', state.pendingChestCount < 2);

    if (this.modal.isOpen() && this.modalStack.length > 0) {
      this.renderModalTop();
    }

    this.scheduleAutoOpenChests();
  }
}
