# Step-by-Step — Layout da página redimensionada (sem sobreposição)

## Data: 06/06/2025

## Problema

O painel do Taskbar Hero ficava **por cima** do conteúdo da página. O afiliado-extensao **reduz o espaço** da página à esquerda, sem cobrir o conteúdo.

## Solução

Criado `PageLayoutAdjuster` que:

1. Define `html` com `width: calc(100vw - larguraPainel)` em vez de só `margin-right`
2. Força `body` a ocupar 100% dessa área reduzida
3. Mantém sidebar fixa à direita ocupando sua faixa exclusiva
4. Usa `<style>` injetado com `!important` para resistir a CSS de sites
5. `MutationObserver` reaplica layout se o site alterar estilos do `body` (SPAs)

## Arquivos

| Arquivo | Função |
|---------|--------|
| `PageLayoutAdjuster.ts` | Redimensiona página e reserva faixa direita |
| `sidebar-host.css` | Remove sombra de overlay; sidebar na faixa direita |
| `SidebarHost.ts` | Delega layout ao adjuster |

## Como testar

```bash
npm run build
```

Recarregar extensão → abrir site → conteúdo deve encolher à esquerda, jogo ocupa faixa direita sem cobrir texto.

## Status

✅ Implementado
