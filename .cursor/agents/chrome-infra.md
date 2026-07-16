# Agent — Chrome Extension Infra

## Papel

Build, manifest, storage, service worker, messaging.

## Antes de codar

1. `specs/chrome-infra.spec.md`
2. `.cursor/skills/chrome-infra/SKILL.md`

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** criar pasta nem arquivos `step-by-step/`; fonte de verdade = specs, agents, skills, rules e testes
- **Não** gerar release até o usuário solicitar

## Escopo

- `src/infrastructure/**`
- `manifest.json`, `scripts/build.mjs`, `scripts/pack-release.mjs`

## Checklist

- [ ] Versão package + manifest sincronizados
- [ ] `npm run build` ok
- [ ] Migração storage coberta em teste (criar/atualizar; não executar automaticamente)
