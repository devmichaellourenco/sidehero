import { RewardMoment } from '../delight/types/RewardMoment';
import { WowBanner } from './types/WowBanner';

const BATTLE_STRIP_KINDS = new Set<RewardMoment['kind']>(['phase_cleared']);

const EPHEMERAL_SKIP_KINDS = new Set<RewardMoment['kind']>(['phase_cleared', 'chest_available']);

export function mapRewardMomentToWowBanner(moment: RewardMoment): WowBanner | null {
  if (BATTLE_STRIP_KINDS.has(moment.kind)) return null;
  if (EPHEMERAL_SKIP_KINDS.has(moment.kind)) return null;

  return {
    id: moment.id,
    kind: mapKind(moment.kind),
    persistence: 'ephemeral',
    priority: moment.priority,
    tone: moment.tone,
    title: moment.title,
    subtitle: moment.subtitle,
    detailLines: moment.detailLines,
    eyebrow: eyebrowFor(moment.kind),
    iconUrl: moment.iconUrl,
    gear: moment.gear,
    heroPortrait: moment.heroPortrait,
    heroEmoji: moment.heroEmoji,
    cta: moment.cta
      ? {
          label: moment.cta.label,
          action: 'dismiss',
        }
      : { label: 'Entendi', action: 'dismiss' },
    displayMs: moment.autoDismissMs ?? 4200,
  };
}

function mapKind(kind: RewardMoment['kind']): WowBanner['kind'] {
  switch (kind) {
    case 'level_up':
      return 'level-up';
    case 'tier_up':
      return 'tier-up';
    case 'season_complete':
      return 'season-complete';
    case 'feature_unlock':
      return 'feature-unlock';
    case 'upgrade_purchased':
      return 'upgrade-purchased';
    case 'loot_received':
      return 'loot-received';
    case 'shop_purchase':
      return 'shop-purchase';
    case 'forge_created':
      return 'forge-created';
    case 'idle_report':
      return 'idle-report';
    default:
      return 'fallback';
  }
}

function eyebrowFor(kind: RewardMoment['kind']): string {
  switch (kind) {
    case 'level_up':
      return 'Level Up';
    case 'tier_up':
      return 'Progressão';
    case 'season_complete':
      return 'Conquista';
    case 'feature_unlock':
    case 'upgrade_purchased':
      return 'Desbloqueado';
    case 'loot_received':
    case 'shop_purchase':
      return 'Novo Item';
    case 'forge_created':
      return 'Forja Divina';
    case 'idle_report':
      return 'Enquanto você estava fora';
    default:
      return 'Recompensa';
  }
}
