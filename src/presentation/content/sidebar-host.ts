import { SidebarPreferencesStore } from '../../infrastructure/storage/SidebarPreferences';
import { ContentMessage, SidebarHost } from './SidebarHost';

const HOST_KEY = '__taskbarHeroSidebarHost';
const LISTENER_KEY = '__taskbarHeroSidebarListener';

type HostWindow = Window & {
  [HOST_KEY]?: SidebarHost;
  [LISTENER_KEY]?: boolean;
};

function getHostWindow(): HostWindow {
  return window as HostWindow;
}

function getOrCreateHost(): SidebarHost {
  const win = getHostWindow();

  if (!win[HOST_KEY]) {
    win[HOST_KEY] = new SidebarHost(new SidebarPreferencesStore());
    void win[HOST_KEY].init();
  }

  return win[HOST_KEY];
}

const host = getOrCreateHost();

if (!getHostWindow()[LISTENER_KEY]) {
  getHostWindow()[LISTENER_KEY] = true;

  chrome.runtime.onMessage.addListener((message: ContentMessage) => {
    switch (message.type) {
      case 'TOGGLE_SIDEBAR':
        void host.toggleVisibility();
        break;
      case 'TOGGLE_COLLAPSE':
        void host.toggleCollapse();
        break;
      case 'SHOW_SIDEBAR':
        void host.show();
        break;
      case 'HIDE_SIDEBAR':
        void host.hide();
        break;
    }
  });
}
