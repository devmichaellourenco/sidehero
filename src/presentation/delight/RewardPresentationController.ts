import { GameStateDto, GearDto } from '../../application/dto/GameStateDto';
import { PanelSnapshot } from '../components/PanelStateSnapshot';
import { RewardCelebrationPort } from './RewardCelebrationPort';
import { RewardMomentDetector, StateChangeDetectOptions, StateChangeHandlers } from './RewardMomentDetector';
import { RewardOrchestrator } from './RewardOrchestrator';
import { CelebrationCardRenderer, MacroOverlayRenderer } from './renderers/DelightRenderers';
import { RewardMoment } from './types/RewardMoment';

export class RewardPresentationController implements RewardCelebrationPort {
  private readonly cardLayer: HTMLElement;
  private readonly macroLayer: HTMLElement;
  private readonly cardRenderer: CelebrationCardRenderer;
  private readonly macroRenderer: MacroOverlayRenderer;
  private readonly detector = new RewardMomentDetector();
  private readonly orchestrator: RewardOrchestrator;

  constructor(root: HTMLElement) {
    this.cardLayer = root.querySelector('#delight-card-layer')!;
    this.macroLayer = root.querySelector('#delight-macro-layer')!;
    this.cardRenderer = new CelebrationCardRenderer(this.cardLayer);
    this.macroRenderer = new MacroOverlayRenderer(this.macroLayer);
    this.orchestrator = new RewardOrchestrator((moment) => this.present(moment));
  }

  detectStateChange(
    previous: GameStateDto | null,
    next: GameStateDto,
    handlers: StateChangeHandlers = {},
    options: StateChangeDetectOptions = {},
  ): void {
    const moments = this.detector.detect(previous, next, handlers, options);
    this.orchestrator.enqueueMany(moments);
  }

  celebrateUpgradePurchased(upgradeId: string): void {
    const moment = this.detector.buildUpgradePurchasedMoment(upgradeId);
    if (moment) this.orchestrator.enqueue(moment);
  }

  celebrateShopPurchase(gear: GearDto): void {
    this.orchestrator.enqueue(this.detector.buildShopPurchaseMoment(gear));
  }

  celebrateForgeCreated(gear: GearDto): void {
    this.orchestrator.enqueue(this.detector.buildForgeCreatedMoment(gear));
  }

  celebrateAscension(heroName: string, heroEmoji: string): void {
    this.orchestrator.enqueue(this.detector.buildAscensionMoment(heroName, heroEmoji));
  }

  celebrateBatchLoot(gears: GearDto[]): void {
    if (gears.length === 0) return;
    if (gears.length === 1) {
      void this.celebrateLoot(gears[0]);
      return;
    }
    this.orchestrator.enqueue(this.detector.buildBatchLootMoment(gears));
  }

  async celebrateLoot(gear: GearDto): Promise<void> {
    const moment = this.detector.buildLootMoment(gear);
    if (!moment) return;

    await this.present(moment);
  }

  showIdleReport(snapshot: PanelSnapshot, state: GameStateDto): void {
    const moment = this.detector.buildIdleReport(snapshot, state);
    if (moment) this.orchestrator.enqueue(moment);
  }

  enqueue(moment: RewardMoment): void {
    this.orchestrator.enqueue(moment);
  }

  private present(moment: RewardMoment): Promise<void> {
    if (moment.tier === 'macro') {
      return this.macroRenderer.show(moment);
    }

    return this.cardRenderer.show(moment);
  }
}
