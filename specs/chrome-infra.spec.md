# Spec — Infraestrutura Chrome Extension

## Status

**Aceite:** 6/6 (100%) · auditoria 2026-07-03  
**Testes obrigatórios:** 3/3 presentes na suite

## Objetivo

Extensão MV3 com **side panel**, service worker para tick idle, persistência local e messaging tipado entre panel ↔ background.

## Critérios de aceite

- [x] `manifest.json` v3: sidePanel, storage, alarms, tabs
- [x] Build esbuild → `dist/`; assets copiados para `dist/panel/assets/`
- [x] Save em `side_hero_game_state`; migração de `taskbar_hero_game_state`
- [x] Mensagens tipadas em `GameClientTypes`; handler em `service-worker.ts`
- [x] Tick alarm em background quando melhoria `background_tick` ativa
- [x] Release automatizável via `npm run release` → zip sem `.map` (só quando o usuário pedir)

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Infrastructure | `ChromeStorageGameRepository`, `BackgroundTickScheduler`, `GameMessageBus` |
| Infrastructure | `createGameApplication.ts`, `service-worker.ts` |
| Root | `manifest.json`, `scripts/build.mjs`, `scripts/pack-release.mjs` |

## Invariantes

- Use cases não chamam `chrome.*` diretamente
- Deserialize tolerante com migração ou novo save em corrupção
- Versão sincronizada: `package.json` + `manifest.json`

## Fora de escopo

- Firefox / Safari
- Cloud sync

## Testes obrigatórios

- [x] `ChromeStorageGameRepository.test.ts` (migração legado)
- [x] `SerialTaskRunner.test.ts`, `SidePanelLifecycle.test.ts`
