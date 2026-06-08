const PANEL_PATH = 'panel/panel.html';

const BLOCKED_URL_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'edge://',
  'about:',
  'devtools://',
  'view-source:',
];

export function isSidePanelEligibleUrl(url?: string): boolean {
  if (!url) return false;
  return !BLOCKED_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

export async function enableSidePanelForTab(tabId: number): Promise<void> {
  try {
    await chrome.sidePanel.setOptions({
      tabId,
      path: PANEL_PATH,
      enabled: true,
    });
  } catch (error) {
    console.error('[Side Hero] Erro ao configurar sidePanel para aba:', error);
  }
}

export async function enableSidePanelForAllTabs(): Promise<void> {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id || !isSidePanelEligibleUrl(tab.url)) continue;
    await enableSidePanelForTab(tab.id);
  }
}

export function registerSidePanelLifecycle(): void {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete' || !tab.url) return;
    if (!isSidePanelEligibleUrl(tab.url)) return;
    void enableSidePanelForTab(tabId);
  });
}

export async function configureSidePanelBehavior(): Promise<void> {
  try {
    await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  } catch (error) {
    console.error('[Side Hero] Erro ao configurar comportamento do sidePanel:', error);
  }
}
