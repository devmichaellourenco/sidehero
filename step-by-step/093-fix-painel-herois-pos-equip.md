# 093 — Correção: painel Heróis e loading após equipar

## Status: concluída

## Sintomas

1. Item equipado não aparecia no painel **Heróis** da tela principal (só nos detalhes do herói).
2. Inventário → Equipar → escolher herói ficava em **loading** indefinido.
3. Ao mudar de fase, os itens voltavam a aparecer corretamente.

## Causa

No fix 092, `afterGearMutation` fazia:

1. `this.state = state` **antes** do `render` adiado.
2. No `render`, `previous` vinha de `this.state` — já igual ao estado novo.
3. `shouldRenderHeroPanel(previous, state)` retornava `false` (mesma chave de loadout).
4. O painel de heróis não era atualizado até um tick/refresh externo (ex.: troca de fase).
5. O modal ficava com botões `gear-action-pending` / `disabled` porque o `refreshModalIfOpen` só rodava no frame adiado, que competia com o estado inconsistente.

## Correção

| Arquivo | Alteração |
|---------|-----------|
| `GameViewController.ts` | `render` aceita `previousState`; `afterGearMutation` renderiza de forma síncrona com o estado anterior capturado; falha de equip chama `refreshModalIfOpen` |
| `DomUpdateScheduler.ts` | Removido (adiamento não é mais necessário com a política de render do 092) |

## Como validar

1. `npm run build` e recarregar a extensão
2. Pausar → equipar pelo inventário e pelo slot no painel Heróis
3. Item deve aparecer nos slots do painel principal; modal deve voltar ao inventário sem loading travado
