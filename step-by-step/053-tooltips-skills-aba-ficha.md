# 053 — Tooltips na aba Skills da ficha do herói

## Objetivo

Reutilizar o mesmo tooltip de combate do painel lateral nas skills da aba **Skills** (e sub-árvore de ascensão na aba **Classe**).

## Arquivos

| Arquivo | Função |
|---------|--------|
| `SkillBattleStatsMapper.ts` | Lógica compartilhada de stats de combate (extraída do mapper do painel) |
| `SkillTooltipPresentation.ts` | HTML compartilhado do tooltip |
| `SkillCardPresentation.ts` | Card da aba Skills com tooltip embutido |
| `HeroSkillsTabRenderer.ts` | Usa `renderSkillCard` |
| `HeroClassTabRenderer.ts` | Cards de ascensão também com tooltip |
| `HeroProgressionMapper.ts` | Enriquece `SkillNodeDto` com `battleStats` e labels |
| `SkillNodeDto.ts` | Novos campos de tooltip |
| `SkillChipTooltipBinder.ts` | Suporta `[data-skill-tooltip]` em cards e chips |
| `HeroDetailModalRenderer.ts` | Bind de tooltips após render |
| `panel.css` | `z-index: 1500` no portal (acima do modal) + cursor help nos cards |

## Uso

Passe o mouse sobre qualquer card de skill na aba Skills ou na sub-árvore de ascensão para ver descrição, ramo, escala, rank e bloco **Na batalha**.
