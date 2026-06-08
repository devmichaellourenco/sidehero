# 032 — Fase 0: Fundação do sistema de progressão

## Status: concluída

## O que foi feito

### Novos arquivos (`src/domain/progression/`)

| Arquivo | Função |
|---------|--------|
| `Attributes.ts` | Tipo STR/DEX/INT, helpers `createAttributes`, `addAttributes` |
| `BaseAttributes.ts` | Atributos base fixos por classe (knight/sorcerer/priest) |
| `SkillId.ts` | Tipos `SkillId` e `AscensionId` |
| `SkillActivationRules.ts` | Custo em ouro para ativar skill (anti-swap) |

### `Hero.ts` — campos e comportamento novos

| Campo | Descrição |
|-------|-----------|
| `allocatedAttributes` | Pontos gastos em STR/DEX/INT |
| `unspentImprovementPoints` | Pontos de aprimoramento básico (+1 por level-up) |
| `unspentAscensionPoints` | Pool separado para sub-árvore de ascensão (PoE 2) |
| `skillRanks` | Ranks investidos por skill |
| `equippedSkillIds` | Skills ativas no combate |
| `ascensionId` | Especialização escolhida ou `null` |

**Getters:** `baseAttributes`, `totalAttributes`, `hasUnspentPoints`

**Métodos:** `spendImprovementPointOnAttribute(key)`, `heal(amount)`

**Level-up:** concede `+1 unspentImprovementPoints` além do crescimento base existente.

**Stats:** ATK/DEF/HP agora incluem bônus derivados de atributos totais (preparação para builds).

### Persistência e DTOs

- `GameStateMigration.ts` — lê campos de progressão com defaults
- `ChromeStorageGameRepository.ts` — serializa todos os campos novos
- `GameStateDto.HeroDto` — expõe atributos, pontos, skills e ascensão para a UI

### Plano atualizado

- `031-skills-atributos-classes-plano.md` — marcado **aprovado** com todas as decisões do usuário

---

## Próxima fase (1)

- Requisitos de equipamento (level + STR/DEX/INT)
- `SpendImprovementPointUseCase` + UI aba **Atributos**
- Abas no `HeroDetailModalRenderer`
