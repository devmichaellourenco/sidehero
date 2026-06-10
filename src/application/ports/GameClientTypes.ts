import { CampaignOverviewDto } from '../dto/CampaignDto';
import { CombatFloatingEventDto } from '../dto/CombatFloatingEventDto';
import { GameStateDto, GearDto } from '../dto/GameStateDto';
import { ShopOfferDto } from '../dto/ShopOfferDto';
import { AscensionOptionDto } from '../dto/AscensionOptionDto';
import { SkillNodeDto } from '../dto/SkillNodeDto';
import { UpgradeNodeDto } from '../dto/UpgradeNodeDto';

export type SpendTargetMessage =
  | { type: 'attribute'; key: 'str' | 'dex' | 'int' }
  | { type: 'skill'; skillId: string };

export type GameMessage =
  | { type: 'GET_STATE' }
  | { type: 'GET_CAMPAIGN_OVERVIEW' }
  | { type: 'SELECT_PHASE'; phaseId: string }
  | { type: 'NEW_GAME' }
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
  | { type: 'SPEND_ASCENSION_POINT'; heroId: string; skillId: string }
  | { type: 'ADD_TO_PARTY'; heroId: string }
  | { type: 'REMOVE_FROM_PARTY'; heroId: string }
  | { type: 'MOVE_PARTY_MEMBER'; fromIndex: number; toIndex: number };

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
      campaign?: CampaignOverviewDto;
    }
  | { ok: false; error: string };
