# 040 — Correção de interações em modais (settings + equipar)

## Status: concluída (revisão 3 — auto-batalha timer)

## Sintomas reportados

1. Checkbox **Auto-batalha** em Configurações não respondia ao clique
2. Seleção de herói no fluxo **Inventário → Equipar** não equipava o item

## Causas raiz

### 1. `GamePreferencesController` — estado stale (bug principal do settings)

`update()` salvava em `sessionStorage` via `updateGamePreference()`, mas `apply()` lia `this.preferences` **desatualizado**. O checkbox re-renderizava sempre `checked=false`.

**Correção:**
- `apply()` carrega `loadGamePreferences()` antes de clamp
- `update()` atribui `this.preferences = next` após salvar

### 2. `renderModalTop()` destruía o modal a cada tick/refresh

`render()` chamava `renderModalTop()` em todo update de estado (auto-batalha, refresh 5s, equip, etc.). `modal.open()` fazia `bodyEl.innerHTML = ''` **mesmo com modal já aberto**, interrompendo cliques em andamento.

**Correção:**
- `ModalController.prepare()` — re-render sem limpar body quando modal já está aberto
- `renderModalTop()` usa `prepare()` em vez de `open()`

### 3. Erros silenciosos em ações async

`handleFailedResponse()` só tratava context invalidated. Falhas como *"Requisitos de equipamento não atendidos"* não exibiam feedback — parecia que o clique não funcionava.

**Correção:** toast com mensagem de erro para demais falhas.

### 4. z-index do modal baixo (1400 agora)

Modal estava em `z-index: 100`, abaixo de toasts/tooltips. Ajustado para `1400`.

## Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `GamePreferencesController.ts` | Sync preferences com sessionStorage |
| `GamePreferencesController.test.ts` | Teste de auto-batalha |
| `ModalController.ts` | `prepare()` vs `open()` |
| `GameViewController.ts` | `prepare`, toasts em erros |
| `panel.css` | z-index modal |

## Revisão 2 — equipar ainda falhava

### Causa adicional

`render()` chamava `renderModalTop()` em **todo** update de estado (tick auto-batalha, refresh 5s). O modal era destruído/recriado durante o clique — o evento `click` não completava.

Settings funcionou porque o toggle é instantâneo; equipar exige vários cliques e mais tempo.

### Correções extras

1. **Removido** `renderModalTop()` do `render()` genérico
2. **`refreshModalIfOpen()`** — só re-renderiza modal após ações que mudam conteúdo (ex.: `afterGearMutation`)
3. **Delegação de eventos** no `#modal-body` para `data-equip-gear`, `data-pick-hero`, `data-loot-equip-hero`, etc. — listener único, sobrevive a re-renders
4. Toast de sucesso ao equipar + guard `equippingGear` contra duplo clique

## Revisão 3 — auto-batalha não avançava

### Causa

`handlePreferenceChange` salvava a preferência e atualizava a UI (`tickBtn.disabled`), mas **não chamava** `startAutoBattle()`. O método `applyPreferences()` existia com a lógica correta, porém **nunca era invocado**.

### Correção

- `syncAutoBattleTimer()` — inicia ou para o intervalo conforme `autoBattleEnabled`
- Chamado em `handlePreferenceChange` quando `result.autoBattleChanged`
- Chamado em `enforceUpgradeGates` se o gate desabilitar auto-batalha
- `startAutoBattle()` usa `restart()` para permitir reinício ao mudar velocidade

## Como validar

1. Desbloquear auto-batalha em Melhorias
2. Configurações → marcar Auto-batalha → deve permanecer marcado e **batalhas avançam a cada ~2,5s**
3. Com auto-batalha **ligada**: Inventário → Equipar → clicar herói → item equipa + toast
4. Slot de equipamento no painel de heróis → escolher item → equipa
5. Loot de baú → Equipar em herói → funciona
