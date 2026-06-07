export type ContentScriptMessage =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_COLLAPSE' }
  | { type: 'SHOW_SIDEBAR' }
  | { type: 'HIDE_SIDEBAR' };

const CONTENT_SCRIPT_FILE = 'content/sidebar-host.js';

export function isInjectableUrl(url?: string): boolean {
  if (!url) return false;

  const blockedPrefixes = [
    'chrome://',
    'chrome-extension://',
    'edge://',
    'about:',
    'devtools://',
    'view-source:',
  ];

  return !blockedPrefixes.some((prefix) => url.startsWith(prefix));
}

export async function ensureContentScript(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [CONTENT_SCRIPT_FILE],
    });
  } catch {
    // Script já injetado ou aba indisponível
  }
}

export async function sendToContentScript(
  tabId: number,
  message: ContentScriptMessage,
): Promise<void> {
  await ensureContentScript(tabId);
  await chrome.tabs.sendMessage(tabId, message);
}
