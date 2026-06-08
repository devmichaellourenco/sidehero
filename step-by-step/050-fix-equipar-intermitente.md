# 050 — Correção: equipar itens intermitente

## Status: concluída

## Sintomas

Equipar funcionava às vezes e parava em qualquer ponto (slot do herói, inventário, loot, otimizar).

## Causas (múltiplas)

### 1. Listeners recriados a cada `render()` (tick auto-batalha / refresh 5s)

`HeroPanelRenderer` e vários modais rebindavam `click` após cada `innerHTML`. Se o DOM era substituído durante o clique, o evento se perdia.

### 2. Flag `equippingGear` descartava cliques em silêncio

Segundo clique (ou overlap com otimizar) retornava sem feedback — parecia que nada aconteceu.

### 3. Ações fora da delegação do modal

`data-optimize-loadout`, `data-loot-keep`, `data-loot-batch-equip` usavam listeners efêmeros, não a delegação estável do `#modal-body`.

### 4. Backend (já corrigido em 046)

`SerialTaskRunner` no service worker evita lost updates no storage.

## Correções

| Arquivo | Alteração |
|---------|-----------|
| `GearMutationQueue.ts` | Fila UI para equip/unequip/optimize |
| `GameViewController.ts` | Delegação em `#hero-panels` + modal ampliado; remove `equippingGear` |
| `HeroPanelRenderer.ts` | Só renderiza HTML; sem listeners |
| `HeroDetailModalRenderer.ts` | Slots de equip via delegação do modal |
| `InventoryModalRenderer.ts` | Otimizar via delegação |
| `LootModalRenderer.ts` / `LootBatchModalRenderer.ts` | Loot via delegação |

## Como validar

1. Ligar **auto-batalha**
2. Equipar por slot, inventário, loot e otimizar — repetir durante batalhas
3. Cliques rápidos em sequência devem enfileirar (toast/estado consistente)
