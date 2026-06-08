# 068 — Migração para Chrome Side Panel API

## Objetivo

Substituir o sidebar injetado na página (iframe + content script) pelo **Chrome Side Panel API**, no mesmo modelo do AffiliPro, preservando a identidade visual do jogo (`panel.html`, `panel.css`, assets, fontes e sprites).

## Motivação

| Antes (injetado) | Depois (Side Panel nativo) |
|------------------|----------------------------|
| Content script `<all_urls>` | Sem injeção na página |
| Iframe + patch de layout (YouTube, fixed elements) | Painel na borda do browser |
| `TOGGLE_SIDEBAR` / `ENSURE_SIDEBAR` | `chrome.sidePanel.setPanelBehavior` |
| Permissões `scripting`, `activeTab` | Permissão `sidePanel` |

## Arquivos alterados

| Arquivo | Função |
|---------|--------|
| `manifest.json` | `side_panel.default_path`, `permissions: ["sidePanel"]`, `minimum_chrome_version: "116"`, removidos `content_scripts` e `web_accessible_resources` |
| `src/infrastructure/background/SidePanelLifecycle.ts` | Habilita painel por aba (`setOptions`), filtra URLs elegíveis |
| `src/infrastructure/entry/service-worker.ts` | Remove bridge de content script; configura `openPanelOnActionClick` |
| `scripts/build.mjs` | Remove build do content script; target `chrome116` |
| `src/presentation/panel/panel.html` | Subtítulo atualizado |

## Arquivos removidos

| Arquivo | Motivo |
|---------|--------|
| `src/presentation/content/*` | Host do sidebar injetado, CSS do shell, patchers de layout |
| `src/infrastructure/messaging/ContentScriptBridge.ts` | Comunicação com content script |
| `src/infrastructure/storage/SidebarPreferences.ts` | Preferências de visível/colapso/largura do shell injetado |

## Preservado (identidade visual)

- `panel.html`, `panel.css`, `panel.ts`
- `GameViewController`, renderers, modais, battle strip
- Assets em `panel/assets/` (sprites, fontes, backgrounds, ícones)

## Fluxo do usuário

1. Navegar em qualquer site web (exceto `chrome://`, etc.)
2. Clicar no ícone da extensão → Chrome abre o Side Panel com o jogo
3. O jogo comunica com o service worker via `chrome.runtime.sendMessage` (inalterado)

## Requisitos

- **Chrome 116+** (API Side Panel)
- Recarregar extensão em `chrome://extensions` após build

## Testes

- `SidePanelLifecycle.test.ts` — validação de URLs elegíveis
- `npm test` e `npm run build` devem passar
