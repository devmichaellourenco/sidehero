import { CampaignId, MapId, PhaseId } from './CampaignIds';
import { WaveDefinition } from './WaveDefinition';

export interface PhaseDefinition {
  id: PhaseId;
  campaignId: CampaignId;
  mapId: MapId;
  displayName: string;
  difficultyTier: number;
  waves: WaveDefinition[];
  /** Fases desbloqueadas ao derrotar o boss. Suporta múltiplos IDs para bifurcações futuras. */
  unlocks: PhaseId[];
  /** Boss de capítulo a cada 50 fases — inimigos mais fortes. */
  milestoneBoss?: boolean;
  /** Última fase da temporada (10-50). */
  seasonFinale?: boolean;
  /** Multiplicador extra de stats dos inimigos desta fase. */
  statMultiplier?: number;
}
