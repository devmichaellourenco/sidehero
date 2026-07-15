# Toast próximo ao cursor

Data: 2026-07-15

## Objetivo

Toasts (avisos) deixam de aparecer só no topo; nascem **centralizados horizontalmente no painel** e **um pouco acima da posição Y do mouse**, mantendo fade/sumiço atuais.

## Alterações

| Arquivo | Função |
|---------|--------|
| `ToastController.ts` | Rastreia `pointermove`/`pointerdown`; define `top` com offset acima do cursor e clamp na viewport |
| `panel.css` | `.toast-root` cobre o painel; cada `.game-toast` é absoluto em `left: 50%` com `translateX(-50%)` |
| `ToastController.test.ts` | Garante offset acima do cursor e clamp no topo |

## Comportamento

- X: centro do painel
- Y: `clientY - 40px` (mín. 12px da borda)
- Entrada/saída: mesma opacidade + leve deslocamento vertical
