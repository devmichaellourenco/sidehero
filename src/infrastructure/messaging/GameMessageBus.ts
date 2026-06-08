import { CombatFloatingEventDto } from '../../application/dto/CombatFloatingEventDto';
import { GameStateDto, GearDto } from '../../application/dto/GameStateDto';
import { ShopOfferDto } from '../../application/dto/ShopOfferDto';
import { AscensionOptionDto } from '../../application/dto/AscensionOptionDto';
import { SkillNodeDto } from '../../application/dto/SkillNodeDto';
import { UpgradeNodeDto } from '../../application/dto/UpgradeNodeDto';
import { isExtensionContextValid, isContextInvalidatedError } from './ExtensionContext';

export type SpendTargetMessage =
  | { type: 'attribute'; key: 'str' | 'dex' | 'int' }
  | { type: 'skill'; skillId: string };

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
  | { type: 'PURCHASE_UPGRADE'; upgradeId: string }
  | { type: 'SPEND_IMPROVEMENT_POINT'; heroId: string; target: SpendTargetMessage }
  | { type: 'GET_HERO_SKILL_TREE'; heroId: string }
  | { type: 'ACTIVATE_SKILL'; heroId: string; skillId: string }
  | { type: 'DEACTIVATE_SKILL'; heroId: string; skillId: string }
  | { type: 'ASCEND_CLASS'; heroId: string; ascensionId: string }
  | { type: 'GET_HERO_ASCENSION_TREE'; heroId: string }
  | { type: 'SPEND_ASCENSION_POINT'; heroId: string; skillId: string };

export type GameResponse =
  | {
      ok: true;
      state: GameStateDto;
      combatFloats?: CombatFloatingEventDto[];
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
      skillNodes?: SkillNodeDto[];
      ascensionOptions?: AscensionOptionDto[];
      ascensionName?: string | null;
      ascensionSkillNodes?: SkillNodeDto[];
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
