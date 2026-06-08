# 025 — QoL fase 3: automação completa e configurações

## 1. Auto-equipar loot
- Toggle em Configurações
- Após abrir baú(s), chama `EQUIP_BEST_LOADOUT` sem modal
- Toast: `Loot auto-equipado: N itens`

## 2. Indicador próximo baú
- Pill `0/3` no header (`chestProgress` de `CombatRules.ts`)
- Baseado em `totalBattlesWon % 3`

## 3. Log filtrado
- Toggle **Log resumido** em Configurações
- `BattleLogFilter.ts` mantém vitórias, baús, equipamentos e derrotas

## 4. Item substituído volta ao inventário
- `GearEquipService.ts` usado em `EquipGearUseCase` e `LoadoutPlanner`
- Ao equipar, item antigo do slot retorna ao inventário

## 5. Painel de configurações
- Botão ⚙ no header abre modal **Configurações**
- Consolida: Auto-batalha, Auto-baús, Auto-equipar, Log resumido, Velocidade 1x/2x
- `GamePreferences.ts` centraliza sessionStorage

## 6. Atalho Espaço
- Avança batalha com painel focado (exceto com Auto ligado ou modal aberto)

## Validação
```bash
npm run build
```
