import { GameMessage, GameResponse } from '../../infrastructure/messaging/GameMessageBus';
import {
  isInjectableUrl,
  sendToContentScript,
} from '../../infrastructure/messaging/ContentScriptBridge';
import { createGameApplication } from '../../infrastructure/di/createGameApplication';
import { SidebarPreferencesStore } from '../../infrastructure/storage/SidebarPreferences';
import {
  syncBackgroundTickAlarm,
  TICK_ALARM,
} from '../../infrastructure/background/BackgroundTickScheduler';
import { SerialTaskRunner } from '../../infrastructure/background/SerialTaskRunner';

const app = createGameApplication();
const sidebarPrefsStore = new SidebarPreferencesStore();
const stateMutations = new SerialTaskRunner();

async function syncTickAlarmFromState(): Promise<void> {
  const state = await app.getState.execute();
  await syncBackgroundTickAlarm(state.upgradeLevels);
}

async function ensureSidebarOnTab(tabId: number, url?: string): Promise<void> {
  if (!isInjectableUrl(url)) return;

  const prefs = await sidebarPrefsStore.load();
  if (!prefs.visible) return;

  try {
    await sendToContentScript(tabId, { type: 'ENSURE_SIDEBAR' });
  } catch {
    // Aba pode estar em carregamento ou restrita
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  await syncTickAlarmFromState();

  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id) continue;
    await ensureSidebarOnTab(tab.id, tab.url);
  }
});

chrome.runtime.onStartup.addListener(() => {
  void syncTickAlarmFromState();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  void ensureSidebarOnTab(tabId, tab.url);
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab?.id || !isInjectableUrl(tab.url)) return;

  try {
    await sendToContentScript(tab.id, { type: 'TOGGLE_SIDEBAR' });
  } catch (error) {
    console.error('[Side Hero] Falha ao alternar painel:', error);
  }
});

chrome.alarms.onAlarm.addListener(async (alarm: chrome.alarms.Alarm) => {
  if (alarm.name !== TICK_ALARM) return;

  try {
    const state = await app.getState.execute();
    await syncBackgroundTickAlarm(state.upgradeLevels);

    const tickLevel = state.upgradeLevels.background_tick ?? 0;
    if (tickLevel < 1) return;

    await stateMutations.run(() => app.tick.execute(1));
  } catch (error) {
    console.error('[Side Hero] Erro no tick idle:', error);
  }
});

chrome.runtime.onMessage.addListener((
  message: GameMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: GameResponse) => void,
) => {
  stateMutations
    .run(() => handleMessage(message))
    .then(sendResponse)
    .catch((error: Error) => {
      const response: GameResponse = { ok: false, error: error.message };
      sendResponse(response);
    });

  return true;
});

async function handleMessage(message: GameMessage): Promise<GameResponse> {
  switch (message.type) {
    case 'GET_STATE': {
      const state = await app.getState.execute();
      return { ok: true, state };
    }
    case 'TICK': {
      const result = await app.tick.execute(message.ticks ?? 1);
      await syncBackgroundTickAlarm(result.state.upgradeLevels);
      return { ok: true, state: result.state, combatFloats: result.combatFloats };
    }
    case 'OPEN_CHEST': {
      const result = await app.openChest.execute(message.chestId);
      return { ok: true, state: result.state, openedGear: result.openedGear };
    }
    case 'OPEN_ALL_CHESTS': {
      const result = await app.openAllChests.execute();
      return { ok: true, state: result.state, openedGears: result.openedGears };
    }
    case 'EQUIP_GEAR': {
      const state = await app.equipGear.execute(message.heroId, message.gearId);
      return { ok: true, state };
    }
    case 'EQUIP_BEST_LOADOUT': {
      const result = await app.equipBestLoadout.execute(message.gearIds);
      return { ok: true, state: result.state, equippedCount: result.equippedCount };
    }
    case 'UNEQUIP_GEAR': {
      const state = await app.unequipGear.execute(
        message.heroId,
        message.slot as 'weapon' | 'armor' | 'accessory',
      );
      return { ok: true, state };
    }
    case 'GET_SHOP_OFFERS': {
      const result = await app.getShopOffers.execute();
      return {
        ok: true,
        state: result.state,
        shopOffers: result.offers,
        shopRefreshCost: result.refreshCost,
        canAffordShopRefresh: result.canAffordRefresh,
        shopRefreshUnlocked: result.shopRefreshUnlocked,
        shopRefreshRemaining: result.shopRefreshRemaining,
      };
    }
    case 'BUY_SHOP_OFFER': {
      const result = await app.buyShopOffer.execute(message.offerId);
      return { ok: true, state: result.state, purchasedGear: result.purchasedGear };
    }
    case 'REFRESH_SHOP': {
      const result = await app.refreshShop.execute();
      return {
        ok: true,
        state: result.state,
        shopOffers: result.offers,
        shopRefreshCost: result.refreshCost,
        canAffordShopRefresh: result.canAffordRefresh,
        shopRefreshRemaining: result.shopRefreshRemaining,
        shopRefreshUnlocked: true,
      };
    }
    case 'GET_UPGRADE_TREE': {
      const result = await app.getUpgradeTree.execute();
      return {
        ok: true,
        state: result.state,
        upgradeNodes: result.nodes,
        purchasableUpgradeCount: result.purchasableCount,
      };
    }
    case 'PURCHASE_UPGRADE': {
      const result = await app.purchaseUpgrade.execute(message.upgradeId);
      await syncBackgroundTickAlarm(result.state.upgradeLevels);
      return {
        ok: true,
        state: result.state,
        upgradeNodes: result.nodes,
        purchasableUpgradeCount: result.purchasableCount,
        purchasedUpgradeId: result.purchasedUpgradeId,
      };
    }
    case 'SPEND_IMPROVEMENT_POINT': {
      const state = await app.spendImprovementPoint.execute(message.heroId, message.target);
      return { ok: true, state };
    }
    case 'GET_HERO_SKILL_TREE': {
      const result = await app.getHeroSkillTree.execute(message.heroId);
      return { ok: true, state: result.state, skillNodes: result.nodes };
    }
    case 'ACTIVATE_SKILL': {
      const state = await app.activateSkill.execute(message.heroId, message.skillId);
      return { ok: true, state };
    }
    case 'DEACTIVATE_SKILL': {
      const state = await app.deactivateSkill.execute(message.heroId, message.skillId);
      return { ok: true, state };
    }
    case 'ASCEND_CLASS': {
      const state = await app.ascendClass.execute(message.heroId, message.ascensionId);
      return { ok: true, state };
    }
    case 'GET_HERO_ASCENSION_TREE': {
      const result = await app.getHeroAscensionTree.execute(message.heroId);
      return {
        ok: true,
        state: result.state,
        ascensionOptions: result.options,
        ascensionName: result.ascensionName,
        ascensionSkillNodes: result.ascensionSkillNodes,
      };
    }
    case 'SPEND_ASCENSION_POINT': {
      const state = await app.spendAscensionPoint.execute(message.heroId, message.skillId);
      return { ok: true, state };
    }
    default:
      return { ok: false, error: 'Mensagem desconhecida' };
  }
}
