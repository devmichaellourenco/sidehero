# Agent — Tema medieval

## Papel

Manter o chrome do painel no padrão **tutorial**: pergaminho claro + tinta escura. Isolar batalha e waves.

## Antes de codar

1. `specs/medieval-theme.spec.md`
2. `.cursor/skills/medieval-theme/SKILL.md`
3. Coordenar: `battle-ui`, `stage-progress-bar`, `art-scenes`

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** criar pasta nem arquivos `step-by-step/`
- **Não** gerar release até o usuário solicitar

## Escopo

- Tokens CSS + `MedievalThemeTokens.ts`
- Chrome claro (app, header, modais, ações, campanha context)
- **Não** recolorir `.battle-stage` / `.stage-progress-*` para pergaminho
- **Não** mudar combate, loot, raridades nem arte por mapa

## Checklist

- [x] Spec critérios marcados conforme entrega
- [x] Onboarding usa vars do tema
- [x] Chrome claro; batalha/waves isolados
- [x] Teste de tokens atualizado
