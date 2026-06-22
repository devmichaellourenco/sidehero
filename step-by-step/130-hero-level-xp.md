# 130 — Tabela de XP por nível

## Objetivo

Definir a progressão de heróis com tabela de experiência por nível (1–100).

## Domínio

| Arquivo | Função |
|---------|--------|
| `domain/progression/HeroLevelXpCatalog.ts` | 100 níveis, `expRequiredToAdvanceFromLevel()` |
| `domain/value-objects/Experience.ts` | Usa o catálogo em `initial`, `restore` e `gain` |

## Regras

- Nível 1 → 100: XP por nível conforme catálogo oficial do jogo
- Teto: **nível 100** (sem progressão além)
- Saves antigos: `restore()` recalcula `toNextLevel` pelo catálogo (ignora ×1,4 legado)

## Wiki (curriculum-michael)

- `src/app/sidehero/wiki/wiki-data.ts` — `HERO_LEVEL_XP_TABLE`
- `src/app/sidehero/wiki/sections/HeroesSection.tsx` — tabela completa na seção Heróis
