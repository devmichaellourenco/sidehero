import { GameStateDto, GearDto } from '../../application/dto/GameStateDto';
import { PanelSnapshot } from '../components/PanelStateSnapshot';
import { RewardCelebrationPort } from '../delight/RewardCelebrationPort';
import { RewardMomentDetector, StateChangeDetectOptions, StateChangeHandlers } from '../delight/RewardMomentDetector';
import { WowCelebrationController } from '../wow/WowCelebrationController';

export class RewardPresentationController implements RewardCelebrationPort {
  private readonly detector = new RewardMomentDetector();

  constructor(private readonly wowCelebration: WowCelebrationController) {}

  detectStateChange(
    previous: GameStateDto | null,
    next: GameStateDto,
    handlers: StateChangeHandlers = {},
    options: StateChangeDetectOptions = {},
  ): void {
    const moments = this.detector.detect(previous, next, handlers, options);
    for (const moment of moments) {
      this.wowCelebration.enqueueMoment(moment);
    }
  }

  celebrateUpgradePurchased(upgradeId: string): void {
    const moment = this.detector.buildUpgradePurchasedMoment(upgradeId);
    if (moment) this.wowCelebration.enqueueMoment(moment);
  }

  celebrateShopPurchase(gear: GearDto): void {
    this.wowCelebration.enqueueMoment(this.detector.buildShopPurchaseMoment(gear));
  }

  celebrateForgeCreated(gear: GearDto): void {
    this.wowCelebration.enqueueMoment(this.detector.buildForgeCreatedMoment(gear));
  }

  celebrateAscension(heroName: string, heroEmoji: string): void {
    this.wowCelebration.enqueueMoment(this.detector.buildAscensionMoment(heroName, heroEmoji));
  }

  celebrateBatchLoot(gears: GearDto[]): void {
    if (gears.length === 0) return;
    if (gears.length === 1) {
      void this.celebrateLoot(gears[0]);
      return;
    }
    this.wowCelebration.enqueueMoment(this.detector.buildBatchLootMoment(gears));
  }

  async celebrateLoot(gear: GearDto): Promise<void> {
    const moment = this.detector.buildLootMoment(gear);
    if (!moment) return;
    this.wowCelebration.enqueueMoment(moment);
  }

  showIdleReport(snapshot: PanelSnapshot, state: GameStateDto): void {
    const moment = this.detector.buildIdleReport(snapshot, state);
    if (moment) this.wowCelebration.enqueueMoment(moment);
  }
}
