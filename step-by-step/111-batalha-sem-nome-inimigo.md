# 111 — Remover nome/nível visível do inimigo na battle strip

## Objetivo

Liberar espaço na faixa de batalha removendo o rótulo fixo abaixo do sprite do inimigo (`Boss Goblin Lv.1`, etc.).

## Alterações

| Arquivo | Mudança |
|---------|---------|
| `EnemyBattlePresentation.ts` | Removido `<div class="enemy-name">` |
| `panel.css` | Removidos estilos `.enemy-name` e variante boss |

## Informação preservada

- **Tooltip** (hover/focus em `data-enemy-tooltip`): nome, stage, vida, ATK/DEF, ouro, XP e skills.
- **Barra de vida** abaixo do sprite.
- **`aria-label`** no hitbox para acessibilidade.

## Validação

Recarregar extensão → inimigos exibem só sprite + barra de HP; detalhes aparecem ao passar o mouse.
