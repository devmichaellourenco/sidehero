# 074 — Tela de vitória no battle strip

## Objetivo

Substituir toasts de vitória de fase por overlay na tela de batalha com recompensas (ouro, XP, tier, baú, level-ups) e avanço automático para a próxima fase após confirmação.

## Fluxo

1. Boss derrotado → `detectBattleVictory()` compara `GameStateDto` anterior vs. novo.
2. Overlay exibido no `.battle-strip`; ticks e auto-battle pausados.
3. Toasts de vitória/tier/level-up/baú suprimidos enquanto overlay ativo.
4. Botão **Continuar** ou countdown de 4s → inicia próxima fase (`tick()` ou retoma auto-battle).
5. Baú pendente abre após dispensar overlay (se houver).

## Arquivos novos

| Arquivo | Função |
|---------|--------|
| `BattleVictoryDetector.ts` | Detecta vitória no boss e monta payload de recompensas |
| `BattleVictoryOverlayRenderer.ts` | Renderiza card de vitória com sprites ResourcesData |
| `BattleVictoryFlow.ts` | Pausa combate, countdown e dismiss |
| `BattleVictoryDetector.test.ts` | Testes de detecção |

## Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `GameViewController.ts` | Integra overlay; bloqueia tick/Space durante vitória |
| `GameStateChangeDetector.ts` | `skipVictoryOverlayRewards` para evitar toasts duplicados |
| `panel.html` | `#battle-victory-overlay` dentro do battle strip |
| `panel.css` | Estilos `.battle-victory-*` e expansão `.battle-strip--victory` |
| `AssetCatalog.ts` | `victoryFrame`, `victoryGlow`, `victoryWings`, `chestOpen` |
| `copy-assets.mjs` | Copia sprites Popup/Glow/Wings/Chest-open de ResourcesData |

## Sprites ResourcesData usados

- `Popup/popup_01_frame.png` → moldura do card
- `Demo_Image/image_glow_circle.png` → brilho de fundo
- `Demo_Image/group_image_wingbadge1.png` → emblema de vitória
- `Demo_Icon_Chest/shop_img_chest_open01_s_00.png` → baú aberto
- Reutilizados: `gold`, `energy` (XP), `stage`, `buttons/primary`

## Validação

```bash
npm test
npm run build
```
