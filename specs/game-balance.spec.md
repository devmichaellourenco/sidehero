# Spec — Balanceamento do Jogo (transversal)

## Status

**Aceite:** 9/9 (100%) · auditoria 2026-07-07  
**Testes obrigatórios:** 9/9 + `BalanceAudit.test.ts`

## Objetivo

Garantir que **todos os sistemas do jogo**, juntos, produzam uma experiência **desafiadora porém justa**: o jogador sente progressão e escolhas relevantes, sem walls impossíveis nem trivialização precoce.

Este documento é **transversal** — não substitui specs de feature (`combat-campaign`, `gear-loot`, etc.). Define **como auditar, coordenar e validar** balanceamento antes e depois de mudanças numéricas ou de curva.

## Princípios de balanceamento

1. **Curva suave** — poder do jogador e dificuldade do conteúdo escalam juntos (tier, stage, melhorias, gear, meta).
2. **Contramedidas** — resistências, DEF, esquiva e economia limitam snowball; fraquezas temáticas recompensam build diversa.
3. **Legibilidade** — fórmulas centralizadas em catálogos/serviços; evitar números mágicos espalhados na UI.
4. **Reprodutibilidade** — seeds determinísticos onde o jogador reabre a mesma oferta/fase; RNG de loot com pesos documentados.
5. **Desafio ≠ impossível** — wipe e retry são aceitáveis; estagnar horas no mesmo tier sem rota de upgrade não é.

## Domínios de auditoria

| Domínio | O que verificar | Spec parceira | Arquivos-chave |
|---------|-----------------|---------------|----------------|
| **Combate e fórmulas** | Dano, cura, crítico, status, turnos/tick | `combat-campaign` | `MitigationPipeline`, `CombatDamageResolver`, `CombatActionExecutor`, `CombatTurnPhase` |
| **Elementos** | Cada elemento (`physical`/`fire`/`cold`/`lightning`/`air`) usa mitigação do tipo; multi-componente; DOT | `combat-campaign`, `skills-progression` | `DamageElement`, `ResistanceProfile`, `HeroCombatSkillCatalog`, `EnemyMonsterCombatSkillCatalog` |
| **Gear e loot** | Stats por raridade/tier; resist/def por slot; caps | `gear-loot` | `LootService`, `GearTemplateCatalog`, `DifficultyCombatScaling` |
| **Waves e fases** | HP/ATK/DEF inimigos por tier; boss vs trash; handcrafted | `combat-campaign` | `StageScalingCatalog`, `WaveEnemyFactory`, `HandcraftedPhaseCatalog`, `EnemyRosterCatalog` |
| **Skills e progressão** | `Base × (powerPerRank × nível) × (attr × fator)`; cooldowns; ascensão vs tier | `skills-progression`, `heroes-party` | `HeroCombatSkillCatalog`, `SkillPowerCalculator`, `SkillDamageBalance`, `HeroLevelXpCatalog` |
| **Economia** | Ouro in/out; loja; baús; forja; loja refresh | `shop-economy`, `stash-forge`, `gear-loot` | `ShopCatalog`, `ShopService`, `ShopPricing`, `EconomyReference`, `PhaseGoldBudget`, `ForgeSalvageGoldCatalog`, `PhaseCombatHandlers` |
| **Melhorias e meta** | Gates, custos, impacto em features | `upgrade-tree`, `meta-legacy` | `UpgradeCatalog`, `MetaUpgradeCatalog`, `FeatureAccessPolicy` |
| **Integração** | Mudança num domínio não quebra curva global | todas | esta spec + checklist abaixo |

## Pipeline de dano (referência)

```
Poder × crítico → split damageComponents[]
  → físico: DEF/armadura (mitigatePhysicalDamage)
  → elemental: resist[elemento] + allElemental
  → soma → esquiva → bloqueio → redução %
  → HP
```

**Regra:** todo dano que reduz HP deve passar pelo mesmo pipeline (incluindo DOT), salvo exceção documentada na spec.

## Critérios de aceite

- [x] Spec, agent e skill de balanceamento criados e registrados no SDD
- [x] Matriz de coordenação com specs de feature documentada
- [x] DOT (`CombatTurnPhase`) mitigado por elemento + defesas como hit instantâneo
- [x] Ciclo elemental completo: skills `frost_shard`, `blizzard` e `frost_breath` (gelo)
- [x] Auditoria documentada de curva tier 1–25 (early), 26–100 (mid), 101–200 (late) no jogo base v1
- [x] Loja, loot e baús validados contra renda de ouro por fase (sem trivializar nem starvation)
- [x] Ouro de combate em fases normais limitado à renda de referência do tier (`PhaseGoldBudget`)
- [x] Waves/boss: tempo médio para clear dentro de faixa alvo por tier (ver skill)
- [x] Backlog de balanceamento revisado após cada entrega numérica relevante
- [x] BAL-010 — identidade soft por mapa (pools + resists −15/+20) nos 4 mapas base

## Coordenação com outros agents

| Situação | Agent principal | Consultar balanceamento quando |
|----------|-----------------|-------------------------------|
| Nova skill ou rebalance de poder | `skills-progression` | Alterar `basePower`, cooldown, elemento ou DOT |
| Novo inimigo ou fase | `combat-campaign` | Stats, skills, resist inata, wave count |
| Loot, affixes, raridade | `gear-loot` | Multiplicadores, caps, distribuição por baú |
| Preços loja / refresh | `shop-economy` | Tier caps, quantidade de ofertas, preços |
| Custo de melhoria | `upgrade-tree` | Impacto cumulativo na curva de poder |
| Selos / meta | `meta-legacy` | Bônus % que afetam combate ou economia |
| UI de combate (só números) | `battle-ui` | Nunca alterar fórmula na presentation |

