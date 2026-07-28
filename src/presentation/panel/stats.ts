import type { BattleStatsTabId } from '../components/BattleStatsPresentation';
import { renderBattleStatsBody } from '../components/BattleStatsPresentation';
import { applyStoredUiTheme } from '../components/GamePreferences';
import { mountNavArrowIcons } from '../assets/NavArrowPresentation';
import { hydratePanelIcons } from '../assets/PanelIconHydrator';
import { requestDockBattleStatsToSidePanel } from '../helpers/BattleStatsPinPreference';
import { getDefaultGameClient } from '../../infrastructure/messaging/defaultGameClient';

const POLL_MS = 500;
const TAB_KEY = 'sidehero_battle_stats_tab';
const TAB_IDS: readonly BattleStatsTabId[] = [
  'general',
  'damage',
  'healing',
  'taken',
  'mitigated',
  'crits',
];

function isBattleStatsTabId(value: string | null | undefined): value is BattleStatsTabId {
  return Boolean(value && (TAB_IDS as readonly string[]).includes(value));
}

function readTabPreference(): BattleStatsTabId {
  try {
    const raw = sessionStorage.getItem(TAB_KEY);
    return isBattleStatsTabId(raw) ? raw : 'general';
  } catch {
    return 'general';
  }
}

function writeTabPreference(tab: BattleStatsTabId): void {
  try {
    sessionStorage.setItem(TAB_KEY, tab);
  } catch {
    // sessionStorage indisponível
  }
}

function applyActiveTab(bodyEl: HTMLElement, activeTab: BattleStatsTabId): void {
  bodyEl.querySelectorAll('[data-battle-stats-tab]').forEach((button) => {
    const tab = button.getAttribute('data-battle-stats-tab');
    const active = tab === activeTab;
    button.classList.toggle('battle-stats-tab--active', active);
    button.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  bodyEl.querySelectorAll('[data-battle-stats-tab-panel]').forEach((panel) => {
    const tab = panel.getAttribute('data-battle-stats-tab-panel');
    const active = tab === activeTab;
    panel.classList.toggle('hidden', !active);
    if (active) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
  });
}

async function bootStatsWindow(): Promise<void> {
  applyStoredUiTheme();
  mountNavArrowIcons(document);
  hydratePanelIcons(document);

  const bodyEl = document.getElementById('battle-stats-body');
  const closeBtn = document.getElementById('stats-window-close');
  const pinBtn = document.getElementById('stats-window-pin');
  if (!bodyEl || !closeBtn) return;

  const client = getDefaultGameClient();
  let activeTab = readTabPreference();
  let lastHtml = '';

  closeBtn.addEventListener('click', () => {
    window.close();
  });

  pinBtn?.addEventListener('click', () => {
    void (async () => {
      await requestDockBattleStatsToSidePanel();
      await client.send({ type: 'CLOSE_BATTLE_STATS_WINDOW' });
      window.close();
    })();
  });

  bodyEl.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const tabBtn = target?.closest('[data-battle-stats-tab]') as HTMLElement | null;
    if (!tabBtn) return;
    const tab = tabBtn.getAttribute('data-battle-stats-tab');
    if (!isBattleStatsTabId(tab) || tab === activeTab) return;
    activeTab = tab;
    writeTabPreference(tab);
    applyActiveTab(bodyEl, activeTab);
  });

  const refresh = async (): Promise<void> => {
    if (!client.isContextValid()) return;
    const response = await client.send({ type: 'GET_STATE' });
    if (!response.ok) return;

    if (!response.state.featureFlags.battleStats) {
      bodyEl.innerHTML =
        '<p class="battle-stats-empty">Estatísticas de batalha ainda não desbloqueadas.</p>';
      lastHtml = bodyEl.innerHTML;
      return;
    }

    const html = renderBattleStatsBody(response.state, activeTab);
    if (html === lastHtml) {
      applyActiveTab(bodyEl, activeTab);
      return;
    }
    lastHtml = html;
    bodyEl.innerHTML = html;
    applyActiveTab(bodyEl, activeTab);
  };

  await refresh();
  window.setInterval(() => {
    void refresh();
  }, POLL_MS);
}

document.addEventListener('DOMContentLoaded', () => {
  void bootStatsWindow();
});
