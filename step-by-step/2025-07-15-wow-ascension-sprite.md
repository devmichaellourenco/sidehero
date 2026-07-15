# Step-by-step — Sprite de ascensão no Wow

**Data:** 2025-07-15  
**Pedido:** no card Wow ao aceitar ascensão, mostrar o sprite da evolução em vez do ícone/emoji.

## Correção

1. `RewardHeroPortrait` passa a carregar `ascensionId`
2. `buildAscensionMoment` / `celebrateAscension` recebem o herói e setam `heroPortrait`
3. `WowStripRenderer` já prioriza `heroPortrait` → `getHeroSprite` resolve o PNG da evolução
