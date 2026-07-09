export interface CampaignSceneAssets {
  battleLeft?: string;
  battleRight?: string;
  banner?: string;
  /** Horizonte/céu em largura total (atrás dos painéis L/R). */
  battleBackdrop?: string;
  /** Faixa central entre os painéis laterais. */
  battleCenter?: string;
  /** Textura de chão em tile horizontal (`repeat-x`). */
  floorTile?: string;
}

const CAMPAIGN_SCENES: Record<string, CampaignSceneAssets> = {
  stendra: {
    battleLeft: 'campaign/stendra/battle_stendra_left.png',
    battleRight: 'campaign/stendra/battle_stendra_right.png',
    banner: 'campaign/stendra/campaign_stendra_banner.png',
    floorTile: 'campaign/stendra/floor_stendra_tile.png',
  },
  gruftall: {
    /** Arte em `public/sprites/campaign/grutfall/` (basename do diretório de assets). */
    banner: 'campaign/grutfall/campaign_grutfall_banner.png',
  },
  valdris: {
    banner: 'campaign/valdris/campaign_valdris_banner.png',
  },
  morthaven: {
    banner: 'campaign/morthaven/campaign_morthaven_banner.png',
  },
};

export function getCampaignScene(mapId: string): CampaignSceneAssets | null {
  return CAMPAIGN_SCENES[mapId] ?? null;
}

/** Painéis L/R (e opcionalmente chão) na battle strip. */
export function hasCampaignScene(mapId: string): boolean {
  const scene = CAMPAIGN_SCENES[mapId];
  return Boolean(scene?.battleLeft && scene?.battleRight);
}

export function hasCampaignBanner(mapId: string): boolean {
  return Boolean(CAMPAIGN_SCENES[mapId]?.banner);
}
