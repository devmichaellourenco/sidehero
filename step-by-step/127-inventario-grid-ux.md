# 127 — Inventário em grid (Fase 1 UX)

## Objetivo

Redesenhar o inventário para grid compacto, equipar em 1 clique com contexto de herói, tooltip rico e filtros escaláveis — sem segundo modal para equipar.

## Alterações

### Novos arquivos

| Arquivo | Função |
|---------|--------|
| `InventoryGridPresentation.ts` | Slots 6 colunas, seletor de herói, tooltip embutido |
| `InventoryGearTooltipBinder.ts` | Portal de tooltip com stats e delta |
| `InventoryGridPresentation.test.ts` | Testes de renderização |
| `GearComparison.hero.test.ts` | Upgrade relativo ao herói |
| `GearRequirementPresentationMapper.ts` | Avalia requisitos (DTO) para UI |
| `GearRequirementPresentation.ts` | Renderiza linhas de requisito (verde/cinza vs. vermelho) |
| `InventoryHeroLoadoutPresentation.ts` | Retrato + slots de equipamento no inventário |
| `InventoryEquipFeedback.ts` | Diff equip/desequip para animações visuais |

### Refatorados

| Arquivo | Mudança |
|---------|---------|
| `InventoryModalRenderer.ts` | Grid + toolbar + filtro "Só upgrades" + ordenação por raridade |
| `GearComparison.ts` | `getGearUpgradeInfoForHero`, `sortGearForHero` |
| `EquipPickerModalRenderer.ts` | Slot picker com painel loadout + grid (mesma UX do inventário) |
| `GameViewController.ts` | Clique em `data-inventory-equip` no portal |
| `ModalController.ts` / `SideDrawerController.ts` | Esconde tooltip ao fechar |
| `panel.css` | Estilos `.inventory-grid`, chips de herói, tooltip interativo |

## Fluxo do jogador

1. Abre inventário (ícone no footer).
2. Seleciona herói nos chips ("Equipar em").
3. Vê grid 6×52px com badge ▲/▼/=.
4. **Hover** → tooltip com stats, requisitos e delta vs. equipado.
5. **Painel de loadout** → retrato grande do herói à esquerda; slots (arma/armadura/acessório) à direita com equipados ou vazio; clique no slot equipado desequipa.
6. **Clique no slot do grid** → equipa no herói selecionado (1 clique); slot novo pulsa em verde, item substituído volta ao grid com badge ↩ (sem toast).
7. Filtros: slot, só upgrades, ordenação ganho/raridade/nome.
8. Footer: Otimizar equipe.

## Próximos passos (Fase 2)

- Busca textual, favoritar, vender lixo, compare side-by-side.
- Aba inventário no drawer do herói.
- Virtualização para 500+ itens.

## Status

Concluído — validar com `npm test` e build.

## Correções (pós-feedback)

1. **Tooltip:** removido `title` nativo (só mostrava o nome); portal com `z-index: 1500` acima do modal; estilos explícitos para stats/delta; linha "Equipado: …" + comparação com herói selecionado.
2. **Otimizar equipe:** `optimizeLoadout` roda em rodadas até estabilizar (itens substituídos voltam ao inventário e são redistribuídos); escopo limitado à **party ativa**.
3. **Badge ▲:** baseado em upgrade para qualquer herói da party (`getGearUpgradeInfoForActiveParty`); após otimizar, não deve restar upgrade pendente na party.
4. **Requisitos de equipamento:** tooltip no hover lista Level/STR/DEX/INT com valor atual vs. exigido; requisitos não atendidos em vermelho (`gear-requirement-line--unmet`). Slot bloqueado (`inventory-grid-slot--locked`) sem botão Equipar e sem equipar no clique. Mesma lógica em picker de herói, picker de slot e loot.
5. **Feedback visual (sem toast no inventário):** painel de loadout com herói grande + slots; equipar anima slot (`inventory-loadout-slot--equipped-new`); item substituído aparece no grid com `↩` (`inventory-grid-slot--returned`); troca de herói anima retrato. Toasts de equip/otimizar suprimidos com `fromInventory: true`.
6. **Slots icon-only:** arma/armadura/acessório mostram só ícone (vazio) ou item (equipado); nome, stats e tipo aparecem no hover via `EquipmentTooltipBinder`.
