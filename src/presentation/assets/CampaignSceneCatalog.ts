export interface CampaignSceneAssets {
  /** Imagem única de fundo da battle strip (333×133 ou proporcional). */
  battleBackground?: string;
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
    battleBackground: 'campaign/stendra/cenario_stendra.jpeg',
    banner: 'campaign/stendra/campaign_stendra_banner.png',
    // Painéis L/R + chão tiled (legado — reativar se voltar ao layout em camadas):
    // battleLeft: 'campaign/stendra/battle_stendra_left.png',
    // battleRight: 'campaign/stendra/battle_stendra_right.png',
    // floorTile: 'campaign/stendra/floor_stendra_tile.png',
  },
  gruftall: {
    battleBackground: 'campaign/grutfall/cenario_grutfall.png',
    /** Arte em `public/sprites/campaign/grutfall/` (basename do diretório de assets). */
    banner: 'campaign/grutfall/campaign_grutfall_banner.png',
  },
  valdris: {
    battleBackground: 'campaign/valdris/cenario_valdris.png',
    banner: 'campaign/valdris/campaign_valdris_banner.png',
  },
  morthaven: {
    battleBackground: 'campaign/morthaven/cenario_morthaven.png',
    banner: 'campaign/morthaven/campaign_morthaven_banner.png',
  },
};

export function getCampaignScene(mapId: string): CampaignSceneAssets | null {
  return CAMPAIGN_SCENES[mapId] ?? null;
}

/** Cena de batalha na strip (fundo único ou painéis L/R). */
export function hasCampaignScene(mapId: string): boolean {
  const scene = CAMPAIGN_SCENES[mapId];
  return Boolean(scene?.battleBackground || (scene?.battleLeft && scene?.battleRight));
}

export function hasCampaignBanner(mapId: string): boolean {
  return Boolean(CAMPAIGN_SCENES[mapId]?.banner);
}
