# 092 — Correção: equipar intermitente durante pausa manual

## Status: concluída

## Sintoma

Com o jogo pausado para ajustes, cliques em **Equipar** (inventário) ou no herói/slot (personagem) às vezes não faziam nada — o botão parecia ignorar o clique.

## Causa raiz

1. **`shouldRenderHeroPanel` re-renderizava sempre com `canEditParty`**  
   Durante a pausa manual, `canEditParty` fica `true`. A política antiga retornava `true` em todo `render()`, inclusive no refresh de 5s. O `innerHTML` do painel de heróis era substituído mesmo sem mudança de loadout, destruindo botões entre `mousedown` e `click`.

2. **`afterGearMutation` atualizava o modal no mesmo tick do clique**  
   Ao equipar, `refreshModalIfOpen()` trocava o DOM do modal imediatamente após a mutação, competindo com o próximo clique em sequência.

3. **Refresh periódico durante pausa com modal aberto**  
   `GET_STATE` a cada 5s re-renderizava o painel enquanto o jogador editava no modal.

## Correções

| Arquivo | Alteração |
|---------|-----------|
| `HeroPanelRenderPolicy.ts` | Compara chave de loadout (party + equipamento + stats visíveis) em vez de sempre re-renderizar com `canEditParty` |
| `DomUpdateScheduler.ts` | Adia atualizações de DOM para o próximo frame |
| `GameViewController.ts` | `afterGearMutation` adia render/modal; refresh ignorado com modal aberto na pausa manual; feedback `gear-action-pending` nos botões de equip |
| `HeroPanelRenderPolicy.test.ts` | Novos casos para pausa/loadout |
| `panel.css` | Estilo visual de ação pendente |

## Como validar

1. `npm run build` e recarregar a extensão
2. Iniciar batalha → **Pausar para ajustes**
3. Equipar pelo inventário (vários itens seguidos) e pelos slots do herói no painel
4. Repetir com cliques rápidos — cada ação deve equipar ou mostrar toast de erro; botão deve indicar processamento
