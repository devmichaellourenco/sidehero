# Forja Divina — Limpar seleção

Data: 2026-07-15

## Objetivo

Na tela da Forja Divina, após selecionar um ou mais itens, o jogador precisa poder **limpar toda a seleção de uma vez**, sem desmarcar item a item.

## Alterações

| Arquivo | Função |
|---------|--------|
| `DivineForgePresentation.ts` | Botão `Limpar seleção` (`data-forge-clear-selection`) no dock das abas Fundir e Destruir, visível só com seleção |
| `DivineForgeModalRenderer.ts` | Clique no botão chama `resetSelection()` e re-render via `onSelectionChange` |
| `panel.css` | `.forge-dock-actions` agrupa botões primário + limpar |
| `DivineForgePresentation.test.ts` | Cobertura: botão ausente sem seleção; presente com parcial/completa |
| `specs/stash-forge.spec.md` | Critério de aceite + contagem 9/9 |
| `.cursor/skills/stash-forge/SKILL.md` | Nota do padrão UI |

## Comportamento

1. **Fundir:** com 1–9 itens selecionados, aparece botão ghost abaixo de “Fundir itens”.
2. **Destruir:** com 1 item selecionado, aparece o mesmo botão abaixo de “Destruir por ouro”.
3. Clique → zera seleção (fundir e salvage) e atualiza o grid/dock.
4. Sem seleção → botão não é renderizado.
