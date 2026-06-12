# 094 — Renomear chave de storage para side_hero_game_state

## Status: concluída

## Alteração

Chave principal do save renomeada de `taskbar_hero_game_state` → `side_hero_game_state`.

## Arquivos

| Arquivo | Função |
|---------|--------|
| `ChromeStorageGameRepository.ts` | Nova chave + migração automática do save legado no `load()` |
| `ChromeStorageGameRepository.test.ts` | Testes atualizados + caso de migração |

## Migração

No primeiro `load()` após atualizar:
1. Lê `side_hero_game_state`; se vazio, tenta `taskbar_hero_game_state`
2. Grava na chave nova e remove a legada

Quem **reinstalar** a extensão continua começando do zero (comportamento do Chrome).
