import { GameMessage, GameResponse } from '../../infrastructure/messaging/GameMessageBus';
import {
  isInjectableUrl,
  sendToContentScript,
} from '../../infrastructure/messaging/ContentScriptBridge';
import { createGameApplication } from '../../infrastructure/di/createGameApplication';
import { SidebarPreferencesStore } from '../../infrastructure/storage/SidebarPreferences';

const TICK_ALARM = 'taskbar-hero-tick';
const TICK_INTERVAL_MINUTES = 0.1;

const app = createGameApplication();
const sidebarPrefsStore = new SidebarPreferencesStore();

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
  chrome.alarms.create(TICK_ALARM, { periodInMinutes: TICK_INTERVAL_MINUTES });

  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id) continue;
    await ensureSidebarOnTab(tab.id, tab.url);
  }
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
    await app.tick.execute(1);
  } catch (error) {
    console.error('[Side Hero] Erro no tick idle:', error);
  }
});

chrome.runtime.onMessage.addListener((
  message: GameMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: GameResponse) => void,
) => {
  handleMessage(message)
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
      const state = await app.tick.execute(message.ticks ?? 1);
      return { ok: true, state };
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
    default:
      return { ok: false, error: 'Mensagem desconhecida' };
  }
}
