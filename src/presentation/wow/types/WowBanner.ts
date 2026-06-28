import { GearDto } from '../../../application/dto/GameStateDto';
import { RewardHeroPortrait } from '../../delight/RewardHeroPortrait';
import { PendingActionKind } from '../../policies/PendingActionsPolicy';

export type WowBannerAction = PendingActionKind | 'new-game' | 'dismiss';

export type WowBannerKind =
  | PendingActionKind
  | 'chest-progress'
  | 'season-complete'
  | 'idle-report'
  | 'level-up'
  | 'tier-up'
  | 'feature-unlock'
  | 'upgrade-purchased'
  | 'loot-received'
  | 'shop-purchase'
  | 'forge-created'
  | 'hero-unlock'
  | 'fallback';

export type WowBannerPersistence = 'persistent' | 'ephemeral';

export type WowBannerTone =
  | 'chest'
  | 'level'
  | 'victory'
  | 'loot'
  | 'unlock'
  | 'idle'
  | 'forge'
  | 'neutral';

export interface WowBannerCta {
  label: string;
  action: WowBannerAction;
}

export interface WowBanner {
  id: string;
  kind: WowBannerKind;
  persistence: WowBannerPersistence;
  priority: number;
  tone: WowBannerTone;
  title: string;
  subtitle?: string;
  detailLines?: string[];
  eyebrow?: string;
  iconUrl?: string;
  gear?: GearDto;
  heroPortrait?: RewardHeroPortrait;
  heroEmoji?: string;
  cta?: WowBannerCta;
  onCtaClick?: () => void;
  progressRatio?: number;
  displayMs?: number;
}
