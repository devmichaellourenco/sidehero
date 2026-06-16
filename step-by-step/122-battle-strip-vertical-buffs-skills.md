# 122 — Battle strip vertical, skills in-flow e badges de buff

## Objetivo

Corrigir sobreposição de skills, colisão heróis/inimigos e substituir texto de buff (`ATK+11.3`) por ícones com tooltip.

## Decisões do usuário

| Tópico | Escolha |
|--------|---------|
| Skills | Todas sempre visíveis |
| Buffs | Só ícones no sprite; detalhe no tooltip |
| Altura da strip | Mínimo 148px, cresce com atores empilhados |
| Layout | Colunas verticais (heróis à esquerda, inimigos à direita) |
| Buffs em inimigos | Sim, mesma estrutura |

## O que significa o buff

`ATK+11.3` = bônus temporário de ataque aplicado pela skill (ex. Bênção).  
`DEF-8` = penalidade de defesa. O número de turnos aparece no badge e no tooltip.

## Arquivos alterados

| Arquivo | Função |
|---------|--------|
| `panel.html` | `battle-actors-layer` com colunas verticais |
| `panel.css` | Strip mais alta, layout vertical, skills in-flow, badges |
| `CombatStatusEffect.ts` | `statusEffectTooltip()`, formatação decimal |
| `CombatStatusEffectDto` | `kind` + `tooltip` (remove `label` da UI) |
| `CombatStatusEffectMapper.ts` | Mapeia tooltip |
| `CombatStatusEffectPresentation.ts` | Badges icônicos no canto do sprite |
| `HeroBattlePresentation.ts` | Card unificado; badges dentro do hitbox |
| `EnemyBattlePresentation.ts` | Mesma estrutura do herói |
| `BattleStripPatcher.ts` | Patch unificado + `syncBattleStripStackLayout` |
| `BattleStripRenderer.ts` | Coluna vertical; altura dinâmica |
| `BattleStripStructure.ts` | Remove dependência de `.enemies-row` |
| `CombatSkillIntentPresentation.ts` | `data-skill-count` para escala CSS |
| `GameViewController.ts` | Passa `battleStrip` ao renderer |
| `CombatStatusEffect.test.ts` | Testes de tooltip |

## Layout

```
┌─ battle-strip (min 148px, cresce) ─────────────┐
│  [herói 1]              [inimigo 1]            │
│  [herói 2]              [inimigo 2]            │
│  ...                    ...                    │
│════════════════ chão ═══════════════════════════│
└────────────────────────────────────────────────┘
```

Cada card: sprite + badges → HP → skills (linha única, sem wrap).

## Validação

```bash
npm test
npm run build
```

Recarregar extensão e verificar: 3 skills sem empilhar, 2+ inimigos sem invadir heróis, buff como ícone com tooltip.
