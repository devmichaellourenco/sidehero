# 106 — Cooldown de skills em inteiros

## Status: concluída

## Regra

- Exibir **apenas números inteiros** no overlay de recarga.
- Frações arredondam **para cima** (0,75s → **1**).
- Ao zerar → **0**, depois overlay some (skill pronta).

## Implementação

`formatSkillCooldownCountdown()` em `SkillCooldownTiming.ts`, usado em:

- `HeroSkillCooldownPresentation.ts`
- `HeroPanelCooldownPatcher.ts`
- `HeroActiveSkillsPresentation.ts` (aria-label)
- `CombatSkillIntentPresentation.ts` (battle strip)

Tooltips de ficha (`formatCooldownLabel`) mantêm formato descritivo com segundos.
