# 014 — Modais completos para heróis e inventário

## Objetivo
Eliminar o layout 50/50 apertado e exibir heróis em largura total, com inventário, ficha do herói e equipar em modais sobrepostos.

## Alterações

### Layout principal
- **`panel.html`**: removida coluna fixa de inventário; heróis ocupam largura total; botão `Inventário (N)` no footer; shell `#modal-root` com header, voltar e fechar.
- **`panel.css`**: estilos de slots de equipamento, modais, filtros, ficha do herói e seletor de herói.

### Apresentação (novos)
- **`GearPresentation.ts`**: HTML compartilhado para slots e cards de itens.
- **`ModalController.ts`**: abre/fecha overlay, ESC, backdrop, botão voltar.
- **`InventoryModalRenderer.ts`**: lista com filtros por slot + botão Equipar.
- **`HeroDetailModalRenderer.ts`**: sprite grande, stats e slots clicáveis.
- **`EquipPickerModalRenderer.ts`**: escolha por slot (itens compatíveis) ou por item (escolha de herói).

### Apresentação (atualizados)
- **`HeroPanelRenderer.ts`**: cards compactos com 3 slots; clique no card abre ficha; clique no slot abre equipar.
- **`GameViewController.ts`**: pilha de modais (`inventory` → `equip-picker`, `hero-detail` → `equip-picker`).
- Removido **`InventoryRenderer.ts`** (substituído pelo modal).

### Aplicação
- **`GameStateDto.ts`**: `equipment` inclui `id`, `slot` e `rarity` para renderizar slots corretamente.

## Fluxos de uso
1. **Inventário** → lista filtrável → Equipar → escolher herói → equipa e fecha modais.
2. **Card do herói** → ficha completa → slot → lista de itens compatíveis → equipa.
3. **Slot no card** (sem abrir ficha) → lista de itens compatíveis → equipa.

## Arquivos por função
| Arquivo | Função |
|---------|--------|
| `GearPresentation.ts` | Templates reutilizáveis de UI para gear/slots |
| `ModalController.ts` | Controle genérico do overlay |
| `InventoryModalRenderer.ts` | Conteúdo do modal de inventário |
| `HeroDetailModalRenderer.ts` | Conteúdo do modal de ficha |
| `EquipPickerModalRenderer.ts` | Conteúdo do modal contextual de equipar |
| `GameViewController.ts` | Orquestra painel + pilha de modais + mensagens ao service worker |

## Validação
```bash
npm run build
```
Recarregar extensão: heróis em coluna única; inventário e equipamento via modais.

## Ajuste header do modal (equipar)
- Header trocado de `grid` para `flex`: evita botões ← e × truncados quando o voltar aparece/desaparece.
- Título com `ellipsis` para títulos longos (`Equipar armadura — Nome`).
