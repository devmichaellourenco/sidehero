import { GameStateDto, GearDto } from '../../application/dto/GameStateDto';
import { ShopOfferDto } from '../../application/dto/ShopOfferDto';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import { isExtensionContextValid, isContextInvalidatedError } from './ExtensionContext';

export type GameMessage =
  | { type: 'GET_STATE' }
  | { type: 'TICK'; ticks?: number }
  | { type: 'OPEN_CHEST'; chestId: string }
  | { type: 'OPEN_ALL_CHESTS' }
  | { type: 'EQUIP_GEAR'; heroId: string; gearId: string }
  | { type: 'EQUIP_BEST_LOADOUT'; gearIds?: string[] }
  | { type: 'UNEQUIP_GEAR'; heroId: string; slot: string }
  | { type: 'GET_SHOP_OFFERS' }
  | { type: 'BUY_SHOP_OFFER'; offerId: string }
  | { type: 'REFRESH_SHOP' }
  | { type: 'GET_UPGRADE_TREE' }
  | { type: 'PURCHASE_UPGRADE'; upgradeId: string };

export type GameResponse =
  | {
      ok: true;
      state: GameStateDto;
      openedGear?: GearDto;
      openedGears?: GearDto[];
      equippedCount?: number;
      shopOffers?: ShopOfferDto[];
      purchasedGear?: GearDto;
      shopRefreshCost?: number;
      canAffordShopRefresh?: boolean;
      shopRefreshUnlocked?: boolean;
      shopRefreshRemaining?: number;
      upgradeNodes?: UpgradeNodeDto[];
      purchasableUpgradeCount?: number;
      purchasedUpgradeId?: string;
    }
  | { ok: false; error: string };

export async function sendGameMessage(message: GameMessage): Promise<GameResponse> {
  if (!isExtensionContextValid()) {
    return { ok: false, error: 'Extension context invalidated' };
  }

  try {
    const response = (await chrome.runtime.sendMessage(message)) as GameResponse | undefined;
    return response ?? { ok: false, error: 'Sem resposta do service worker' };
  } catch (error) {
    if (isContextInvalidatedError(error)) {
      return { ok: false, error: 'Extension context invalidated' };
    }

    const errorMessage = error instanceof Error ? error.message : 'Erro ao comunicar com a extensão';
    return { ok: false, error: errorMessage };
  }
}
