# Spec — Infraestrutura Chrome Extension

## Status

**Aceite:** 7/7 (100%) · auditoria 2026-07-29  
**Testes obrigatórios:** 4/4 presentes na suite

## Objetivo

Extensão MV3 com **side panel**, service worker, persistência local e messaging tipado entre panel ↔ background.

**Nota de produto (2026-07):** progresso offline / tick em background **desativado** — sem aquisição de recursos com o painel fechado. Código preservado comentado para possível reativação (`BackgroundTickScheduler`, upgrades `background_tick_*`, relatório idle).

## Critérios de aceite

- [x] `manifest.json` v3: sidePanel, storage, alarms, tabs
- [x] Build esbuild → `dist/`; assets copiados para `dist/panel/assets/`
- [x] Save em `side_hero_game_state`; migração de `taskbar_hero_game_state`
- [x] Mensagens tipadas em `GameClientTypes`; handler em `service-worker.ts`
- [x] Tick alarm em background **desativado** (código comentado; alarm legado é limpo)
- [x] Release automatizável via `npm run release` → zip sem `.map` (só quando o usuário pedir)
- [x] Backup criptografado (AES-GCM) export/import em Configurações (`.sidehero`) — ofuscação local, não anti-cheat absoluto

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Infrastructure | `ChromeStorageGameRepository`, `BackgroundTickScheduler`, `GameMessageBus` |
| Infrastructure | `ChromeSaveBackupStore`, `createGameApplication.ts`, `service-worker.ts` |
| Application | `SaveBackupCodec`, `ExportSaveBackupUseCase`, `ImportSaveBackupUseCase` |
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
- [x] `SaveBackupCodec.test.ts` — roundtrip e rejeição de arquivo adulterado
