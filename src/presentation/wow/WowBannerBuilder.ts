import { GameStateDto } from '../../application/dto/GameStateDto';
import { ASSETS, getAssetUrl } from '../assets/AssetCatalog';
import { buildPendingActions } from '../policies/PendingActionsPolicy';
import { WowBanner, WowBannerCta } from './types/WowBanner';

export interface WowPersistentHandlers {
  onChestOpen: () => void;
  onInventoryOpen: () => void;
  onUpgradesOpen: () => void;
  onHeroPointsOpen: () => void;
  onNewGame: () => void;
}

const PERSISTENT_PRIORITY: Record<string, number> = {
  'season-complete': 100,
  chest: 85,
  'hero-points': 70,
  'upgrade-tree': 65,
  'inventory-upgrade': 60,
  'chest-progress': 15,
};

export function buildPersistentWowBanners(state: GameStateDto, handlers: WowPersistentHandlers): WowBanner[] {
  const banners: WowBanner[] = [];

  if (state.seasonCompleted) {
    const sigilHint =
      state.meta && state.meta.sigils > 0
        ? `Você tem ${state.meta.sigils} selos de legado para investir.`
        : 'Conclua a temporada e ganhe selos para a próxima run.';

    banners.push({
      id: 'season-complete',
      kind: 'season-complete',
      persistence: 'persistent',
      priority: PERSISTENT_PRIORITY['season-complete'],
      tone: 'victory',
      eyebrow: 'Conquista',
      title: 'Temporada concluída!',
      subtitle: sigilHint,
      iconUrl: getAssetUrl(ASSETS.ui.victoryFrame),
      cta: { label: 'Novo jogo', action: 'new-game' },
    });
  }

  for (const action of buildPendingActions(state)) {
    const banner = mapPendingAction(action.kind, action.label, handlers);
    if (banner) banners.push(banner);
  }

  if (banners.length === 0) {
    banners.push(buildChestProgressBanner(state));
  }

  return banners.sort((left, right) => right.priority - left.priority);
}

function mapPendingAction(
  kind: ReturnType<typeof buildPendingActions>[number]['kind'],
  label: string,
  handlers: WowPersistentHandlers,
): WowBanner | null {
  const ctaMap: Record<typeof kind, WowBannerCta> = {
    chest: { label: 'Abrir baú', action: 'chest' },
    'inventory-upgrade': { label: 'Ver inventário', action: 'inventory-upgrade' },
    'upgrade-tree': { label: 'Ver melhorias', action: 'upgrade-tree' },
    'hero-points': { label: 'Distribuir pontos', action: 'hero-points' },
  };

  const toneMap: Record<typeof kind, WowBanner['tone']> = {
    chest: 'chest',
    'inventory-upgrade': 'loot',
    'upgrade-tree': 'unlock',
    'hero-points': 'level',
  };

  const iconMap: Record<typeof kind, string> = {
    chest: getAssetUrl(ASSETS.ui.chest),
    'inventory-upgrade': getAssetUrl(ASSETS.ui.inventory),
    'upgrade-tree': getAssetUrl(ASSETS.ui.stage),
    'hero-points': getAssetUrl(ASSETS.ui.energy),
  };

  void handlers;

  return {
    id: `pending-${kind}`,
    kind,
    persistence: 'persistent',
    priority: PERSISTENT_PRIORITY[kind] ?? 50,
    tone: toneMap[kind],
    eyebrow: 'Pendência',
    title: label,
    subtitle: 'Toque para resolver agora',
    iconUrl: iconMap[kind],
    cta: ctaMap[kind],
  };
}

function buildChestProgressBanner(state: GameStateDto): WowBanner {
  const progress = state.chestProgress;

  return {
    id: 'chest-progress',
    kind: 'chest-progress',
    persistence: 'persistent',
    priority: PERSISTENT_PRIORITY['chest-progress'],
    tone: 'neutral',
    eyebrow: 'Próxima recompensa',
    title: `${progress.current}/${progress.target} vitórias`,
    subtitle: 'Continue batalhando para ganhar um baú',
    iconUrl: getAssetUrl(ASSETS.ui.chest),
    progressRatio: progress.ratio,
  };
}
