# Step-by-step — Float "Lv UP" na batalha

**Data:** 2025-07-14  
**Pedido:** ao subir de nível mid-fight, mostrar "Lv UP" brilhante subindo como número de dano acima do herói.

## Fluxo

1. `EnemyKillRewardService` compara níveis da party ativa após XP → `levelUpHeroIds`
2. `CombatTurnPhase` emite `createLevelUpEvent` em `floatingEvents`
3. Tick → `combatFloats` → `BattleFloatingTextController` renderiza `Lv UP` no anchor do herói

## Arquivos

| Arquivo | Função |
|---------|--------|
| `CombatFloatingEvent.ts` / DTO | kind `level-up` |
| `EnemyKillRewardService.ts` | detecta level-up ativo |
| `CombatTurnPhase.ts` | empilha float no kill |
| `BattleFloatingTextPresentation.ts` | label/CSS class |
| `panel.css` | `.battle-float--level-up` + animação |