**Fluxo recomendado:** feature agent propõe mudança → balance agent revisa impacto cross-domain → atualiza critérios/backlog nesta spec → feature agent implementa.

## Invariantes

- Fórmulas de combate vivem em `domain/combat` e `domain/services/combat`, não na UI
- Resistência física = stat DEF; resistência elemental = profile separado (`fire`/`cold`/`lightning`/`air` + `allElemental`)
- `allElemental` soma a **todos** os elementos (não a físico)
- Elemento canônico de DOT sem `dotElement` explícito = `air` (ex-caos)
- Scaling de inimigo usa `difficultyTier` global da fase, não stage local arbitrário
- Determinismo: IDs de oferta/seed não podem mudar item ao recomprar no mesmo tier+seed

## Escopo v1 (jogo base até Morthaven)

Auditoria de balanceamento do release inicial cobre **tier 1–200** (fases `1-1` … `4-50`). Tiers 201–500 (DLC) permanecem no catálogo numérico mas ficam fora do escopo de aceite até liberação de DLC.

| Faixa | Tiers (v1) | Notas |
|-------|------------|-------|
| Early | 1–25 | Stendra |
| Mid | 26–100 | Gruftall + início Valdris |
| Late | 101–200 | Valdris + Morthaven |

Âncoras de auditoria v1: `1, 10, 25, 26, 50, 100, 150, 200`. Tiers `250` e `500` reservados para perfil `full` / DLC.

## Fora de escopo

- Balanceamento PvP ou modos não implementados
- Simulação Monte Carlo automatizada em CI (manual por enquanto)
- Tabela de drop rates publicada ao jogador in-game

## Testes obrigatórios (matemática de balanceamento)

Criar ou atualizar; **não executar** automaticamente.

- [x] `MitigationPipeline.test.ts` — resist por elemento; físico vs elemental
- [x] `DamageElement.test.ts` — elementos canônicos incluem `air` e excluem `chaos`
- [x] `CombatDamageResolver.test.ts` — multi-componente, crítico, dodge
- [x] `CombatActionExecutor.test.ts` — resist gear, DOT apply, debuff defesa
- [x] `DifficultyCombatScaling.test.ts` — scaling por tier
- [x] `ResistanceProfileAggregator.test.ts` — soma de resist no equip
- [x] `EnemyInnateResists.test.ts` — temas e fraquezas (+ bias de mapa)
- [x] `MapCombatIdentityCatalog.test.ts` — identidade soft dos 4 mapas base
- [x] `DamageThroughputEstimate.test.ts` — eficácia vs resists da área
- [x] `ShopService.test.ts` — cap de raridade por tier, preços
- [x] `DotTickResolver.test.ts` — DOT mitigado; default sem elemento = `air`
- [x] `BalanceAudit.test.ts` — curva por tier, economia loja/forja, tempo de clear
- [x] `PhaseGoldBudget.test.ts` — teto de ouro por fase normal alinhado à referência
- [x] `MilestoneGoldCap.test.ts` — teto de ouro em milestones (BAL-007)
- [x] `MapGearLevelPolicy.test.ts` — faixa de nível de item por mapa
- [x] `ProgressionPowerScale.test.ts` — curva de XP e stats de gear por nível
- [x] `CampaignXpScaling.test.ts` — XP por mapa, early boost e metas de progressão
- [x] `GameStateMigration.test.ts` — migração legada `chaos*` → `air*` (gear, IDs, DOT)

## Backlog conhecido (auditoria 2026-07-03)

| ID | Severidade | Descrição | Domínio | Status |
|----|------------|-----------|---------|--------|
| BAL-001 | Alta | DOT ignora `MitigationPipeline` e defesas | Combate | ✅ Resolvido |
| BAL-002 | Média | Elemento `cold` sem fonte ofensiva no catálogo | Elementos | ✅ Resolvido |
| BAL-003 | Baixa | Dodge/block/DR aplicados na soma total, não por componente | Combate | Aberto (aceito) |
| BAL-004 | Baixa | `debuff_defense` só afeta componente físico | Combate | Aberto (intencional — ver tooltip in-game) |
| BAL-005 | Média | Gear sem dano/resist elemental visível no loot | Gear/Loot | ✅ Resolvido |
| BAL-006 | Média | Gear sem flat/%, velocidade negativa e redução de CD | Gear/Loot | ✅ Resolvido |
| BAL-007 | Média | Milestones (ex. 2-50) pagam ouro muito acima da renda de referência — épico na loja fica trivial nessas fases | Economia | ✅ Resolvido (`MilestoneGoldCap`) |
| BAL-008 | Média | Ouro por fase normal escalava acima da renda de referência em fases multi-inimigo (épico trivial cedo) | Economia | ✅ Resolvido (`PhaseGoldBudget`) |
| BAL-009 | Alta | Progressão de nível lenta no v1; loot fora da faixa do mapa; dano não escalava até ~20k DPS | Progressão/Loot | ✅ Resolvido (`ProgressionPowerScale`, `MapGearLevelPolicy`) |
| BAL-010 | Alta | Mapas sem identidade de combate — meta colapsa em DPS genérico | Campanha/Elementos | ✅ Resolvido (`MapCombatIdentityCatalog`, bias soft, X-50) |
