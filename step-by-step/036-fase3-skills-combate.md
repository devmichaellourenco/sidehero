# 036 — Fase 3: Skills no combate

## Status: concluída

## Arquitetura (SOLID / Clean Architecture)

```
SkillCombatCatalog (dados de combate)
        ↓
SkillPowerCalculator (cálculo de poder)
        ↓
CombatSkillResolver (escolhe ação) ← ICombatSkillResolver
        ↓
CombatActionExecutor (aplica efeito)
        ↓
HeroActionPhase (loop da party)
        ↓
CombatPipeline → EnemyCounterPhase / VictoryRewardPhase
```

### Separação de responsabilidades
| Módulo | SRP |
|--------|-----|
| `SkillDefinition` / `SkillCatalog` | Progressão (desbloqueio, árvore) |
| `SkillCombatCatalog` | Comportamento em combate (prioridade, tipo, scaling) |
| `CombatSkillResolver` | **Qual** ação o herói executa |
| `CombatActionExecutor` | **Como** aplicar dano/cura |
| `HeroActionPhase` | Orquestra turno dos heróis |

### DIP
- `ICombatSkillResolver` — interface para testes e extensão
- `HeroActionPhase` recebe resolver injetável

## Comportamento

1. **Skills equipadas** (`equippedSkillIds`) com rank ≥ 1 entram no combate
2. **Prioridade:** cura (ally < 85% HP) → dano mágico/físico por priority no catálogo → ataque básico
3. **Poder:** `base + perRank×(rank-1) + atributo×factor` (scaling da skill definition)
4. **Logs:** "Lyra lançou Raio Arcano (24)" · "Elara usou Cura Menor em Arthos (+18 HP)"

## Skills com perfil de combate

| Skill | Tipo | Notas |
|-------|------|-------|
| `minor_heal` | Cura | Alvo com menor HP% abaixo de 85% |
| `fireball`, `arcane_bolt`, `arcane_touch`, `smite` | Magia | Scaling INT |
| `shield_bash`, `power_attack` | Físico | Scaling STR |
| Passivas (`iron_skin`, `mana_shield`, `blessing`) | — | Fase futura |

## Correção de bug

`CombatPipeline` agora propaga `actionResult.heroes` (com curas aplicadas) para `EnemyCounterPhase` e `VictoryRewardPhase`.

## Testes

- `CombatSkillResolver.test.ts` — ataque básico, prioridade de cura, magia equipada
- `SkillPowerCalculator.test.ts` — scaling por rank e atributo
- `HeroActionPhase.test.ts` — dano mágico no inimigo, cura persistida na party

**Correção:** fixtures usam `Hero.restore()` com `skillRanks` + `equippedSkillIds` diretamente (sem `activateSkill` antes do rank), alinhado à regra de domínio.

**Resultado:** `npm test` — 13/13 passando · `npm run build` — OK

## Validação SOLID / Clean Architecture

| Princípio | Aplicação na Fase 3 |
|-----------|---------------------|
| **SRP** | Cada classe tem uma razão para mudar: catálogo de combate ≠ cálculo de poder ≠ resolução de ação ≠ execução de efeito ≠ orquestração de turno |
| **OCP** | Novas skills = entrada em `SkillCombatCatalog` + definição em `SkillCatalog`; resolver/executor não precisam mudar |
| **LSP** | `CombatSkillResolver` substituível via `ICombatSkillResolver` em testes e futuras variantes (ex.: IA manual) |
| **ISP** | `ICombatSkillResolver` expõe apenas `resolve()`; `CombatAction` é VO enxuto |
| **DIP** | `HeroActionPhase` depende de abstração (`ICombatSkillResolver`), não de implementação concreta |

**Camadas respeitadas:**
- `domain/progression/combat/` — regras e dados de poder (sem UI/infra)
- `domain/services/combat/` — pipeline de combate (sem import de presentation)
- Progressão (`SkillCatalog`) separada de combate (`SkillCombatCatalog`) — evita acoplamento entre árvore de skills e comportamento em batalha

**Escalabilidade:** passivas (`iron_skin`, `mana_shield`, `blessing`) entram como novo `CombatActionKind` + perfil no catálogo, sem reescrever o pipeline.

## Arquivos

| Novo | Função |
|------|--------|
| `domain/progression/combat/*` | Perfis e cálculo de poder |
| `domain/services/combat/CombatAction.ts` | Value object de ação |
| `domain/services/combat/CombatSkillResolver.ts` | Resolver de ações |
| `domain/services/combat/CombatActionExecutor.ts` | Executor de efeitos |
| `domain/services/combat/HeroActionPhase.ts` | Fase de heróis (substitui HeroAttackPhase) |

| Removido | Motivo |
|----------|--------|
| `HeroAttackPhase.ts` | Substituído por HeroActionPhase |

## Análise de manutenibilidade

A separação entre **progressão** e **combate** permite evoluir a árvore de skills (custos, requisitos, UI) sem tocar no loop de batalha. O resolver segue uma cadeia de prioridade declarativa no catálogo — adicionar `holy_light` ou `chain_lightning` é configuração, não lógica condicional espalhada.

O `CombatPipeline` agora propaga corretamente o estado mutável da party (`actionResult.heroes`), o que era pré-requisito para curas e futuros buffs/debuffs. Próximo passo natural: **Fase 4** (ascensão de classe) ou passivas de combate como modificadores no `CombatActionExecutor`.
