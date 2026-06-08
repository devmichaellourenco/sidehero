# 052 — Tooltips de skills no painel Heróis

## Objetivo

Ao passar o mouse sobre um chip de skill ativa no painel lateral, exibir nome, descrição, ramo, escala, rank e dados de combate de forma legível.

## Arquivos alterados

| Arquivo | Função |
|---------|--------|
| `HeroActiveSkillMapper.ts` | Monta `HeroActiveSkillDto` enriquecido (descrição, rank, stats de batalha, poder estimado) |
| `HeroActiveSkillMapper.test.ts` | Testes do mapper |
| `GameStateDto.ts` | Expande `HeroActiveSkillDto` com campos de tooltip |
| `HeroDtoMapper.ts` | Usa `mapHeroActiveSkills(hero)` |
| `HeroActiveSkillsPresentation.ts` | HTML do chip + tooltip oculto embutido |
| `SkillChipTooltipBinder.ts` | Portal fixo no hover (padrão do equipamento) |
| `HeroPanelRenderer.ts` | Chama `bindSkillChipTooltips` após render |
| `ModalController.ts` | Esconde tooltip ao fechar modal |
| `panel.css` | Estilos do portal e conteúdo do tooltip |

## Conteúdo do tooltip

1. **Cabeçalho:** nome + meta (Ofensivo/Defensivo/Utilidade · Universal/Classe · STR/DEX/INT)
2. **Descrição:** texto do catálogo de progressão
3. **Na batalha** (quando há definição de combate): tipo, alvo, poder, recarga, início e condições
4. **Rodapé:** rank atual/máximo

## Padrão técnico

Mesmo fluxo dos tooltips de equipamento: conteúdo fica oculto no DOM do chip, copiado para um portal `position: fixed` no `mouseenter`, com borda colorida por ramo da skill.
