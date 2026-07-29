import { FeatureFlagsDto } from '../../application/dto/FeatureFlagsDto';
import { ASSETS, getAssetUrl } from '../assets/AssetCatalog';

export interface FeatureUnlockMeta {
  title: string;
  subtitle: string;
  iconUrl: string;
}

type FeatureFlagKey = keyof FeatureFlagsDto;

const FEATURE_UNLOCK_META: Partial<Record<FeatureFlagKey, FeatureUnlockMeta>> = {
  divineForge: {
    title: 'Forja Divina',
    subtitle: 'Combine itens e eleve a raridade',
    iconUrl: getAssetUrl(ASSETS.ui.forge),
  },
  improvementReset: {
    title: 'Reset de Pontos',
    subtitle: 'Devolva pontos de aprimoramento',
    iconUrl: getAssetUrl(ASSETS.ui.improvement),
  },
  itemStash: {
    title: 'Baú de Itens',
    subtitle: 'Armazene equipamentos extras',
    iconUrl: getAssetUrl(ASSETS.ui.inventory),
  },
  openAllChests: {
    title: 'Abrir Todos',
    subtitle: 'Abra todos os baús de uma vez',
    iconUrl: getAssetUrl(ASSETS.ui.chestOpen),
  },
  autoOpenChests: {
    title: 'Auto-abrir Baús',
    subtitle: 'Baús abertos automaticamente',
    iconUrl: getAssetUrl(ASSETS.ui.chest),
  },
  optimizeLoadout: {
    title: 'Otimizar Loadout',
    subtitle: 'Equipe o melhor gear automaticamente',
    iconUrl: getAssetUrl(ASSETS.ui.attack),
  },
  autoEquipLoot: {
    title: 'Auto-equipar Loot',
    subtitle: 'Novos itens equipados na hora',
    iconUrl: getAssetUrl(ASSETS.ui.inventory),
  },
  shopRefresh: {
    title: 'Renovar Loja',
    subtitle: 'Novas ofertas disponíveis',
    iconUrl: getAssetUrl(ASSETS.ui.shop),
  },
  // OFFLINE PROGRESS DESATIVADO (2026-07)
  // backgroundTick: {
  //   title: 'Progresso Offline',
  //   subtitle: 'O jogo avança com o painel fechado',
  //   iconUrl: getAssetUrl(ASSETS.ui.energy),
  // },
};

export function getFeatureUnlockMeta(flag: FeatureFlagKey): FeatureUnlockMeta | null {
  return FEATURE_UNLOCK_META[flag] ?? null;
}

export function detectNewlyUnlockedFeatures(
  previous: FeatureFlagsDto,
  next: FeatureFlagsDto,
): FeatureFlagKey[] {
  const unlocked: FeatureFlagKey[] = [];

  for (const key of Object.keys(FEATURE_UNLOCK_META) as FeatureFlagKey[]) {
    const wasEnabled = Boolean(previous[key]);
    const isEnabled = Boolean(next[key]);
    if (!wasEnabled && isEnabled) {
      unlocked.push(key);
    }
  }

  return unlocked;
}
