# 047 — Limite de 3 skills ativas + exibição no painel de heróis

## Status: concluída

## Requisito

- Heróis podem desbloquear várias skills, mas só **3** ficam ativas na batalha.
- As skills ativas devem aparecer no painel **Heróis**, logo abaixo da barra de experiência.

## Implementação

### Domínio

| Arquivo | Função |
|---------|--------|
| `SkillBattleSlots.ts` | Constante `MAX_ACTIVE_BATTLE_SKILLS = 3` e helper de slot livre |
| `Hero.ts` | `activateSkill()` rejeita a 4ª skill ativa |
| `SkillService.ts` | `canActivate` e `canActivate` na árvore respeitam o limite |
| `GameStateMigration.ts` | Saves antigos com mais de 3 skills ativas são truncados no load |

### Application

| Arquivo | Função |
|---------|--------|
| `HeroDto` | Campos `activeSkills` (id, name, branch) e `maxActiveSkills` |
| `SkillNodeDto` | Campo `canActivate` para UI desabilitar botão Ativar |
| `HeroDtoMapper.ts` | Mapeia skills ativas com nome do catálogo |

### UI

| Arquivo | Função |
|---------|--------|
| `HeroActiveSkillsPresentation.ts` | Renderiza 3 chips (ativos ou vazios `—`) |
| `HeroPanelRenderer.ts` | Chips abaixo das barras HP/XP |
| `HeroSkillsTabRenderer.ts` | Mostra `Slots de batalha: X/3` |
| `HeroClassTabRenderer.ts` | Mesmo indicador na aba Classe/Ascensão |
| `panel.css` | Estilos por branch (offense/defense/utility) |

## Como validar

1. `npm run build` e recarregar extensão
2. Investir em 4+ skills em um herói
3. Ativar 3 — a 4ª deve falhar com toast de limite
4. No painel Heróis, ver chips coloridos abaixo da barra de XP
5. Desativar uma skill → slot vazio (`—`) e botão Ativar liberado na ficha
