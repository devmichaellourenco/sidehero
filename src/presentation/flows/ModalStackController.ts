import { GameStateDto } from '../../application/dto/GameStateDto';
import { EquipPickerModalRenderer } from '../components/EquipPickerModalRenderer';
import { HeroDetailModalRenderer } from '../components/HeroDetailModalRenderer';
import { InventoryModalRenderer } from '../components/InventoryModalRenderer';
import { LootBatchModalRenderer } from '../components/LootBatchModalRenderer';
import { LootModalRenderer } from '../components/LootModalRenderer';
import { ModalController } from '../components/ModalController';
import { SettingsModalRenderer } from '../components/SettingsModalRenderer';
import { ShopModalRenderer } from '../components/ShopModalRenderer';
import { UpgradeTreeModalRenderer } from '../components/UpgradeTreeModalRenderer';
import { GamePreferences } from '../components/GamePreferences';
import { LootFlowController } from '../controllers/LootFlowController';
import { ChestLootFlow } from './ChestLootFlow';
import { GearEquipFlow } from './GearEquipFlow';
import { HeroDetailFlow } from './HeroDetailFlow';
import { ModalView } from './ModalTypes';
import { ShopFlow } from './ShopFlow';

export class ModalStackController {
  constructor(
    private readonly modal: ModalController,
    private readonly inventoryModal: InventoryModalRenderer,
    private readonly heroDetailFlow: HeroDetailFlow,
    private readonly equipPickerModal: EquipPickerModalRenderer,
    private readonly lootModal: LootModalRenderer,
    private readonly lootBatchModal: LootBatchModalRenderer,
    private readonly settingsModal: SettingsModalRenderer,
    private readonly shopModal: ShopModalRenderer,
    private readonly upgradeTreeModal: UpgradeTreeModalRenderer,
    private readonly shopFlow: ShopFlow,
    private readonly gearEquipFlow: GearEquipFlow,
    private readonly chestLootFlow: ChestLootFlow,
    private readonly lootFlow: LootFlowController,
    private readonly getPreferences: () => GamePreferences,
    private readonly onPreferenceChange: <K extends keyof GamePreferences>(
      key: K,
      value: GamePreferences[K],
    ) => void,
    private readonly onOpenUpgrades: () => void,
    private readonly onEquipPickerFromSlot: (heroId: string, slot: string) => void,
    private readonly onEquipPickerFromGear: (gearId: string) => void,
    private readonly onEquipRecommendedLoot: (gearIds: string[]) => void,
  ) {}

  getModalTitle(view: ModalView, state: GameStateDto): string {
    switch (view.type) {
      case 'inventory':
        return `Inventário (${state.inventory.length})`;
      case 'hero-detail': {
        const hero = state.heroes.find((entry) => entry.id === view.heroId);
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
          const gear = state.inventory.find((entry) => entry.id === view.mode.gearId);
          return gear ? `Equipar ${gear.name}` : 'Equipar item';
        }
        {
          const hero = state.heroes.find((entry) => entry.id === view.mode.heroId);
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

  renderTop(stack: ModalView[], state: GameStateDto): void {
    if (stack.length === 0) return;

    const view = stack[stack.length - 1];
    const title = this.getModalTitle(view, state);
    const container = this.modal.prepare(title, (reason) => {
      if (reason !== 'action') {
        stack.length = 0;
        this.chestLootFlow.lootFlow.reset();
      }
    });

    this.modal.setBackVisible(stack.length > 1);
    this.modal.setOnBack(() => {
      if (stack.length <= 1) {
        stack.length = 0;
        this.modal.close('button');
        return;
      }
      stack.pop();
      this.renderTop(stack, state);
    });

    switch (view.type) {
      case 'inventory':
        this.inventoryModal.render(
          container,
          state,
          {
            onEquipGear: (gearId) => this.onEquipPickerFromGear(gearId),
            onFilterChange: () => this.renderTop(stack, state),
            onSortChange: () => this.renderTop(stack, state),
            onOptimizeLoadout: () => {
              void this.gearEquipFlow.optimizeLoadout();
            },
          },
          { showOptimize: state.featureFlags.optimizeLoadout },
        );
        break;
      case 'hero-detail':
        this.heroDetailFlow.bindToModal(container, state, view.heroId, {
          onSlotClick: (heroId, slot) => this.onEquipPickerFromSlot(heroId, slot),
        });
        break;
      case 'equip-picker':
        this.equipPickerModal.render(container, state, view.mode, {
          onSelectGear: (heroId, gearId) => {
            void this.gearEquipFlow.equip(heroId, gearId);
          },
          onSelectHero: (heroId, gearId) => {
            void this.gearEquipFlow.equip(heroId, gearId);
          },
          onUnequip: (heroId, slot) => {
            void this.gearEquipFlow.unequip(heroId, slot);
          },
        });
        break;
      case 'loot-reveal':
        this.lootModal.render(container, state, view.gearId, {
          onEquipBest: (heroId, gearId) => {
            void this.gearEquipFlow.equip(heroId, gearId);
          },
          onKeepInInventory: () => this.chestLootFlow.closeLootModal(),
        });
        break;
      case 'loot-batch':
        this.lootBatchModal.render(
          container,
          state,
          view.gearIds,
          {
            onEquipRecommended: () => this.onEquipRecommendedLoot(view.gearIds),
            onKeepAll: () => this.chestLootFlow.closeLootBatchModal(),
          },
          { canOptimize: state.featureFlags.optimizeInLootBatch },
        );
        break;
      case 'settings':
        this.settingsModal.render(container, state, this.getPreferences(), {
          onPreferenceChange: (key, value) => this.onPreferenceChange(key, value),
          onOpenUpgrades: () => this.onOpenUpgrades(),
        });
        break;
      case 'upgrades':
        this.upgradeTreeModal.render(container, state, this.shopFlow.state.upgradeNodes, {
          onPurchase: (upgradeId) => {
            void this.shopFlow.purchaseUpgrade(upgradeId);
          },
        });
        break;
      case 'shop':
        this.shopModal.render(
          container,
          state,
          {
            offers: this.shopFlow.state.offers,
            refreshCost: this.shopFlow.state.refreshCost,
            canAffordRefresh: this.shopFlow.state.canAffordRefresh,
            shopRefreshUnlocked: this.shopFlow.state.shopRefreshUnlocked,
            shopRefreshRemaining: this.shopFlow.state.shopRefreshRemaining,
          },
          {
            onBuyOffer: (offerId) => {
              void this.shopFlow.buyOffer(offerId);
            },
            onRefreshShop: () => {
              void this.shopFlow.refreshShop();
            },
          },
        );
        break;
    }
  }
}
