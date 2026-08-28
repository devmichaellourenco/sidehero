# Spec — Áudio (música e SFX)

## Status

**Aceite:** 4/8 (50%) · fase 1 — trilhas de campanha  
**Testes obrigatórios:** 2/2 presentes na suite

## Objetivo

Sistema de áudio no painel Chrome: trilhas de fundo por contexto de jogo, com preferências locais e transição suave entre momentos.

## Critérios de aceite — fase 1 (música)

- [x] Catálogo declarativo com trilha **acampamento** (`camp`) e **batalha** (`battle`)
- [x] Assets em `public/audio/music/` copiados para `dist/panel/assets/audio/music/` no build
- [x] `GameMusicController` toca em loop com crossfade entre trilhas
- [x] Troca automática: `phaseRun` ativo → batalha; caso contrário → acampamento
- [x] Pausa com painel oculto (`document.hidden`); retoma ao voltar
- [x] Desbloqueio de autoplay no primeiro gesto do usuário (política do Chrome)
- [x] Preferências `musicEnabled` e `musicVolume` em Configurações
- [ ] SFX de combate, UI e recompensas

## Camadas e arquivos-chave

| Camada | Paths |
|--------|-------|
| Presentation | `GameMusicCatalog.ts`, `resolveGameMusicTrack.ts`, `GameMusicController.ts` |
| Presentation | `GamePreferences.ts`, `SettingsModalRenderer.ts`, `GameViewController.ts` |
| Build | `scripts/copy-assets.mjs` — pasta `public/audio/` |
| Assets | `public/audio/music/camp.wav`, `public/audio/music/battle.wav` |

## Créditos (música)

Registro canônico: `src/presentation/audio/GameMusicCredits.ts` · cópia junto aos assets: `public/audio/music/CREDITS.md`

| Trilha | Arquivo | Obra | Autor | Licença | Fonte |
|--------|---------|------|-------|---------|-------|
| `camp` | `camp.wav` | Medieval: Minstrel Dance | RandomMind | CC0 | https://opengameart.org/content/medieval-minstrel-dance |
| `battle` | `battle.wav` | Medieval: Battle | RandomMind | CC0 | https://opengameart.org/content/medieval-battle |

## Invariantes

- Presentation não importa domínio — decisão de trilha usa apenas campos do `GameStateDto`
- Música só inicia após splash (`bootReady`) no painel principal
- Falha ao carregar arquivo não quebra o painel (fail silent)

## Fora de escopo (fase 1)

- SFX, voz, mixagem dinâmica por wave/boss
- Áudio no service worker ou janelas detached (sem loop de batalha)

## Testes obrigatórios

- [x] `resolveGameMusicTrack.test.ts` — mapeamento acampamento vs batalha
- [x] `GameMusicController.test.ts` — crossfade, mute, visibilidade
- [x] `GameMusicCredits.test.ts` — URLs e autores registrados
