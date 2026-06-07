import { isExtensionContextValid, isContextInvalidatedError } from '../messaging/ExtensionContext';

export interface SidebarPreferences {
  visible: boolean;
  collapsed: boolean;
  width: number;
}

const STORAGE_KEY = 'taskbar_hero_sidebar_prefs';

const DEFAULT_PREFS: SidebarPreferences = {
  visible: true,
  collapsed: false,
  width: 380,
};

export class SidebarPreferencesStore {
  async load(): Promise<SidebarPreferences> {
    if (!isExtensionContextValid()) {
      return { ...DEFAULT_PREFS };
    }

    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const raw = result[STORAGE_KEY] as Partial<SidebarPreferences> | undefined;
      return { ...DEFAULT_PREFS, ...raw };
    } catch (error) {
      if (isContextInvalidatedError(error)) {
        return { ...DEFAULT_PREFS };
      }
      throw error;
    }
  }

  async save(prefs: SidebarPreferences): Promise<void> {
    if (!isExtensionContextValid()) return;

    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: prefs });
    } catch (error) {
      if (!isContextInvalidatedError(error)) throw error;
    }
  }

  async update(partial: Partial<SidebarPreferences>): Promise<SidebarPreferences> {
    const current = await this.load();
    const next = { ...current, ...partial };
    await this.save(next);
    return next;
  }
}

export const SIDEBAR_ROOT_ID = 'taskbar-hero-sidebar-root';
export const SIDEBAR_LAYOUT_CLASS = 'taskbar-hero-sidebar-active';
export const SIDEBAR_COLLAPSED_CLASS = 'taskbar-hero-sidebar-collapsed';
export const SIDEBAR_WIDTH_VAR = '--taskbar-hero-sidebar-width';
export const SIDEBAR_COLLAPSED_WIDTH = 44;
