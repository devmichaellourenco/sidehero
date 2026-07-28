import { CampaignOverviewDto } from '../dto/CampaignDto';
import { CombatFloatingEventDto } from '../dto/CombatFloatingEventDto';
import { CombatSkillVfxDto } from '../dto/CombatSkillVfxDto';
import { GameStateDto, GearDto } from '../dto/GameStateDto';
import { ShopOfferDto } from '../dto/ShopOfferDto';
import { AscensionOptionDto } from '../dto/AscensionOptionDto';
import { SkillNodeDto } from '../dto/SkillNodeDto';
import { UpgradeNodeDto } from '../dto/UpgradeNodeDto';
import { MetaNodeDto } from '../dto/MetaDto';
import { AchievementListEntryDto, AchievementUpdateDto } from '../dto/AchievementDto';
import { MassRefundPreviewDto } from '../dto/MassRefundPreviewDto';

export type SpendTargetMessage =
  | { type: 'attribute'; key: 'str' | 'dex' | 'int' }
  | { type: 'skill'; skillId: string };

export type GameMessage =
  | { type: 'GET_STATE' }
  | { type: 'MARK_ACT_SCENE_VIEWED'; sceneId: string }
  | { type: 'GET_CAMPAIGN_OVERVIEW' }
  | { type: 'SELECT_PHASE'; phaseId: string }
  | { type: 'NEW_GAME' }
  | { type: 'PAUSE_FOR_LOADOUT' }
  | { type: 'PAUSE_BATTLE' }
  | { type: 'RESUME_BATTLE' }
  | { type: 'TICK'; ticks?: number; restartCurrentPhase?: boolean }
  | { type: 'RESUME_COMBAT_INTERMISSION' }
  | { type: 'OPEN_CHEST'; chestId: string }
  | { type: 'OPEN_ALL_CHESTS' }
  | { type: 'EQUIP_GEAR'; heroId: string; gearId: string }
  | { type: 'EQUIP_BEST_LOADOUT'; gearIds?: string[] }
  | { type: 'UNEQUIP_GEAR'; heroId: string; slot: string }
  | { type: 'MOVE_GEAR_TO_STASH'; gearId: string }
  | { type: 'MOVE_GEAR_FROM_STASH'; gearId: string }
  | { type: 'DESTROY_GEAR'; gearId: string; location: 'inventory' | 'stash' }
  | { type: 'FORGE_FUSE_GEAR'; gearIds: string[] }
  | { type: 'FORGE_SALVAGE_GEAR'; gearId: string }
  | { type: 'GET_SHOP_OFFERS' }
  | { type: 'BUY_SHOP_OFFER'; offerId: string }
  | { type: 'REFRESH_SHOP' }
  | { type: 'GET_UPGRADE_TREE' }
  | { type: 'PURCHASE_UPGRADE'; upgradeId: string }
  | { type: 'GET_META_TREE' }
  | { type: 'PURCHASE_META_UPGRADE'; upgradeId: string }
  | { type: 'GET_ACHIEVEMENTS' }
  | { type: 'SPEND_IMPROVEMENT_POINT'; heroId: string; target: SpendTargetMessage }
  | { type: 'REFUND_IMPROVEMENT_POINT'; heroId: string; target: SpendTargetMessage }
  | { type: 'MASS_REFUND_IMPROVEMENT_POINTS'; heroId: string }
  | { type: 'PREVIEW_MASS_REFUND_IMPROVEMENT_POINTS'; heroId: string }
  | { type: 'GET_HERO_SKILL_TREE'; heroId: string }
  | { type: 'ASSIGN_SKILL_SLOT'; heroId: string; skillId: string; slotIndex: number }
  | { type: 'DEACTIVATE_SKILL'; heroId: string; skillId: string }
  | { type: 'ASCEND_CLASS'; heroId: string; ascensionId: string }
  | { type: 'GET_HERO_ASCENSION_TREE'; heroId: string }
  | { type: 'SPEND_ASCENSION_POINT'; heroId: string; skillId: string }
  | { type: 'ADD_TO_PARTY'; heroId: string }
  | { type: 'REMOVE_FROM_PARTY'; heroId: string }
  | { type: 'MOVE_PARTY_MEMBER'; fromIndex: number; toIndex: number }
  | { type: 'SET_PARTY_SLOT'; slotIndex: number; heroId: string }
  | { type: 'OPEN_DETACHED_SURFACE'; surfaceId: string }
  | { type: 'CLOSE_DETACHED_SURFACE'; surfaceId: string };

export type GameResponse =
  | {
      ok: true;
      state: GameStateDto;
      combatFloats?: CombatFloatingEventDto[];
      combatSkillVfx?: CombatSkillVfxDto[];
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
      metaNodes?: MetaNodeDto[];
      purchasableMetaCount?: number;
      purchasedMetaUpgradeId?: string;
      sigilsAwarded?: number;
      achievementUpdates?: AchievementUpdateDto[];
      achievements?: AchievementListEntryDto[];
      completedAchievementCount?: number;
      totalAchievementCount?: number;
      forgedGear?: GearDto;
      salvageGold?: number;
      campaign?: CampaignOverviewDto;
      refundWarnings?: string[];
      pointsRefunded?: number;
      ascensionPointsRefunded?: number;
      massRefundPreview?: MassRefundPreviewDto;
    }
  | { ok: false; error: string };
