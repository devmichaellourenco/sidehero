import { SIDEBAR_LAYOUT_CLASS, SIDEBAR_ROOT_ID } from '../../../infrastructure/storage/SidebarPreferences';

export function isYouTubeHost(): boolean {
  return /(^|\.)youtube\.com$/.test(location.hostname);
}

export function shouldUseFixedPatcher(): boolean {
  return !isYouTubeHost();
}

export function buildLayoutCss(widthPx: number): string {
  const contentWidth = `calc(100vw - ${widthPx}px)`;
  const rules = [buildSidebarCss(widthPx)];

  if (isYouTubeHost()) {
    rules.unshift(buildYouTubeCss(contentWidth, widthPx));
  } else {
    rules.unshift(buildBaseCss(widthPx));
    rules.push(buildAppRootsCss(contentWidth));

    if (isTwitter()) {
      rules.push(buildTwitterCss(contentWidth));
    }
  }

  return rules.join('\n');
}

function isTwitter(): boolean {
  return /(^|\.)(twitter|x)\.com$/.test(location.hostname);
}

function buildBaseCss(widthPx: number): string {
  return `
    html.${SIDEBAR_LAYOUT_CLASS} {
      width: 100vw !important;
      max-width: 100vw !important;
      padding-right: ${widthPx}px !important;
      box-sizing: border-box !important;
      overflow-x: hidden !important;
      margin-right: 0 !important;
    }

    html.${SIDEBAR_LAYOUT_CLASS} body {
      width: 100% !important;
      max-width: 100% !important;
      overflow-x: hidden !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding-right: 0 !important;
    }
  `;
}

function buildAppRootsCss(contentWidth: string): string {
  const roots = ['#root', '#app', '#__next', '#__nuxt', 'main', '[role="main"]'];
  const selectors = roots.map((r) => `html.${SIDEBAR_LAYOUT_CLASS} ${r}`).join(',\n');

  return `
    ${selectors} {
      width: ${contentWidth} !important;
      max-width: ${contentWidth} !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
    }
  `;
}

function buildYouTubeCss(contentWidth: string, sidebarWidthPx: number): string {
  const cls = SIDEBAR_LAYOUT_CLASS;
  const contentContainers = [
    'ytd-page-manager',
    'ytd-page-manager#page-manager',
    '#page-manager',
    'ytd-browse',
    'ytd-watch-flexy',
    'ytd-watch',
    'ytd-search',
    'ytd-shorts',
    'ytd-playlist-video-list-renderer',
  ];
  const contentSelectors = contentContainers
    .map((selector) => `html.${cls} ${selector}`)
    .join(',\n');

  const fixedSelectors = [
    'ytd-masthead',
    'ytd-masthead#masthead',
    'ytd-app-banner',
  ]
    .map((selector) => `html.${cls} ${selector}`)
    .join(',\n');

  return `
    html.${cls} {
      width: 100vw !important;
      max-width: 100vw !important;
      overflow-x: hidden !important;
      margin-right: 0 !important;
      padding-right: 0 !important;
      box-sizing: border-box !important;
    }

    html.${cls} body {
      width: 100% !important;
      max-width: 100% !important;
      overflow-x: hidden !important;
      box-sizing: border-box !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    html.${cls} ytd-app {
      width: ${contentWidth} !important;
      max-width: ${contentWidth} !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
    }

    ${fixedSelectors} {
      width: ${contentWidth} !important;
      max-width: ${contentWidth} !important;
      left: 0 !important;
      right: auto !important;
      box-sizing: border-box !important;
    }

    html.${cls} ytd-miniplayer {
      left: 0 !important;
      right: ${sidebarWidthPx}px !important;
      width: auto !important;
      max-width: none !important;
    }

    ${contentSelectors} {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
    }

    html.${cls} #cinematics-full-bleed-container,
    html.${cls} #cinematics,
    html.${cls} ytd-watch-flexy[theater] #full-bleed-container.ytd-watch-flexy,
    html.${cls} ytd-watch-flexy[theater] #player-wide-container.ytd-watch-flexy {
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
    }
  `;
}

function buildTwitterCss(contentWidth: string): string {
  const cls = SIDEBAR_LAYOUT_CLASS;
  return `
    html.${cls} #react-root,
    html.${cls} [data-testid="primaryColumn"],
    html.${cls} header[role="banner"] {
      width: ${contentWidth} !important;
      max-width: ${contentWidth} !important;
      min-width: 0 !important;
      box-sizing: border-box !important;
    }
  `;
}

function buildSidebarCss(widthPx: number): string {
  return `
    html.${SIDEBAR_LAYOUT_CLASS} #${SIDEBAR_ROOT_ID} {
      position: fixed !important;
      top: 0 !important;
      right: 0 !important;
      left: auto !important;
      width: ${widthPx}px !important;
      height: 100vh !important;
      z-index: 2147483646 !important;
    }
  `;
}
