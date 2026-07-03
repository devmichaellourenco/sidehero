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
| Crítico | `critChance`, `critDamage` | Multiplicador antes do split | `CombatDamageResolver.ts` |
| DEF efetiva | base + debuff | Só componente `physical` | `CombatStatResolver.ts` |
| Resist | gear + inato | `getEffectiveResistance` | `ResistanceProfile.ts` |
| Esquiva/block/DR | gear + passivas | Após soma de componentes | `DefensiveMitigation.ts` |
| DOT tick | `onHitDot` | **Deve** usar pipeline (backlog BAL-001) | `CombatTurnPhase.ts` |
| Inimigo stats | tier, role | `StageScalingCatalog` | `WaveEnemyFactory.ts` |
| Loot primário | tier, raridade | `lootPrimaryStatScale` | `DifficultyCombatScaling.ts` |
| Loja | tier, seed | cap raridade + pesos | `ShopCatalog.ts` |

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

## Testes de fórmula

Ver lista em `specs/game-balance.spec.md`. Criar/atualizar arquivos; não executar `npm test` automaticamente.

## Workflow do agente

- Criar ou atualizar testes da spec — **não executar** `npm test` salvo pedido explícito
- **Não** gerar release até o usuário solicitar

## Próximos itens sugeridos (backlog)

1. Auditoria curva ouro: recompensa por wave vs preço loja/forja
2. BAL-003 — dodge/block/DR por componente (opcional)
3. Playtest documentado tier 1–25 / 26–60 / 61+

## Referências

- `step-by-step/129-combate-elementos.md`
- `step-by-step/148-game-balance-specialist.md`
