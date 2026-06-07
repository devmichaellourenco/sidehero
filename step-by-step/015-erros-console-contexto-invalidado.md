# 015 — Erros de console e contexto invalidado

## Erros externos (não são do Side Hero)
- `ERR_SSL_VERSION_OR_CIPHER_MISMATCH`: recurso de terceiros na página com TLS incompatível.
- `gdpr=0&gdpr_consent= 404`: script de consentimento/GDPR do site.
- `711890.gif 451`: imagem bloqueada (ads/geo/legal).

## Erro da extensão
`Extension context invalidated` ocorre quando a extensão é recarregada em `chrome://extensions` mas a aba ainda usa scripts antigos (painel + content script).

## Mitigação aplicada
- **`ExtensionContext.ts`**: detecta contexto inválido.
- **`GameMessageBus.ts`**: try/catch em `sendMessage`, retorna `{ ok: false }` em vez de exceção.
- **`AssetCatalog.ts`**: `getAssetUrl` não lança mais quando o contexto expirou.
- **`panel.ts`**: `GameViewController` usa `document.body` (corrige `#modal-root` fora de `#app`).
- **`GameViewController.ts`**: para polling, fecha modais, banner com botão "Recarregar página".
- **`SidebarPreferences.ts`** + **`SidebarHost.ts`**: storage/colapso não estouram promise rejeitada.

## Bug corrigido: `querySelectorAll` em null
O `#modal-root` ficava fora do `#app`, mas o controller buscava modais só dentro de `#app`. Isso quebrava os modais e gerava `Cannot read properties of null`.

## Ação do usuário após `npm run build` + reload da extensão
Recarregar a página do site (F5 ou botão no banner) para reinjetar content script e iframe.
