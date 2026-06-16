# 120 — Barra completa de skills na batalha

## Objetivo

Exibir **todas** as skills abaixo de heróis e inimigos, com feedback de cooldown e destaque da próxima ação.

## Comportamento

| Feature | Implementação |
|---------|----------------|
| Todas as skills visíveis | `combatSkills[]` no DTO, sempre renderizado |
| Cooldown | Ícone escurecido + barra subindo (`--cooldown-ratio`) |
| Próxima skill | Classe `combat-skill-slot--next` (fundo verde como turno ativo) |
| Segunda skill pronta | `combat-skill-slot--queued` + execução após **1s** |
| Multi-skill combate | `pendingSkillActions` em `CombatState` |

## Arquivos principais

| Arquivo | Função |
|---------|--------|
| `CombatSkillBarResolver.ts` | Lista skills + highlights |
| `CombatSkillBarMapper.ts` | Domain → DTO |
| `CombatSkillIntentPresentation.ts` | HTML + patch de cooldowns |
| `CombatTurnPhase.ts` | Fila de skills com 1s de intervalo |
| `panel.css` | Estilos slots, cooldown, pulse |

## Validação

```bash
npm test
npm run build
```

Recarregar extensão — skills sempre visíveis na battle strip.
