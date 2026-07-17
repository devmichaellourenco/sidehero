---
name: medieval-theme
description: Paleta medieval do painel Side Hero (pergaminho claro, tinta, ouro de selo). Use para tema, cores, :root, CSS vars, onboarding palette, chrome claro ou MedievalThemeTokens. Exceto battle-stage e stage-progress.
---

# Tema medieval

## Spec

`specs/medieval-theme.spec.md`

## Coordenação SDD

```
@.cursor/skills/medieval-theme/SKILL.md
+ @.cursor/skills/battle-ui/SKILL.md
+ @.cursor/skills/stage-progress-bar/SKILL.md
```

## Referência

Card do tutorial (`.onboarding-card`): borda ouro `#c9a227`, fundo `#fff9ed → #f3e4bc → #e8d4a0`, tipografia tinta `#1f1710` / `#3d3428`, CTA floresta `#3f8a49 → #2f6b38`.

## Princípios

1. **Chrome do painel = pergaminho claro + texto tinta** (igual tutorial)
2. **Exceção:** `.battle-stage` (batalha + Acampamento/Batalhar) e `.stage-progress-*` (waves)
3. Ênfase = ouro de selo; CTA positivo = floresta; perigo = carmesim selo
4. Temas por mapa e raridades **não** são sobrescritos

## Tokens

`src/presentation/theme/MedievalThemeTokens.ts` → `panel.css` `:root`

## Fluxo ao alterar cor

1. Spec + `MedievalThemeTokens.ts`
2. Espelhar em `:root` / chrome (não em battle/waves)
3. Teste de tokens
4. Marcar aceite

## Testes

`MedievalThemeTokens.test.ts` — **não** executar `npm test` automaticamente.

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar
- **Não** criar pasta nem arquivos `step-by-step/`
