# 072 — Slots de skill bloqueados + tooltips

## Objetivo

1. Tooltip em slot de skill vazio (como equipamentos)
2. Slots 2 e 3 bloqueados no início; desbloqueio via **Melhorias** com requisito de nível + ouro

## Domínio

| Arquivo | Função |
|---------|--------|
| `SkillBattleSlots.ts` | `getUnlockedBattleSkillSlotCount`, `trimEquippedSkillIds` |
| `FeatureKey.ts` | Feature `battle_skill_slots` |
| `UpgradeCatalog.ts` | Slot II (60 ouro, herói Lv.3+) e Slot III (150 ouro, Slot II + Lv.6+) |
| `UpgradeRequirement.ts` | Requisito `min_hero_level` |
| `HeroProgression.ts` | `activateSkill` respeita `maxActiveSlots` |

## UI

| Arquivo | Função |
|---------|--------|
| `HeroActiveSkillsPresentation.ts` | Vazio clicável + bloqueado com 🔒 e `data-open-upgrades` |
| `GameViewController.ts` | Clique em slot bloqueado abre Melhorias |
| `HeroDto` | Campo `unlockedActiveSkillSlots` |

## Persistência

`ChromeStorageGameRepository` apara skills equipadas além dos slots desbloqueados ao carregar save.

## Validação

```bash
npm test
npm run build
```
