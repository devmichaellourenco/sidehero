# 118 — Goblin Bombardeiro e Gonodor (boss de Gondonor)

## Objetivo

Integrar sprites restantes de `public/sprites/enemies/`:
- `goblin_bombardeiro.png` → inimigo comum **Goblin Bombardeiro**
- `gonodor_boss.png` → **Gonodor**, boss final da campanha **Gondonor** (fase 2-50)

## Roster

| ID | Nome | Papel | Sprite |
|----|------|-------|--------|
| `goblin_bomber` | Goblin Bombardeiro | comum T1 | `goblin_bomber.png` |
| `gonodor` | Gonodor | boss narrativo | `gonodor_boss.png` |

Substituído `kobold_pyro` por `goblin_bomber` (mantém 50 inimigos de campanha).

## Campanha Gondonor

- Marco mapa 2 (`EnemyTierProgression`) → `gonodor`
- Fase **2-50** (`Capitão da Mina`): waves temáticas de goblins + boss **Gonodor**
- Fase **1-50**: `kobold_pyro` trocado por `goblin_bomber` na wave 3

## Pipeline

| Origem | Destino |
|--------|---------|
| `goblin_bombardeiro.png` | `characters/goblin_bomber.png` |
| `gonodor_boss.png` | `characters/gonodor_boss.png` |

## Arquivos alterados

- `EnemyRosterCatalog.ts`, `EnemyTierProgression.ts`
- `MilestonePhaseBlueprints.ts`, `EnemyType.ts`
- `AssetCatalog.ts`, `copy-assets.mjs`
- Testes de roster, assets e marcos

## Validação

```bash
npm test
npm run build
```
