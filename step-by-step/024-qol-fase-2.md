# 024 — QoL fase 2: otimizar equipe, auto-baús, loot em lote e tooltips

## 1. Otimizar equipe
- `LoadoutPlanner.ts` + `EquipBestLoadoutUseCase.ts`
- Mensagem `EQUIP_BEST_LOADOUT` (opcional `gearIds` para loot em lote)
- Botão **Otimizar equipe** no footer e no inventário

## 2. Auto-abrir baús
- Toggle **Baús** ao lado do Auto
- Preferência `sidehero_auto_open_chest` em sessionStorage
- Abre automaticamente quando há baús e nenhum modal aberto

## 3. Loot em lote
- `LootBatchModalRenderer.ts` para 2+ itens
- **Equipar recomendados (N)** / **Guardar tudo**

## 4. Badge no inventário
- `countUpgradeItems()` em `GearComparison.ts`
- Badge `↑N` no botão Inventário e no botão Otimizar

## 5. Tooltip dos heróis na battle strip
- `HeroBattlePresentation.ts` + `HeroTooltipBinder.ts`
- Hover: nome, nível, HP, XP, ATK/DEF

## 6. Velocidade auto-batalha
- Select **1x / 2x** (intervalo base 2,5s)
- Preferência `sidehero_auto_battle_speed`

## Validação
```bash
npm run build
```
