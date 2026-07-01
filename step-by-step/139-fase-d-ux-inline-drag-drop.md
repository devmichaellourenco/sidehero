# 139 — Fase D: UX inline e drag-and-drop

## Status: concluída

## Escopo

- Equip **inline** no drawer do herói e no modal de inventário (sem modal empilhado)
- **Drag-and-drop** de gear: inventário ↔ slots, inventário ↔ baú, equipado ↔ inventário/baú
- **Drag-and-drop** de formação: reserva ↔ equipe, reordenar na equipe
- **Fora de escopo:** atalhos de teclado, carrossel de party

## Arquitetura

```
presentation/gear/
  InlineEquipController.ts    — estado e render do picker inline
  GearDragDropPolicy.ts       — regras puras (slot compatível, payload)
  GearDragDropBinder.ts       — HTML5 DnD via delegação no #app
```

## Fluxos

### Equip inline

1. Drawer aberto ou inventário aberto → clique em slot de gear
2. `InlineEquipController.toggleSlot()` abre painel abaixo do loadout
3. Segundo clique no mesmo slot fecha o painel
4. Fallback modal `equip-picker` permanece para loot e hero panel principal

### Drag gear

| Origem | Destino | Ação |
|--------|---------|------|
| Inventário | Slot compatível | Equipar |
| Baú | Slot compatível | Retirar + equipar |
| Equipado | Inventário | Desequipar |
| Inventário | Baú | Guardar |
| Equipado | Baú | Desequipar + guardar |
| Equipado | Outro slot (mesmo herói/outro) | Desequipar + equipar |

### Drag party

| Origem | Destino | Ação |
|--------|---------|------|
| Reserva | Slot da equipe | Adicionar + reposicionar |
| Equipe | Reserva | Remover |
| Equipe | Outro slot | Reordenar |

Edição bloqueada fora da pausa de loadout (`canEditParty` / `canEditGear`).

## Integração

- `GameViewController` — orquestra inline + binder
- `ModalStackController` — passa `inlineActiveSlot` ao inventário
- `GearPresentation`, `InventoryGridPresentation`, `StorageGridPresentation`, `HeroesPanelPresentation` — atributos `data-drag-*` / `data-drop-*`

## Validação manual

1. `npm test` + `npm run build`
2. Pausar loadout → abrir inventário → clicar slot → picker inline abre/fecha
3. Arrastar item do grid para slot do loadout
4. Arrastar item equipado para o grid (desequipar)
5. Arrastar para baú e do baú para slot
6. Drawer do herói → mesmo fluxo inline
7. Aba Formação → arrastar heróis entre reserva e equipe

## Referência

Análise geral: `138-analise-melhorias-jogo.md`
