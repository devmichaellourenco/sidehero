# Step-by-step — Skills de evolução na aba Skills

**Data:** 2025-07-14  
**Pedido:** skills novas de classe/evolução devem aparecer na aba Skills, não na aba Classe.

## Alterações

| Arquivo | Função |
|---------|--------|
| `HeroSkillsTabRenderer.ts` | Lista skills de classe + seção "Skills de evolução" |
| `HeroClassTabRenderer.ts` | Só escolha de caminho / ascensão |
| `HeroDetailModalRenderer.ts` | Passa `ascensionSkillNodes` para Skills; assign só na aba Skills |
| `panel.css` | Estilo do subtítulo de evolução |
| `skills-progression/SKILL.md` | Padrão de UI atualizado |

## Comportamento

- Allocate de evolução continua com `data-ascension-allocate` (pontos de ascensão).
- Equip/slots de batalha na aba Skills abrangem as duas listas.
