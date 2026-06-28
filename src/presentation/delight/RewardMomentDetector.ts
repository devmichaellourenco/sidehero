import { GameStateDto, GearDto } from '../../application/dto/GameStateDto';
import { getUpgradeById } from '../../domain/upgrades/UpgradeCatalog';
import { ASSETS, getAssetUrl } from '../assets/AssetCatalog';
import { PanelSnapshot } from '../components/PanelStateSnapshot';
import {
  detectNewlyUnlockedFeatures,
  getFeatureUnlockMeta,
} from './FeatureUnlockCatalog';
import {
  LOOT_CELEBRATION_RARITIES,
  REWARD_AUTO_DISMISS_MS,
  REWARD_KIND_PRIORITY,
  REWARD_KIND_TIER,
} from './RewardMomentCatalog';
import { rewardHeroPortraitFromClass, rewardHeroPortraitFromDto } from './RewardHeroPortrait';

let momentCounter = 0;

function nextMomentId(prefix: string): string {
  momentCounter += 1;
  return `${prefix}-${momentCounter}-${Date.now()}`;
}

function buildMoment(
  kind: RewardMoment['kind'],
  partial: Omit<RewardMoment, 'id' | 'kind' | 'tier' | 'priority'> & { priority?: number },
): RewardMoment {
  return {
    id: nextMomentId(kind),
    kind,
    tier: REWARD_KIND_TIER[kind],
    priority: partial.priority ?? REWARD_KIND_PRIORITY[kind],
    autoDismissMs: partial.autoDismissMs ?? REWARD_AUTO_DISMISS_MS[kind],
    ...partial,
  };
}

export interface StateChangeHandlers {
  onChestAvailable?: () => void;
}

export interface StateChangeDetectOptions {
  skipVictoryRewards?: boolean;
}

export class RewardMomentDetector {
  detect(
    previous: GameStateDto | null,
    next: GameStateDto,
    handlers: StateChangeHandlers = {},
    options: StateChangeDetectOptions = {},
  ): RewardMoment[] {
    if (!previous) return [];

    const moments: RewardMoment[] = [];
    const skipVictoryRewards = options.skipVictoryRewards === true;

    if (!skipVictoryRewards && next.pendingChestCount > previous.pendingChestCount) {
      const count = next.pendingChestCount - previous.pendingChestCount;
      const newestChest = next.chests.filter((chest) => !chest.opened).at(-1);
      const title =
        count === 1 && newestChest ? newestChest.chestLabel : count === 1 ? 'Baú disponível!' : `${count} baús!`;

      moments.push(
        buildMoment('chest_available', {
          title,
          subtitle: 'Uma recompensa espera por você',
          tone: 'chest',
          iconUrl: getAssetUrl(ASSETS.ui.chest),
          cta: handlers.onChestAvailable
            ? { label: 'Abrir agora', onClick: handlers.onChestAvailable }
            : undefined,
        }),
      );
    }

    if (!skipVictoryRewards && next.stage > previous.stage) {
      moments.push(
        buildMoment('tier_up', {
          title: `Tier ${next.stage}`,
          subtitle: 'Boss derrotado — inimigos evoluíram',
          tone: 'victory',
          iconUrl: getAssetUrl(ASSETS.ui.stage),
        }),
      );
    }

    const clearedNow = next.campaignProgress.clearedPhaseIds.filter(
      (phaseId) => !previous.campaignProgress.clearedPhaseIds.includes(phaseId),
    );

    if (!skipVictoryRewards && !previous.seasonCompleted && next.seasonCompleted) {
      moments.push(
        buildMoment('season_complete', {
          title: 'Temporada Concluída!',
          subtitle: 'Você venceu a campanha desta run',
          tone: 'victory',
          iconUrl: getAssetUrl(ASSETS.ui.victoryFrame),
          detailLines: ['Inicie um novo jogo quando quiser continuar'],
        }),
      );
    } else if (!skipVictoryRewards && clearedNow.length > 0) {
      const phase = clearedNow[clearedNow.length - 1];
      moments.push(
        buildMoment('phase_cleared', {
          title: `Fase ${phase} limpa!`,
          subtitle: 'Campanha avançando',
          tone: 'victory',
          iconUrl: getAssetUrl(ASSETS.ui.campaign),
        }),
      );
    }

    if (!skipVictoryRewards) {
      const levelUps = next.heroes
        .map((hero) => {
          const oldHero = previous.heroes.find((entry) => entry.id === hero.id);
          if (!oldHero || hero.level <= oldHero.level) return null;
          return `${hero.emoji} ${hero.name} → Lv.${hero.level}`;
        })
        .filter((line): line is string => Boolean(line));

      if (levelUps.length === 1) {
        const hero = next.heroes.find((entry) => {
          const oldHero = previous.heroes.find((old) => old.id === entry.id);
          return oldHero && entry.level > oldHero.level;
        });
        moments.push(
          buildMoment('level_up', {
            title: `Lv.${hero?.level ?? ''}`,
            subtitle: hero ? `${hero.name} ficou mais forte` : levelUps[0],
            tone: 'level',
            heroEmoji: hero?.emoji,
          }),
        );
      } else if (levelUps.length > 1) {
        moments.push(
          buildMoment('level_up', {
            title: `${levelUps.length} heróis subiram!`,
            subtitle: 'A party evoluiu na batalha',
            tone: 'level',
            detailLines: levelUps,
          }),
        );
      }
    }

    for (const flag of detectNewlyUnlockedFeatures(previous.featureFlags, next.featureFlags)) {
      const meta = getFeatureUnlockMeta(flag);
      if (!meta) continue;

      moments.push(
        buildMoment('feature_unlock', {
          title: meta.title,
          subtitle: meta.subtitle,
          tone: 'unlock',
          iconUrl: meta.iconUrl,
        }),
      );
    }

    const newHeroes = next.heroes.filter(
      (hero) => !previous.heroes.some((entry) => entry.id === hero.id),
    );
    for (const hero of newHeroes) {
      moments.push(
        buildMoment('feature_unlock', {
          title: `${hero.name} entrou na reserva!`,
          subtitle: 'Novo herói disponível na formação',
          tone: 'unlock',
          heroPortrait: rewardHeroPortraitFromDto(hero),
          priority: REWARD_KIND_PRIORITY.feature_unlock,
        }),
      );
    }

    return moments;
  }

