import { GameStateDto, GearDto } from '../../application/dto/GameStateDto';
import { PanelSnapshot } from '../components/PanelStateSnapshot';
import { RewardCelebrationPort } from '../delight/RewardCelebrationPort';
import { RewardMomentDetector, StateChangeDetectOptions, StateChangeHandlers } from '../delight/RewardMomentDetector';
import { WowStripController } from '../wow/WowStripController';

export class RewardPresentationController implements RewardCelebrationPort {
  private readonly detector = new RewardMomentDetector();

  constructor(private readonly wowStrip: WowStripController) {}

  detectStateChange(
    previous: GameStateDto | null,
    next: GameStateDto,
    handlers: StateChangeHandlers = {},
    options: StateChangeDetectOptions = {},
  ): void {
    const moments = this.detector.detect(previous, next, handlers, options);
    for (const moment of moments) {
      this.wowStrip.enqueueMoment(moment);
    }
  }

  celebrateUpgradePurchased(upgradeId: string): void {
    const moment = this.detector.buildUpgradePurchasedMoment(upgradeId);
    if (moment) this.wowStrip.enqueueMoment(moment);
  }

  celebrateShopPurchase(gear: GearDto): void {
    this.wowStrip.enqueueMoment(this.detector.buildShopPurchaseMoment(gear));
  }

  celebrateForgeCreated(gear: GearDto): void {
    this.wowStrip.enqueueMoment(this.detector.buildForgeCreatedMoment(gear));
  }

  celebrateAscension(heroName: string, heroEmoji: string): void {
    this.wowStrip.enqueueMoment(this.detector.buildAscensionMoment(heroName, heroEmoji));
  }

  celebrateBatchLoot(gears: GearDto[]): void {
    if (gears.length === 0) return;
    if (gears.length === 1) {
      void this.celebrateLoot(gears[0]);
      return;
    }
    this.wowStrip.enqueueMoment(this.detector.buildBatchLootMoment(gears));
  }

  async celebrateLoot(gear: GearDto): Promise<void> {
    const moment = this.detector.buildLootMoment(gear);
    if (!moment) return;
    this.wowStrip.enqueueMoment(moment);
  }

  showIdleReport(snapshot: PanelSnapshot, state: GameStateDto): void {
    const moment = this.detector.buildIdleReport(snapshot, state);
    if (moment) this.wowStrip.enqueueMoment(moment);
  }
}
