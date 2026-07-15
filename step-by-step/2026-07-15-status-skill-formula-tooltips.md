# Status das skills — fórmulas no hover (sem lore)

Data: 2026-07-15

## Objetivo

Na aba **Status** do herói, skills de batalha devem mostrar o máximo de informação numérica possível, com o **cálculo completo no hover**, e **sem texto de lore/descrição narrativa**.

## Alterações

### Domínio — `DamageThroughputEstimate.ts`

- Breakdown estruturado por etapa: `powerBreakdown`, `gearBreakdown`, `hitBreakdown`, `rateBreakdown`, `dpsBreakdown`
- Cada linha pode carregar uma chave de ícone (`attack`, `rune`, `improvement`, `power_attack`, …)
- Formula de poder de skill: base + rank + atributo × fator → ×1.9 → piso físico (se aplicável)
- Formula de hit: poder → bônus elemental/físico de gear → fator de crit esperado
- Formula de taxa: APS (ataque) ou CD + CDR + recovery de cast
- DPS = dano/hit esperado × taxa

### Application — DTO + mapper

| Arquivo | Função |
|---------|--------|
| `GameStateDto.ts` | `HeroActiveSkillStatDto` ganha `tooltipLines` (texto + ícone) e `emphasize` |
| `SkillBattleStatsMapper.ts` | Preenche tooltip em **toda** stat (tipo, alvo, poder, gear, crit, hit, taxa, DPS, recarga, início, condição, duração); adiciona Casts/s, fator de crit e bônus de gear |

### Presentation

| Arquivo | Função |
|---------|--------|
| `HeroStatusSkillsPresentation.ts` | Remove description/lore; cada stat vira row com `data-hero-stat-tooltip`; ícones via `ASSETS` |
| `panel.css` | Hint, destaque dourado no DPS, ícones no tooltip, portal mais largo |
| Binder existente | `HeroStatTooltipBinder` já ativo na aba Status — reutilizado |

## O que o jogador vê

1. Nome, rank e escala da skill (sem parágrafo de história)
2. Lista densa de estatísticas
3. Hover/focus em qualquer linha → portal com o passo a passo do cálculo (+ ícones quando cabe)
4. DPS em destaque dourado

## Testes atualizados

- `DamageThroughputEstimate.test.ts` — breakdown presente
- `SkillBattleStatsMapper.test.ts` — tooltipLines / emphasize / Casts/s / fator de crit
- `HeroStatusSkillsPresentation.test.ts` — tooltips no HTML; **não** contém lore