  buildLootMoment(gear: GearDto): RewardMoment | null {
    if (!LOOT_CELEBRATION_RARITIES.has(gear.rarity)) return null;

    return buildMoment('loot_received', {
      title: gear.name,
      subtitle: `Item ${gear.rarity} recebido`,
      tone: 'loot',
      gear,
    });
  }

  buildShopPurchaseMoment(gear: GearDto): RewardMoment {
    return buildMoment('shop_purchase', {
      title: gear.name,
      subtitle: 'Compra concluída na loja',
      tone: 'loot',
      gear,
    });
  }

  buildForgeCreatedMoment(gear: GearDto): RewardMoment {
    return buildMoment('forge_created', {
      title: gear.name,
      subtitle: 'Forja concluída com sucesso',
      tone: 'forge',
      gear,
    });
  }

  buildAscensionMoment(heroName: string, heroEmoji: string): RewardMoment {
    return buildMoment('upgrade_purchased', {
      title: 'Ascensão!',
      subtitle: `${heroName} alcançou uma nova classe`,
      tone: 'unlock',
      heroEmoji,
      priority: REWARD_KIND_PRIORITY.feature_unlock,
    });
  }

  buildBatchLootMoment(gears: GearDto[]): RewardMoment {
    const rareGears = gears.filter((gear) => LOOT_CELEBRATION_RARITIES.has(gear.rarity));
    const headline = gears.length === 1 ? gears[0].name : `${gears.length} itens dos baús!`;
    const featured = rareGears[0] ?? gears[0];

    return buildMoment('loot_received', {
      title: headline,
      subtitle: rareGears.length > 0 ? `${rareGears.length} item(ns) raro(s) ou melhor` : 'Loot adicionado ao inventário',
      tone: 'loot',
      gear: featured,
      detailLines: gears.slice(0, 5).map((gear) => gear.name),
      autoDismissMs: 3800,
    });
  }

  buildUpgradePurchasedMoment(upgradeId: string): RewardMoment | null {
    const upgrade = getUpgradeById(upgradeId);
    if (!upgrade) return null;

    const heroPortrait = upgrade.unlockHeroClass
      ? rewardHeroPortraitFromClass(upgrade.unlockHeroClass)
      : null;

    return buildMoment('upgrade_purchased', {
      title: upgrade.name,
      subtitle: upgrade.description,
      tone: 'unlock',
      heroPortrait: heroPortrait ?? undefined,
      iconUrl: heroPortrait ? undefined : this.upgradeIconFor(upgrade.feature),
    });
  }

  buildIdleReport(snapshot: PanelSnapshot, state: GameStateDto): RewardMoment | null {
    const stagesGained = state.stage - snapshot.stage;
    const goldGained = state.gold - snapshot.gold;
    const chestsGained = state.pendingChestCount - snapshot.pendingChestCount;

    const levelUps = state.heroes
      .filter((hero) => {
        const previousLevel = snapshot.heroLevels[hero.id];
        return previousLevel !== undefined && hero.level > previousLevel;
      })
      .map((hero) => `${hero.emoji} ${hero.name} Lv.${hero.level}`);

    const detailLines: string[] = [];

    if (stagesGained > 0) {
      detailLines.push(`+${stagesGained} tier${stagesGained > 1 ? 's' : ''}`);
    }
    if (goldGained > 0) {
      detailLines.push(`+${goldGained} ouro`);
    }
    if (chestsGained > 0) {
      detailLines.push(`+${chestsGained} baú${chestsGained > 1 ? 's' : ''}`);
    }
    detailLines.push(...levelUps);

    if (detailLines.length === 0) return null;

    return buildMoment('idle_report', {
      title: 'Progresso Offline',
      subtitle: 'Sua party continuou avançando',
      tone: 'idle',
      iconUrl: getAssetUrl(ASSETS.ui.energy),
      detailLines,
    });
  }

  private upgradeIconFor(feature: string): string {
    if (feature === 'divine_forge') return getAssetUrl(ASSETS.ui.forge);
    if (feature === 'item_stash') return getAssetUrl(ASSETS.ui.inventory);
    if (feature.includes('hero_unlock')) return getAssetUrl(ASSETS.ui.attack);
    if (feature === 'auto_battle') return getAssetUrl(ASSETS.ui.attack);
    if (feature === 'background_tick') return getAssetUrl(ASSETS.ui.energy);
    if (feature.includes('chest')) return getAssetUrl(ASSETS.ui.chest);
    return getAssetUrl(ASSETS.ui.stage);
  }
}
