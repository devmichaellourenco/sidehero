---
name: game-balance
description: Balanceamento transversal do Side Hero — fórmulas de combate, elementos, gear, waves, economia e curva de dificuldade. Use para balance, rebalance, curva, tier scaling, mitigação, resist, DOT, dificuldade, auditoria numérica ou BAL-*.
---

# Balanceamento do Jogo

## Spec

`specs/game-balance.spec.md`

## Quando usar este skill

- Revisar ou alterar **números** que afetam desafio ou progressão
- Auditar se sistemas **funcionam juntos** (não só isolados)
- Antes de corrigir gaps conhecidos (DOT, gelo, loja, waves)
- Depois de entregar conteúdo novo (inimigo, skill, melhoria, loot)

## Fluxo de auditoria

1. Identifique **domínios** afetados (tabela na spec)
2. Leia a **spec parceira** da feature que será implementada
3. Trace a fórmula nos arquivos de domínio (nunca só na UI)
4. Verifique **early (T1–10)**, **mid (T11–40)**, **late (T41+)** mentalmente ou com notas
5. Atualize backlog `BAL-*` e critérios `[ ]` → `[x]` em `game-balance.spec.md`
6. Peça ao agent de feature para implementar; não duplicar lógica fora do domínio

## Mapa rápido de fórmulas

| Sistema | Entrada | Mitigação / escala | Arquivo |
|---------|---------|-------------------|---------|
| Hit instantâneo | `damageComponents[]` | Pipeline por elemento + DEF | `MitigationPipeline.ts` |
| TTA / ASPD | perfil do combatente | `1/ASPD` (DEX/STR + baseline; sem piso global) | `CombatSpeedScaling.ts`, `ActionTimerService.ts` |
| Inimigo stats | level, attrs, role, tier template | `buildEnemyCombatSheet` + derived | `EnemyProgressionCatalog.ts`, `WaveEnemyFactory.ts` |
| Recarga de skill | `cooldownTurns` / rank | turns×5s − 1,5s×(level−1), piso 4s (herói e inimigo) | `SkillCooldownTiming.ts` |
| Ataque básico | ATK | ×0,5 (herói e inimigo) | `SkillPowerCalculator.ts` |
| Crítico | `critChance`, `critDamage` | Multiplicador antes do split | `CombatDamageResolver.ts` |
| DEF efetiva | base + debuff | Só componente `physical` | `CombatStatResolver.ts` |
| Resist | gear + inato | `getEffectiveResistance` | `ResistanceProfile.ts` |
| Esquiva/block/DR | gear + passivas | Após soma de componentes | `DefensiveMitigation.ts` |
| DOT tick | `onHitDot` | **Deve** usar pipeline (backlog BAL-001) | `CombatTurnPhase.ts` |
| XP por kill | mapa, tier, replay | `CampaignXpScaling` | `WaveEnemyFactory.ts`, `PhaseLootPolicy.ts` |
| Loot primário | itemLevel, raridade | `rolledGearPrimaryStat` | `DifficultyCombatScaling.ts`, `MapGearLevelPolicy.ts` |
| Ouro por fase | tier, # inimigos | `PhaseGoldBudget` → referência | `PhaseGoldBudget.ts`, `EconomyReference.ts` |
| Loja | tier, seed | cap raridade + pesos | `ShopCatalog.ts` |
| Identidade de mapa | mapId | bias pool + resists soft (−15/+20) | `MapCombatIdentityCatalog.ts`, `EnemyTierProgression.ts` |

## Faixas alvo (orientação — calibrar com playtest)

| Tier | Sensação | Sinais de desbalance |
|------|----------|----------------------|
| 1–10 | Tutorial pressionado; mortes ocasionais | Lendário na loja T1; one-shot constante |
| 11–25 | Build importa; upgrades sentidos | Zero progresso em 20+ fases |
| 26–60 | Checks de resist/gear | Dano irrelevante ou only-meta |
| 61+ | Endgame; meta + mitos | Impossível sem mythic |

## Coordenação SDD

Sempre em **par** com o skill da feature:

```
@.cursor/skills/game-balance/SKILL.md  +  @.cursor/skills/<feature>/SKILL.md
```

Exemplo: corrigir DOT → `game-balance` define critério + teste; `combat-campaign` implementa em `CombatTurnPhase`.

## Laboratório local (Balance Lab)

Simulador fora da extensão — mesmas fórmulas do domínio (`CombatantDerivedStats`, sheet inimigo, ASPD).

```bash
npm run balance-lab
# http://127.0.0.1:5179/
```

Arquivos: `tools/balance-lab/` (+ `scripts/balance-lab.mjs`).

- **Simulador:** 1 combatente | lado a lado; fórmulas e passivas editáveis; export/import JSON.
- **Missões:** aba no lab para editar batalhas (main/side/normal) via formulário + JSON. Grava em `src/domain/campaign/data/phase-battle-overrides.json` (merge em `CampaignCatalog.resolvePhase`). Cada save/delete gera backup em `src/domain/campaign/data/backups/phase-battle-overrides/`. Após salvar, rebuild da extensão para o jogo embutir o JSON.

Não entra no zip de release.

## Testes de fórmula

Ver lista em `specs/game-balance.spec.md`. Criar/atualizar arquivos; não executar `npm test` automaticamente.

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar
- **Não** criar pasta nem arquivos `step-by-step/`; fonte de verdade = specs, agents, skills, rules e testes

## Próximos itens sugeridos (backlog)

1. ~~Auditoria curva ouro: recompensa por wave vs preço loja/forja~~ (`PhaseGoldBudget`)
2. ~~Expandir BAL-011 (race/sustain/spike) para Gruftall → Morthaven~~ (+ warded/armored multi-slot)
3. BAL-003 — dodge/block/DR por componente (opcional)
4. Playtest documentado tier 1–25 / 26–60 / 61+
