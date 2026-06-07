import { GameStateDto } from '../../application/dto/GameStateDto';
import { isExtensionContextValid } from '../../infrastructure/messaging/ExtensionContext';
import { sendGameMessage } from '../../infrastructure/messaging/GameMessageBus';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import { BattleStripRenderer } from './BattleStripRenderer';
import { EquipPickerModalRenderer, EquipPickerMode } from './EquipPickerModalRenderer';
import { GameStateChangeDetector } from './GameStateChangeDetector';
import { GearSlotKey } from './GearPresentation';
import { HeroDetailModalRenderer } from './HeroDetailModalRenderer';
import { HeroPanelRenderer } from './HeroPanelRenderer';
import { InventoryModalRenderer } from './InventoryModalRenderer';
import { LootModalRenderer } from './LootModalRenderer';
import { ModalController } from './ModalController';
import { ToastController } from './ToastController';

type ModalView =
  | { type: 'inventory' }
  | { type: 'hero-detail'; heroId: string }
  | { type: 'equip-picker'; mode: EquipPickerMode }
  | { type: 'loot-reveal'; gearId: string };

export class GameViewController {
  private state: GameStateDto | null = null;
  private readonly modalStack: ModalView[] = [];
  private refreshTimer: number | null = null;
  private contextInvalidated = false;

  private readonly stageLabel: HTMLElement;
  private readonly goldLabel: HTMLElement;
  private readonly chestLabel: HTMLElement;
  private readonly battleLog: HTMLElement;
  private readonly openChestBtn: HTMLButtonElement;
  private readonly openInventoryBtn: HTMLButtonElement;

  private readonly battleStrip: BattleStripRenderer;
  private readonly heroPanel: HeroPanelRenderer;
  private readonly modal: ModalController;
  private readonly inventoryModal: InventoryModalRenderer;
  private readonly heroDetailModal: HeroDetailModalRenderer;
  private readonly equipPickerModal: EquipPickerModalRenderer;
  private readonly lootModal: LootModalRenderer;
  private readonly toasts: ToastController;
  private readonly stateChanges: GameStateChangeDetector;

  constructor(root: HTMLElement) {
    this.stageLabel = root.querySelector('#stage-label')!;
    this.goldLabel = root.querySelector('#gold-label')!;
    this.chestLabel = root.querySelector('#chest-label')!;
    this.battleLog = root.querySelector('#battle-log')!;
    this.openChestBtn = root.querySelector('#open-chest-btn') as HTMLButtonElement;
    this.openInventoryBtn = root.querySelector('#open-inventory-btn') as HTMLButtonElement;

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
    this.toasts = new ToastController(root.querySelector('#toast-root')!);
    this.stateChanges = new GameStateChangeDetector(this.toasts);

    root.querySelector('#tick-btn')!.addEventListener('click', () => this.tick());
    this.openChestBtn.addEventListener('click', () => this.openNextChest());
    this.openInventoryBtn.addEventListener('click', () => this.openInventoryModal());
  }

  async init(): Promise<void> {
    try {
      await this.refresh();
    } catch {
      this.handleContextInvalidated();
      return;
    }

    if (this.contextInvalidated) return;

    this.refreshTimer = window.setInterval(() => {
      void this.refresh();
    }, 5000);
  }

  private async refresh(): Promise<void> {
    if (this.contextInvalidated) return;

    const response = await sendGameMessage({ type: 'GET_STATE' });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }
    this.render(response.state);
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

    if (this.refreshTimer !== null) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

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
    const response = await sendGameMessage({ type: 'TICK', ticks: 1 });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }
    this.render(response.state);
  }

  private async openNextChest(): Promise<void> {
    if (!this.state) return;
    const pending = this.state.chests.find((c) => !c.opened);
    if (!pending) return;

    const response = await sendGameMessage({ type: 'OPEN_CHEST', chestId: pending.id });
    if (!response.ok) {
      this.handleFailedResponse(response.error);
      return;
    }

    this.render(response.state, { skipChestToast: true });

    if (response.openedGear) {
      this.stateChanges.showLootReceived(response.openedGear.name);
      this.modalStack.length = 0;
      this.pushModal({ type: 'loot-reveal', gearId: response.openedGear.id });
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
      topView?.type === 'loot-reveal'
    ) {
      this.modalStack.pop();
    }

    this.render(state);

    if (this.modalStack.length === 0) {
      this.modal.close('action');
    }
  }

  private closeLootModal(): void {
    const topView = this.modalStack[this.modalStack.length - 1];
    if (topView?.type !== 'loot-reveal') return;

    this.modalStack.pop();
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
      }
    });

    this.modal.setBackVisible(this.modalStack.length > 1);
    this.modal.setOnBack(() => this.popModal());

    switch (view.type) {
      case 'inventory':
        this.inventoryModal.render(container, this.state, {
          onEquipGear: (gearId) => this.openEquipPickerFromGear(gearId),
          onFilterChange: () => this.renderModalTop(),
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
      case 'loot-reveal':
        return 'Loot do baú';
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

  private render(
    state: GameStateDto,
    options: { skipChestToast?: boolean } = {},
  ): void {
    if (this.contextInvalidated || !isExtensionContextValid()) {
      this.handleContextInvalidated();
      return;
    }

    const previous = this.state;
    if (previous && !options.skipChestToast) {
      this.stateChanges.detect(previous, state);
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

    this.openInventoryBtn.innerHTML = `
      ${imgTag(getAssetUrl(ASSETS.ui.inventory), 'Inventário', 'btn-icon')}
      Inventário (${state.inventory.length})
    `;

    this.battleLog.innerHTML = [...state.battleLog]
      .reverse()
      .map((entry) => `<li>${entry.message}</li>`)
      .join('');

    this.openChestBtn.disabled = state.pendingChestCount === 0;

    if (this.modal.isOpen() && this.modalStack.length > 0) {
      this.renderModalTop();
    }
  }
}
