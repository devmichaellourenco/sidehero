# 086 — Cooldown visual das skills no painel Heróis

## Problema

Durante o combate, o painel Heróis não re-renderizava (anti-flicker), então as skills não mostravam recarga.

## Solução

1. **`HeroSkillCooldownMapper`** — expõe `combatSkillCooldowns` por herói no DTO
2. **`HeroSkillCooldownPresentation`** — overlay com sombra preenchendo/esvaziando
3. **`HeroPanelCooldownPatcher`** — atualiza overlays in-place a cada tick de combate
4. **`HeroPanelRenderer.patchCombatCooldowns`** — chamado em `GameViewController` quando o painel não re-renderiza

## UX

- Sombra sobe de baixo para cima enquanto a skill recarrega (esvazia = fica pronta)
- Label com segundos restantes no centro do ícone
- Transição CSS `0.5s linear` entre ticks

## Arquivos

- `HeroSkillCooldownMapper.ts`
- `HeroSkillCooldownPresentation.ts`
- `HeroPanelCooldownPatcher.ts`
- `HeroActiveSkillsPresentation.ts`
- `HeroPanelRenderer.ts`
- `GameViewController.ts`
- `panel.css`
