# Step-by-Step — Painel lateral direito (estilo afiliado-extensao)

## Data: 06/06/2025

## Objetivo

Exibir o jogo fixo no **lado direito do browser**, permitindo que as páginas à esquerda continuem acessíveis normalmente, sem remover a visualização do plugin ao navegar.

## Solução implementada

**Content script + sidebar fixa + iframe**, padrão comum em extensões de afiliado:

1. `content/sidebar-host.js` injeta um painel fixo à direita em todas as páginas web
2. O jogo roda dentro de um `<iframe>` apontando para `panel/panel.html`
3. O `html` da página recebe `margin-right` para deslocar o conteúdo à esquerda
4. O painel persiste ao navegar (content script reexecuta em cada página)
5. Clique no ícone da extensão alterna mostrar/ocultar o painel

## Arquivos novos/alterados

| Arquivo | Função |
|---------|--------|
| `src/presentation/panel/` | UI do jogo (substitui popup) — altura total do painel |
| `src/presentation/content/SidebarHost.ts` | Monta/desmonta sidebar e ajusta layout da página |
| `src/presentation/content/sidebar-host.ts` | Entry point do content script |
| `src/presentation/content/sidebar-host.css` | Estilos do painel lateral fixo |
| `src/infrastructure/storage/SidebarPreferences.ts` | Preferências visível/recolhido/largura |
| `manifest.json` | `content_scripts`, `web_accessible_resources`, sem popup |
| `service-worker.ts` | `chrome.action.onClicked` para toggle |

## Controles do painel

- **◀** — recolhe para barra fina (44px), mantendo jogo oculto mas visível o label
- **✕** — oculta o painel completamente
- **Ícone da extensão** — mostra/oculta o painel na aba atual

## Limitações conhecidas

- Não funciona em páginas restritas (`chrome://`, Chrome Web Store)
- Alguns sites com CSS agressivo podem ignorar o `margin-right` (casos raros)

## Como testar

```bash
npm run build
```

Recarregar extensão em `chrome://extensions` e abrir qualquer site — o painel deve aparecer à direita.

## Status

✅ Painel lateral direito implementado
