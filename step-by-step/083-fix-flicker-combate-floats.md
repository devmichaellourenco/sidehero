# 083 — Fix flicker no combate e floats de dano/cura

## Problema

A cada ~2,5s (intervalo do auto-batalha em 1x), personagens na battle strip e ícones no painel Heróis piscavam. Os números flutuantes de dano/cura não apareciam de forma confiável.

## Causa

1. Cada `tick()` chamava `render()` com `innerHTML` completo em `BattleStripRenderer` e `HeroPanelRenderer`, recarregando sprites/ícones.
2. O `refresh()` a cada 5s também re-renderizava durante o combate, competindo com o tick.
3. `showCombatFloats()` rodava antes do layout estabilizar após o re-render.

## Solução

| Arquivo | Função |
|---------|--------|
| `BattleStripStructure.ts` | Chave estrutural (ids de heróis/inimigos, boss wave) + validação do DOM |
| `BattleStripPatcher.ts` | Atualiza HP, status, turno ativo e skill intent sem trocar sprites |
| `BattleStripRenderer.ts` | Patch in-place quando estrutura igual; full render só em mudanças estruturais |
| `HeroPanelRenderPolicy.ts` | Evita re-render do painel Heróis durante combate (só composição da party) |
| `GameViewController.ts` | Pula `refresh()` em combate; floats com duplo `requestAnimationFrame` |

## Comportamento esperado

- Sprites permanecem estáveis entre ticks de combate.
- Barras de vida, efeitos e intent de skill ainda atualizam a cada turno.
- Painel Heróis só pisca ao entrar/sair de combate ou mudar a party.
- Números flutuantes aparecem após o layout da battle strip estar pronto.
