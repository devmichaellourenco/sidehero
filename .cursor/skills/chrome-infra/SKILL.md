---
name: chrome-infra
description: Infraestrutura da extensão Chrome Side Hero — build, storage, service worker e messaging. Use para manifest, service worker, Chrome storage, build, release ou side panel.
---

# Chrome Extension Infra

## Spec

`specs/chrome-infra.spec.md`

## Fluxo de mensagem

```
panel → GameMessageBus → service-worker → UseCase → presenter → panel
```

Tipos em `application/ports/GameClientTypes.ts`.

## Build e release

```bash
npm run build    # dist/
npm run release  # zip → releases/ — só quando o usuário pedir (agente não executa)
```

## Storage

- Chave: `side_hero_game_state`
- Legado: `taskbar_hero_game_state` (migração automática)
- Meta: repositório separado
- Backup: `SaveBackupCodec` (AES-GCM ofuscado) + `EXPORT_SAVE_BACKUP` / `IMPORT_SAVE_BACKUP`; UI em Configurações

## DI

Composition root: `infrastructure/di/createGameApplication.ts`

## Testes

`ChromeStorageGameRepository.test.ts`, `SerialTaskRunner.test.ts`, `SaveBackupCodec.test.ts` — criar ou atualizar; não executar automaticamente.

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar
- **Não** criar pasta nem arquivos `step-by-step/`; fonte de verdade = specs, agents, skills, rules e testes
