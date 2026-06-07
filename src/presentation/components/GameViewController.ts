import { GameStateDto } from '../../application/dto/GameStateDto';
import { sendGameMessage } from '../../infrastructure/messaging/GameMessageBus';
import { ASSETS, getAssetUrl, imgTag } from '../assets/AssetCatalog';
import { BattleStripRenderer } from './BattleStripRenderer';
import { HeroPanelRenderer } from './HeroPanelRenderer';
import { InventoryRenderer } from './InventoryRenderer';

export class GameViewController {
  private state: GameStateDto | null = null;

  private readonly stageLabel: HTMLElement;
  private readonly goldLabel: HTMLElement;
  private readonly chestLabel: HTMLElement;
  private readonly battleLog: HTMLElement;
  private readonly openChestBtn: HTMLButtonElement;

  private readonly battleStrip: BattleStripRenderer;
  private readonly heroPanel: HeroPanelRenderer;
  private readonly inventory: InventoryRenderer;

  constructor(root: HTMLElement) {
    this.stageLabel = root.querySelector('#stage-label')!;
    this.goldLabel = root.querySelector('#gold-label')!;
    this.chestLabel = root.querySelector('#chest-label')!;
    this.battleLog = root.querySelector('#battle-log')!;
    this.openChestBtn = root.querySelector('#open-chest-btn') as HTMLButtonElement;

    this.battleStrip = new BattleStripRenderer(
      root.querySelector('#heroes-container')!,
      root.querySelector('#enemy-container')!,
    );

    this.heroPanel = new HeroPanelRenderer(root.querySelector('#hero-panels')!);

    this.inventory = new InventoryRenderer(
      root.querySelector('#inventory-list')!,
      (heroId, gearId) => this.equipGear(heroId, gearId),
    );

    root.querySelector('#tick-btn')!.addEventListener('click', () => this.tick());
    this.openChestBtn.addEventListener('click', () => this.openNextChest());
  }

  async init(): Promise<void> {
    await this.refresh();
    setInterval(() => this.refresh(), 5000);
  }

  private async refresh(): Promise<void> {
    const response = await sendGameMessage({ type: 'GET_STATE' });
    if (!response.ok) return;
    this.render(response.state);
  }

  private async tick(): Promise<void> {
    const response = await sendGameMessage({ type: 'TICK', ticks: 1 });
    if (response.ok) this.render(response.state);
  }

  private async openNextChest(): Promise<void> {
    if (!this.state) return;
    const pending = this.state.chests.find((c) => !c.opened);
    if (!pending) return;

    const response = await sendGameMessage({ type: 'OPEN_CHEST', chestId: pending.id });
    if (response.ok) this.render(response.state);
  }

  private async equipGear(heroId: string, gearId: string): Promise<void> {
    const response = await sendGameMessage({ type: 'EQUIP_GEAR', heroId, gearId });
    if (response.ok) this.render(response.state);
  }

  private render(state: GameStateDto): void {
    this.state = state;

    this.stageLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.stage), 'Stage', 'stat-icon')} Stage ${state.stage}`;
    this.goldLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.gold), 'Ouro', 'stat-icon')} ${state.gold}`;
    this.chestLabel.innerHTML = `${imgTag(getAssetUrl(ASSETS.ui.chest), 'Baús', 'stat-icon')} ${state.pendingChestCount}`;

    this.battleStrip.render(state);
    this.heroPanel.render(state);
    this.inventory.render(state);

    this.battleLog.innerHTML = [...state.battleLog]
      .reverse()
      .map((entry) => `<li>${entry.message}</li>`)
      .join('');

    this.openChestBtn.disabled = state.pendingChestCount === 0;
  }
}
